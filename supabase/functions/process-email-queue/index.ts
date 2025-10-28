import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailQueueItem {
  id: string
  recipient_id: string
  recipient_email: string
  template_id?: string
  subject: string
  html_body: string
  text_body: string
  personalization_data?: Record<string, any>
  priority: number
  scheduled_for: string
  send_attempts: number
  status: string
}

// Get AWS credentials from Supabase Vault
async function getAWSCredentials(supabaseClient: any) {
  const { data, error } = await supabaseClient.rpc('get_secret', {
    secret_name: 'aws_ses_credentials'
  })

  if (error || !data) {
    console.error('Failed to get AWS credentials:', error)
    throw new Error('AWS credentials not found')
  }

  return JSON.parse(data)
}

// Replace template variables
function personalizeContent(
  content: string,
  data: Record<string, any>
): string {
  let personalizedContent = content
  
  Object.entries(data).forEach(([key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    personalizedContent = personalizedContent.replace(pattern, String(value || ''))
  })
  
  return personalizedContent
}

// Add unsubscribe footer
function addEmailFooter(htmlBody: string, textBody: string, unsubscribeToken?: string): {
  html: string
  text: string
} {
  const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://poultryco.in'
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`
  const preferencesUrl = `${baseUrl}/settings/email-preferences`

  const htmlFooter = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #666;">
      <p>
        © ${new Date().getFullYear()} PoultryCo. All rights reserved.
      </p>
      <p style="margin-top: 10px;">
        <a href="${preferencesUrl}" style="color: #10b981; text-decoration: none;">Manage Email Preferences</a>
        ${unsubscribeToken ? ` | <a href="${unsubscribeUrl}" style="color: #10b981; text-decoration: none;">Unsubscribe</a>` : ''}
      </p>
    </div>
  `

  const textFooter = `

--
© ${new Date().getFullYear()} PoultryCo. All rights reserved.

Manage Email Preferences: ${preferencesUrl}
${unsubscribeToken ? `Unsubscribe: ${unsubscribeUrl}` : ''}
`

  // Insert footer before closing body tag or append to end
  const htmlWithFooter = htmlBody.includes('</body>') 
    ? htmlBody.replace('</body>', `${htmlFooter}</body>`)
    : htmlBody + htmlFooter
    
  return {
    html: htmlWithFooter,
    text: textBody + textFooter,
  }
}

// Send email via AWS SES
async function sendEmailViaSES(
  credentials: any,
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string,
  from: string
) {
  const { accessKeyId, secretAccessKey, region } = credentials

  // Prepare the request
  const endpoint = `https://email.${region}.amazonaws.com/`
  const method = 'POST'
  const service = 'ses'
  const host = `email.${region}.amazonaws.com`
  const contentType = 'application/x-www-form-urlencoded'
  
  // Create form data
  const params = new URLSearchParams()
  params.append('Action', 'SendEmail')
  params.append('Source', from)
  params.append('Destination.ToAddresses.member.1', to)
  params.append('Message.Subject.Data', subject)
  params.append('Message.Subject.Charset', 'UTF-8')
  params.append('Message.Body.Html.Data', htmlBody)
  params.append('Message.Body.Html.Charset', 'UTF-8')
  params.append('Message.Body.Text.Data', textBody)
  params.append('Message.Body.Text.Charset', 'UTF-8')
  
  const body = params.toString()
  
  // Create canonical request (simplified for SES)
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = date.substr(0, 8)
  
  // Sign the request (using AWS Signature Version 4)
  const canonical_uri = '/'
  const canonical_querystring = ''
  const canonical_headers = `content-type:${contentType}\nhost:${host}\nx-amz-date:${date}\n`
  const signed_headers = 'content-type;host;x-amz-date'
  
  const payload_hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(body)
  ).then(buf => {
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  })
  
  const canonical_request = `${method}\n${canonical_uri}\n${canonical_querystring}\n${canonical_headers}\n${signed_headers}\n${payload_hash}`
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256'
  const credential_scope = `${dateStamp}/${region}/${service}/aws4_request`
  const string_to_sign = `${algorithm}\n${date}\n${credential_scope}\n${await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonical_request)
  ).then(buf => {
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  })}`
  
  // Calculate signature
  const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
    const kDate = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(`AWS4${key}`),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(dateStamp)
    )
    
    const kRegion = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        kDate,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(regionName)
    )
    
    const kService = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        kRegion,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(serviceName)
    )
    
    const kSigning = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        kService,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode('aws4_request')
    )
    
    return kSigning
  }
  
  const signing_key = await getSignatureKey(secretAccessKey, dateStamp, region, service)
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      signing_key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(string_to_sign)
  ).then(buf => {
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  })
  
  // Create authorization header
  const authorization_header = `${algorithm} Credential=${accessKeyId}/${credential_scope}, SignedHeaders=${signed_headers}, Signature=${signature}`
  
  // Make the request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'X-Amz-Date': date,
      'Authorization': authorization_header,
    },
    body: body,
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SES Error: ${error}`)
  }
  
  return await response.text()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify this is called by authorized source (cron or admin)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
    // Get AWS credentials
    const awsCredentials = await getAWSCredentials(supabase)
    
    // Get pending emails from queue
    const { data: queueItems, error: fetchError } = await supabase
      .from('email_queue')
      .select(`
        *,
        recipient:profiles!recipient_id(
          email,
          full_name,
          user_email_preferences(*)
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(10)
    
    if (fetchError) {
      console.error('Error fetching email queue:', fetchError)
      throw fetchError
    }
    
    if (!queueItems || queueItems.length === 0) {
      return new Response(JSON.stringify({ message: 'No emails to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const results = []
    
    // Process each email
    for (const item of queueItems as any[]) {
      try {
        // Check user preferences
        const preferences = item.recipient?.user_email_preferences?.[0]
        if (preferences && !preferences.email_enabled) {
          await supabase
            .from('email_queue')
            .update({
              status: 'skipped',
              error_message: 'User unsubscribed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id)
          
          results.push({ id: item.id, status: 'skipped' })
          continue
        }
        
        // Update status to sending
        await supabase
          .from('email_queue')
          .update({
            status: 'sending',
            send_attempts: (item.send_attempts || 0) + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq('id', item.id)
        
        // Personalize content
        let htmlBody = item.html_body
        let textBody = item.text_body
        
        if (item.personalization_data) {
          htmlBody = personalizeContent(htmlBody, item.personalization_data)
          textBody = personalizeContent(textBody, item.personalization_data)
        }
        
        // Add footer
        const { html, text } = addEmailFooter(
          htmlBody,
          textBody,
          preferences?.unsubscribe_token
        )
        
        // Determine sender
        let fromEmail = 'hello@mail.poultryco.net'
        if (item.template_id) {
          const { data: template } = await supabase
            .from('email_templates')
            .select('category')
            .eq('id', item.template_id)
            .single()
          
          if (template?.category) {
            switch (template.category) {
              case 'system':
              case 'welcome':
              case 'onboarding':
                fromEmail = 'noreply@mail.poultryco.net'
                break
              case 'engagement':
              case 'network':
              case 'achievement':
                fromEmail = 'notifications@notify.poultryco.net'
                break
              case 'educational':
              case 'digest':
                fromEmail = 'updates@news.poultryco.net'
                break
            }
          }
        }
        
        // Send email
        await sendEmailViaSES(
          awsCredentials,
          item.recipient_email,
          item.subject,
          html,
          text,
          `PoultryCo <${fromEmail}>`
        )
        
        // Update status to sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq('id', item.id)
        
        // Log event
        await supabase
          .from('email_events')
          .insert({
            email_queue_id: item.id,
            event_type: 'sent',
          })
        
        results.push({ id: item.id, status: 'sent' })
        
      } catch (itemError: any) {
        console.error(`Error processing email ${item.id}:`, itemError)
        
        const shouldRetry = (item.send_attempts || 0) < 3
        
        await supabase
          .from('email_queue')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            error_message: itemError.message,
            scheduled_for: shouldRetry 
              ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
              : item.scheduled_for,
          })
          .eq('id', item.id)
        
        results.push({ 
          id: item.id, 
          status: shouldRetry ? 'retry' : 'failed',
          error: itemError.message 
        })
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Email queue processed',
        processed: results.length,
        results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
    
  } catch (error: any) {
    console.error('Error processing email queue:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
