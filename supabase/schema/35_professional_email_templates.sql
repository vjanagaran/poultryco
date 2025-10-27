-- =====================================================
-- Professional Email Templates - PoultryCo Branded
-- =====================================================

-- Clear existing templates to start fresh with professional ones
TRUNCATE TABLE email_templates CASCADE;

-- 1. WELCOME EMAIL - Professional & Branded
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  user_segment
) VALUES (
  'welcome_professional',
  '{{full_name}}, Welcome to PoultryCo - India''s Premier Poultry Network',
  'Professional welcome email with clear value proposition',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PoultryCo</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <!-- Email Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10B981 0%,#059669 100%);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Welcome to PoultryCo</h1>
              <p style="margin:10px 0 0;color:#ffffff;font-size:16px;opacity:0.9;">India''s Premier Poultry Professional Network</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;font-weight:600;">Dear {{full_name}},</h2>
              
              <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;">
                Welcome to PoultryCo! You''ve joined a thriving community of <strong>10,000+ poultry professionals</strong> 
                across India who are revolutionizing the industry through collaboration and knowledge sharing.
              </p>
              
              <!-- Value Props -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:30px 0;">
                <tr>
                  <td style="padding:20px;background-color:#f9fafb;border-radius:8px;">
                    <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">What You Can Achieve:</h3>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" valign="top" style="padding:8px 0;">
                          <img src="https://poultryco.net/email/icon-network.png" alt="Network" width="32" height="32" style="display:block;">
                        </td>
                        <td valign="top" style="padding:8px 0;">
                          <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.5;">
                            <strong>Expand Your Network:</strong> Connect with farmers, suppliers, veterinarians, and industry experts
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="40" valign="top" style="padding:8px 0;">
                          <img src="https://poultryco.net/email/icon-growth.png" alt="Growth" width="32" height="32" style="display:block;">
                        </td>
                        <td valign="top" style="padding:8px 0;">
                          <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.5;">
                            <strong>Grow Your Business:</strong> Find new customers, suppliers, and partnership opportunities
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="40" valign="top" style="padding:8px 0;">
                          <img src="https://poultryco.net/email/icon-learn.png" alt="Learn" width="32" height="32" style="display:block;">
                        </td>
                        <td valign="top" style="padding:8px 0;">
                          <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.5;">
                            <strong>Stay Informed:</strong> Access latest industry trends, best practices, and expert insights
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{app_url}}/me/edit?utm_source=email&utm_medium=welcome&utm_campaign=onboarding" 
                       style="display:inline-block;padding:16px 48px;background-color:#10B981;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Complete Your Profile
                    </a>
                    <p style="margin:12px 0 0;color:#6b7280;font-size:14px;">Takes only 2 minutes</p>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Start Guide -->
              <div style="border-top:1px solid #e5e7eb;margin:30px 0;"></div>
              
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Quick Start Guide:</h3>
              <ol style="margin:0 0 24px;padding-left:20px;color:#4b5563;font-size:15px;line-height:1.8;">
                <li>Complete your profile to get discovered</li>
                <li>Connect with 5 professionals in your area</li>
                <li>Share your first insight or question</li>
              </ol>
              
              <!-- Support -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:30px 0;">
                <tr>
                  <td style="padding:20px;background-color:#eff6ff;border-radius:8px;border-left:4px solid #3b82f6;">
                    <p style="margin:0;color:#1e40af;font-size:15px;line-height:1.5;">
                      <strong>Need Help?</strong> Our team is here for you.<br>
                      Email: <a href="mailto:support@poultryco.net" style="color:#3b82f6;">support@poultryco.net</a><br>
                      WhatsApp: <a href="https://wa.me/919876543210" style="color:#3b82f6;">+91 98765 43210</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:30px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Follow us on</p>
                    <a href="https://linkedin.com/company/poultryco" style="display:inline-block;margin:0 8px;">
                      <img src="https://poultryco.net/email/icon-linkedin.png" alt="LinkedIn" width="24" height="24">
                    </a>
                    <a href="https://twitter.com/poultryco" style="display:inline-block;margin:0 8px;">
                      <img src="https://poultryco.net/email/icon-twitter.png" alt="Twitter" width="24" height="24">
                    </a>
                    <a href="https://facebook.com/poultryco" style="display:inline-block;margin:0 8px;">
                      <img src="https://poultryco.net/email/icon-facebook.png" alt="Facebook" width="24" height="24">
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
                      © 2025 PoultryCo. All rights reserved.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:13px;">
                      <a href="{{app_url}}/settings/email-preferences?token={{unsubscribe_token}}" style="color:#6b7280;">Email Preferences</a> | 
                      <a href="{{app_url}}/privacy" style="color:#6b7280;">Privacy Policy</a> | 
                      <a href="{{app_url}}/terms" style="color:#6b7280;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'Dear {{full_name}},

Welcome to PoultryCo! You''ve joined a thriving community of 10,000+ poultry professionals across India who are revolutionizing the industry through collaboration and knowledge sharing.

WHAT YOU CAN ACHIEVE:
• Expand Your Network: Connect with farmers, suppliers, veterinarians, and industry experts
• Grow Your Business: Find new customers, suppliers, and partnership opportunities
• Stay Informed: Access latest industry trends, best practices, and expert insights

GET STARTED IN 3 STEPS:
1. Complete your profile to get discovered
2. Connect with 5 professionals in your area
3. Share your first insight or question

Complete Your Profile: {{app_url}}/me/edit

NEED HELP?
Our team is here for you.
Email: support@poultryco.net
WhatsApp: +91 98765 43210

Best regards,
The PoultryCo Team

---
Email Preferences: {{app_url}}/settings/email-preferences?token={{unsubscribe_token}}
© 2025 PoultryCo. All rights reserved.',
  'welcome',
  ARRAY['new']
);

-- 2. PROFILE COMPLETION REMINDER - Urgency without spam
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  min_profile_strength,
  max_profile_strength,
  user_segment
) VALUES (
  'profile_completion_professional',
  '{{full_name}}, unlock your full PoultryCo potential ({{100 - profile_strength}}% to go)',
  'Professional profile completion reminder',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your PoultryCo Profile</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 30px 30px;">
              <h1 style="margin:0 0 8px;color:#1f2937;font-size:24px;font-weight:700;">
                Hi {{full_name}},
              </h1>
              <p style="margin:0;color:#4b5563;font-size:16px;">
                Your profile is <strong>{{profile_strength}}%</strong> complete. Let''s make it 100%!
              </p>
            </td>
          </tr>
          
          <!-- Progress Bar -->
          <tr>
            <td style="padding:0 30px 30px;">
              <div style="background-color:#e5e7eb;height:24px;border-radius:12px;overflow:hidden;">
                <div style="background-color:#10B981;height:100%;width:{{profile_strength}}%;transition:width 0.3s;"></div>
              </div>
            </td>
          </tr>
          
          <!-- Benefits -->
          <tr>
            <td style="padding:0 30px 30px;">
              <div style="background-color:#f9fafb;padding:24px;border-radius:8px;">
                <h2 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">
                  Members with complete profiles get:
                </h2>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:8px 0;color:#059669;font-size:20px;width:30px;">✓</td>
                    <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                      <strong>10x more</strong> profile views and connection requests
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#059669;font-size:20px;width:30px;">✓</td>
                    <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                      <strong>Priority listing</strong> in search results
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#059669;font-size:20px;width:30px;">✓</td>
                    <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                      <strong>Verified badge</strong> for credibility
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#059669;font-size:20px;width:30px;">✓</td>
                    <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                      <strong>Direct messaging</strong> capabilities
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Missing Sections -->
          <tr>
            <td style="padding:0 30px 30px;">
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:16px;font-weight:600;">
                Complete these sections:
              </h3>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;">
                {{#missing_sections}}
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
                    <span style="color:#ef4444;margin-right:8px;">○</span>
                    <span style="color:#4b5563;font-size:15px;">{{section_name}}</span>
                    <span style="float:right;color:#6b7280;font-size:13px;">{{section_points}} points</span>
                  </td>
                </tr>
                {{/missing_sections}}
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding:0 30px 40px;" align="center">
              <a href="{{app_url}}/me/edit?utm_source=email&utm_medium=profile&utm_campaign=completion" 
                 style="display:inline-block;padding:14px 32px;background-color:#10B981;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                Complete Profile Now
              </a>
              <p style="margin:12px 0 0;color:#6b7280;font-size:14px;">
                It takes less than 2 minutes
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:30px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">
                You''re receiving this because you signed up for PoultryCo.<br>
                <a href="{{app_url}}/settings/email-preferences?token={{unsubscribe_token}}" style="color:#6b7280;">
                  Manage email preferences
                </a> | 
                <a href="{{app_url}}/unsubscribe?token={{unsubscribe_token}}&type=onboarding" style="color:#6b7280;">
                  Unsubscribe from onboarding emails
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'Hi {{full_name}},

Your profile is {{profile_strength}}% complete. Let''s make it 100%!

MEMBERS WITH COMPLETE PROFILES GET:
✓ 10x more profile views and connection requests
✓ Priority listing in search results
✓ Verified badge for credibility
✓ Direct messaging capabilities

COMPLETE THESE SECTIONS:
{{#missing_sections}}
○ {{section_name}} ({{section_points}} points)
{{/missing_sections}}

Complete Profile Now: {{app_url}}/me/edit
It takes less than 2 minutes.

Best regards,
The PoultryCo Team

---
Manage email preferences: {{app_url}}/settings/email-preferences?token={{unsubscribe_token}}
Unsubscribe from onboarding: {{app_url}}/unsubscribe?token={{unsubscribe_token}}&type=onboarding',
  'onboarding',
  0,
  80,
  ARRAY['new', 'active']
);

-- 3. WEEKLY DIGEST - Clean and informative
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  user_segment
) VALUES (
  'weekly_digest_professional',
  'Your PoultryCo Weekly Update - {{date_range}}',
  'Professional weekly digest with personalized insights',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PoultryCo Weekly Digest</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1f2937;padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                Your Weekly PoultryCo Update
              </h1>
              <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;">
                {{date_range}}
              </p>
            </td>
          </tr>
          
          <!-- Your Activity Stats -->
          <tr>
            <td style="padding:30px;">
              <h2 style="margin:0 0 20px;color:#1f2937;font-size:20px;font-weight:600;">
                Your Activity This Week
              </h2>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="33%" style="text-align:center;padding:0 10px;">
                    <div style="background-color:#f3f4f6;padding:20px;border-radius:8px;">
                      <p style="margin:0;color:#10B981;font-size:32px;font-weight:700;">{{profile_views}}</p>
                      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Profile Views</p>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 10px;">
                    <div style="background-color:#f3f4f6;padding:20px;border-radius:8px;">
                      <p style="margin:0;color:#3b82f6;font-size:32px;font-weight:700;">{{new_connections}}</p>
                      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">New Connections</p>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 10px;">
                    <div style="background-color:#f3f4f6;padding:20px;border-radius:8px;">
                      <p style="margin:0;color:#8b5cf6;font-size:32px;font-weight:700;">{{messages_received}}</p>
                      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Messages</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Trending Content -->
          {{#if trending_posts}}
          <tr>
            <td style="padding:0 30px 30px;">
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">
                🔥 Trending in {{location_state}}
              </h3>
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                {{#each trending_posts}}
                <div style="padding:16px;{{#unless @last}}border-bottom:1px solid #e5e7eb;{{/unless}}">
                  <p style="margin:0 0 8px;color:#1f2937;font-size:15px;font-weight:500;">
                    {{author_name}}
                  </p>
                  <p style="margin:0 0 8px;color:#4b5563;font-size:14px;line-height:1.5;">
                    {{post_preview}}
                  </p>
                  <a href="{{post_url}}?utm_source=email&utm_medium=digest" style="color:#10B981;font-size:14px;text-decoration:none;">
                    Read more →
                  </a>
                </div>
                {{/each}}
              </div>
            </td>
          </tr>
          {{/if}}
          
          <!-- Opportunities -->
          {{#if opportunities}}
          <tr>
            <td style="padding:0 30px 30px;">
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">
                💼 New Opportunities
              </h3>
              <div style="background-color:#eff6ff;padding:16px;border-radius:8px;">
                <p style="margin:0 0 12px;color:#1e40af;font-size:14px;font-weight:500;">
                  This week in your network:
                </p>
                <ul style="margin:0;padding-left:20px;color:#3b82f6;font-size:14px;line-height:1.6;">
                  <li>{{new_suppliers}} new suppliers joined</li>
                  <li>{{new_buyers}} potential buyers nearby</li>
                  <li>{{new_jobs}} job opportunities posted</li>
                </ul>
                <a href="{{app_url}}/discover?utm_source=email&utm_medium=digest" 
                   style="display:inline-block;margin-top:12px;color:#2563eb;font-size:14px;text-decoration:none;font-weight:500;">
                  Explore opportunities →
                </a>
              </div>
            </td>
          </tr>
          {{/if}}
          
          <!-- Recommendations -->
          {{#if recommendations}}
          <tr>
            <td style="padding:0 30px 30px;">
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">
                🤝 People You Should Connect With
              </h3>
              {{#each recommendations}}
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
                <tr>
                  <td width="60">
                    <div style="width:48px;height:48px;background-color:#10B981;border-radius:24px;text-align:center;line-height:48px;color:#ffffff;font-weight:600;">
                      {{initials}}
                    </div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;color:#1f2937;font-size:15px;font-weight:500;">{{name}}</p>
                    <p style="margin:2px 0 0;color:#6b7280;font-size:14px;">{{headline}}</p>
                  </td>
                  <td width="80" align="right">
                    <a href="{{profile_url}}?utm_source=email&utm_medium=digest" 
                       style="display:inline-block;padding:8px 16px;background-color:#10B981;color:#ffffff;text-decoration:none;font-size:14px;border-radius:6px;">
                      Connect
                    </a>
                  </td>
                </tr>
              </table>
              {{/each}}
            </td>
          </tr>
          {{/if}}
          
          <!-- Footer -->
          <tr>
            <td style="padding:30px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="{{app_url}}?utm_source=email&utm_medium=digest" 
                       style="display:inline-block;padding:12px 24px;background-color:#1f2937;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;border-radius:6px;">
                      Visit PoultryCo
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:#6b7280;font-size:13px;">
                      You''re receiving this weekly digest as an active PoultryCo member.<br>
                      <a href="{{app_url}}/settings/email-preferences?token={{unsubscribe_token}}" style="color:#6b7280;">
                        Update frequency
                      </a> | 
                      <a href="{{app_url}}/unsubscribe?token={{unsubscribe_token}}&type=digest" style="color:#6b7280;">
                        Unsubscribe from digests
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'Your PoultryCo Weekly Update - {{date_range}}

YOUR ACTIVITY THIS WEEK:
• Profile Views: {{profile_views}}
• New Connections: {{new_connections}}  
• Messages: {{messages_received}}

{{#if trending_posts}}
TRENDING IN {{location_state}}:
{{#each trending_posts}}
• {{author_name}}: {{post_preview}}
  Read more: {{post_url}}
{{/each}}
{{/if}}

{{#if opportunities}}
NEW OPPORTUNITIES:
• {{new_suppliers}} new suppliers joined
• {{new_buyers}} potential buyers nearby
• {{new_jobs}} job opportunities posted
Explore: {{app_url}}/discover
{{/if}}

{{#if recommendations}}
PEOPLE YOU SHOULD CONNECT WITH:
{{#each recommendations}}
• {{name}} - {{headline}}
  Connect: {{profile_url}}
{{/each}}
{{/if}}

Visit PoultryCo: {{app_url}}

---
Update email frequency: {{app_url}}/settings/email-preferences?token={{unsubscribe_token}}
Unsubscribe from digests: {{app_url}}/unsubscribe?token={{unsubscribe_token}}&type=digest',
  'digest',
  ARRAY['active']
);

-- 4. RE-ENGAGEMENT - Gentle and value-focused
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  user_segment
) VALUES (
  'reengagement_professional',
  '{{full_name}}, your poultry network has {{pending_items}} updates waiting',
  'Professional re-engagement without being pushy',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your PoultryCo Updates</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 30px;">
              <h1 style="margin:0 0 8px;color:#1f2937;font-size:24px;font-weight:600;">
                Welcome back, {{full_name}}
              </h1>
              <p style="margin:0;color:#6b7280;font-size:16px;">
                You have been missed! Here''s what''s waiting for you.
              </p>
            </td>
          </tr>
          
          <!-- Pending Activities -->
          {{#if has_pending_activities}}
          <tr>
            <td style="padding:0 30px 30px;">
              <div style="background-color:#fef3c7;border:1px solid #fbbf24;padding:20px;border-radius:8px;">
                <h2 style="margin:0 0 16px;color:#92400e;font-size:18px;font-weight:600;">
                  Your Pending Activities
                </h2>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  {{#if pending_connections}}
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="color:#f59e0b;font-size:16px;margin-right:12px;">🤝</span>
                      <span style="color:#92400e;font-size:15px;">
                        <strong>{{pending_connections}}</strong> connection requests awaiting response
                      </span>
                    </td>
                  </tr>
                  {{/if}}
                  {{#if unread_messages}}
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="color:#f59e0b;font-size:16px;margin-right:12px;">💬</span>
                      <span style="color:#92400e;font-size:15px;">
                        <strong>{{unread_messages}}</strong> unread messages
                      </span>
                    </td>
                  </tr>
                  {{/if}}
                  {{#if profile_views}}
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="color:#f59e0b;font-size:16px;margin-right:12px;">👀</span>
                      <span style="color:#92400e;font-size:15px;">
                        <strong>{{profile_views}}</strong> people viewed your profile
                      </span>
                    </td>
                  </tr>
                  {{/if}}
                </table>
              </div>
            </td>
          </tr>
          {{/if}}
          
          <!-- What''s New -->
          <tr>
            <td style="padding:0 30px 30px;">
              <h2 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">
                What''s New Since Your Last Visit
              </h2>
              <div style="background-color:#f9fafb;padding:20px;border-radius:8px;">
                <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:15px;line-height:1.8;">
                  <li><strong>{{new_members_count}}</strong> new members joined from {{location_state}}</li>
                  <li>Enhanced search to find partners 3x faster</li>
                  <li>New mobile app features for on-the-go networking</li>
                  <li>Industry insights section with expert articles</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Success Story -->
          <tr>
            <td style="padding:0 30px 30px;">
              <div style="background-color:#f0fdf4;border-left:4px solid #10B981;padding:20px;">
                <p style="margin:0;color:#065f46;font-size:15px;font-style:italic;line-height:1.6;">
                  "Through PoultryCo, I found a reliable feed supplier that reduced my costs by 15% and connected with 3 new buyers for my eggs. The platform has transformed my business!"
                </p>
                <p style="margin:12px 0 0;color:#047857;font-size:14px;font-weight:500;">
                  - Amit Patel, Layer Farmer, Gujarat
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding:0 30px 40px;" align="center">
              <a href="{{app_url}}/home?utm_source=email&utm_medium=reengagement" 
                 style="display:inline-block;padding:16px 40px;background-color:#10B981;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                Check Your Updates
              </a>
              <p style="margin:12px 0 0;color:#6b7280;font-size:14px;">
                Or download our mobile app for instant notifications
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:30px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">
                We send these updates to keep you connected with your network.<br>
                <a href="{{app_url}}/settings/email-preferences?token={{unsubscribe_token}}" style="color:#6b7280;">
                  Adjust email frequency
                </a> | 
                <a href="{{app_url}}/pause-emails?token={{unsubscribe_token}}&days=30" style="color:#6b7280;">
                  Pause emails for 30 days
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'Welcome back, {{full_name}}!

You have been missed! Here''s what''s waiting for you:

{{#if has_pending_activities}}
YOUR PENDING ACTIVITIES:
{{#if pending_connections}}• {{pending_connections}} connection requests awaiting response{{/if}}
{{#if unread_messages}}• {{unread_messages}} unread messages{{/if}}
{{#if profile_views}}• {{profile_views}} people viewed your profile{{/if}}
{{/if}}

WHAT''S NEW:
• {{new_members_count}} new members joined from {{location_state}}
• Enhanced search to find partners 3x faster
• New mobile app features
• Industry insights section

SUCCESS STORY:
"Through PoultryCo, I found a reliable feed supplier that reduced my costs by 15% and connected with 3 new buyers. The platform has transformed my business!"
- Amit Patel, Layer Farmer, Gujarat

Check Your Updates: {{app_url}}/home

---
Adjust email frequency: {{app_url}}/settings/email-preferences?token={{unsubscribe_token}}
Pause emails for 30 days: {{app_url}}/pause-emails?token={{unsubscribe_token}}&days=30',
  'retention',
  ARRAY['inactive']
);
