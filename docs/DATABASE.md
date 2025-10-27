# PoultryCo Database Schema - Complete Reference

**Last Updated:** October 27, 2024  
**Status:** ✅ Production Ready  
**Total Tables:** 70+  
**Schema Version:** v1.0

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Schema Files (Execution Order)](#schema-files-execution-order)
3. [Core Modules](#core-modules)
4. [Complete Table List](#complete-table-list)
5. [Key Relationships](#key-relationships)
6. [RLS Security Model](#rls-security-model)
7. [Indexes & Performance](#indexes--performance)
8. [Storage Buckets](#storage-buckets)

---

## 🚀 Quick Start

### Setting Up Fresh Database

```bash
# 1. Create new Supabase project
# 2. Navigate to SQL Editor
# 3. Execute schema files in order:

cd supabase/schema/
# Execute files 01-28 in sequence
```

### Execution Sequence
```
01_core_profiles.sql          → User profiles & auth
02_profile_roles.sql          → Role management
03_professional_info.sql      → Experience, education, skills
04_business_details.sql       → Business profiles
05_business_products_jobs.sql → Products & job postings
06_organizations.sql          → Organization profiles
07_memberships_events.sql     → Memberships & events
08_event_speakers_exhibitors.sql → Event management
09_privacy_verification_gamification.sql → Privacy & gamification
10_network_connections.sql    → Connections & follows
11_stats_metrics.sql          → Analytics & stats
12_rls_policies.sql           → Row Level Security
13_admin_roles.sql            → Admin management
14_marketing_cms.sql          → CMS & blog
15_social_posts_system.sql    → Stream/Feed posts
16_social_posts_rls.sql       → Post security
17_messaging_system.sql       → WhatsApp-style messaging
18_notifications_system.sql   → Notifications
19_market_data_and_dashboard.sql → Market data
20_storage_buckets_and_policies.sql → CDN storage
21_add_cover_photo.sql        → Profile enhancements
22_messaging_performance_optimization.sql → Indexes
23_notification_triggers.sql  → Auto-notifications
24_discovery_system_tables.sql → Discovery tables
25_discovery_system_indexes.sql → Discovery indexes
26_make_profiles_global.sql   → Global platform support
27_fix_profile_insert_policy.sql → Profile RLS fix
28_final_rls_fixes.sql        → Final RLS corrections
```

---

## 🏗️ Core Modules

### 1. **Profile System**
Core user management with multi-role support

**Tables:**
- `profiles` - User profiles (personal)
- `profile_roles` - Role assignments
- `profile_experience` - Work history
- `profile_education` - Education history
- `profile_skills` - Skills & endorsements
- `profile_stats` - Engagement metrics
- `privacy_settings` - Privacy controls
- `verification_requests` - Verification system

**Key Features:**
- Progressive profile completion
- Role-based customization (Farmer, Veterinarian, etc.)
- LinkedIn-style professional profiles
- Photo uploads (profile + cover)
- Privacy controls per section

---

### 2. **Business Profiles**
Complete business directory & storefront

**Tables:**
- `business_profiles` - Company profiles
- `business_profiles_contact` - Contact information
- `business_locations` - Multiple locations
- `business_products` - Product catalog
- `product_images` - Product photos
- `business_certifications` - Certifications & licenses
- `business_team_members` - Team management
- `business_contact_persons` - Contact assignments
- `business_farm_details` - Farm-specific data
- `business_supplier_details` - Supplier-specific data
- `business_stats` - Business analytics

**Key Features:**
- Multi-location support
- Product catalog with images
- Team management with roles
- Certification tracking
- Type-specific details (farm/supplier)
- Public directory with verified badges

---

### 3. **Organization Profiles**
Communities, associations, forums

**Tables:**
- `organization_profiles` - Organization data
- `organization_contact` - Contact info
- `organization_leadership` - Leadership team
- `organization_membership_tiers` - Membership levels
- `organization_members` - Members list
- `organization_resources` - Shared resources
- `organization_announcements` - Updates
- `organization_events` - Events calendar
- `organization_stats` - Analytics

**Key Features:**
- Multi-tier membership
- Leadership management
- Resource sharing
- Event management
- Public/private groups

---

### 4. **Discovery System**
Advanced search & filtering

**Tables:**
- `business_types` - Predefined business categories
- `organization_types` - Organization categories
- `product_categories` - 3-level product taxonomy
- `product_subcategories`
- `product_types`
- `job_types` - Job categories
- `event_types` - Event categories

**Key Features:**
- Unified search across all entities
- Industry-specific filters
- Location-based search
- Trust badges & ratings
- Verified listings

---

### 5. **Network & Connections**
LinkedIn-style networking

**Tables:**
- `connections` - 2-way connections
- `follows` - 1-way follows
- `follower_stats` - Follower counts
- `connection_stats` - Connection counts

**Key Features:**
- Connection requests (pending/connected/blocked)
- Follow system (connections + followers)
- Request tracking
- Mutual connection detection

---

### 6. **Stream (Social Feed)**
LinkedIn-style social feed

**Tables:**
- `posts` - Main posts
- `post_images` - Multi-image support
- `post_mentions` - @mentions
- `post_hashtags` - #hashtags
- `post_engagement` - Likes, saves
- `comments` - Nested comments
- `shares` - Post sharing
- `post_reports` - Content moderation

**Key Features:**
- Rich text posts with markdown
- Multi-image upload
- @mentions & #hashtags
- Engagement (like, comment, share, save)
- Visibility controls (public/connections/private)
- Real-time updates
- Offline support (IndexedDB)

---

### 7. **Messaging System**
WhatsApp-style messaging

**Tables:**
- `conversations` - Chat threads
- `conversation_participants` - Participants list
- `messages` - Message content
- `message_status` - Delivery tracking (1-tick, 2-tick, read)
- `message_media` - Media attachments
- `message_reactions` - Emoji reactions

**Key Features:**
- One-on-one chats
- Group chats (public/private)
- Message delivery status
- Media sharing (images, videos, docs, audio)
- Message actions (reply, forward, delete)
- Real-time with Supabase Realtime
- Persistent history (Telegram-style)
- Offline support (IndexedDB)

---

### 8. **Notifications System**
Comprehensive notification system

**Tables:**
- `notifications` - Notification records
- `notification_preferences` - User preferences
- `notification_templates` - Message templates

**Key Features:**
- 8 trigger-based notifications
- In-app, email, push support
- Real-time updates
- Notification preferences per type
- Mark as read/unread
- Auto-cleanup old notifications

**Notification Types:**
- Post likes & comments
- @Mentions
- Connection requests & acceptance
- New messages
- Event invitations
- Business inquiries
- Organization updates

---

### 9. **CMS & Marketing**
Content management

**Tables:**
- `blog_posts` - Blog articles
- `blog_categories` - Categories
- `blog_tags` - Tags
- `blog_comments` - Comments
- `case_studies` - Success stories
- `testimonials` - User testimonials
- `faqs` - FAQ system
- `contact_submissions` - Contact form
- `early_access_signups` - Waitlist

---

### 10. **Admin System**
Platform management

**Tables:**
- `admin_roles` - Admin permissions
- `admin_activity_log` - Audit trail
- `platform_settings` - Configuration

---

## 📊 Complete Table List (70+ Tables)

### Core (14 tables)
- profiles
- profile_roles
- profile_experience
- profile_education
- profile_skills
- profile_stats
- privacy_settings
- verification_requests
- gamification_points
- badges
- user_badges
- connections
- follows
- follower_stats

### Business (18 tables)
- business_profiles
- business_profiles_contact
- business_locations
- business_products
- product_images
- product_categories
- product_subcategories
- product_types
- business_certifications
- business_team_members
- business_contact_persons
- business_farm_details
- business_supplier_details
- business_stats
- business_types
- job_postings
- job_applications
- job_types

### Organizations (12 tables)
- organization_profiles
- organization_contact
- organization_leadership
- organization_membership_tiers
- organization_members
- organization_resources
- organization_announcements
- organization_events
- event_speakers
- event_exhibitors
- organization_stats
- organization_types
- event_types

### Social (9 tables)
- posts
- post_images
- post_mentions
- post_hashtags
- post_engagement
- comments
- shares
- post_reports
- hashtags

### Messaging (6 tables)
- conversations
- conversation_participants
- messages
- message_status
- message_media
- message_reactions

### Notifications (3 tables)
- notifications
- notification_preferences
- notification_templates

### CMS (9 tables)
- blog_posts
- blog_categories
- blog_tags
- blog_comments
- case_studies
- testimonials
- faqs
- contact_submissions
- early_access_signups

### Admin (3 tables)
- admin_roles
- admin_activity_log
- platform_settings

---

## 🔐 RLS Security Model

### Public Data (No authentication required)
- Blog posts, case studies, testimonials
- Business profiles (public directory)
- Organization profiles (public)
- Public events
- Product catalog
- Job listings

### Authenticated Users
- Create/read own profile
- Create connections & follows
- Create posts, comments, engagements
- Send messages
- Create business/organization profiles (if owner)

### Profile Owners
- Update/delete own profile
- Manage own experience, education, skills
- Privacy settings control

### Business Owners
- Full CRUD on own business
- Manage team members
- Manage products & locations
- Manage certifications

### Organization Admins
- Manage organization details
- Manage members & leadership
- Create events & resources
- Manage announcements

### Admins
- Platform-wide access
- Content moderation
- User management
- Analytics access

---

## ⚡ Indexes & Performance

### High-Traffic Indexes
```sql
-- Profiles
CREATE INDEX idx_profiles_slug ON profiles(profile_slug);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_verification ON profiles(verification_level);

-- Connections
CREATE INDEX idx_connections_profile_1 ON connections(profile_id_1);
CREATE INDEX idx_connections_profile_2 ON connections(profile_id_2);
CREATE INDEX idx_connections_status ON connections(status);
CREATE UNIQUE INDEX idx_connections_unique_pair ON connections(profile_id_1, profile_id_2);

-- Posts (Stream)
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_post_hashtags_tag ON post_hashtags(hashtag_id);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_message_status_message ON message_status(message_id);
CREATE INDEX idx_message_status_user ON message_status(user_id);

-- Full-text search
CREATE INDEX idx_messages_content_fts ON messages USING GIN(to_tsvector('english', content));

-- Business
CREATE INDEX idx_business_profiles_slug ON business_profiles(business_slug);
CREATE INDEX idx_business_profiles_type ON business_profiles(business_type);
CREATE INDEX idx_business_profiles_verified ON business_profiles(is_verified);
CREATE INDEX idx_business_products_business ON business_products(business_profile_id);

-- Organizations
CREATE INDEX idx_organization_profiles_slug ON organization_profiles(slug);
CREATE INDEX idx_organization_profiles_type ON organization_profiles(organization_type_id);
CREATE INDEX idx_organization_events_date ON organization_events(event_date);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### Compound Indexes
```sql
-- Messages by conversation and time
CREATE INDEX idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC);

-- Unread messages per user
CREATE INDEX idx_message_status_unread 
  ON message_status(user_id, status) 
  WHERE status != 'read';

-- Active connections
CREATE INDEX idx_connections_active 
  ON connections(profile_id_1, profile_id_2, status) 
  WHERE status = 'connected';
```

---

## 💾 Storage Buckets

### `cdn-poultryco` (Public)
Main CDN bucket for all media

**Structure:**
```
cdn-poultryco/
├── profiles/
│   ├── avatars/           # Profile photos (WebP, 400x400)
│   └── covers/            # Cover photos (WebP, 1200x400)
├── businesses/
│   ├── logos/             # Business logos
│   ├── covers/            # Business covers
│   └── products/          # Product images
├── organizations/
│   ├── logos/
│   └── covers/
├── posts/
│   └── {user_id}/         # Post images
├── messages/
│   ├── images/            # Message images
│   ├── videos/            # Message videos
│   ├── documents/         # Message documents
│   └── audio/             # Voice messages
└── certifications/        # Certificate uploads

**Policies:**
- SELECT: Public (anyone can view)
- INSERT: Authenticated users (own folders)
- UPDATE: Owners only
- DELETE: Owners only

**Optimizations:**
- WebP format for images
- Thumbnail generation
- Storage tracking
- LRU eviction for offline cache

---

## 🔄 Real-time Subscriptions

### Enabled Tables
- `posts` - New feed posts
- `comments` - New comments
- `post_engagement` - Likes, saves
- `messages` - New messages
- `message_status` - Delivery status
- `notifications` - New notifications
- `connections` - Connection requests
- `conversations` - Conversation updates

---

## 📈 Analytics & Stats Tables

### Profile Stats
- `profile_stats` - Views, connections, engagements

### Business Stats
- `business_stats` - Views, inquiries, product views

### Organization Stats
- `organization_stats` - Member count, event attendance

### Post Stats
- Denormalized in `posts` table (like_count, comment_count, share_count)

---

## 🛠️ Maintenance

### Regular Tasks
1. **Cleanup old notifications** (> 90 days)
2. **Archive old messages** (optional)
3. **Optimize indexes** (REINDEX)
4. **Vacuum tables** (VACUUM ANALYZE)
5. **Monitor storage usage**

### Backup Strategy
- Daily automated backups (Supabase)
- Weekly full exports
- Point-in-time recovery enabled

---

## 📚 Related Documentation

- [Setup New Environment](./SETUP_NEW_ENVIRONMENT.md)
- [Schema Migration Guide](./schema/SQL_MIGRATION_GUIDE.md)
- [Storage Setup](./storage/CDN_SETUP.md)
- [RLS Policies Deep Dive](./schema/12_rls_policies.sql)

---

## ✅ Schema Status

| Module | Status | Tables | Indexes | RLS | Real-time |
|--------|--------|--------|---------|-----|-----------|
| Profiles | ✅ Complete | 14 | ✅ | ✅ | ✅ |
| Business | ✅ Complete | 18 | ✅ | ✅ | ✅ |
| Organizations | ✅ Complete | 12 | ✅ | ✅ | ✅ |
| Stream | ✅ Complete | 9 | ✅ | ✅ | ✅ |
| Messaging | ✅ Complete | 6 | ✅ | ✅ | ✅ |
| Notifications | ✅ Complete | 3 | ✅ | ✅ | ✅ |
| Discovery | ✅ Complete | 7 | ✅ | ✅ | - |
| CMS | ✅ Complete | 9 | ✅ | ✅ | - |
| Admin | ✅ Complete | 3 | ✅ | ✅ | - |

**Total: 70+ tables, 150+ indexes, Full RLS coverage, 8 real-time modules**

---

**Last Schema Update:** October 27, 2024  
**Production Status:** ✅ Live & Stable  
**Next Review:** Monthly or before major feature additions

