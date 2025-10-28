import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { createClient } from '@supabase/supabase-js';

// Initialize AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface EmailTemplate {
  subject: string;
  html_body: string;
  text_body: string;
}

interface EmailQueueItem {
  id: string;
  recipient_email: string;
  subject: string;
  html_body: string;
  text_body: string;
  personalization_data?: Record<string, any>;
}

// Domain configuration for different email types
const EMAIL_DOMAINS = {
  transactional: 'mail.poultryco.net',
  notification: 'notify.poultryco.net',
  marketing: 'news.poultryco.net',
  system: 'noreply.poultryco.net',
};

// Get the appropriate sender based on email category
function getSenderEmail(category: string): string {
  switch (category) {
    case 'welcome':
    case 'onboarding':
    case 'system':
      return `PoultryCo <noreply@${EMAIL_DOMAINS.system}>`;
    case 'engagement':
    case 'network':
    case 'achievement':
      return `PoultryCo <notifications@${EMAIL_DOMAINS.notification}>`;
    case 'educational':
    case 'digest':
    case 'promotional':
      return `PoultryCo Newsletter <updates@${EMAIL_DOMAINS.marketing}>`;
    default:
      return `PoultryCo <hello@${EMAIL_DOMAINS.transactional}>`;
  }
}

// Replace template variables with personalization data
function personalizeContent(
  content: string,
  data: Record<string, any>
): string {
  let personalizedContent = content;
  
  // Replace {{variable}} patterns with actual values
  Object.entries(data).forEach(([key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    personalizedContent = personalizedContent.replace(pattern, String(value || ''));
  });
  
  return personalizedContent;
}

// Add email footer with unsubscribe link
function addEmailFooter(htmlBody: string, textBody: string, unsubscribeToken?: string): {
  html: string;
  text: string;
} {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://poultryco.in';
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;
  const preferencesUrl = `${baseUrl}/settings/email-preferences`;

  const htmlFooter = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #666;">
      <p>
        © ${new Date().getFullYear()} PoultryCo. All rights reserved.
      </p>
      <p style="margin-top: 10px;">
        <a href="${preferencesUrl}" style="color: #10b981; text-decoration: none;">Manage Email Preferences</a>
        ${unsubscribeToken ? ` | <a href="${unsubscribeUrl}" style="color: #10b981; text-decoration: none;">Unsubscribe</a>` : ''}
      </p>
      <p style="margin-top: 10px; font-size: 11px;">
        PoultryCo - Professional Network for Poultry Industry<br>
        Mumbai, Maharashtra, India
      </p>
    </div>
  `;

  const textFooter = `

--
© ${new Date().getFullYear()} PoultryCo. All rights reserved.

Manage Email Preferences: ${preferencesUrl}
${unsubscribeToken ? `Unsubscribe: ${unsubscribeUrl}` : ''}

PoultryCo - Professional Network for Poultry Industry
Mumbai, Maharashtra, India
`;

  return {
    html: htmlBody.replace('</body>', `${htmlFooter}</body>`),
    text: textBody + textFooter,
  };
}

// Send email via AWS SES
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string,
  category: string = 'transactional',
  unsubscribeToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Add footer with unsubscribe links
    const { html, text } = addEmailFooter(htmlBody, textBody, unsubscribeToken);

    // Prepare email parameters
    const params = {
      Source: getSenderEmail(category),
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
          Text: {
            Data: text,
            Charset: 'UTF-8',
          },
        },
      },
      // Optional: Add tags for tracking
      Tags: [
        {
          Name: 'category',
          Value: category,
        },
        {
          Name: 'platform',
          Value: 'poultryco',
        },
      ],
    };

    // Send email
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

// Process email queue
export async function processEmailQueue(): Promise<void> {
  try {
    // Get pending emails from queue
    const { data: queueItems, error: fetchError } = await supabase
      .from('email_queue')
      .select('*, recipient:profiles!recipient_id(email, user_email_preferences(*))')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(10); // Process 10 emails at a time

    if (fetchError) {
      console.error('Error fetching email queue:', fetchError);
      return;
    }

    if (!queueItems || queueItems.length === 0) {
      return;
    }

    // Process each email
    for (const item of queueItems) {
      try {
        // Check if user has email preferences and is subscribed
        const preferences = (item as any).recipient?.user_email_preferences?.[0];
        if (preferences && !preferences.email_enabled) {
          // Mark as skipped
          await supabase
            .from('email_queue')
            .update({
              status: 'skipped',
              error_message: 'User unsubscribed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);
          continue;
        }

        // Update status to sending
        await supabase
          .from('email_queue')
          .update({
            status: 'sending',
            send_attempts: (item.send_attempts || 0) + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        // Personalize content if needed
        let htmlBody = item.html_body;
        let textBody = item.text_body;
        
        if (item.personalization_data) {
          htmlBody = personalizeContent(htmlBody, item.personalization_data);
          textBody = personalizeContent(textBody, item.personalization_data);
        }

        // Determine category from template
        let category = 'transactional';
        if (item.template_id) {
          const { data: template } = await supabase
            .from('email_templates')
            .select('category')
            .eq('id', item.template_id)
            .single();
          
          if (template) {
            category = template.category;
          }
        }

        // Send the email
        const result = await sendEmail(
          item.recipient_email,
          item.subject,
          htmlBody,
          textBody,
          category,
          preferences?.unsubscribe_token
        );

        if (result.success) {
          // Update status to sent
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              error_message: null,
            })
            .eq('id', item.id);

          // Log event
          await supabase
            .from('email_events')
            .insert({
              email_queue_id: item.id,
              event_type: 'sent',
            });

          // Update template stats if applicable
          if (item.template_id) {
            await supabase.rpc('increment_email_template_sent', {
              template_id: item.template_id,
            });
          }
        } else {
          // Handle failure
          const shouldRetry = (item.send_attempts || 0) < 3;
          
          await supabase
            .from('email_queue')
            .update({
              status: shouldRetry ? 'pending' : 'failed',
              error_message: result.error,
              scheduled_for: shouldRetry 
                ? new Date(Date.now() + 30 * 60 * 1000).toISOString() // Retry in 30 minutes
                : item.scheduled_for,
            })
            .eq('id', item.id);
        }
      } catch (itemError: any) {
        console.error(`Error processing email ${item.id}:`, itemError);
        
        // Mark as failed
        await supabase
          .from('email_queue')
          .update({
            status: 'failed',
            error_message: itemError.message,
          })
          .eq('id', item.id);
      }
    }
  } catch (error) {
    console.error('Error in email queue processor:', error);
  }
}

// Queue an email for sending
export async function queueEmail(
  recipientId: string,
  templateId: string,
  personalizationData?: Record<string, any>,
  scheduledFor?: Date,
  priority: number = 5
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get recipient details
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('email, full_name, profile_strength')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return { success: false, error: 'Recipient not found' };
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      return { success: false, error: 'Template not found' };
    }

    // Prepare personalization data
    const fullPersonalizationData = {
      full_name: recipient.full_name,
      profile_strength: recipient.profile_strength,
      current_year: new Date().getFullYear(),
      ...personalizationData,
    };

    // Queue the email
    const { error: queueError } = await supabase
      .from('email_queue')
      .insert({
        recipient_id: recipientId,
        recipient_email: recipient.email,
        template_id: templateId,
        subject: template.subject,
        html_body: template.html_body,
        text_body: template.text_body,
        personalization_data: fullPersonalizationData,
        priority,
        scheduled_for: scheduledFor?.toISOString() || new Date().toISOString(),
        status: 'pending',
      });

    if (queueError) {
      console.error('Error queuing email:', queueError);
      return { success: false, error: 'Failed to queue email' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in queueEmail:', error);
    return { success: false, error: error.message };
  }
}

// Create RPC functions for template stats
export const createRPCFunctions = `
  CREATE OR REPLACE FUNCTION increment_email_template_sent(template_id UUID)
  RETURNS void AS $$
  BEGIN
    UPDATE email_templates 
    SET total_sent = total_sent + 1
    WHERE id = template_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION increment_email_template_opened(template_id UUID)
  RETURNS void AS $$
  BEGIN
    UPDATE email_templates 
    SET total_opened = total_opened + 1
    WHERE id = template_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION increment_email_template_clicked(template_id UUID)
  RETURNS void AS $$
  BEGIN
    UPDATE email_templates 
    SET total_clicked = total_clicked + 1
    WHERE id = template_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
`;

export default {
  sendEmail,
  processEmailQueue,
  queueEmail,
};
