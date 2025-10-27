-- =====================================================
-- Email Templates - Initial Data
-- =====================================================

-- Welcome Email
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  user_segment
) VALUES (
  'welcome_immediate',
  'Welcome to India''s Poultry Professional Network, {{full_name}}! 🐔',
  'Immediate welcome email for new signups',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #10B981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Welcome to PoultryCo!</h1>
    </div>
    <div style="padding: 30px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Hello {{full_name}},</h2>
      <p style="color: #666; line-height: 1.6;">
        Welcome to India''s fastest-growing poultry professional network! You''ve just joined 
        thousands of farmers, suppliers, veterinarians, and industry experts who are 
        transforming the poultry industry together.
      </p>
      
      <h3 style="color: #10B981;">Get Started in 3 Simple Steps:</h3>
      <ol style="color: #666; line-height: 1.8;">
        <li><strong>Complete Your Profile</strong> - Add your photo and professional details</li>
        <li><strong>Connect with Peers</strong> - Find and connect with professionals in {{location_state}}</li>
        <li><strong>Join Conversations</strong> - Share your expertise and learn from others</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/me/edit" style="background-color: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Complete Your Profile
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        <strong>Why complete your profile?</strong><br>
        ✓ Get discovered by potential business partners<br>
        ✓ Unlock messaging and advanced features<br>
        ✓ Build trust with verified information
      </p>
      
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        Have questions? Reply to this email or visit our <a href="{{app_url}}/help" style="color: #10B981;">Help Center</a>
      </p>
    </div>
  </div>',
  'Hello {{full_name}},

Welcome to India''s fastest-growing poultry professional network! 

You''ve just joined thousands of farmers, suppliers, veterinarians, and industry experts who are transforming the poultry industry together.

Get Started in 3 Simple Steps:
1. Complete Your Profile - Add your photo and professional details
2. Connect with Peers - Find and connect with professionals in {{location_state}}
3. Join Conversations - Share your expertise and learn from others

Complete Your Profile: {{app_url}}/me/edit

Why complete your profile?
- Get discovered by potential business partners
- Unlock messaging and advanced features  
- Build trust with verified information

Have questions? Reply to this email or visit our Help Center: {{app_url}}/help

Best regards,
The PoultryCo Team',
  'welcome',
  ARRAY['new']
);

-- Profile Completion Reminder (Day 2)
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
  'profile_completion_day2',
  '{{full_name}}, your profile is {{profile_strength}}% complete - let''s fix that!',
  'Profile completion reminder for users with <50% completion',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f9f9f9; padding: 30px;">
      <h2 style="color: #333;">Hi {{full_name}},</h2>
      
      <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #10B981; text-align: center;">Your Profile Completion</h3>
        <div style="background-color: #e0e0e0; height: 30px; border-radius: 15px; overflow: hidden;">
          <div style="background-color: #10B981; height: 100%; width: {{profile_strength}}%; transition: width 0.3s;"></div>
        </div>
        <p style="text-align: center; color: #666; font-size: 24px; margin: 10px 0;">{{profile_strength}}%</p>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        Did you know? Profiles with 80%+ completion get:
      </p>
      <ul style="color: #666; line-height: 1.8;">
        <li>🔍 <strong>10x more profile views</strong></li>
        <li>🤝 <strong>5x more connection requests</strong></li>
        <li>💬 <strong>3x more business inquiries</strong></li>
      </ul>
      
      <h3 style="color: #333;">Complete these sections to reach 80%:</h3>
      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
        {{#missing_sections}}
        <p style="margin: 5px 0;">❌ {{section_name}}</p>
        {{/missing_sections}}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/me/edit" style="background-color: #10B981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Complete Profile Now
        </a>
      </div>
      
      <p style="color: #999; font-size: 14px;">
        <strong>Success Story:</strong> "After completing my profile, I received 15 connection 
        requests in the first week and found 3 new suppliers!" - Rajesh Kumar, Layer Farmer, Maharashtra
      </p>
    </div>
  </div>',
  'Hi {{full_name}},

Your Profile Completion: {{profile_strength}}%

Did you know? Profiles with 80%+ completion get:
- 10x more profile views
- 5x more connection requests
- 3x more business inquiries

Complete these sections to reach 80%:
{{#missing_sections}}
- {{section_name}}
{{/missing_sections}}

Complete Profile Now: {{app_url}}/me/edit

Success Story: "After completing my profile, I received 15 connection requests in the first week and found 3 new suppliers!" - Rajesh Kumar, Layer Farmer, Maharashtra

Best regards,
The PoultryCo Team',
  'onboarding',
  0,
  50,
  ARRAY['new']
);

-- Re-engagement Email (14 days inactive)
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  user_segment
) VALUES (
  'reengagement_14days',
  '{{full_name}}, you have {{pending_connections}} pending connection requests',
  'Re-engagement email for 14 days inactive users',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #10B981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">We Miss You! 👋</h1>
    </div>
    <div style="padding: 30px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Hi {{full_name}},</h2>
      
      <p style="color: #666; line-height: 1.6;">
        It''s been {{last_login_days_ago}} days since your last visit. Your poultry network 
        has been active, and you have some pending activities waiting for you!
      </p>
      
      <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #10B981; margin-top: 0;">Waiting for You:</h3>
        <ul style="color: #666; line-height: 1.8; list-style: none; padding: 0;">
          {{#if pending_connections}}
          <li>🤝 <strong>{{pending_connections}} connection requests</strong></li>
          {{/if}}
          {{#if unread_messages}}
          <li>💬 <strong>{{unread_messages}} unread messages</strong></li>
          {{/if}}
          <li>👀 <strong>{{profile_views_this_week}} people viewed your profile</strong></li>
          <li>📈 <strong>New opportunities in {{location_state}}</strong></li>
        </ul>
      </div>
      
      <h3 style="color: #333;">What''s New Since Your Last Visit:</h3>
      <ul style="color: #666; line-height: 1.6;">
        <li>🎯 Improved search to find business partners faster</li>
        <li>📱 Enhanced mobile experience</li>
        <li>🏆 New member achievements and badges</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/home" style="background-color: #10B981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Check Your Activity
        </a>
      </div>
      
      <p style="color: #999; font-size: 14px; text-align: center;">
        Miss fewer opportunities - Download our mobile app for instant notifications!<br>
        <a href="{{app_url}}/mobile" style="color: #10B981;">Get the App</a>
      </p>
    </div>
  </div>',
  'Hi {{full_name}},

It''s been {{last_login_days_ago}} days since your last visit. Your poultry network has been active!

Waiting for You:
- {{pending_connections}} connection requests
- {{unread_messages}} unread messages  
- {{profile_views_this_week}} people viewed your profile
- New opportunities in {{location_state}}

What''s New:
- Improved search to find business partners faster
- Enhanced mobile experience
- New member achievements and badges

Check Your Activity: {{app_url}}/home

Miss fewer opportunities - Download our mobile app!

Best regards,
The PoultryCo Team',
  'retention',
  ARRAY['inactive']
);

-- First Post Encouragement
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  user_segment
) VALUES (
  'first_post_encouragement',
  'Share your poultry expertise with {{connection_count}}+ professionals',
  'Encourage users to create their first post',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="padding: 30px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Hi {{full_name}},</h2>
      
      <p style="color: #666; line-height: 1.6;">
        You''ve built a great network with {{connection_count}} connections! Now it''s time 
        to share your valuable poultry industry insights with them.
      </p>
      
      <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #10B981;">Post Ideas to Get You Started:</h3>
        <ul style="color: #666; line-height: 1.8;">
          <li>📊 Share your farm''s success story or milestone</li>
          <li>💡 Tips that have worked for your poultry business</li>
          <li>❓ Ask for advice on a challenge you''re facing</li>
          <li>📸 Photos of your farm setup or products</li>
          <li>📈 Market insights from your region</li>
        </ul>
      </div>
      
      <div style="background-color: #FFF3CD; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #856404; margin: 0;">
          <strong>Did you know?</strong> Members who post regularly get 3x more business 
          inquiries and build stronger professional relationships!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/compose" style="background-color: #10B981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Create Your First Post
        </a>
      </div>
      
      <p style="color: #666; font-style: italic; background-color: white; padding: 15px; border-left: 4px solid #10B981;">
        "I was hesitant to post initially, but my first post about layer farming challenges 
        got 50+ responses and connected me with an expert who solved my problem!" 
        <br><strong>- Priya Sharma, Gujarat</strong>
      </p>
    </div>
  </div>',
  'Hi {{full_name}},

You''ve built a great network with {{connection_count}} connections! Now share your insights.

Post Ideas:
- Share your farm''s success story
- Tips for your poultry business
- Ask for advice on challenges
- Photos of your farm/products
- Market insights from your region

Members who post regularly get 3x more business inquiries!

Create Your First Post: {{app_url}}/compose

"My first post got 50+ responses and solved my farming challenge!" - Priya Sharma

Best regards,
The PoultryCo Team',
  'engagement',
  ARRAY['active']
);

-- Weekly Digest Email
INSERT INTO email_templates (
  name,
  subject,
  description,
  html_body,
  text_body,
  category,
  user_segment
) VALUES (
  'weekly_digest',
  'Your PoultryCo Weekly: {{total_updates}} updates from your network',
  'Weekly digest of network activity',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #10B981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Your Weekly PoultryCo Digest 📊</h1>
    </div>
    <div style="padding: 30px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Hi {{full_name}},</h2>
      
      <p style="color: #666;">Here''s what happened in your network this week:</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background-color: white; padding: 15px; border-radius: 5px; text-align: center;">
          <h3 style="color: #10B981; margin: 0;">{{profile_views_this_week}}</h3>
          <p style="color: #666; margin: 5px 0;">Profile Views</p>
        </div>
        <div style="background-color: white; padding: 15px; border-radius: 5px; text-align: center;">
          <h3 style="color: #10B981; margin: 0;">{{new_connections_this_week}}</h3>
          <p style="color: #666; margin: 5px 0;">New Connections</p>
        </div>
      </div>
      
      {{#if top_posts}}
      <h3 style="color: #333;">🔥 Trending in Your Network:</h3>
      <div style="background-color: white; padding: 15px; border-radius: 5px;">
        {{#each top_posts}}
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <p style="margin: 0;"><strong>{{author_name}}</strong></p>
          <p style="color: #666; margin: 5px 0;">{{post_preview}}</p>
          <a href="{{post_url}}" style="color: #10B981; text-decoration: none;">Read more →</a>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if suggested_connections}}
      <h3 style="color: #333;">🤝 People You May Know:</h3>
      <div style="background-color: white; padding: 15px; border-radius: 5px;">
        {{#each suggested_connections}}
        <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
          <div style="flex: 1;">
            <strong>{{name}}</strong><br>
            <span style="color: #666; font-size: 14px;">{{headline}}</span>
          </div>
          <a href="{{profile_url}}" style="background-color: #10B981; color: white; padding: 5px 15px; text-decoration: none; border-radius: 3px;">Connect</a>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}/home" style="background-color: #10B981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          View Full Activity
        </a>
      </div>
    </div>
  </div>',
  'Hi {{full_name}},

Your Weekly Summary:
- Profile Views: {{profile_views_this_week}}
- New Connections: {{new_connections_this_week}}

{{#if top_posts}}
Trending in Your Network:
{{#each top_posts}}
- {{author_name}}: {{post_preview}}
{{/each}}
{{/if}}

{{#if suggested_connections}}
People You May Know:
{{#each suggested_connections}}
- {{name}} - {{headline}}
{{/each}}
{{/if}}

View Full Activity: {{app_url}}/home

Best regards,
The PoultryCo Team',
  'digest',
  ARRAY['active', 'new']
);
