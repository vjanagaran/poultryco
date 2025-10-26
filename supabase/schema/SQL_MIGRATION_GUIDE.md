# PoultryCo Platform Schema - SQL Migration Guide

## Overview
This document provides instructions for executing the SQL schema files to build the complete PoultryCo platform database.

---

## 📁 New SQL Files Created

### Social Features
1. **`15_social_posts_system.sql`** - Posts, likes, comments, shares, tags, reports, bookmarks
2. **`16_social_posts_rls.sql`** - RLS policies for social features

### Messaging
3. **`17_messaging_system.sql`** - Conversations, messages, read receipts, reactions

### Notifications
4. **`18_notifications_system.sql`** - Notifications, preferences, templates

### Market Data & Dashboard
5. **`19_market_data_and_dashboard.sql`** - Market prices, dashboard widgets, activity tracking, user preferences

---

## 🎯 Execution Order

Execute the SQL files **in this exact order** via Supabase SQL Editor:

### Prerequisites (Already Applied)
- ✅ `01_core_profiles.sql`
- ✅ `02_profile_roles.sql`
- ✅ `03_professional_info.sql`
- ✅ `04_business_details.sql`
- ✅ `05_business_products_jobs.sql`
- ✅ `06_organizations.sql`
- ✅ `07_memberships_events.sql`
- ✅ `08_event_speakers_exhibitors.sql`
- ✅ `09_privacy_verification_gamification.sql`
- ✅ `10_network_connections.sql`
- ✅ `11_stats_metrics.sql`
- ✅ `12_rls_policies.sql`

### New Files (Execute Now)
```bash
# Social Features
/supabase/schema/15_social_posts_system.sql
/supabase/schema/16_social_posts_rls.sql

# Messaging
/supabase/schema/17_messaging_system.sql

# Notifications
/supabase/schema/18_notifications_system.sql

# Market Data & Dashboards
/supabase/schema/19_market_data_and_dashboard.sql
```

---

## 📝 Step-by-Step Execution

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Execute Social Posts System
```sql
-- Copy and paste contents of 15_social_posts_system.sql
-- Click "Run" or press Ctrl+Enter
```

**Expected result**: ✅ Success
- Creates: `posts`, `post_likes`, `post_comments`, `post_comment_likes`, `post_shares`, `post_views`, `post_tags`, `posts_tags`, `post_reports`, `post_bookmarks`
- Triggers for like/comment/share count updates
- Full-text search indexes

### 3. Execute Social Posts RLS
```sql
-- Copy and paste contents of 16_social_posts_rls.sql
-- Click "Run"
```

**Expected result**: ✅ Success
- Enables RLS on all social tables
- Public posts viewable by everyone
- Connection-only posts protected
- Users can only manage their own content

### 4. Execute Messaging System
```sql
-- Copy and paste contents of 17_messaging_system.sql
-- Click "Run"
```

**Expected result**: ✅ Success
- Creates: `conversations`, `conversation_participants`, `messages`, `message_read_receipts`, `message_reactions`
- Helper functions: `create_direct_conversation()`, `mark_messages_as_read()`
- Real-time subscriptions enabled

### 5. Execute Notifications System
```sql
-- Copy and paste contents of 18_notifications_system.sql
-- Click "Run"
```

**Expected result**: ✅ Success
- Creates: `notifications`, `notification_preferences`, `notification_templates`
- Helper functions: `create_notification()`, `mark_notifications_as_read()`, `get_unread_notifications_count()`
- Real-time subscriptions enabled

### 6. Execute Market Data & Dashboard
```sql
-- Copy and paste contents of 19_market_data_and_dashboard.sql
-- Click "Run"
```

**Expected result**: ✅ Success
- Creates: `market_prices`, `user_dashboard_widgets`, `user_activity`, `user_preferences`
- Helper functions: `get_latest_price()`, `reset_dashboard_to_default()`, `log_activity()`

---

## ✅ Verification Checklist

After executing all files, verify the following:

### Tables Created
```sql
-- Run this query to verify all tables exist:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'posts', 'post_likes', 'post_comments', 'post_comment_likes', 'post_shares', 
  'post_views', 'post_tags', 'posts_tags', 'post_reports', 'post_bookmarks',
  'conversations', 'conversation_participants', 'messages', 'message_read_receipts', 'message_reactions',
  'notifications', 'notification_preferences', 'notification_templates',
  'market_prices', 'user_dashboard_widgets', 'user_activity', 'user_preferences'
)
ORDER BY table_name;
```

**Expected**: 21 tables

### RLS Policies
```sql
-- Verify RLS is enabled on all tables:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'posts', 'post_likes', 'post_comments', 'post_shares',
  'conversations', 'messages',
  'notifications', 'market_prices', 'user_dashboard_widgets'
)
AND rowsecurity = true;
```

**Expected**: All should have `rowsecurity = true`

### Functions Created
```sql
-- Verify helper functions exist:
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'increment_post_likes_count',
  'increment_post_comments_count',
  'increment_post_shares_count',
  'create_direct_conversation',
  'mark_messages_as_read',
  'create_notification',
  'mark_notifications_as_read',
  'get_unread_notifications_count',
  'get_latest_price',
  'reset_dashboard_to_default',
  'log_activity'
)
ORDER BY routine_name;
```

**Expected**: 11 functions

### Real-Time Enabled
```sql
-- Verify real-time is enabled:
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN (
  'posts', 'post_likes', 'post_comments', 'post_comment_likes',
  'conversations', 'messages', 'message_read_receipts', 'message_reactions',
  'notifications'
);
```

**Expected**: 9 tables

---

## 🧪 Test Data (Optional)

### Create a Test Post
```sql
-- Create a test post (replace with your user_id)
INSERT INTO posts (author_id, content, post_type, visibility)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'Hello PoultryCo! This is a test post from the database.',
  'update',
  'public'
);
```

### Create Test Market Prices
```sql
-- Add sample market prices
INSERT INTO market_prices (product_type, product_name, location_state, price, unit, source)
VALUES 
  ('broiler', 'Live Broiler Chicken', 'Tamil Nadu', 125.00, 'kg', 'user_reported'),
  ('eggs_table', 'Table Eggs', 'Tamil Nadu', 4.85, 'piece', 'user_reported'),
  ('feed_broiler_starter', 'Broiler Starter Feed', 'Tamil Nadu', 1850.00, 'bag', 'user_reported');
```

### Create Test Conversation
```sql
-- Create a test conversation between two users
SELECT create_direct_conversation(
  (SELECT id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 0),
  (SELECT id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 1)
);
```

---

## 🔍 Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already created. Skip that file or drop table first:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

### Error: "permission denied"
**Solution**: Ensure you're running as superuser or have proper permissions in Supabase.

### Error: "function does not exist"
**Solution**: Execute the dependent SQL files first (check execution order).

### Error: "column does not exist"
**Solution**: Verify all previous migration files have been executed successfully.

---

## 📊 Database Relationships

### Posts → Profiles
- `posts.author_id` → `profiles.id`
- `post_likes.user_id` → `profiles.id`
- `post_comments.author_id` → `profiles.id`

### Conversations → Profiles
- `conversations.created_by` → `profiles.id`
- `conversation_participants.user_id` → `profiles.id`
- `messages.sender_id` → `profiles.id`

### Notifications → Profiles
- `notifications.recipient_id` → `profiles.id`
- `notifications.sender_id` → `profiles.id`

### Market Prices → Profiles
- `market_prices.reported_by` → `profiles.id`
- `market_prices.verified_by` → `profiles.id`

### Dashboard → Profiles
- `user_dashboard_widgets.user_id` → `profiles.id`
- `user_activity.user_id` → `profiles.id`
- `user_preferences.user_id` → `profiles.id`

---

## 🎯 Feature Availability After Migration

| Feature | Status | Tables Used |
|---------|--------|-------------|
| **Stream (Social Posts)** | ✅ Ready | `posts`, `post_likes`, `post_comments`, `post_shares` |
| **Messaging** | ✅ Ready | `conversations`, `messages`, `conversation_participants` |
| **Notifications** | ✅ Ready | `notifications`, `notification_preferences` |
| **Market Prices** | ✅ Ready | `market_prices` |
| **Dashboard Customization** | ✅ Ready | `user_dashboard_widgets` |
| **Activity Tracking** | ✅ Ready | `user_activity` |

---

## 📱 Integration with Frontend

### Stream Component
```typescript
// apps/web/src/components/stream/StreamContent.tsx
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles(*),
    post_likes(count),
    post_comments(count)
  `)
  .eq('visibility', 'public')
  .order('created_at', { ascending: false });
```

### Messaging Component
```typescript
// apps/web/src/components/messages/MessagesContent.tsx
const { data: conversations } = await supabase
  .from('conversation_participants')
  .select(`
    *,
    conversation:conversations(*),
    user:profiles(*)
  `)
  .eq('user_id', user.id)
  .eq('is_active', true);
```

### Notifications Component
```typescript
// Real-time notifications subscription
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `recipient_id=eq.${user.id}`
  }, (payload) => {
    // Show notification
  })
  .subscribe();
```

---

## 🚀 Next Steps

1. ✅ Execute all SQL files in order
2. ✅ Verify all tables and functions created
3. ✅ Test RLS policies with different users
4. 🔄 Integrate with frontend components
5. 🔄 Add test data for development
6. 🔄 Set up Supabase Storage buckets for media
7. 🔄 Configure email templates for notifications
8. 🔄 Set up cron jobs for market price updates

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs for detailed error messages
2. Verify prerequisite tables exist
3. Ensure proper permissions
4. Review the RLS policies
5. Test with simple queries first

---

**Schema Version**: 1.0
**Last Updated**: 2025-10-25
**Total Tables**: 61 (42 existing + 19 new)
**Total Functions**: 25+ helper functions
**RLS Policies**: Comprehensive security across all tables

