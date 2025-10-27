# AWS SES Integration Guide

## Overview
This guide covers the complete setup and configuration of AWS SES (Simple Email Service) for PoultryCo's email infrastructure, including multi-subdomain setup, security best practices, and deliverability optimization.

## Domain Architecture

### Subdomain Strategy
```
mail.poultryco.net      - Transactional emails (welcome, password reset)
notify.poultryco.net    - Notifications (connections, messages)
news.poultryco.net      - Marketing & newsletters
support.poultryco.net   - Support & educational emails
app.poultryco.net       - System-generated emails
```

### Benefits of Subdomain Separation
- **Reputation Isolation**: Issues with one type won't affect others
- **Better Analytics**: Track performance by email type
- **Flexible Sending**: Different IPs/configs per subdomain
- **Compliance**: Easy to manage unsubscribes per type

## AWS SES Configuration

### 1. Initial Setup
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure
# Region: ap-south-1 (Mumbai)
# Access Key: [Your Access Key]
# Secret Key: [Your Secret Key]
```

### 2. Domain Verification
```bash
# Verify each subdomain
aws ses verify-domain-identity --domain mail.poultryco.net
aws ses verify-domain-identity --domain notify.poultryco.net
aws ses verify-domain-identity --domain news.poultryco.net
aws ses verify-domain-identity --domain support.poultryco.net
aws ses verify-domain-identity --domain app.poultryco.net
```

### 3. DNS Configuration
Add these records to your DNS provider for each subdomain:

#### TXT Records (Domain Verification)
```
_amazonses.mail.poultryco.net     TXT  "verification-token-from-aws"
_amazonses.notify.poultryco.net   TXT  "verification-token-from-aws"
_amazonses.news.poultryco.net     TXT  "verification-token-from-aws"
```

#### DKIM Records (Email Authentication)
```
token1._domainkey.mail.poultryco.net  CNAME  token1.dkim.amazonses.com
token2._domainkey.mail.poultryco.net  CNAME  token2.dkim.amazonses.com
token3._domainkey.mail.poultryco.net  CNAME  token3.dkim.amazonses.com
```

#### SPF Record (Sender Authentication)
```
mail.poultryco.net    TXT  "v=spf1 include:amazonses.com ~all"
notify.poultryco.net  TXT  "v=spf1 include:amazonses.com ~all"
news.poultryco.net    TXT  "v=spf1 include:amazonses.com ~all"
```

#### DMARC Record (Policy Enforcement)
```
_dmarc.poultryco.net  TXT  "v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@poultryco.net"
```

#### MX Records (For Bounce Handling)
```
feedback-smtp.ap-south-1.amazonses.com  10  mail.poultryco.net
```

### 4. Configuration Sets
Create configuration sets for tracking:
```bash
aws ses put-configuration-set --configuration-set Name=poultryco-transactional
aws ses put-configuration-set --configuration-set Name=poultryco-notification  
aws ses put-configuration-set --configuration-set Name=poultryco-marketing
```

### 5. Event Publishing
Configure event destinations for each configuration set:
```bash
# SNS Topic for real-time events
aws sns create-topic --name poultryco-email-events

# Configure events
aws ses put-configuration-set-event-destination \
  --configuration-set-name poultryco-transactional \
  --event-destination Name=sns-destination \
    Enabled=true \
    SNSDestination={TopicARN=arn:aws:sns:ap-south-1:xxx:poultryco-email-events}
```

## Secure Credential Storage

### Using Supabase Vault
```sql
-- Enable pgsodium extension
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Create encryption key (run once)
SELECT pgsodium.crypto_aead_xchacha20poly1305_ietf_keygen();

-- Store the key securely in environment variables
-- SUPABASE_ENCRYPTION_KEY=<generated_key>
```

### Environment Variables (.env)
```bash
# AWS SES Credentials
AWS_SES_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SES_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_SES_REGION=ap-south-1

# Supabase Encryption
SUPABASE_ENCRYPTION_KEY=<your-encryption-key>

# Email Domains
EMAIL_DOMAIN_TRANSACTIONAL=mail.poultryco.net
EMAIL_DOMAIN_NOTIFICATION=notify.poultryco.net
EMAIL_DOMAIN_MARKETING=news.poultryco.net
```

### Storing Credentials in Database
```typescript
// Use the SQL function we created
await supabase.rpc('store_email_credentials', {
  p_provider: 'aws_ses',
  p_environment: 'production',
  p_access_key: process.env.AWS_SES_ACCESS_KEY_ID,
  p_secret_key: process.env.AWS_SES_SECRET_ACCESS_KEY,
  p_region: process.env.AWS_SES_REGION
});
```

## Email Sending Implementation

### TypeScript/Node.js Integration
```typescript
import AWS from 'aws-sdk';
import { createClient } from '@/lib/supabase/server';

class EmailService {
  private ses: AWS.SES;
  private supabase: any;

  constructor() {
    this.supabase = createClient();
    this.initializeSES();
  }

  private async initializeSES() {
    // Get credentials from database
    const { data: credentials } = await this.supabase.rpc('get_email_credentials', {
      p_provider: 'aws_ses',
      p_environment: process.env.NODE_ENV
    });

    this.ses = new AWS.SES({
      accessKeyId: credentials.access_key,
      secretAccessKey: credentials.secret_key,
      region: credentials.region
    });
  }

  async sendEmail(params: EmailParams) {
    // Check suppression list
    const { data: suppressed } = await this.supabase
      .from('email_suppressions')
      .select('id')
      .eq('email', params.to)
      .single();

    if (suppressed) {
      console.log(`Email suppressed: ${params.to}`);
      return;
    }

    // Get user preferences
    const { data: prefs } = await this.supabase
      .from('user_email_preferences_v2')
      .select('*')
      .eq('user_id', params.userId)
      .single();

    if (!this.shouldSendEmail(prefs, params.category)) {
      return;
    }

    // Prepare SES params
    const sesParams = {
      Source: this.getFromAddress(params.category),
      Destination: {
        ToAddresses: [params.to]
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: params.htmlBody,
            Charset: 'UTF-8'
          },
          Text: {
            Data: params.textBody,
            Charset: 'UTF-8'
          }
        }
      },
      ConfigurationSetName: this.getConfigurationSet(params.category),
      Tags: [
        { Name: 'user_id', Value: params.userId },
        { Name: 'category', Value: params.category },
        { Name: 'template', Value: params.templateName }
      ]
    };

    // Send email
    try {
      const result = await this.ses.sendEmail(sesParams).promise();
      
      // Update queue
      await this.supabase
        .from('email_queue')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          ses_message_id: result.MessageId
        })
        .eq('id', params.queueId);

    } catch (error) {
      console.error('SES Error:', error);
      
      // Update queue with error
      await this.supabase
        .from('email_queue')
        .update({
          status: 'failed',
          error_message: error.message,
          send_attempts: params.sendAttempts + 1
        })
        .eq('id', params.queueId);
    }
  }

  private getFromAddress(category: string): string {
    const mapping = {
      'welcome': 'noreply@mail.poultryco.net',
      'notification': 'updates@notify.poultryco.net',
      'marketing': 'newsletter@news.poultryco.net',
      'support': 'help@support.poultryco.net'
    };
    return mapping[category] || 'noreply@mail.poultryco.net';
  }

  private shouldSendEmail(prefs: any, category: string): boolean {
    if (!prefs || !prefs.all_emails_enabled) return false;
    
    // Map category to preference field
    const prefMapping = {
      'welcome': true, // Always send
      'security': true, // Always send
      'connection': prefs.connection_requests,
      'message': prefs.messages,
      'marketing': prefs.newsletter
    };

    return prefMapping[category] ?? true;
  }
}
```

## Queue Processing with Supabase Edge Functions

### Edge Function for Email Processing
```typescript
// supabase/functions/process-email-queue/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { EmailService } from './email-service.ts';

serve(async (req) => {
  const emailService = new EmailService();
  
  // Get pending emails from queue
  const { data: pendingEmails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: false })
    .limit(10);

  for (const email of pendingEmails) {
    await emailService.sendEmail(email);
  }

  return new Response(
    JSON.stringify({ processed: pendingEmails.length }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Cron Job Setup
```sql
-- Create pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule email queue processing every 5 minutes
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/process-email-queue',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_key')
      )
    );
  $$
);
```

## Best Practices for Deliverability

### 1. Content Guidelines
- **Subject Lines**: Clear, honest, no misleading claims
- **Preheader Text**: Complement subject, add context
- **From Name**: Consistent "PoultryCo" or "PoultryCo Team"
- **Reply-To**: Use monitored address for engagement

### 2. HTML Best Practices
- **Mobile-First**: 600px max width
- **Alt Text**: All images need descriptive alt text
- **Fallbacks**: CSS inlining for email clients
- **Testing**: Litmus/Email on Acid for rendering

### 3. List Hygiene
- **Double Opt-In**: Verify email addresses
- **Engagement Monitoring**: Remove inactive users
- **Bounce Handling**: Immediate suppression
- **Complaint Handling**: Honor immediately

### 4. Sending Patterns
- **Warm-Up**: Start with 50/day, double weekly
- **Consistent Volume**: Avoid sudden spikes
- **Time Zones**: Send during recipient's day
- **Frequency Caps**: Respect user limits

## Monitoring & Analytics

### CloudWatch Metrics
```bash
# Set up CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name PoultryCo-Email-Metrics \
  --dashboard-body file://email-dashboard.json
```

### Key Metrics to Track
- **Send Rate**: Current vs maximum
- **Bounce Rate**: Keep below 5%
- **Complaint Rate**: Keep below 0.1%
- **Open Rate**: Target 25%+
- **Click Rate**: Target 5%+

### Alerts Setup
```typescript
// CloudWatch Alarms
const alarms = [
  {
    name: 'HighBounceRate',
    threshold: 5,
    metric: 'Reputation.BounceRate'
  },
  {
    name: 'HighComplaintRate', 
    threshold: 0.1,
    metric: 'Reputation.ComplaintRate'
  }
];
```

## Troubleshooting

### Common Issues

#### 1. Emails Going to Spam
- Check DKIM/SPF/DMARC alignment
- Review content for spam triggers
- Verify sender reputation
- Check blacklists

#### 2. High Bounce Rate
- Implement email validation
- Use double opt-in
- Regular list cleaning
- Monitor hard vs soft bounces

#### 3. Low Engagement
- A/B test subject lines
- Optimize send times
- Segment better
- Improve content relevance

## Compliance

### GDPR/Privacy
- Clear consent at signup
- Easy unsubscribe in every email
- Data retention policies
- Right to be forgotten

### CAN-SPAM
- Accurate header information
- Clear subject lines
- Physical address included
- Opt-out honored within 10 days

This comprehensive setup ensures professional email delivery with high inbox rates while maintaining user trust and compliance.
