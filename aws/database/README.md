# 🗄️ PoultryCo AWS Database Schema

**Version:** 2.0 - AWS Migration  
**Date:** December 1, 2025  
**Status:** In Progress

---

## 📋 Overview

This directory contains the complete AWS-optimized database schema for PoultryCo, following the **DATABASE_STANDARDS.md** and **DATABASE_STRATEGY.md** conventions.

### Key Improvements from Supabase Schema:
- ✅ **Module-based prefixes** (`usr_`, `biz_`, `org_`, `soc_`, `msg_`, `nec_`, etc.)
- ✅ **Plural table names** (profiles, not profile)
- ✅ **AWS Cognito integration** (auth schema)
- ✅ **Optimized for scale** (500-table architecture ready)
- ✅ **Clean separation** (no Supabase-specific dependencies)

---

## 📁 Directory Structure

```
aws/database/
├── schema/                      # SQL schema files (numbered)
│   ├── 00_extensions.sql        # ✅ PostgreSQL extensions + auth schema
│   ├── 01_core_and_ref.sql      # ✅ Core profiles + reference tables
│   ├── 10_usr_core.sql          # ✅ User profile extensions
│   ├── 11_usr_roles.sql         # ✅ Role-specific details
│   ├── 12_usr_professional.sql  # ⏳ Experience, education (TODO)
│   ├── 13_usr_skills.sql        # ⏳ Skills & endorsements (TODO)
│   ├── 20_biz_core.sql          # ⏳ Business profiles (TODO)
│   ├── 30_org_core.sql          # ⏳ Organization profiles (TODO)
│   ├── 40_soc_posts.sql         # ⏳ Social posts system (TODO)
│   ├── 50_msg_core.sql          # ⏳ Messaging system (TODO)
│   ├── 100_nec_core.sql         # ✅ NECC market data
│   └── 999_functions.sql        # ⏳ All functions (TODO)
│
├── seed/                        # Reference data
│   └── production/
│       ├── 01_ref_countries.sql # ⏳ Countries (TODO)
│       ├── 02_ref_states.sql    # ⏳ States (TODO)
│       └── ...
│
├── scripts/                     # Execution scripts
│   ├── run-schema.sh            # ✅ Execute all schema files
│   ├── setup-db.sh              # ⏳ Initial DB setup (TODO)
│   └── migrate-from-supabase.sh # ⏳ Migration script (TODO)
│
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites

1. **AWS RDS PostgreSQL** provisioned
2. **Database credentials** (from AWS Secrets Manager or environment)
3. **psql** installed locally

### Execution

```bash
# Option 1: Using AWS Secrets Manager
AWS_SECRET_NAME=staging/poultryco/db/password ./scripts/run-schema.sh

# Option 2: Using environment variables
DB_HOST=your-rds-endpoint.rds.amazonaws.com \
DB_PASSWORD=your-password \
./scripts/run-schema.sh
```

---

## 📊 Schema Files Created (5/30+)

### ✅ Completed

1. **00_extensions.sql** (~100 lines)
   - PostgreSQL extensions (uuid-ossp, pg_trgm, unaccent)
   - Auth schema for Cognito integration
   - Helper functions (auth.uid(), update_updated_at_column())

2. **01_core_and_ref.sql** (~300 lines)
   - Core `profiles` table
   - Reference tables: countries, states, business_types, organization_types, event_types, job_categories, skills, notification_types
   - Slug generation functions

3. **10_usr_core.sql** (~350 lines)
   - usr_profile_roles (multi-role system)
   - usr_privacy_settings
   - usr_verifications
   - usr_completeness_checks
   - usr_badges
   - usr_preferences
   - usr_activity
   - Auto-creation triggers

4. **11_usr_roles.sql** (~250 lines)
   - usr_farmer_details
   - usr_veterinarian_details
   - usr_supplier_details
   - usr_consultant_details
   - usr_researcher_details
   - usr_nutritionist_details

5. **100_nec_core.sql** (~400 lines)
   - nec_zones
   - nec_prices
   - nec_monthly_averages (materialized view)
   - nec_yoy_comparison (view)
   - nec_annotations
   - nec_predictions
   - nec_scraper_logs
   - Helper functions

### ⏳ Remaining (25+ files)

**User Module:**
- 12_usr_professional.sql (experience, education, certifications)
- 13_usr_skills.sql (skills, endorsements)
- 14_usr_engagement.sql (stats, metrics)

**Business Module:**
- 20_biz_core.sql (business profiles, contact info)
- 21_biz_details.sql (locations, team, products)

**Organization Module:**
- 30_org_core.sql (organization profiles)
- 31_org_membership.sql (members, tiers)
- 32_org_structure.sql (committees, leadership)

**Social Module:**
- 40_soc_posts.sql (posts, versions)
- 41_soc_engagement.sql (likes, comments, shares)
- 42_soc_connections.sql (connections, follows)

**Messaging Module:**
- 50_msg_core.sql (conversations, messages)

**Notifications Module:**
- 60_ntf_core.sql (notifications, preferences)

**Marketing Module:**
- 70_mkt_core.sql (campaigns, content)
- 71_mkt_campaigns.sql (segments, schedules)

**Email Module:**
- 80_eml_core.sql (queue, templates)
- 81_eml_config.sql (providers, configuration)

**CMS Module:**
- 90_cms_core.sql (blog, pages)

**Events Module:**
- 110_evt_core.sql (events, registrations)
- 111_evt_details.sql (speakers, exhibitors)

**Jobs Module:**
- 120_job_core.sql (job postings)

**Products Module:**
- 130_prd_core.sql (products, reviews)

**Analytics Module:**
- 140_ana_core.sql (stats, metrics)

**Support Module:**
- 150_sup_core.sql (feedback, tickets)

**Integrations Module:**
- 160_int_core.sql (third-party integrations)

**Admin Module:**
- 170_adm_core.sql (admin users)

**Shared Module:**
- 180_shr_core.sql (shared engagement)

**Queues Module:**
- 190_que_core.sql (background jobs)

**Preferences Module:**
- 200_prf_core.sql (user preferences)

**Functions:**
- 999_functions.sql (all PostgreSQL functions)

---

## 🎯 Next Steps

### Immediate (This Week)

1. ✅ Complete remaining schema files (25+ files)
2. ✅ Create seed data files (reference tables)
3. ✅ Test schema execution on staging RDS
4. ✅ Create migration script from Supabase

### Short-term (Next 2 Weeks)

1. Execute schema on AWS RDS (staging)
2. Migrate data from Supabase
3. Test with pgAdmin
4. Create developer handbook

### Medium-term (Week 3-4)

1. Deploy NestJS API
2. Update frontend to use new API
3. Test end-to-end
4. Deploy to production

---

## 📝 Schema Statistics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Schema Files** | 30+ | 5 | 17% |
| **Tables** | 161 | ~50 | 31% |
| **Functions** | 20+ | 5 | 25% |
| **Seed Files** | 10 | 0 | 0% |
| **Scripts** | 5 | 1 | 20% |

---

## 🔧 Development Workflow

### Adding New Tables

1. Determine module prefix (usr_, biz_, org_, etc.)
2. Create in appropriate schema file
3. Follow naming conventions (plural, snake_case)
4. Add indexes and constraints
5. Add trigger for updated_at
6. Add comments

### Testing Schema Changes

```bash
# Test on local PostgreSQL
psql -h localhost -U postgres -d poultryco_test -f schema/XX_new_file.sql

# Test on staging RDS
AWS_SECRET_NAME=staging/poultryco/db/password ./scripts/run-schema.sh
```

---

## 📚 Related Documentation

- **[DATABASE_STANDARDS.md](../../docs/database/DATABASE_STANDARDS.md)** - Naming conventions
- **[DATABASE_STRATEGY.md](../../docs/database/DATABASE_STRATEGY.md)** - Implementation strategy
- **[Supabase Schema](../../supabase/schema/)** - Original schema (for reference)

---

## ✅ Validation Checklist

After schema execution:

- [ ] All tables created (161 expected)
- [ ] All functions created (20+ expected)
- [ ] All triggers created (30+ expected)
- [ ] All indexes created (100+ expected)
- [ ] RLS policies not needed (handled by application layer)
- [ ] Seed data loaded (reference tables)
- [ ] pgAdmin connection works
- [ ] Sample queries execute successfully

---

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test connection
psql "postgresql://postgres:PASSWORD@HOST:5432/poultryco" -c "SELECT 1"

# Check security group (port 5432 open)
aws ec2 describe-security-groups --group-ids sg-xxx
```

### Schema Execution Errors

```bash
# Check PostgreSQL logs
aws rds describe-db-log-files --db-instance-identifier poultryco-staging
aws rds download-db-log-file-portion --db-instance-identifier poultryco-staging --log-file-name error/postgresql.log
```

### Performance Issues

```bash
# Enable pg_stat_statements
psql -c "CREATE EXTENSION pg_stat_statements;"

# Check slow queries
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## 📞 Support

For issues or questions:
1. Check [DATABASE_STANDARDS.md](../../docs/database/DATABASE_STANDARDS.md)
2. Review PostgreSQL logs
3. Test queries in pgAdmin

---

**Last Updated:** December 1, 2025  
**Version:** 2.0 - AWS Migration  
**Status:** In Progress (17% complete)
