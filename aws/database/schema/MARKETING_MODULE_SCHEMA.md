# Marketing Module Schema - Implementation Summary

**Version:** 1.0  
**Date:** December 2025  
**Status:** Complete

---

## 📋 Overview

This document summarizes the Marketing module database schema implementation following the finalized naming structure defined in `docs/database/MARKETING_MODULE_NAMING.md`.

---

## 📁 Schema Files

### File Organization

```
aws/database/schema/
├── 70_mkt_common.sql      - Common tables (Campaigns, Channels, Segments, KPIs)
├── 71_mkt_ndp.sql         - NDP Research Module
├── 72_mkt_content.sql     - Content Framework
├── 73_mkt_persona.sql     - Persona Mapping (ICP Definition)
└── 74_mkt_whatsapp.sql    - WhatsApp Integration
```

### Execution Order

Files must be executed in numerical order:
1. `70_mkt_common.sql` - Creates base tables (segments, channels, campaigns, kpis)
2. `71_mkt_ndp.sql` - Creates NDP research tables (depends on segments)
3. `72_mkt_content.sql` - Creates content tables (depends on NDP topics, segments, channels)
4. `73_mkt_persona.sql` - Creates persona tables (depends on segments)
5. `74_mkt_whatsapp.sql` - Creates WhatsApp tables (depends on campaigns, content, persona, groups)

**Note:** Some foreign key constraints reference tables in later files. This is intentional and works because:
- PostgreSQL validates foreign keys when data is inserted, not when tables are created
- All files are executed in order during migration
- Tables exist before foreign keys are used

---

## 📊 Table Summary

### Common Tables (70_mkt_common.sql)

| Table | Description | Rows |
|-------|-------------|------|
| `mkt_segments` | Stakeholder segments (11 segments) | ~11 |
| `mkt_channels` | Marketing channels (LinkedIn, FB, WhatsApp, etc.) | ~10-20 |
| `mkt_campaigns` | Top-level marketing campaigns | Variable |
| `mkt_campaign_segment_assignments` | Campaign → Segments (many-to-many) | Variable |
| `mkt_campaign_ndp_assignments` | Campaign → NDP Topics (many-to-many) | Variable |
| `mkt_campaign_pillar_assignments` | Campaign → Pillars (many-to-many) | Variable |
| `mkt_campaign_content_assignments` | Campaign → Content (many-to-many) | Variable |
| `mkt_kpis` | Platform KPIs (daily metrics) | ~365/year |
| `mkt_social_kpis` | Social media KPIs (channel-specific) | ~365/year/channel |

**Total: 9 tables**

---

### NDP Research Module (71_mkt_ndp.sql)

| Table | Description | Rows |
|-------|-------------|------|
| `mkt_ndp_categories` | NDP categories (Need, Desire, Pain, etc.) | ~6 |
| `mkt_ndp_topics` | NDP research topics (ICP language) | ~50-100 |
| `mkt_ndp_topic_segments` | NDP Topics → Segments (many-to-many) | Variable |

**Total: 3 tables**

---

### Content Framework (72_mkt_content.sql)

| Table | Description | Rows |
|-------|-------------|------|
| `mkt_con_types` | Content types (LinkedIn Post, Blog, etc.) | ~24 |
| `mkt_con_pillar_types` | Pillar types (Research, Case Study, etc.) | ~6 |
| `mkt_con_pillars` | Content pillars (core research topics) | Variable |
| `mkt_con_pillar_types` | Pillar → Content Types (many-to-many) | Variable |
| `mkt_con_ideas` | Content ideas (quick capture) | Variable |
| `mkt_con_content` | Master + Repurposed content (unified) | Variable |
| `mkt_con_tags` | Content tags | ~50-100 |
| `mkt_con_tag_assignments` | Content → Tags (many-to-many) | Variable |
| `mkt_con_pillar_tag_assignments` | Pillar → Tags (many-to-many) | Variable |
| `mkt_con_schedule` | Content scheduling (calendar) | Variable |

**Total: 10 tables**

---

### Persona Mapping (73_mkt_persona.sql)

| Table | Description | Rows |
|-------|-------------|------|
| `mkt_persona_contacts` | Contact persona data (ICP definition) | Variable |
| `mkt_persona_scores` | Persona confidence scores | Variable |
| `mkt_persona_attributes` | Extended persona attributes | Variable |

**Total: 3 tables**

---

### WhatsApp Module (74_mkt_whatsapp.sql)

| Table | Description | Rows |
|-------|-------------|------|
| `mkt_wap_accounts` | WhatsApp accounts (multi-account) | ~5 |
| `mkt_wap_groups` | WhatsApp groups | ~100-500 |
| `mkt_wap_contacts` | WhatsApp contacts | ~1,000-10,000 |
| `mkt_wap_messages` | WhatsApp messages | Variable |
| `mkt_persona_group_memberships` | Group → Persona mapping | Variable |

**Total: 5 tables**

---

## 📈 Total Table Count

- **Common:** 9 tables
- **NDP Research:** 3 tables
- **Content:** 10 tables
- **Persona:** 3 tables
- **WhatsApp:** 5 tables

**Grand Total: 30 tables**

---

## 🔗 Key Relationships

### Campaign Flow
```
mkt_campaigns
  ├─ → mkt_segments (via mkt_campaign_segment_assignments)
  ├─ → mkt_ndp_topics (via mkt_campaign_ndp_assignments)
  ├─ → mkt_con_pillars (via mkt_campaign_pillar_assignments)
  └─ → mkt_con_content (via mkt_campaign_content_assignments)
```

### Content Flow
```
mkt_con_pillars
  └─ → mkt_con_content (master → repurposed)
      └─ → mkt_con_schedule
          └─ → mkt_channels
```

### WhatsApp Flow
```
mkt_wap_messages
  ├─ → mkt_campaigns (direct link, NO separate WhatsApp campaigns)
  ├─ → mkt_con_content
  ├─ → mkt_wap_groups
  └─ → mkt_wap_contacts
      └─ → mkt_persona_contacts
```

### Persona Flow
```
mkt_persona_contacts
  ├─ → mkt_segments
  └─ → mkt_wap_groups (via mkt_persona_group_memberships)
```

---

## ✅ Design Decisions

1. **Campaigns are common** - `mkt_campaigns` (not `mkt_cam_campaigns`)
2. **NDP is research module** - `mkt_ndp_*` comes BEFORE content creation
3. **NDP topics are research** - `mkt_ndp_topics` (not `mkt_con_topics`)
4. **Persona is ICP definition** - Mapping of segments + regions + attributes
5. **No WhatsApp campaigns** - WhatsApp execution links directly to `mkt_campaigns`
6. **WhatsApp messages link to campaigns** - `mkt_wap_messages.campaign_id → mkt_campaigns.id`

---

## 🚀 Migration Notes

### Dependencies

1. **Core Tables Required:**
   - `profiles` (from `01_core_and_ref.sql`)
   - `auth_users` (from `00_auth_custom.sql`)

2. **Function Required:**
   - `update_updated_at_column()` (from `00_auth_custom.sql`)

### Execution

```bash
# Execute in order:
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 70_mkt_common.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 71_mkt_ndp.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 72_mkt_content.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 73_mkt_persona.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 74_mkt_whatsapp.sql
```

### Seed Data

Seed data should be added for:
- `mkt_segments` - 11 stakeholder segments
- `mkt_ndp_categories` - 6 NDP categories
- `mkt_con_types` - 24 content types
- `mkt_con_pillar_types` - 6 pillar types

---

## 📚 Related Documentation

- [Marketing Module Naming Structure](../../docs/database/MARKETING_MODULE_NAMING.md)
- [Database Standards](../../docs/database/DATABASE_STANDARDS.md)
- [WhatsApp Integration Design](../../docs/marketing-system/whatsapp_marketing_automation_system_design.md)

---

**Last Updated:** December 2025  
**Version:** 1.0  
**Status:** Complete

