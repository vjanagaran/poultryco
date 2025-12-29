# PoultryCo AWS Database Schema - Index

**Version:** 2.0  
**Last Updated:** 2025-12-01  
**Total Files:** 25 schema files + 1 seed file

## 📋 Quick Reference

### Execution Order

All files are numbered and should be executed in order:

```bash
cd /Users/janagaran/Programs/poultryco/aws/database
./scripts/run-schema.sh <DB_HOST> <DB_USER> <DB_PASSWORD> <DB_NAME>
```

---

## 📁 Schema Files

### Core & Reference (00-01)

| File | Tables | Description |
|------|--------|-------------|
| `00_extensions.sql` | 1 | PostgreSQL extensions + mock auth.users |
| `01_core_and_ref.sql` | 9 | Core profiles + reference tables |

**Tables Created:**
- `auth.users` (mock for Cognito)
- `profiles`
- `ref_countries`, `ref_states`, `ref_business_types`, `ref_organization_types`
- `ref_event_types`, `ref_job_categories`, `ref_skills`, `ref_notification_types`

---

### User Module (10-13)

| File | Tables | Description |
|------|--------|-------------|
| `10_usr_core.sql` | 4 | User privacy, verifications, badges |
| `11_usr_roles.sql` | 9 | Multi-role system + role-specific details |
| `12_usr_professional.sql` | 2 | Experience & education |
| `13_usr_skills.sql` | 2 | Skills & endorsements |

**Tables Created (16):**
- `usr_privacy_settings`, `usr_verifications`, `usr_completeness_checks`, `usr_badges`
- `usr_profile_roles`, `usr_farmer_details`, `usr_veterinarian_details`, `usr_consultant_details`, `usr_trader_details`, `usr_supplier_details`, `usr_researcher_details`, `usr_student_details`, `usr_government_official_details`
- `usr_experiences`, `usr_education`
- `usr_profile_skills`, `usr_skill_endorsements`

---

### Business Module (20-21)

| File | Tables | Description |
|------|--------|-------------|
| `20_biz_core.sql` | 2 | Business profiles + stats |
| `21_biz_details.sql` | 5 | Team, contacts, certifications, farm/supplier details |

**Tables Created (7):**
- `biz_profiles`, `biz_stats`
- `biz_team_members`, `biz_contact_persons`, `biz_certifications`, `biz_farm_details`, `biz_supplier_details`

---

### Organization Module (30-32)

| File | Tables | Description |
|------|--------|-------------|
| `30_org_core.sql` | 5 | Organization profiles, contact, offices, leadership |
| `31_org_membership.sql` | 5 | Membership tiers, members, applications, invitations |
| `32_org_structure.sql` | 4 | Committees, resources, announcements |

**Tables Created (14):**
- `org_profiles`, `org_contact_info`, `org_offices`, `org_leadership`, `org_stats`
- `org_membership_tiers`, `org_members`, `org_membership_applications`, `org_member_invitations`, `org_membership_history`
- `org_committees`, `org_committee_members`, `org_resources`, `org_announcements`

---

### Social Module (40-41)

| File | Tables | Description |
|------|--------|-------------|
| `40_soc_posts.sql` | 7 | Posts, likes, comments, bookmarks, reports, polls |
| `41_soc_connections.sql` | 4 | Connections, follows, blocks, suggestions |

**Tables Created (11):**
- `soc_posts`, `soc_post_likes`, `soc_post_comments`, `soc_comment_likes`, `soc_post_bookmarks`, `soc_post_reports`, `soc_poll_votes`
- `soc_connections`, `soc_follows`, `soc_blocks`, `soc_connection_suggestions`

---

### Messaging Module (50)

| File | Tables | Description |
|------|--------|-------------|
| `50_msg_core.sql` | 3 | Conversations, participants, messages |

**Tables Created (3):**
- `msg_conversations`, `msg_participants`, `msg_messages`

---

### Events Module (60)

| File | Tables | Description |
|------|--------|-------------|
| `60_evt_core.sql` | 6 | Events, attendees, co-hosts, speakers, sponsors, updates |

**Tables Created (6):**
- `evt_events`, `evt_attendees`, `evt_cohosts`, `evt_speakers`, `evt_sponsors`, `evt_updates`

---

### Notifications Module (70)

| File | Tables | Description |
|------|--------|-------------|
| `70_ntf_core.sql` | 4 | Notifications, preferences, queue, templates |

**Tables Created (4):**
- `ntf_notifications`, `ntf_preferences`, `ntf_queue`, `ntf_templates`

---

### Resources Module (80)

| File | Tables | Description |
|------|--------|-------------|
| `80_res_core.sql` | 6 | Resources, categories, likes, bookmarks, views, comments |

**Tables Created (6):**
- `res_categories`, `res_resources`, `res_likes`, `res_bookmarks`, `res_views`, `res_comments`

---

### Analytics Module (90)

| File | Tables | Description |
|------|--------|-------------|
| `90_anl_core.sql` | 6 | Profile views, search queries, activity log, metrics, referrals |

**Tables Created (6):**
- `anl_profile_views`, `anl_search_queries`, `anl_activity_log`, `anl_engagement_metrics`, `anl_platform_metrics`, `anl_referrals`

---

### NECC Module (100)

| File | Tables | Description |
|------|--------|-------------|
| `100_nec_core.sql` | 6 | NECC zones, prices, annotations, predictions, scraper logs |

**Tables Created (6 + 2 views):**
- `nec_zones`, `nec_prices`, `nec_annotations`, `nec_annotation_metadata`, `nec_predictions`, `nec_scraper_logs`
- `nec_monthly_averages` (materialized view)
- `nec_yoy_comparison` (materialized view)

---

### Admin Module (110)

| File | Tables | Description |
|------|--------|-------------|
| `110_adm_core.sql` | 6 | Admin roles, users, moderation queue, actions log, bans, settings |

**Tables Created (6):**
- `adm_roles`, `adm_users`, `adm_moderation_queue`, `adm_actions_log`, `adm_banned_users`, `adm_system_settings`

---

### Jobs Module (120)

| File | Tables | Description |
|------|--------|-------------|
| `120_job_core.sql` | 3 | Job postings, applications, bookmarks |

**Tables Created (3):**
- `job_postings`, `job_applications`, `job_bookmarks`

---

### Marketplace Module (130)

| File | Tables | Description |
|------|--------|-------------|
| `130_mkt_core.sql` | 5 | Products, categories, reviews, orders (future phase) |

**Tables Created (5):**
- `mkt_categories`, `mkt_products`, `mkt_product_reviews`, `mkt_orders`, `mkt_order_items`

---

### Utilities (900)

| File | Tables | Description |
|------|--------|-------------|
| `900_utilities.sql` | 6 | Tags, media uploads, saved searches, feedback, email queue, audit log |

**Tables Created (6):**
- `tags`, `media_uploads`, `saved_searches`, `feedback`, `email_queue`, `audit_log`

---

### Functions & Views (999)

| File | Objects | Description |
|------|---------|-------------|
| `999_functions.sql` | 15+ | PostgreSQL functions + materialized views |

**Functions Created:**
- `generate_unique_slug()` - Slug generation
- `calculate_profile_strength()` - Profile completion
- `get_personalized_feed()` - Feed generation
- `search_profiles()` - Full-text search
- `get_connection_recommendations()` - Recommendations
- `get_user_engagement_stats()` - Analytics
- `create_notification()` - Notification helper
- `refresh_all_materialized_views()` - View refresh
- `cleanup_old_activity_logs()` - Cleanup
- `cleanup_old_profile_views()` - Cleanup
- `is_valid_indian_phone()` - Validation
- `is_valid_email()` - Validation

**Materialized Views:**
- `mv_popular_posts`
- `mv_trending_resources`
- `mv_active_users`

---

## 🌱 Seed Data

### Reference Data (seeds/)

| File | Description |
|------|-------------|
| `01_reference_data.sql` | Seed data for all reference tables |

**Data Seeded:**
- 32 Indian states
- 14 user roles
- 12 business types
- 8 organization types
- 10 event types
- 10 job categories
- 20+ skills
- 13 notification types
- 4 admin roles
- 20+ system settings

---

## 📊 Summary Statistics

| Category | Count |
|----------|-------|
| **Total Schema Files** | 25 |
| **Total Tables** | ~120 |
| **Total Functions** | 15+ |
| **Total Materialized Views** | 5 |
| **Total Triggers** | 40+ |
| **Total Indexes** | 200+ |

---

## 🔑 Key Features Implemented

### ✅ Database Standards Compliance
- [x] Module-based 3-letter prefixes (`usr_`, `biz_`, `org_`, `soc_`, `msg_`, `nec_`, etc.)
- [x] Plural table names
- [x] snake_case naming
- [x] Consistent column patterns
- [x] Junction tables for many-to-many
- [x] Detail tables for role-specific data

### ✅ Database Strategy Implementation
- [x] Denormalized engagement counts with triggers
- [x] Soft deletes where appropriate
- [x] Full-text search indexes
- [x] Materialized views for performance
- [x] PostgreSQL functions for business logic
- [x] Comprehensive audit logging

### ✅ AWS Integration Ready
- [x] Mock `auth.users` table for Cognito integration
- [x] S3 file URL references
- [x] SES email queue
- [x] CloudFront-ready media URLs
- [x] Lambda-ready scraper logs

---

## 🚀 Next Steps

### 1. Database Setup
```bash
# Create RDS PostgreSQL instance
# Configure security groups
# Run schema setup
./scripts/run-schema.sh <RDS_ENDPOINT> postgres <PASSWORD> poultryco
```

### 2. Seed Data
```bash
psql -h <RDS_ENDPOINT> -U postgres -d poultryco -f seeds/01_reference_data.sql
```

### 3. Verify
```bash
# Check table count
psql -h <RDS_ENDPOINT> -U postgres -d poultryco -c "\dt"

# Check functions
psql -h <RDS_ENDPOINT> -U postgres -d poultryco -c "\df"

# Check materialized views
psql -h <RDS_ENDPOINT> -U postgres -d poultryco -c "\dm"
```

### 4. Configure Application
- Update Drizzle ORM schema
- Configure AWS Cognito user pool
- Set up S3 buckets for media
- Configure SES for emails
- Set up Lambda for NECC scraper

---

## 📝 Notes

1. **Execution Order:** Files MUST be executed in numerical order due to dependencies
2. **Idempotency:** All files use `IF NOT EXISTS` and `ON CONFLICT` for safe re-execution
3. **Performance:** Indexes are optimized for common query patterns
4. **Scalability:** Designed to handle 500 tables over 2 years
5. **Security:** RLS policies to be added in next phase

---

## 🔗 Related Documentation

- `/docs/database/DATABASE_STANDARDS.md` - Naming conventions
- `/docs/database/DATABASE_STRATEGY.md` - Architecture strategy
- `/docs/MVP_COMPLETE_SCOPE.md` - Feature requirements
- `/aws/database/README.md` - Setup instructions
- `/aws/database/MIGRATION_STATUS.md` - Migration tracking

---

**Last Updated:** 2025-12-01  
**Status:** ✅ Complete - Ready for AWS RDS deployment

