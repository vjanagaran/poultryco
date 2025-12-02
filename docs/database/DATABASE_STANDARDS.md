# 🏗️ Database Naming Standards

**Version:** 2.0  
**Date:** November 30, 2025  
**Type:** Universal Reference Manual

---

## 📋 Overview

Enterprise-grade database naming conventions designed to scale from 100 to 1000+ tables while maintaining clarity, consistency, and developer productivity.

**Key Principles:**
1. ✅ Module-based 3-letter prefixes
2. ✅ Plural table names
3. ✅ Snake_case for all identifiers
4. ✅ Strategic enum vs mapping tables
5. ✅ Consistent column patterns

---

## 🎯 Module Prefix System

### **28 Standard Modules**

| Prefix | Module | Description | Example Tables |
|--------|--------|-------------|----------------|
| `usr_` | User Management | Personal profiles, auth, preferences | `usr_profiles`, `usr_roles`, `usr_sessions` |
| `biz_` | Business | Business profiles, products, services | `biz_profiles`, `biz_products`, `biz_locations` |
| `org_` | Organizations | Associations, memberships, committees | `org_profiles`, `org_members`, `org_events` |
| `soc_` | Social Network | Posts, connections, follows, feeds | `soc_posts`, `soc_connections`, `soc_comments` |
| `msg_` | Messaging | Conversations, messages, real-time | `msg_conversations`, `msg_messages` |
| `ntf_` | Notifications | Push, email, in-app notifications | `ntf_notifications`, `ntf_preferences` |
| `mkt_` | Marketing | Campaigns, content, analytics | `mkt_campaigns`, `mkt_content`, `mkt_segments` |
| `eml_` | Email System | Email queue, templates, tracking | `eml_queue`, `eml_templates`, `eml_events` |
| `cms_` | Content Management | Blog, pages, media | `cms_posts`, `cms_categories`, `cms_media` |
| `nec_` | Market Data | Domain-specific market data | `nec_prices`, `nec_zones`, `nec_predictions` |
| `evt_` | Events | Event management, registrations | `evt_events`, `evt_registrations`, `evt_sessions` |
| `job_` | Jobs & Hiring | Job postings, applications | `job_postings`, `job_applications` |
| `prd_` | Products | Product catalog, inventory | `prd_products`, `prd_categories`, `prd_reviews` |
| `srv_` | Services | Service offerings, bookings | `srv_services`, `srv_bookings` |
| `pay_` | Payments | Transactions, invoices | `pay_transactions`, `pay_invoices` |
| `sub_` | Subscriptions | Plans, billing, usage | `sub_plans`, `sub_subscriptions` |
| `ana_` | Analytics | Stats, metrics, dashboards | `ana_events`, `ana_metrics` |
| `geo_` | Geography | Locations, regions, zones | `geo_countries`, `geo_states` |
| `med_` | Media Storage | Files, images, documents | `med_files`, `med_images` |
| `sec_` | Security | Permissions, audit logs | `sec_permissions`, `sec_audit_logs` |
| `int_` | Integrations | Third-party APIs, webhooks | `int_credentials`, `int_webhooks` |
| `adm_` | Admin | Admin users, settings | `adm_users`, `adm_settings` |
| `gam_` | Gamification | Badges, points, achievements | `gam_badges`, `gam_achievements` |
| `sup_` | Support | Tickets, feedback, help | `sup_tickets`, `sup_feedback` |
| `sch_` | Scheduling | Cron jobs, tasks, queues | `sch_jobs`, `sch_tasks` |
| `sea_` | Search | Search indexes, suggestions | `sea_indexes`, `sea_suggestions` |
| `ref_` | Reference Data | Master data, lookups | `ref_countries`, `ref_currencies` |
| `que_` | Queues | Background job queues | `que_sms`, `que_whatsapp` |
| `ai__` | AI/ML | Predictions, training data | `ai_predictions`, `ai_models` |

### **Core Tables (No Prefix)**

Only fundamental, cross-cutting tables:
- `profiles` - Central user profiles (referenced by 50+ tables)
- `auth_users` - Authentication (Supabase/Cognito)
- `migrations` - Database migrations
- `schema_version` - Schema versioning

---

## 🔤 Naming Convention Rules

### **1. Table Names: PLURAL + SNAKE_CASE + PREFIX**

**Pattern:** `{prefix}_{entity_plural}`

```sql
✅ CORRECT:
usr_profiles
biz_products
org_members
soc_posts
msg_conversations

❌ WRONG:
user_profile          (singular)
UserProfiles          (PascalCase)
bizProducts           (camelCase)
biz-products          (kebab-case)
profiles              (missing prefix, unless core table)
```

---

### **2. Junction Tables: BOTH_ENTITY_NAMES**

**Pattern:** `{prefix}_{entity1}_{entity2}`

```sql
✅ CORRECT:
usr_profile_roles          (users ↔ roles)
soc_post_tags              (posts ↔ tags)
org_member_committees      (members ↔ committees)
evt_event_speakers         (events ↔ speakers)

❌ WRONG:
usr_usr_profile_usr_roles  (redundant prefix)
profile_role               (missing prefix)
user_has_roles             (avoid "has" verbs)
```

---

### **3. Detail/Extension Tables: PARENT_DETAILS**

**Pattern:** `{prefix}_{parent}_{type}_details` or `{prefix}_{descriptive_name}`

```sql
✅ CORRECT:
usr_farmer_details              (farmer-specific fields)
usr_veterinarian_details
biz_contact_info
org_membership_tiers

❌ WRONG:
usr_details_farmer              (wrong order)
farmer_details                  (missing context)
```

---

### **4. Column Naming Patterns**

| Pattern | Usage | Examples |
|---------|-------|----------|
| `id` | Primary key (UUID) | `id` |
| `{entity}_id` | Foreign key | `user_id`, `business_id`, `post_id` |
| `{adjective}_name` | Name fields | `full_name`, `display_name`, `business_name` |
| `{field}_url` | URLs | `profile_photo_url`, `website_url`, `logo_url` |
| `{field}_at` | Timestamps | `created_at`, `updated_at`, `deleted_at` |
| `is_{state}` | Boolean flags | `is_active`, `is_public`, `is_verified` |
| `has_{feature}` | Boolean capabilities | `has_premium`, `has_access` |
| `{field}_count` | Counters | `post_count`, `follower_count` |
| `{field}_level` | Levels/tiers | `verification_level`, `membership_level` |
| `{field}_type` | Type discriminators | `role_type`, `event_type` |
| `{field}_status` | Status fields | `payment_status`, `registration_status` |

**Example:**
```sql
CREATE TABLE usr_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  profile_slug TEXT UNIQUE NOT NULL,
  profile_photo_url TEXT,
  email TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_level TEXT DEFAULT 'basic',
  follower_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **5. Index Naming Convention**

```sql
-- Primary Key
pk_{table_name}
pk_usr_profiles

-- Foreign Key
fk_{source_table}_{target_table}
fk_soc_posts_usr_profiles

-- Unique Constraint
uq_{table_name}_{column_name}
uq_usr_profiles_email

-- Regular Index
idx_{table_name}_{column_name}
idx_usr_profiles_location_state

-- Composite Index
idx_{table_name}_{col1}_{col2}
idx_soc_posts_author_id_created_at

-- Full-text Search
fts_{table_name}_{column_name}
fts_usr_profiles_search_vector

-- GIN Index (arrays, JSONB)
gin_{table_name}_{column_name}
gin_usr_profiles_skills
```

---

### **6. Constraint Naming Convention**

```sql
-- Check Constraint
ck_{table_name}_{column_name}_{condition}
ck_usr_profiles_profile_strength_range

-- Default Constraint
df_{table_name}_{column_name}
df_usr_profiles_created_at
```

---

## 🔀 Decision Tree: Enum vs Mapping Table

### **Decision Matrix**

| Criteria | Use ENUM | Use MAPPING TABLE |
|----------|----------|-------------------|
| **Values Change?** | Never/Rarely | Frequently |
| **Need Attributes?** | No | Yes (description, icon, color) |
| **User-Defined?** | No | Yes |
| **Count** | < 10 values | > 10 values |
| **Localization?** | No | Yes |
| **Soft Delete?** | No | Yes |
| **Audit Trail?** | No | Yes |

### **Rule of Thumb:**
- If you might add "description" or "icon" later → **Mapping table**
- If values are truly fixed and simple → **Enum**
- **When in doubt → Mapping table** (easier to extend)

---

## 📚 Real-World Examples

### **Example 1: User Role System**

**✅ GOOD: Junction Table + Reference Table**

```sql
-- Reference table for role definitions
CREATE TABLE ref_roles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for user-role assignments
CREATE TABLE usr_profile_roles (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  role_id UUID REFERENCES ref_roles(id),
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);

-- Role-specific details
CREATE TABLE usr_farmer_details (
  profile_role_id UUID PRIMARY KEY REFERENCES usr_profile_roles(id),
  farm_size DECIMAL,
  farm_type TEXT,
  bird_capacity INTEGER,
  years_experience INTEGER
);
```

**Why:** Users can have multiple roles, each with attributes, extensible

---

### **Example 2: Post Visibility**

**✅ GOOD: Using ENUM (Simple, Fixed)**

```sql
CREATE TYPE post_visibility AS ENUM ('public', 'connections', 'private');

CREATE TABLE soc_posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  visibility post_visibility DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** Only 3 values, will never change, no attributes needed

---

### **Example 3: Business Types**

**✅ GOOD: Reference Table**

```sql
CREATE TABLE ref_business_types (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,  -- 'production', 'supply', 'service'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE biz_profiles (
  id UUID PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_type_id UUID REFERENCES ref_business_types(id)
);
```

**Why:** Can add new types without code deploy, need icons/descriptions

---

### **Example 4: Product Categories (Hierarchical)**

**✅ GOOD: Self-Referencing Table**

```sql
CREATE TABLE ref_product_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES ref_product_categories(id),  -- Self-reference
  level INTEGER,  -- 0 = top, 1 = sub, 2 = sub-sub
  path TEXT,  -- 'poultry/feed/starter'
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query all products in category and subcategories:
SELECT p.* 
FROM prd_products p
JOIN ref_product_categories c ON p.category_id = c.id
WHERE c.path LIKE 'poultry/feed%';
```

**Why:** Supports unlimited hierarchy depth, efficient queries

---

### **Example 5: Notification Types**

**✅ GOOD: Mapping Table with Metadata**

```sql
CREATE TABLE ref_notification_types (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  priority INTEGER,  -- 1 = high, 5 = low
  template TEXT,  -- '{actor} liked your post'
  action_url_pattern TEXT,  -- '/posts/{resource_id}'
  is_real_time BOOLEAN DEFAULT true,
  is_email BOOLEAN DEFAULT false,
  is_push BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ntf_notifications (
  id UUID PRIMARY KEY,
  recipient_id UUID REFERENCES profiles(id),
  type_id UUID REFERENCES ref_notification_types(id),
  actor_id UUID REFERENCES profiles(id),
  resource_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** Add new types without deploy, customize templates, control channels

---

### **Example 6: Polymorphic Likes**

**✅ GOOD: Separate Tables (Type-Safe)**

```sql
-- Separate table for each entity type
CREATE TABLE soc_post_likes (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES soc_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE soc_comment_likes (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES soc_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);
```

**Alternative: Polymorphic (Less Type-Safe)**
```sql
CREATE TABLE shr_entity_likes (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,  -- 'post', 'comment', 'product'
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, user_id)
);
```

**Recommendation:** Separate tables for better data integrity

---

## 🎯 Common Patterns

### **Standard Timestamps**

```sql
CREATE TABLE example_table (
  id UUID PRIMARY KEY,
  
  -- Always include:
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Optional based on needs:
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ
);
```

---

### **Soft Deletes**

```sql
CREATE TABLE soc_posts (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active records only
CREATE INDEX idx_soc_posts_active 
ON soc_posts(created_at) 
WHERE is_deleted = false;
```

---

### **Audit Fields**

```sql
CREATE TABLE important_table (
  id UUID PRIMARY KEY,
  -- data fields...
  
  -- Audit trail
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Slug Generation**

```sql
CREATE TABLE usr_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  profile_slug TEXT UNIQUE NOT NULL,  -- 'john-doe-chennai'
  location_city TEXT
);

-- Function to generate slug
CREATE OR REPLACE FUNCTION generate_profile_slug(
  p_full_name TEXT, 
  p_location_city TEXT, 
  p_id UUID
)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(
    p_full_name || '-' || COALESCE(p_location_city, ''),
    '[^a-zA-Z0-9]+', '-', 'g'
  ));
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  base_slug := substring(base_slug, 1, 60);
  final_slug := base_slug;
  
  WHILE EXISTS (
    SELECT 1 FROM usr_profiles 
    WHERE profile_slug = final_slug AND id != p_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
```

---

## ✅ Quick Reference Cheat Sheet

### **Table Naming**
```
{prefix}_{entity_plural}
usr_profiles, biz_products, soc_posts
```

### **Junction Tables**
```
{prefix}_{entity1}_{entity2}
usr_profile_roles, soc_post_tags
```

### **Detail Tables**
```
{prefix}_{parent}_{type}_details
usr_farmer_details, biz_contact_info
```

### **Column Naming**
```
id                  → Primary key
{entity}_id         → Foreign key
{field}_name        → Names
{field}_url         → URLs
{field}_at          → Timestamps
is_{state}          → Booleans
{field}_count       → Counters
```

---

## 📋 Validation Checklist

Before creating a new table:

- [ ] Table name is **plural**
- [ ] Table name uses **snake_case**
- [ ] Table has appropriate **3-letter prefix** (or is core)
- [ ] All columns use **snake_case**
- [ ] Foreign keys follow `{entity}_id` pattern
- [ ] Timestamps use `_at` suffix
- [ ] Booleans use `is_` or `has_` prefix
- [ ] Indexes follow naming convention
- [ ] Constraints follow naming convention
- [ ] Enum vs mapping table decision documented

---

## 🚫 Anti-Patterns to Avoid

### **❌ Inconsistent Naming**
```sql
-- BAD: Mixed conventions
user_profiles
UserRoles
profile_farmer
work_experience
user_has_skills
```

### **❌ Redundant Prefixes**
```sql
-- BAD: Double prefixes
usr_usr_profile_usr_roles

-- GOOD: Single prefix
usr_profile_roles
```

### **❌ Verb-Based Names**
```sql
-- BAD: Using verbs
user_has_roles
post_belongs_to_user

-- GOOD: Noun-based
usr_profile_roles
soc_posts (with author_id FK)
```

### **❌ Abbreviations**
```sql
-- BAD: Unclear abbreviations
usr_prof
biz_prod
org_mem

-- GOOD: Full words
usr_profiles
biz_products
org_members
```

---

## 📚 References

- PostgreSQL Naming Conventions: https://wiki.postgresql.org/wiki/Don%27t_Do_This
- Stripe API Design: https://stripe.com/docs/api
- Shopify Engineering: https://shopify.engineering/
- AWS RDS Best Practices: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html

---

**Last Updated:** November 30, 2025  
**Version:** 2.0  
**Status:** Production Standard

