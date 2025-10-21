# SQL Schema Files Index

**Quick reference for all schema files**

---

## 📋 Execution Order

Execute files in this exact order:

| # | File | Tables | Lines | Description |
|---|------|--------|-------|-------------|
| 1 | `01_core_profiles.sql` | 6 | 455 | Core profiles, slugs, functions |
| 2 | `02_profile_roles.sql` | 6 | 310 | Multi-role system & details |
| 3 | `03_professional_info.sql` | 6 | 385 | Experience, education, skills |
| 4 | `04_business_details.sql` | 7 | 355 | Business locations, team, contacts |
| 5 | `05_business_products_jobs.sql` | 5 | 320 | Products, reviews, jobs |
| 6 | `06_organizations.sql` | 7 | 285 | Org offices, leadership, resources |
| 7 | `07_memberships_events.sql` | 4 | 410 | Memberships, invites, events |
| 8 | `08_event_speakers_exhibitors.sql` | 6 | 340 | Speakers, exhibitors, agenda |
| 9 | `09_privacy_verification_gamification.sql` | 4 | 435 | Privacy, verification, badges |
| 10 | `10_network_connections.sql` | 4 | 320 | Connections, follows, blocks |
| 11 | `11_stats_metrics.sql` | 3 | 275 | Statistics tables |
| 12 | `12_rls_policies.sql` | 0 | 445 | Security policies |
| 13 | `13_admin_roles.sql` | 1 | 129 | Admin user roles & permissions |
| 14 | `14_marketing_cms.sql` | 7 | 620 | Blog, forms, newsletter |
| **TOTAL** | **14 files** | **66 tables** | **~4,850 lines** | **Complete schema** |

---

## 🗂️ Tables by Category

### **Core (6 tables)**
- `profiles` - Personal profiles
- `business_profiles` - Business entities
- `business_profiles_contact` - Business contact info
- `organizations` - Organizations
- `organizations_contact` - Organization contact info

### **Roles (6 tables)**
- `profile_roles` - Multi-role junction
- `profile_farmer_details`
- `profile_veterinarian_details`
- `profile_supplier_details`
- `profile_consultant_details`
- `profile_researcher_details`

### **Professional (6 tables)**
- `profile_experience` - With key_achievements
- `profile_education`
- `profile_certifications`
- `skills` - With synonyms & related
- `profile_skills`
- `skill_endorsements`

### **Business Details (7 tables)**
- `business_locations`
- `business_service_areas`
- `business_team_members`
- `business_contact_persons` ⭐ NEW
- `business_farm_details`
- `business_supplier_details`
- `business_certifications`

### **Products & Jobs (5 tables)**
- `business_products`
- `product_images`
- `product_reviews`
- `business_jobs`
- `job_categories_master`

### **Organizations (7 tables)**
- `organization_offices`
- `organization_leadership`
- `organization_membership_tiers`
- `organization_committees`
- `organization_committee_members`
- `organization_resources`
- `organization_announcements`

### **Memberships & Events (4 tables)**
- `organization_members` - Polymorphic
- `organization_membership_applications`
- `organization_member_invitations` - Bulk invite
- `organization_events`
- `organization_event_registrations` - With QR codes

### **Event Features (6 tables)**
- `organization_event_speakers`
- `organization_event_exhibitors`
- `organization_event_sponsors`
- `organization_event_agenda`
- `organization_event_resources`
- `organization_event_feedback`

### **Privacy & Gamification (4 tables)**
- `profile_privacy_settings` ⭐ NEW
- `profile_verifications` ⭐ NEW
- `profile_completeness_checks` ⭐ NEW
- `profile_badges` ⭐ NEW

### **Network (4 tables)**
- `connections` - Mutual (LinkedIn-style)
- `follows` - One-way
- `connection_suggestions`
- `blocked_users`

### **Statistics (3 tables)**
- `profile_stats`
- `business_stats`
- `organization_stats`

---

## 🔧 Functions Created

### **Slug Generation**
- `generate_profile_slug()`
- `generate_business_slug()`
- `generate_organization_slug()`

### **Skills**
- `find_or_create_skill()`
- `increment_skill_usage()`

### **Connections**
- `get_connection_status()`
- `send_connection_request()`
- `accept_connection_request()`
- `ensure_connection_ordering()`

### **Verification**
- `update_profile_verification_level()`

### **Completeness & Gamification**
- `calculate_profile_strength()`
- `update_profile_completeness()`
- `award_badge()`
- `check_and_award_badges()`

### **Privacy**
- `create_default_privacy_settings()`

### **Stats**
- `refresh_profile_stats()`
- `refresh_business_stats()`
- `refresh_organization_stats()`

### **RLS Helpers**
- `auth_uid()`
- `is_profile_public()`
- `are_connected()`
- `is_business_admin()`
- `is_organization_admin()`

### **Membership**
- `validate_member_exists()`

### **Utilities**
- `update_updated_at_column()`
- `generate_invitation_token()`

---

## 🔐 Security Features

✅ RLS enabled on all 58 tables  
✅ 40+ security policies  
✅ Privacy-aware access control  
✅ Connection-based visibility  
✅ Owner/admin permissions  
✅ Polymorphic validation  

---

## 📊 Key Features Implemented

### **✅ From Specification:**
- Multi-role profiles
- Polymorphic memberships
- Bulk invitations
- Event management (PTSE)
- Product catalog
- Job postings
- Skills & endorsements

### **⭐ Enhanced Features:**
- SEO-friendly slugs
- Key achievements array
- Enhanced role details
- Skill synonyms
- Business contact persons
- Privacy settings
- Verification system
- Completeness tracking
- Badge system

---

## 🚀 Quick Start

```bash
# Execute all files
./execute_all.sh

# Or manually
supabase db execute --file 01_core_profiles.sql
supabase db execute --file 02_profile_roles.sql
# ... continue for all 12 files
```

---

**Last Updated:** October 17, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

