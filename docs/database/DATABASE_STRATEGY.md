# 🎯 PoultryCo Database Strategy

**Version:** 2.0  
**Date:** November 30, 2025  
**Purpose:** Implementation strategy for 500-table architecture

---

## 📊 Current State Analysis

### **Existing Tables: 161**

Current tables organized by future module:

**User Management (usr_) - 18 tables:**
- profile_roles, profile_farmer_details, profile_veterinarian_details, profile_supplier_details
- profile_consultant_details, profile_researcher_details, profile_experience, profile_education
- profile_certifications, profile_skills, skill_endorsements, profile_privacy_settings
- profile_verifications, profile_completeness_checks, profile_badges, profile_stats
- user_preferences, user_activity

**Business (biz_) - 17 tables:**
- business_profiles, business_profiles_contact, business_locations, business_service_areas
- business_team_members, business_contact_persons, business_farm_details, business_supplier_details
- business_certifications, business_stats, business_types, service_categories, service_attributes
- product_categories, business_products, product_images, product_reviews

**Organizations (org_) - 24 tables:**
- organizations, organizations_contact, organization_offices, organization_leadership
- organization_membership_tiers, organization_committees, organization_committee_members
- organization_resources, organization_announcements, organization_members
- organization_membership_applications, organization_member_invitations
- organization_membership_history, organization_roles, organization_stats, organization_types
- organization_events, organization_event_registrations, organization_event_speakers
- organization_event_exhibitors, organization_event_sponsors, organization_event_agenda
- organization_event_resources, organization_event_feedback

**Social Network (soc_) - 15 tables:**
- posts, post_likes, post_comments, post_comment_likes, post_shares, post_bookmarks
- post_views, post_reports, post_tags, posts_tags (duplicate), connections
- connection_suggestions, follows, blocked_users, share_tracking

**Messaging (msg_) - 6 tables:**
- conversations, conversation_participants, messages, message_reactions
- message_read_receipts, offline_message_queue

**Notifications (ntf_) - 3 tables:**
- notifications, notification_preferences, notification_templates

**Marketing (mkt_) - 18 tables:**
- stakeholder_segments, content_pillars, content_pillar_types, content_topics
- content_topic_segments, content_types, content, content_ideas, content_schedule
- content_tags, content_tag_assignments, content_campaigns, content_campaign_assignments
- pillar_campaign_assignments, pillar_tag_assignments, pillar_types (duplicate)
- marketing_channels, platform_kpis

**Email (eml_) - 12 tables:**
- email_queue, email_templates, email_template_versions, email_campaigns
- email_events, email_provider_config, email_senders, email_domains
- email_suppressions, campaign_recipients, campaign_steps, ses_events

**CMS (cms_) - 7 tables:**
- blog_posts, blog_categories, blog_tags, blog_post_tags
- early_access_signups, newsletter_subscribers, contact_submissions

**NECC (nec_) - 6 tables:**
- necc_zones, necc_prices, necc_annotations, necc_annotation_metadata
- necc_ai_predictions, necc_scraper_logs

**Events (evt_) - 14 tables:**
- events, event_types, event_registrations, event_sessions, event_speakers
- event_sponsors, event_sponsor_tiers, event_expo_stalls, event_ticket_types
- event_checkins, organization_event_speakers (duplicate), organization_event_exhibitors
- organization_event_sponsors (duplicate), organization_event_agenda (duplicate)

**Jobs (job_) - 3 tables:**
- business_jobs, job_categories_master, job_types

**Products (prd_) - 4 tables:**
- business_products (duplicate), product_images (duplicate), product_reviews (duplicate)
- product_categories (duplicate)

**Admin (adm_) - 1 table:**
- admin_users

**Support (sup_) - 9 tables:**
- feedback_submissions, feedback_categories, feedback_tags, feedback_tag_relations
- feedback_comments, feedback_attachments, feedback_workflows
- feedback_response_templates, feedback_insights

**Integrations (int_) - 2 tables:**
- integration_credentials, invitations

**Analytics (ana_) - 4 tables:**
- user_feedback_stats, social_media_kpis, market_prices, ndp_categories

**Reference Data (ref_) - 12 tables:**
- business_types, organization_types, event_types, job_categories_master, job_types
- product_categories, service_categories, service_attributes, entity_types
- skills, contact_imports, user_dashboard_widgets

**Shared (shr_) - 4 tables:**
- entity_likes, entity_comments, entity_shares, social_share_templates

**Queues (que_) - 3 tables:**
- sms_queue, whatsapp_queue, offline_message_queue (duplicate)

**Preferences (prf_) - 2 tables:**
- user_email_preferences, user_email_preferences_v2 (duplicate)

**Core (no prefix) - 1 table:**
- profiles

---

## 🎯 Target Architecture

### **500 Tables Over 2 Years**

**Module Distribution:**

| Module | Prefix | Current | Year 1 | Year 2 | Growth |
|--------|--------|---------|--------|--------|--------|
| User Management | `usr_` | 18 | 25 | 35 | +17 |
| Business | `biz_` | 14 | 20 | 30 | +16 |
| Organizations | `org_` | 16 | 25 | 35 | +19 |
| Social Network | `soc_` | 14 | 20 | 30 | +16 |
| Messaging | `msg_` | 6 | 10 | 15 | +9 |
| Notifications | `ntf_` | 3 | 8 | 12 | +9 |
| Marketing | `mkt_` | 18 | 25 | 35 | +17 |
| Email | `eml_` | 12 | 15 | 20 | +8 |
| CMS | `cms_` | 7 | 12 | 18 | +11 |
| NECC | `nec_` | 6 | 10 | 15 | +9 |
| Events | `evt_` | 10 | 15 | 25 | +15 |
| Jobs | `job_` | 1 | 8 | 15 | +14 |
| Products | `prd_` | 3 | 10 | 20 | +17 |
| Services | `srv_` | 0 | 5 | 15 | +15 |
| Payments | `pay_` | 0 | 10 | 20 | +20 |
| Subscriptions | `sub_` | 0 | 8 | 15 | +15 |
| Analytics | `ana_` | 4 | 15 | 30 | +26 |
| Geography | `geo_` | 0 | 5 | 10 | +10 |
| Media | `med_` | 0 | 8 | 15 | +15 |
| Security | `sec_` | 0 | 10 | 20 | +20 |
| Integrations | `int_` | 2 | 8 | 15 | +13 |
| Admin | `adm_` | 1 | 5 | 10 | +9 |
| Gamification | `gam_` | 0 | 5 | 12 | +12 |
| Support | `sup_` | 9 | 12 | 18 | +9 |
| Scheduling | `sch_` | 0 | 5 | 10 | +10 |
| Search | `sea_` | 0 | 8 | 15 | +15 |
| Reference Data | `ref_` | 12 | 20 | 30 | +18 |
| AI/ML | `ai__` | 0 | 10 | 25 | +25 |
| **TOTAL** | | **161** | **300** | **500** | **+339** |

---

## 🔄 Table Renaming Map

### **Tables to Rename (Add Prefix)**

```
Current Name                        → New Name
─────────────────────────────────────────────────────────────
# User Management
profile_roles                       → usr_profile_roles
profile_farmer_details              → usr_farmer_details
profile_veterinarian_details        → usr_veterinarian_details
profile_supplier_details            → usr_supplier_details
profile_consultant_details          → usr_consultant_details
profile_researcher_details          → usr_researcher_details
profile_experience                  → usr_experiences
profile_education                   → usr_education
profile_certifications              → usr_certifications
profile_skills                      → usr_profile_skills
skill_endorsements                  → usr_skill_endorsements
profile_privacy_settings            → usr_privacy_settings
profile_verifications               → usr_verifications
profile_completeness_checks         → usr_completeness_checks
profile_badges                      → usr_badges
profile_stats                       → usr_stats
user_preferences                    → usr_preferences
user_activity                       → usr_activity

# Business
business_profiles                   → biz_profiles
business_profiles_contact           → biz_contact_info
business_locations                  → biz_locations
business_service_areas              → biz_service_areas
business_team_members               → biz_team_members
business_contact_persons            → biz_contact_persons
business_farm_details               → biz_farm_details
business_supplier_details           → biz_supplier_details
business_certifications             → biz_certifications
business_stats                      → biz_stats

# Organizations
organizations                       → org_profiles
organizations_contact               → org_contact_info
organization_offices                → org_offices
organization_leadership             → org_leadership
organization_membership_tiers       → org_membership_tiers
organization_committees             → org_committees
organization_committee_members      → org_committee_members
organization_resources              → org_resources
organization_announcements          → org_announcements
organization_members                → org_members
organization_membership_applications → org_membership_applications
organization_member_invitations     → org_member_invitations
organization_membership_history     → org_membership_history
organization_roles                  → org_roles
organization_stats                  → org_stats

# Social Network
posts                               → soc_posts
post_likes                          → soc_post_likes
post_comments                       → soc_post_comments
post_comment_likes                  → soc_comment_likes
post_shares                         → soc_post_shares
post_bookmarks                      → soc_post_bookmarks
post_views                          → soc_post_views
post_reports                        → soc_post_reports
post_tags                           → soc_post_tags
connections                         → soc_connections
connection_suggestions              → soc_connection_suggestions
follows                             → soc_follows
blocked_users                       → soc_blocked_users
share_tracking                      → soc_share_tracking

# Messaging
conversations                       → msg_conversations
conversation_participants           → msg_participants
messages                            → msg_messages
message_reactions                   → msg_reactions
message_read_receipts               → msg_read_receipts

# Notifications
notifications                       → ntf_notifications
notification_preferences            → ntf_preferences
notification_templates              → ntf_templates

# Marketing
stakeholder_segments                → mkt_segments
content_pillars                     → mkt_content_pillars
content_pillar_types                → mkt_pillar_types
content_topics                      → mkt_topics
content_topic_segments              → mkt_topic_segments
content_types                       → mkt_content_types
content                             → mkt_content
content_ideas                       → mkt_content_ideas
content_schedule                    → mkt_content_schedule
content_tags                        → mkt_tags
content_tag_assignments             → mkt_content_tags
content_campaigns                   → mkt_campaigns
content_campaign_assignments        → mkt_campaign_content
pillar_campaign_assignments         → mkt_campaign_pillars
pillar_tag_assignments              → mkt_pillar_tags
marketing_channels                  → mkt_channels
platform_kpis                       → mkt_platform_kpis

# Email
email_queue                         → eml_queue
email_templates                     → eml_templates
email_template_versions             → eml_template_versions
email_campaigns                     → eml_campaigns
email_events                        → eml_events
email_provider_config               → eml_provider_config
email_senders                       → eml_senders
email_domains                       → eml_domains
email_suppressions                  → eml_suppressions
campaign_recipients                 → eml_campaign_recipients
campaign_steps                      → eml_campaign_steps
ses_events                          → eml_ses_events

# CMS
blog_posts                          → cms_posts
blog_categories                     → cms_categories
blog_tags                           → cms_tags
blog_post_tags                      → cms_post_tags
early_access_signups                → cms_early_access
newsletter_subscribers              → cms_newsletter_subscribers
contact_submissions                 → cms_contact_submissions

# NECC
necc_zones                          → nec_zones
necc_prices                         → nec_prices
necc_annotations                    → nec_annotations
necc_annotation_metadata            → nec_annotation_metadata
necc_ai_predictions                 → nec_predictions
necc_scraper_logs                   → nec_scraper_logs

# Events
events                              → evt_events
event_registrations                 → evt_registrations
event_sessions                      → evt_sessions
event_speakers                      → evt_speakers
event_sponsors                      → evt_sponsors
event_sponsor_tiers                 → evt_sponsor_tiers
event_expo_stalls                   → evt_expo_stalls
event_ticket_types                  → evt_ticket_types
event_checkins                      → evt_checkins
organization_event_exhibitors       → evt_exhibitors

# Jobs
business_jobs                       → job_postings

# Products
business_products                   → prd_products
product_images                      → prd_images
product_reviews                     → prd_reviews

# Admin
admin_users                         → adm_users

# Support
feedback_submissions                → sup_submissions
feedback_categories                 → sup_categories
feedback_tags                       → sup_tags
feedback_tag_relations              → sup_submission_tags
feedback_comments                   → sup_comments
feedback_attachments                → sup_attachments
feedback_workflows                  → sup_workflows
feedback_response_templates         → sup_response_templates
feedback_insights                   → sup_insights

# Integrations
integration_credentials             → int_credentials
invitations                         → int_invitations

# Analytics
user_feedback_stats                 → ana_feedback_stats
social_media_kpis                   → ana_social_kpis
market_prices                       → ana_market_prices
ndp_categories                      → ana_ndp_categories

# Shared
entity_likes                        → shr_entity_likes
entity_comments                     → shr_entity_comments
entity_shares                       → shr_entity_shares
social_share_templates              → shr_share_templates

# Queues
sms_queue                           → que_sms
whatsapp_queue                      → que_whatsapp
offline_message_queue               → que_offline_messages

# Preferences
user_email_preferences              → prf_email_preferences
```

### **Tables to Move to Reference Module**

```
business_types                      → ref_business_types
organization_types                  → ref_organization_types
event_types                         → ref_event_types
job_categories_master               → ref_job_categories
job_types                           → ref_job_types
product_categories                  → ref_product_categories
service_categories                  → ref_service_categories
service_attributes                  → ref_service_attributes
entity_types                        → ref_entity_types
skills                              → ref_skills
contact_imports                     → ref_contact_imports
user_dashboard_widgets              → ref_dashboard_widgets
```

### **Tables to Delete (Duplicates)**

```
posts_tags                          → Merge into soc_post_tags
pillar_types                        → Merge into mkt_pillar_types
user_email_preferences_v2           → Merge into prf_email_preferences
organization_event_speakers         → Already in evt_speakers
organization_event_sponsors         → Already in evt_sponsors
organization_event_agenda           → Merge into evt_sessions
```

---

## 📁 File Organization

### **SQL Schema Structure (Logical Grouping)**

```
/aws/database/
│
├── schema/                     # SQL schema files (numbered by dependency)
│   │
│   ├── 00_extensions.sql              (~50 lines)
│   │   # PostgreSQL extensions (uuid-ossp, pg_trgm, etc.)
│   │
│   ├── 01_core_and_ref.sql           (~300 lines)
│   │   # Core: profiles
│   │   # Reference: ref_countries, ref_states, ref_business_types,
│   │   #            ref_organization_types, ref_event_types, ref_job_categories,
│   │   #            ref_skills, ref_notification_types
│   │
│   ├── 10_usr_core.sql               (~250 lines)
│   │   # usr_profile_roles, usr_privacy_settings, usr_verifications
│   │
│   ├── 11_usr_roles.sql              (~200 lines)
│   │   # usr_farmer_details, usr_veterinarian_details, usr_supplier_details,
│   │   # usr_consultant_details, usr_researcher_details
│   │
│   ├── 12_usr_professional.sql       (~200 lines)
│   │   # usr_experiences, usr_education, usr_certifications
│   │
│   ├── 13_usr_skills.sql             (~150 lines)
│   │   # usr_profile_skills, usr_skill_endorsements
│   │
│   ├── 14_usr_engagement.sql         (~150 lines)
│   │   # usr_badges, usr_completeness_checks, usr_stats,
│   │   # usr_preferences, usr_activity
│   │
│   ├── 20_biz_core.sql               (~250 lines)
│   │   # biz_profiles, biz_contact_info, biz_locations, biz_service_areas
│   │
│   ├── 21_biz_details.sql            (~200 lines)
│   │   # biz_team_members, biz_contact_persons, biz_farm_details,
│   │   # biz_supplier_details, biz_certifications, biz_stats
│   │
│   ├── 30_org_core.sql               (~250 lines)
│   │   # org_profiles, org_contact_info, org_offices, org_leadership
│   │
│   ├── 31_org_membership.sql         (~200 lines)
│   │   # org_membership_tiers, org_members, org_membership_applications,
│   │   # org_member_invitations, org_membership_history
│   │
│   ├── 32_org_structure.sql          (~200 lines)
│   │   # org_committees, org_committee_members, org_roles,
│   │   # org_resources, org_announcements, org_stats
│   │
│   ├── 40_soc_posts.sql              (~250 lines)
│   │   # soc_posts, soc_post_versions, soc_post_tags
│   │
│   ├── 41_soc_engagement.sql         (~200 lines)
│   │   # soc_post_likes, soc_post_comments, soc_comment_likes,
│   │   # soc_post_shares, soc_post_bookmarks, soc_post_views, soc_post_reports
│   │
│   ├── 42_soc_connections.sql        (~150 lines)
│   │   # soc_connections, soc_connection_suggestions, soc_follows,
│   │   # soc_blocked_users, soc_share_tracking
│   │
│   ├── 50_msg_core.sql               (~200 lines)
│   │   # msg_conversations, msg_participants, msg_messages,
│   │   # msg_reactions, msg_read_receipts
│   │
│   ├── 60_ntf_core.sql               (~150 lines)
│   │   # ntf_notifications, ntf_preferences, ntf_templates
│   │
│   ├── 70_mkt_core.sql               (~250 lines)
│   │   # mkt_segments, mkt_content_pillars, mkt_pillar_types, mkt_topics,
│   │   # mkt_topic_segments, mkt_content_types, mkt_content, mkt_content_ideas
│   │
│   ├── 71_mkt_campaigns.sql          (~200 lines)
│   │   # mkt_content_schedule, mkt_tags, mkt_content_tags, mkt_campaigns,
│   │   # mkt_campaign_content, mkt_campaign_pillars, mkt_pillar_tags,
│   │   # mkt_channels, mkt_platform_kpis
│   │
│   ├── 80_eml_core.sql               (~250 lines)
│   │   # eml_queue, eml_templates, eml_template_versions, eml_campaigns,
│   │   # eml_campaign_recipients, eml_campaign_steps, eml_events
│   │
│   ├── 81_eml_config.sql             (~150 lines)
│   │   # eml_provider_config, eml_senders, eml_domains,
│   │   # eml_suppressions, eml_ses_events
│   │
│   ├── 90_cms_core.sql               (~200 lines)
│   │   # cms_posts, cms_categories, cms_tags, cms_post_tags,
│   │   # cms_early_access, cms_newsletter_subscribers, cms_contact_submissions
│   │
│   ├── 100_nec_core.sql              (~200 lines)
│   │   # nec_zones, nec_prices, nec_annotations, nec_annotation_metadata,
│   │   # nec_predictions, nec_scraper_logs
│   │
│   ├── 110_evt_core.sql              (~250 lines)
│   │   # evt_events, evt_registrations, evt_sessions, evt_speakers,
│   │   # evt_exhibitors, evt_sponsors, evt_sponsor_tiers
│   │
│   ├── 111_evt_details.sql           (~150 lines)
│   │   # evt_expo_stalls, evt_ticket_types, evt_checkins
│   │
│   ├── 120_job_core.sql              (~150 lines)
│   │   # job_postings
│   │
│   ├── 130_prd_core.sql              (~200 lines)
│   │   # prd_products, prd_images, prd_reviews
│   │
│   ├── 140_ana_core.sql              (~150 lines)
│   │   # ana_feedback_stats, ana_social_kpis, ana_market_prices, ana_ndp_categories
│   │
│   ├── 150_sup_core.sql              (~250 lines)
│   │   # sup_submissions, sup_categories, sup_tags, sup_submission_tags,
│   │   # sup_comments, sup_attachments, sup_workflows,
│   │   # sup_response_templates, sup_insights
│   │
│   ├── 160_int_core.sql              (~100 lines)
│   │   # int_credentials, int_invitations
│   │
│   ├── 170_adm_core.sql              (~100 lines)
│   │   # adm_users
│   │
│   ├── 180_shr_core.sql              (~150 lines)
│   │   # shr_entity_likes, shr_entity_comments, shr_entity_shares,
│   │   # shr_share_templates
│   │
│   ├── 190_que_core.sql              (~100 lines)
│   │   # que_sms, que_whatsapp, que_offline_messages
│   │
│   ├── 200_prf_core.sql              (~100 lines)
│   │   # prf_email_preferences
│   │
│   └── 999_functions.sql             (~400 lines)
│       # PostgreSQL functions:
│       # - generate_profile_slug()
│       # - generate_business_slug()
│       # - generate_organization_slug()
│       # - update_post_likes_count()
│       # - update_post_comments_count()
│       # - update_post_shares_count()
│       # - cleanup_old_versions()
│       # - purge_old_deleted_posts()
│       # - calculate_profile_strength()
│       # - calculate_engagement_score()
│
├── seed/
│   ├── production/                   # Production seed data (reference tables only)
│   │   ├── 01_ref_countries.sql
│   │   ├── 02_ref_states.sql
│   │   ├── 03_ref_business_types.sql
│   │   ├── 04_ref_organization_types.sql
│   │   ├── 05_ref_event_types.sql
│   │   ├── 06_ref_job_categories.sql
│   │   ├── 07_ref_skills.sql
│   │   └── 08_ref_notification_types.sql
│   │
│   └── dev/                          # Same as production (no fake data)
│       └── (same files as production)
│
├── scripts/
│   ├── setup-db.sh                   # Initial database setup
│   ├── run-schema.sh                 # Execute all schema files in order
│   ├── run-seed.sh                   # Execute seed data
│   ├── backup-db.sh                  # Backup database
│   └── restore-db.sh                 # Restore from backup
│
└── migrations/                       # Post-MVP migrations (empty until MVP)
    └── .gitkeep

Total: ~50 schema files, ~10,000 lines
```

### **Drizzle Schema Structure (Generated from SQL)**

```
apps/api/src/database/schema/
│
├── index.ts                    # Export all schemas
│
├── core/
│   └── profiles.schema.ts
│
├── ref/
│   ├── countries.schema.ts
│   ├── states.schema.ts
│   ├── business-types.schema.ts
│   └── ...
│
├── usr/
│   ├── profile-roles.schema.ts
│   ├── farmer-details.schema.ts
│   ├── experiences.schema.ts
│   └── ...
│
├── biz/
├── org/
├── soc/
├── msg/
├── ntf/
├── mkt/
├── eml/
├── cms/
├── nec/
├── evt/
├── job/
├── prd/
├── ana/
├── sup/
├── int/
├── adm/
├── shr/
├── que/
└── prf/

Total: 28 folders, ~161 TypeScript files (generated from SQL)
```

---

## 🚀 Implementation Timeline

### **Week 1: SQL Schema Creation**
**Goal:** Create all SQL schema files with new naming standards

**Tasks:**
- [ ] Set up `/aws/database/` directory structure
- [ ] Convert Supabase migrations to numbered SQL files
- [ ] Apply new naming conventions (prefixes, plurals)
- [ ] Remove duplicate tables
- [ ] Add engagement count columns + triggers
- [ ] Add version history tables
- [ ] Add soft delete fields
- [ ] Add PostgreSQL functions (999_functions.sql)
- [ ] Create seed data files (reference tables only)
- [ ] Test schema execution order

**Deliverable:** Complete SQL schema in `/aws/database/schema/` (~50 files)

---

### **Week 2: AWS Infrastructure Setup**
**Goal:** Set up AWS infrastructure for database

**Tasks:**
- [ ] Provision RDS Postgres (db.t4g.large)
- [ ] Configure VPC, security groups
- [ ] Set up ElastiCache Redis
- [ ] Create S3 buckets for backups
- [ ] Configure CloudWatch monitoring
- [ ] Set up Secrets Manager for credentials
- [ ] Test database connectivity
- [ ] Run schema files on RDS
- [ ] Run seed data

**Deliverable:** Working RDS Postgres with complete schema

---

### **Week 3-4: Drizzle Schema Generation + NestJS**
**Goal:** Generate TypeScript schemas and implement NestJS services

**Tasks:**
- [ ] Generate Drizzle schemas from SQL (use drizzle-kit introspect)
- [ ] Organize into module folders
- [ ] Set up NestJS database module
- [ ] Configure Drizzle connection to RDS
- [ ] Create base repository pattern
- [ ] Implement services for core modules (usr, biz, org, soc)
- [ ] Add DTOs and validation
- [ ] Write unit tests

**Deliverable:** Working NestJS API with database access

---

### **Week 5: Testing & Optimization**
**Goal:** Comprehensive testing and performance optimization

**Tasks:**
- [ ] Test all CRUD operations
- [ ] Test engagement count triggers
- [ ] Test version history (create, restore)
- [ ] Test soft delete + trash folder
- [ ] Test relationships and joins
- [ ] Performance testing (query optimization)
- [ ] Load testing (simulate 1K concurrent users)
- [ ] Fix any issues
- [ ] Optimize slow queries

**Deliverable:** Tested, production-ready API

---

### **Week 6: Deployment & Cutover**
**Goal:** Deploy to production and migrate from Supabase

**Tasks:**
- [ ] Deploy NestJS to ECS Fargate
- [ ] Configure Application Load Balancer
- [ ] Deploy frontend to Amplify
- [ ] Update frontend to use new API
- [ ] Configure CloudFront
- [ ] Set up EventBridge for scheduled jobs
- [ ] Monitor performance
- [ ] Decommission Supabase

**Deliverable:** Production deployment on AWS

---

## 👥 Team Organization

### **Recommended Module Ownership**

**Team Alpha (Core Platform):**
- `profiles` (core)
- `usr_*` (User Management)
- `sec_*` (Security)
- `adm_*` (Admin)

**Team Beta (Business Features):**
- `biz_*` (Business)
- `prd_*` (Products)
- `job_*` (Jobs)
- `srv_*` (Services)

**Team Gamma (Community):**
- `org_*` (Organizations)
- `evt_*` (Events)
- `soc_*` (Social Network)

**Team Delta (Communications):**
- `msg_*` (Messaging)
- `ntf_*` (Notifications)
- `eml_*` (Email)
- `que_*` (Queues)

**Team Epsilon (Growth):**
- `mkt_*` (Marketing)
- `cms_*` (CMS)
- `ana_*` (Analytics)
- `sup_*` (Support)

**Team Zeta (Data & AI):**
- `nec_*` (NECC Data)
- `ai__*` (AI/ML)
- `ref_*` (Reference Data)
- `geo_*` (Geography)

---

## 📊 Success Metrics

### **Development Velocity**
- [ ] New table creation: < 10 minutes
- [ ] Schema review time: < 15 minutes
- [ ] SQL file execution: < 5 minutes for all schemas
- [ ] AI code generation accuracy: > 90%

### **Code Quality**
- [ ] Zero naming conflicts in 6 months
- [ ] 100% adherence to naming standards
- [ ] All tables properly indexed
- [ ] All engagement counts updated via triggers
- [ ] Version history working for all content types

### **Performance**
- [ ] Query response time: < 200ms (p95)
- [ ] Engagement count updates: < 10ms
- [ ] Version restore: < 100ms
- [ ] Soft delete queries: < 50ms

### **Team Productivity**
- [ ] New developer onboarding: < 2 weeks
- [ ] Team satisfaction with standards: > 8/10
- [ ] Reduced time in naming discussions: -80%
- [ ] Schema changes: < 1 hour (add new table)

### **Scalability**
- [ ] Support 500 tables without restructuring
- [ ] Module isolation maintained
- [ ] Clear ownership for all tables
- [ ] File organization scales linearly

---

## 🎯 Key Design Decisions

### **1. Engagement Metadata: Columns (Not JSON)**
**Decision:** Use separate columns with triggers  
**Rationale:** 10x faster queries, atomic updates, indexable  
**Implementation:** `likes_count`, `comments_count`, `shares_count` + triggers

### **2. Version History: Current + 2 Previous**
**Decision:** Keep last 3 versions, simple restore  
**Rationale:** Covers 99% of use cases, no complex diff UI  
**Implementation:** `soc_post_versions` table + cleanup trigger

### **3. Soft Delete: 30-Day Trash Folder**
**Decision:** Hide from active, allow restore for 30 days, auto-purge  
**Rationale:** Industry standard (Gmail, Slack), user-friendly  
**Implementation:** `is_deleted`, `deleted_at`, `purge_at` + scheduled job

### **4. Schema Organization: Logical Grouping**
**Decision:** Group related tables in files (200-300 lines)  
**Rationale:** Balance file count vs file size, solo-friendly  
**Implementation:** ~50 SQL files numbered by dependency

### **5. Seed Data: Reference Tables Only**
**Decision:** No fake data, only master data  
**Rationale:** Clean production-ready data  
**Implementation:** Countries, states, business types, skills, etc.

### **6. Database Functions: PostgreSQL**
**Decision:** Data logic in PostgreSQL, business logic in NestJS  
**Rationale:** Performance, data integrity, separation of concerns  
**Implementation:** Slug generation, engagement updates, profile strength

### **7. No Migrations Until MVP**
**Decision:** Direct schema creation, lock at v1.0  
**Rationale:** Fast iteration, no migration complexity  
**Implementation:** All changes via numbered SQL files until MVP

---

## 📝 Content Types Requiring Special Treatment

### **Versioning Required (Current + 2 Previous Versions):**

| Content Type | Table | Reasoning |
|--------------|-------|-----------|
| **Posts** | `soc_posts` | User-generated, editable, important content |
| **Job Descriptions** | `job_postings` | Long-form, legal implications, frequently updated |
| **Q&A Answers** | `qa_answers` (if implemented) | Knowledge base, needs history |
| **Business Descriptions** | `biz_profiles` | Marketing content, frequently refined |
| **Event Descriptions** | `evt_events` | Important details that change |

**Implementation:**
- Main table: `current_version` column
- History table: `{table}_versions` with last 3 versions
- Trigger: Auto-cleanup old versions

### **Soft Delete Required (30-Day Trash):**

| Content Type | Table | Reasoning |
|--------------|-------|-----------|
| **Posts** | `soc_posts` | User may want to restore |
| **Comments** | `soc_post_comments` | Accidental deletion |
| **Jobs** | `job_postings` | May want to repost |
| **Events** | `evt_events` | May want to restore |
| **Business Profiles** | `biz_profiles` | Accidental deletion |

**Implementation:**
- `is_deleted`, `deleted_at`, `deleted_by`, `purge_at`
- Scheduled job: Daily purge of content > 30 days old
- UI: Trash folder for restore

### **Engagement Counts Required:**

| Content Type | Table | Counts Needed |
|--------------|-------|---------------|
| **Posts** | `soc_posts` | likes, comments, shares, views |
| **Comments** | `soc_post_comments` | likes |
| **Products** | `prd_products` | likes, reviews, views |
| **Jobs** | `job_postings` | applications, views |
| **Events** | `evt_events` | registrations, views |
| **Businesses** | `biz_profiles` | followers, views |

**Implementation:**
- Denormalized count columns on parent table
- Triggers on child tables (likes, comments, etc.)
- Computed `engagement_score` column

### **No Versioning/Soft Delete:**

| Content Type | Table | Reasoning |
|--------------|-------|-----------|
| **Profile Bio** | `profiles` | Current state only, not long-form |
| **Messages** | `msg_messages` | Immutable (edit = new message) |
| **Notifications** | `ntf_notifications` | Transient data |
| **Analytics** | `ana_*` | Historical data, never delete |

---

## 🎯 Next Steps

### **Immediate (This Week)**
1. ✅ Review and approve standards
2. ✅ Set up Drizzle project structure
3. ✅ Begin schema generation
4. ✅ Train team on new standards

### **Short-term (This Month)**
1. Complete schema generation
2. Implement NestJS services
3. Create seed data
4. Deploy to staging

### **Long-term (This Quarter)**
1. Deploy to production
2. Monitor adoption
3. Gather feedback
4. Iterate and improve

---

## 📚 Resources

- **Standards Reference:** `DATABASE_STANDARDS.md`
- **Drizzle Docs:** https://orm.drizzle.team/
- **NestJS Database:** https://docs.nestjs.com/techniques/database
- **PostgreSQL Best Practices:** https://wiki.postgresql.org/

---

**Last Updated:** November 30, 2025  
**Status:** Ready for Implementation

