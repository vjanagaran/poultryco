# Marketing Module Naming Structure - Final Version

**Version:** 1.0  
**Date:** December 2025  
**Status:** Finalized

---

## 📋 Overview

This document defines the finalized naming structure for the Marketing module in the PoultryCo AWS database migration. The structure follows the [Database Standards](../database/DATABASE_STANDARDS.md) and provides clear separation between research, campaigns, content, and channel-specific modules.

---

## 🎯 Hierarchy Flow

```
NDP Research (Market Research & ICP Language)
    ↓
Campaign (Marketing Strategy)
    ↓
    ├─ Maps to: Segments + NDP Topics
    ↓
    Creates: Content Pillars
    ↓
    Creates: Content (Master → Repurposed)
    ↓
    Schedules to: Channels (LinkedIn, Facebook, WhatsApp, etc.)
```

---

## 📊 Final Naming Structure

### 1. Campaigns (Common, Top-Level)
**Prefix:** `mkt_campaigns` (direct, not `mkt_cam_campaigns`)

Campaigns are the top-level marketing strategy that orchestrates all marketing activities.

```
mkt_campaigns                    - Main campaign table (common, top-level)
mkt_campaign_segment_assignments - Campaign → Segments (many-to-many)
mkt_campaign_ndp_assignments      - Campaign → NDP Topics (many-to-many)
mkt_campaign_pillar_assignments  - Campaign → Pillars (many-to-many)
mkt_campaign_content_assignments - Campaign → Content (many-to-many, optional)
```

**Key Points:**
- Campaigns are **common/shared** across all marketing modules
- Campaigns link to segments, NDP topics, pillars, and content
- No sub-prefix needed (`mkt_campaigns` not `mkt_cam_campaigns`)

---

### 2. NDP Research Module (Before Content)
**Prefix:** `mkt_ndp_*`

NDP (Need-Desire-Pain) is a **research module** that comes **BEFORE** content creation. It defines the language of ICP (Ideal Customer Profile) and market research.

```
mkt_ndp_categories          - Need/Desire/Pain/Problem/Fear/Fantasy categories
mkt_ndp_topics              - NDP topics (research findings - ICP language)
mkt_ndp_topic_segments      - NDP topics → Segments mapping (many-to-many)
mkt_ndp_research            - Research data/insights (optional, for future)
```

**Key Points:**
- NDP is **research**, not content
- NDP topics define the language and pain points of ICP
- NDP topics are mapped to segments to understand relevance
- Campaigns link to NDP topics to align strategy with research

---

### 3. Content Framework
**Prefix:** `mkt_con_*`

All content-related tables for managing content creation, pillars, ideas, and scheduling.

```
mkt_con_pillars             - Content pillars (core research topics)
mkt_con_content              - Master + Repurposed content (unified table)
mkt_con_ideas                - Content ideas (quick capture)
mkt_con_schedule             - Content scheduling (calendar)
mkt_con_types                - Content types (LinkedIn Post, Blog, etc.)
mkt_con_tags                 - Content tags
mkt_con_tag_assignments      - Content → Tags (many-to-many)
mkt_con_pillar_types         - Pillar → Content Types (many-to-many)
mkt_con_pillar_tag_assignments - Pillar → Tags (many-to-many)
```

**Key Points:**
- Content framework manages the entire content lifecycle
- Content flows: Pillar → Master Content → Repurposed Content → Schedule
- Content types define platform-specific formats
- Tags provide flexible categorization

---

### 4. WhatsApp Module
**Prefix:** `mkt_wap_*`

WhatsApp-specific tables for managing accounts, groups, contacts, and messages.

```
mkt_wap_accounts            - WhatsApp accounts (multi-account support)
mkt_wap_groups               - WhatsApp groups
mkt_wap_contacts             - WhatsApp contacts (links to mkt_persona_contacts)
mkt_wap_messages             - WhatsApp messages (links to mkt_campaigns + mkt_con_content)
```

**Key Points:**
- **NO** `mkt_wap_campaigns` table
- WhatsApp messages link **directly** to `mkt_campaigns`
- WhatsApp contacts link to persona data for ICP matching
- WhatsApp is a first-class channel in the marketing system

---

### 5. Persona (Common/Shared - ICP Definition)
**Prefix:** `mkt_persona_*`

Persona mapping defines ICP (Ideal Customer Profile) by combining segments, regions, and other attributes.

```
mkt_persona_contacts         - Contact persona data
mkt_persona_scores          - Persona confidence scores
mkt_persona_group_memberships - Group → Persona mapping
mkt_persona_attributes      - Persona attributes (region, segment, type, etc.)
```

**Key Points:**
- Persona = **segments + regions + attributes = ICP**
- Persona is **common/shared** across all marketing modules
- Used by WhatsApp, email, and other channels for targeting
- Confidence scores help with semi-automated campaign approval

---

### 6. Common/Shared Tables
**Prefix:** `mkt_*` (single prefix)

Tables shared across all marketing modules.

```
mkt_channels                - Marketing channels (LinkedIn, FB, WhatsApp, etc.)
mkt_segments                - Stakeholder segments (11 segments)
mkt_kpis                    - Platform KPIs (if shared)
mkt_social_kpis             - Social media KPIs (channel-specific metrics)
```

**Key Points:**
- Channels define where content is published
- Segments define target audiences
- KPIs track performance across all channels

---

## 📋 Complete Table Mapping

### Supabase → AWS Migration

#### Campaigns (Top-Level)
```
content_campaigns                    → mkt_campaigns
content_campaign_assignments         → mkt_campaign_content_assignments
pillar_campaign_assignments          → mkt_campaign_pillar_assignments
(New) campaign_segment_assignments   → mkt_campaign_segment_assignments
(New) campaign_ndp_assignments       → mkt_campaign_ndp_assignments
```

#### NDP Research Module
```
ndp_categories                        → mkt_ndp_categories
content_topics                        → mkt_ndp_topics (NDP topics are research, not content)
content_topic_segments                → mkt_ndp_topic_segments
(New) mkt_ndp_research                → Research insights/data (optional)
```

#### Content Framework
```
content                               → mkt_con_content
content_pillars                       → mkt_con_pillars
content_ideas                         → mkt_con_ideas
content_schedule                      → mkt_con_schedule
content_types                         → mkt_con_types
content_tags                          → mkt_con_tags
content_tag_assignments               → mkt_con_tag_assignments
pillar_types                          → mkt_con_pillar_types
content_pillar_types                  → mkt_con_pillar_types
pillar_tag_assignments                → mkt_con_pillar_tag_assignments
```

#### WhatsApp (New)
```
(New) mkt_wap_accounts
(New) mkt_wap_groups
(New) mkt_wap_contacts
(New) mkt_wap_messages
```

#### Persona (New)
```
(New) mkt_persona_contacts
(New) mkt_persona_scores
(New) mkt_persona_group_memberships
(New) mkt_persona_attributes
```

#### Common/Shared
```
marketing_channels                    → mkt_channels
stakeholder_segments                 → mkt_segments
platform_kpis                        → mkt_kpis
social_media_kpis                    → mkt_social_kpis
```

---

## 🔗 Key Relationships

### Campaign Flow
```
mkt_campaigns (1)
    ├─ → mkt_segments (many-to-many via mkt_campaign_segment_assignments)
    ├─ → mkt_ndp_topics (many-to-many via mkt_campaign_ndp_assignments)
    ├─ → mkt_con_pillars (many-to-many via mkt_campaign_pillar_assignments)
    └─ → mkt_con_content (via pillars)

mkt_wap_messages
    ├─ → mkt_campaigns (many-to-one, direct link)
    └─ → mkt_con_content (many-to-one)
```

### Content Flow
```
mkt_con_pillars (1)
    └─ → mkt_con_content (one-to-many, master → repurposed)

mkt_con_content (1)
    └─ → mkt_con_schedule (one-to-many)
        └─ → mkt_channels (many-to-one)
```

### Persona Flow
```
mkt_wap_contacts (1)
    └─ → mkt_persona_contacts (one-to-one or many-to-one)

mkt_persona_contacts
    ├─ → mkt_segments (via attributes)
    └─ → mkt_wap_groups (via mkt_persona_group_memberships)
```

### NDP Research Flow
```
mkt_ndp_topics (Research)
    └─ → mkt_segments (via mkt_ndp_topic_segments)
```

---

## 📊 Example Workflow

### 1. NDP Research (Market Research)
```
1. Create NDP Categories: Need, Desire, Pain, Problem, Fear, Fantasy
   → mkt_ndp_categories

2. Research Topics: "High Mortality", "Feed Costs", "Disease Outbreaks"
   → mkt_ndp_topics

3. Map Topics to Segments: "High Mortality" → Farmers, Veterinarians
   → mkt_ndp_topic_segments
```

### 2. Create Campaign (Marketing Strategy)
```
1. Create Campaign: "Product Launch Q1 2026"
   → mkt_campaigns

2. Map Segments: Farmers, Veterinarians
   → mkt_campaign_segment_assignments

3. Map NDP Topics: "High Mortality" (from research)
   → mkt_campaign_ndp_assignments
```

### 3. Create Content Pillars
```
1. Create Pillar: "Complete Guide to Mortality Reduction"
   → mkt_con_pillars
   → Linked via mkt_campaign_pillar_assignments
```

### 4. Create Content
```
1. Create Master Content: Blog post
   → mkt_con_content (content_mode = 'master')

2. Create Repurposed Content: LinkedIn post, Facebook post
   → mkt_con_content (content_mode = 'repurposed', master_content_id = ...)
```

### 5. Schedule Content
```
1. Schedule to Channels: LinkedIn, Facebook, WhatsApp
   → mkt_con_schedule
   → Links to mkt_channels
```

### 6. WhatsApp Execution
```
1. Send WhatsApp Messages
   → mkt_wap_messages
   → Links directly to mkt_campaigns + mkt_con_content
   → Uses mkt_persona_contacts for targeting
```

---

## ✅ Design Decisions Summary

1. **Campaigns are common** - `mkt_campaigns` (not `mkt_cam_campaigns`)
2. **NDP is research module** - `mkt_ndp_*` comes BEFORE content creation
3. **NDP topics are research** - `mkt_ndp_topics` (not `mkt_con_topics`)
4. **Persona is ICP definition** - Mapping of segments + regions + attributes
5. **No WhatsApp campaigns** - WhatsApp execution links directly to `mkt_campaigns`
6. **WhatsApp messages link to campaigns** - `mkt_wap_messages.campaign_id → mkt_campaigns.id`

---

## 📈 Table Count Summary

- **Campaigns:** 1 main + 4 junction tables = **5 tables**
- **NDP Research:** 3-4 tables
- **Content:** 8-10 tables
- **WhatsApp:** 4 tables (no campaigns)
- **Persona:** 3-4 tables
- **Common:** 3 tables (channels, segments, kpis)

**Total: ~27-30 tables** for marketing module

---

## 🎯 Benefits of This Design

✅ **Clear separation** - Research, Campaigns, Content, Channels are distinct  
✅ **Scalable** - Easy to add new sub-modules (email, social automation)  
✅ **Query-friendly** - Can query by sub-module easily  
✅ **Maintainable** - Clear organization and naming  
✅ **Flexible** - Common tables stay simple, sub-modules get prefixes  
✅ **Follows standards** - Aligns with Database Standards document

---

## 📚 Related Documents

- [Database Standards](../database/DATABASE_STANDARDS.md)
- [Marketing System Documentation](../../marketing-system/)
- [WhatsApp Integration Understanding](../../marketing-system/whatsapp_marketing_automation_system_design.md)

---

**Last Updated:** December 2025  
**Version:** 1.0  
**Status:** Finalized

