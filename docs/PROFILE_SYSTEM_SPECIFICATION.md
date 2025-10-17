# PoultryCo Profile System - Complete Specification

**Document Version:** 1.0  
**Date:** October 17, 2025  
**Status:** Final for Development  
**Authors:** PoultryCo Development Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Profile System Architecture](#profile-system-architecture)
3. [Entity 1: Personal Profile](#entity-1-personal-profile)
4. [Entity 2: Business Profile](#entity-2-business-profile)
5. [Entity 3: Organization Profile](#entity-3-organization-profile)
6. [Membership System](#membership-system)
7. [Relationships & Connections](#relationships--connections)
8. [Skills & Endorsements](#skills--endorsements)
9. [Privacy & Visibility](#privacy--visibility)
10. [Data Flow Diagrams](#data-flow-diagrams)
11. [User Journeys](#user-journeys)
12. [Implementation Notes](#implementation-notes)

---

## Overview

### Purpose

PoultryCo is a professional networking platform for the global poultry industry. The profile system is the foundation that connects farmers, veterinarians, suppliers, researchers, and industry organizations in a trusted ecosystem.

### Core Principles

1. **Authenticity** - Every member must be a real PoultryCo user
2. **Flexibility** - Users can have multiple roles and associations
3. **Simplicity** - Easy for non-tech poultry professionals
4. **Trust** - Verification and credibility systems built-in
5. **Growth** - Viral growth through organization invitations

### Three Profile Types

| Profile Type | Represents | Examples |
|-------------|-----------|----------|
| **Personal Profile** | Individual professionals | Farmer, Veterinarian, Consultant |
| **Business Profile** | Commercial entities | Farms, Feed Mills, Suppliers |
| **Organization Profile** | Member-based groups | Associations, Federations, Councils |

---

## Profile System Architecture

### Entity Relationship Diagram (High Level)

```
┌─────────────────────┐
│  auth.users         │ (Supabase Auth)
│  - id               │
│  - email            │
│  - phone            │
└──────┬──────────────┘
       │ 1:1
       ↓
┌─────────────────────┐
│  profiles           │ (Personal Profile)
│  - id               │
│  - full_name        │
│  - roles[]          │
└──────┬──────────────┘
       │ 1:Many (creates/owns)
       ↓
┌─────────────────────┐         ┌─────────────────────┐
│  business_profiles  │←────────│  organizations      │
│  - id               │ Similar │  - id               │
│  - business_name    │ Structure│ - org_name         │
│  - owner_id         │         │  - org_type         │
└──────┬──────────────┘         └──────┬──────────────┘
       │                               │
       │ Many:Many (members)           │ Many:Many (members)
       └───────────────┬───────────────┘
                       ↓
           ┌───────────────────────┐
           │ organization_members  │
           │ - member_type         │
           │ - member_id (poly)    │
           │ - membership_tier     │
           └───────────────────────┘
```

### Naming Convention

**"Organization Profile"** is chosen as the umbrella term for:
- Associations (Tamil Nadu Poultry Farmers Association)
- Federations (National Poultry Federation)
- Councils (PoultryTech Innovation Council - PTIC)
- Forums (Poultry Health Forum)
- Communities (Broiler Farmers Community)
- Societies (Veterinary Poultry Society)
- Institutions (Universities, Research Centers)

**Why "Organization"?**
- ✅ Neutral and inclusive term
- ✅ Easily understood globally
- ✅ Doesn't confuse with "Business" entities
- ✅ Aligns with common usage (LinkedIn uses "Organization")
- ✅ Covers all member-based groups

---

## Entity 1: Personal Profile

### Overview

A Personal Profile represents an individual professional in the poultry industry. Each user account has exactly **one** personal profile.

### Core Characteristics

- **One profile per user** (1:1 with auth.users)
- **Multiple roles** (Farmer + Vet + Consultant)
- **Role ordering** (User-defined display order)
- **Role visibility** (Toggle roles on/off)
- **Profile strength** (Gamification for completion)

---

### 1.1 Basic Information

#### Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key, FK to auth.users | - |
| `full_name` | text | Yes | User's full name | "Rajesh Kumar" |
| `profile_slug` | text | Yes | Unique URL slug | "rajesh-kumar-namakkal-farmer" |
| `profile_photo_url` | text | No | Profile picture URL | "/storage/photos/..." |
| `headline` | text | No | Professional headline (150 chars) | "Poultry Farmer & Veterinary Consultant" |
| `bio` | text | No | About section (500 chars) | "20+ years in broiler farming..." |
| `location_state` | text | Yes | State/Province | "Tamil Nadu" |
| `location_district` | text | No | District/City | "Namakkal" |
| `location_city` | text | No | City/Town | "Namakkal" |
| `country` | text | Yes | Country | "India" |
| `phone` | text | Yes | Phone number (from auth) | "+919876543210" |
| `phone_verified` | boolean | Yes | Phone verification status | true |
| `email` | text | Yes | Email (from auth) | "rajesh@example.com" |
| `email_verified` | boolean | Yes | Email verification status | true |
| `whatsapp_number` | text | No | WhatsApp number (if different) | "+919876543210" |
| `profile_strength` | integer | Yes | Profile completion % (0-100) | 75 |
| `is_public` | boolean | Yes | Profile visibility | true |
| `last_active_at` | timestamp | No | Last platform activity | - |
| `last_profile_update_at` | timestamp | No | Last profile edit | - |
| `created_at` | timestamp | Yes | Account creation date | - |
| `updated_at` | timestamp | Yes | Last update | - |

**Profile URL Format:**
```
https://poultryco.net/in/{profile_slug}

Examples:
- poultryco.net/in/rajesh-kumar-namakkal-farmer
- poultryco.net/in/dr-priya-devi-veterinarian
- poultryco.net/in/suresh-babu-feed-consultant

Slug Generation Rules:
1. Lowercase full name
2. Replace spaces with hyphens
3. Add location for uniqueness
4. Add role if still duplicate
5. Max 60 characters
```

#### Headline Generation

If user doesn't provide headline:
```javascript
// Auto-generate from roles
roles = ["farmer", "veterinarian"]
headline = "Poultry Farmer & Veterinarian"

// Or from experience
most_recent_job = "Farm Manager at Green Valley Poultry"
headline = "Farm Manager at Green Valley Poultry"
```

---

### 1.2 Professional Roles

Users can have multiple roles simultaneously.

#### Role Types

| Role | Description | Icon |
|------|-------------|------|
| `farmer` | Poultry farmer/farm owner | 🌾 |
| `veterinarian` | Licensed veterinarian | 🏥 |
| `supplier` | Product/service supplier | 🏭 |
| `researcher` | Academic/researcher | 🎓 |
| `consultant` | Independent consultant | 📊 |
| `trader` | Commission agent/trader | 🤝 |
| `transporter` | Logistics/transport | 🚛 |
| `processor` | Processing plant professional | 🏢 |
| `lab_technician` | Laboratory services | 🔬 |
| `association_member` | Association office bearer | 👥 |
| `student` | Student/trainee | 📚 |
| `other` | Other role | ⭐ |

#### Roles Table Structure

**Table: `profile_roles`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `profile_id` | uuid | FK to profiles |
| `role_type` | enum | Role type from list above |
| `is_active` | boolean | Visibility toggle |
| `sort_order` | integer | Display order (user-defined) |
| `created_at` | timestamp | When role was added |

#### Role Management Rules

1. **No Limit**: Users can add unlimited roles
2. **Ordering**: User can drag-and-drop to reorder
3. **Toggle**: Each role has ON/OFF switch
4. **Visibility**: When OFF, role-specific details hidden from profile
5. **Deletion**: User can remove roles permanently

---

### 1.3 Role-Specific Details

When a role is ACTIVE, show additional fields specific to that role.

#### 1.3.1 Farmer Role Details

**Table: `profile_farmer_details`**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `profile_id` | uuid | FK to profiles (PK) | - |
| `years_of_experience` | integer | Years in farming | 15 |
| `farm_specialization` | text[] | Array of types | ["broiler", "layer"] |
| `farm_scale` | enum | Small/Medium/Large | "medium" |
| `farming_type` | text[] | Farming practices | ["conventional", "organic"] |
| `primary_breeds` | text[] | Breeds managed | ["Cobb", "Ross"] |
| `certifications` | text[] | Farm certifications | ["Organic", "Animal Welfare"] |
| `avg_batch_size` | integer | Average birds per batch | 10000 |
| `batches_per_year` | integer | Production cycles annually | 6 |
| `own_hatchery` | boolean | Has own hatchery | false |

**Specialization Options:**
- `broiler` - Broiler farming
- `layer` - Layer farming  
- `breeder` - Breeder farming
- `hatchery` - Hatchery operations
- `backyard` - Backyard/small-scale
- `integrated` - Integrated farming

**Scale Options:**
- `small` - < 5,000 birds
- `medium` - 5,000 - 50,000 birds
- `large` - > 50,000 birds
- `very_large` - > 500,000 birds

---

#### 1.3.2 Veterinarian Role Details

**Table: `profile_veterinarian_details`**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `profile_id` | uuid | FK to profiles (PK) | - |
| `license_number` | text | Vet license number (private) | "VET-TN-12345" |
| `license_issuing_authority` | text | Authority | "Tamil Nadu Veterinary Council" |
| `license_issue_date` | date | Issue date | 2010-06-15 |
| `license_expiry_date` | date | Expiry (if applicable) | null |
| `years_of_practice` | integer | Years practicing | 15 |
| `specializations` | text[] | Areas of expertise | ["poultry_medicine", "nutrition"] |
| `consultation_type` | text[] | Service types | ["on_farm", "remote"] |
| `service_areas` | text[] | Geographic coverage | ["Namakkal", "Erode"] |
| `emergency_services` | boolean | Available for emergencies | true |
| `consultation_fee_range` | text | Fee range (optional) | "₹500-₹1000" |
| `available_hours` | text | Availability (optional) | "Mon-Sat 9AM-6PM" |

**Specialization Options:**
- `poultry_medicine` - General poultry medicine
- `nutrition` - Poultry nutrition
- `pathology` - Disease pathology
- `reproduction` - Breeding & reproduction
- `preventive_care` - Preventive medicine
- `surgery` - Poultry surgery
- `diagnostics` - Laboratory diagnostics
- `hatchery_management` - Hatchery consultation

**Consultation Type:**
- `on_farm` - Visit to farm
- `remote` - Phone/video consultation
- `clinic` - At clinic/hospital
- `emergency` - Emergency services

---

#### 1.3.3 Supplier/Vendor Role Details

**Table: `profile_supplier_details`**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `profile_id` | uuid | FK to profiles (PK) | - |
| `supplier_type` | text[] | Types of supply | ["feed", "medicine"] |
| `years_in_business` | integer | Business experience | 10 |
| `service_coverage` | text[] | Geographic areas | ["Tamil Nadu", "Karnataka"] |
| `brands_dealt` | text[] | Brands represented | ["Venky's", "Suguna"] |
| `minimum_order_info` | text | MOQ details | "50 bags minimum" |
| `delivery_available` | boolean | Delivery service | true |
| `payment_terms_offered` | text[] | Payment options | ["cash", "credit_15_days", "credit_30_days"] |
| `delivery_time_typical` | text | Typical delivery time | "Same day within 50km" |

**Supplier Types:**
- `feed` - Poultry feed
- `medicine` - Medicines & vaccines
- `equipment` - Farm equipment
- `chicks` - Day-old chicks (DOC)
- `supplements` - Feed supplements
- `disinfectants` - Cleaning supplies
- `packaging` - Packaging materials
- `services` - Service provider

---

#### 1.3.4 Researcher/Academic Role Details

**Table: `profile_researcher_details`**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `profile_id` | uuid | FK to profiles (PK) | - |
| `current_institution` | text | University/Institute | "TANUVAS" |
| `research_areas` | text[] | Research focus | ["nutrition", "genetics"] |
| `publications_count` | integer | Number of publications | 25 |
| `h_index` | integer | Research impact (optional) | 12 |
| `orcid_id` | text | ORCID identifier | "0000-0001-2345-6789" |
| `google_scholar_url` | text | Google Scholar profile | "scholar.google.com/..." |
| `looking_for_collaboration` | boolean | Open to collaborate | true |

**Research Areas:**
- `nutrition` - Poultry nutrition
- `genetics` - Breeding & genetics
- `disease_management` - Disease research
- `welfare` - Animal welfare
- `production` - Production systems
- `meat_quality` - Meat/egg quality
- `environment` - Environmental impact
- `economics` - Poultry economics

---

#### 1.3.5 Consultant Role Details

**Table: `profile_consultant_details`**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `profile_id` | uuid | FK to profiles (PK) | - |
| `consultation_areas` | text[] | Areas of expertise | ["farm_management", "biosecurity"] |
| `years_of_experience` | integer | Consulting experience | 12 |
| `service_type` | text[] | Service offerings | ["advisory", "training"] |
| `consulting_rate` | text | Rate info (optional) | "₹5000/day" |
| `languages_spoken` | text[] | Languages | ["Tamil", "English"] |
| `typical_projects` | text | Project description | "Farm setup, optimization" |

**Consultation Areas:**
- `farm_management` - Farm operations
- `biosecurity` - Biosecurity protocols
- `nutrition` - Feed formulation
- `financial_planning` - Business planning
- `farm_design` - Infrastructure design
- `disease_management` - Disease control
- `quality_control` - QC systems
- `export_compliance` - Export setup

---

### 1.4 Work Experience

LinkedIn-style work experience section.

**Table: `profile_experience`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `profile_id` | uuid | Yes | FK to profiles | - |
| `job_title` | text | Yes | Position title | "Farm Manager" |
| `company_name` | text | Yes | Company/Farm name | "Green Valley Poultry" |
| `business_profile_id` | uuid | No | FK to business_profiles (if exists) | - |
| `employment_type` | enum | Yes | Employment type | "full_time" |
| `location` | text | No | Job location | "Namakkal, TN" |
| `is_current` | boolean | Yes | Currently working | true |
| `start_date` | date | Yes | Start date (Month, Year) | 2015-06-01 |
| `end_date` | date | No | End date (null if current) | null |
| `description` | text | No | Job description (300 chars) | "Managed 50,000 broiler farm..." |
| `key_achievements` | text[] | No | Measurable achievements | ["Reduced FCR from 1.8 to 1.65", "Increased survival rate to 97%"] |
| `sort_order` | integer | Yes | Display order | 1 |
| `created_at` | timestamp | Yes | - | - |

**Key Achievements Examples:**
- "Reduced FCR from 1.8 to 1.65 through feed optimization"
- "Managed 5 farms with total capacity of 250,000 birds"
- "Achieved 97% survival rate consistently"
- "Implemented biosecurity protocol reducing disease by 40%"
- "Increased farm profitability by ₹2L per batch"

**Employment Types:**
- `full_time` - Full-time
- `part_time` - Part-time
- `self_employed` - Self-employed
- `contract` - Contract
- `internship` - Internship
- `volunteer` - Volunteer

**Business Profile Linking:**
- If company exists on PoultryCo → link to `business_profile_id`
- If not → store as text in `company_name`
- Clickable link appears if business profile exists

---

### 1.5 Education

**Table: `profile_education`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `profile_id` | uuid | Yes | FK to profiles | - |
| `degree` | text | Yes | Degree/Certification | "Bachelor of Veterinary Science" |
| `field_of_study` | text | No | Major/Specialization | "Veterinary Medicine" |
| `institution` | text | Yes | University/Institute | "TANUVAS" |
| `location` | text | No | Institution location | "Chennai, Tamil Nadu" |
| `start_year` | integer | No | Start year | 2005 |
| `end_year` | integer | No | End year (null if ongoing) | 2010 |
| `grade` | text | No | Grade/Honors | "First Class with Distinction" |
| `description` | text | No | Additional details | "Focus on poultry pathology" |
| `sort_order` | integer | Yes | Display order | 1 |
| `created_at` | timestamp | Yes | - | - |

---

### 1.6 Licenses & Certifications

**Table: `profile_certifications`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `profile_id` | uuid | Yes | FK to profiles | - |
| `certification_name` | text | Yes | Certificate name | "Veterinary License" |
| `issuing_organization` | text | Yes | Issuing body | "Tamil Nadu Veterinary Council" |
| `issue_date` | date | No | Issue date | 2010-06-15 |
| `expiry_date` | date | No | Expiry (null if lifetime) | null |
| `credential_id` | text | No | Certificate ID/Number | "VET-TN-12345" |
| `credential_url` | text | No | Verification URL | "tnveterinarycouncil.org/verify" |
| `document_url` | text | No | Uploaded certificate | "/storage/certs/..." |
| `is_verified` | boolean | Yes | Verified by admin | true |
| `sort_order` | integer | Yes | Display order | 1 |
| `created_at` | timestamp | Yes | - | - |

**Common Certifications:**
- Veterinary License
- Organic Farming Certification
- Biosecurity Certification
- HACCP Certification
- Animal Welfare Certification
- Export License
- Professional Memberships
- Training Certificates

---

### 1.7 Skills

Tag-based skill system with auto-suggest.

**Table: `skills`** (Global skill repository)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | uuid | Primary key | - |
| `skill_name` | text | Skill name (unique) | "Broiler Management" |
| `skill_category` | enum | Category | "technical" |
| `usage_count` | integer | Times used across platform | 1250 |
| `is_approved` | boolean | Admin approved | true |
| `created_at` | timestamp | - | - |

**Skill Categories:**
- `technical` - Technical skills (Feed Formulation, Disease Diagnosis)
- `management` - Management skills (Farm Management, Team Leadership)
- `sales` - Sales & marketing skills
- `compliance` - Regulatory & compliance
- `technology` - Technology & software
- `language` - Language skills

**Table: `profile_skills`** (User's skills)

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `profile_id` | uuid | FK to profiles |
| `skill_id` | uuid | FK to skills |
| `proficiency_level` | enum | Skill level (beginner/intermediate/expert) |
| `years_of_experience` | integer | Years using this skill |
| `endorsement_count` | integer | Number of endorsements |
| `created_at` | timestamp | When skill was added |

**Skill Auto-suggest Logic:**
```javascript
// When user types "Broiler"
SELECT skill_name FROM skills 
WHERE skill_name ILIKE '%Broiler%' 
  AND is_approved = true
ORDER BY usage_count DESC
LIMIT 10

// Results:
// 1. Broiler Management (1250 uses)
// 2. Broiler Nutrition (890 uses)
// 3. Broiler Disease Management (645 uses)
```

---

### 1.8 Skill Endorsements

Only connections can endorse skills.

**Table: `skill_endorsements`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `profile_skill_id` | uuid | FK to profile_skills |
| `endorser_profile_id` | uuid | FK to profiles (who endorsed) |
| `created_at` | timestamp | When endorsed |

**Rules:**
1. Can only endorse if you are connected
2. Can endorse each skill once per person
3. Can remove your endorsement
4. Endorser's name shown if profile is public

**Display:**
```
Broiler Management (25 endorsements)
Endorsed by: Suresh Kumar, Priya Devi, and 23 others
```

---

### 1.9 Organization Memberships

Display of organizations user belongs to (like LinkedIn honors/certifications).

**Displayed from:** `organization_members` table (see Organization Profile section)

**Profile Display:**
```
🏆 PROFESSIONAL MEMBERSHIPS (3)

⭐ NECC
   National Egg Coordination Committee
   Regular Member #12345
   Member since 2015
   
⭐ Tamil Nadu Poultry Farmers Association
   Life Member #456
   Member since 2010
```

---

### 1.10 Profile Stats & Metrics

**Table: `profile_stats`**

| Field | Type | Description | Updated |
|-------|------|-------------|---------|
| `profile_id` | uuid | FK to profiles (PK) | - |
| `connections_count` | integer | Total connections | Real-time |
| `followers_count` | integer | Total followers | Real-time |
| `posts_count` | integer | Total posts | Real-time |
| `questions_answered` | integer | Expert answers given | Real-time |
| `helpful_votes` | integer | Helpfulness score | Real-time |
| `profile_views` | integer | Profile views (30 days) | Daily |
| `search_appearances` | integer | Appeared in searches | Daily |
| `updated_at` | timestamp | Last stats update | - |

---

### 1.11 Profile Strength Calculation

**Algorithm:**

```javascript
profileStrength = {
  // Basic Info (40%)
  hasProfilePhoto: 10,
  hasHeadline: 5,
  hasBio: 10,
  hasLocation: 5,
  hasVerifiedPhone: 5,
  hasVerifiedEmail: 5,
  
  // Professional Info (40%)
  hasAtLeastOneRole: 10,
  hasExperience: 10,
  hasEducation: 10,
  hasSkills: 10, // At least 3 skills
  
  // Network & Engagement (20%)
  hasConnections: 10, // At least 5 connections
  hasOrganizationMembership: 5,
  hasPostedContent: 5
}

// Total: 100%
```

**Display:**
```
┌────────────────────────────────┐
│ Profile Strength: 75% ████████░░│
│                                │
│ Complete these:                │
│ ☐ Add profile photo    +10%   │
│ ☐ Add 3 skills         +10%   │
│ ☐ Get 5 connections    +5%    │
└────────────────────────────────┘
```

---

## Entity 2: Business Profile

### Overview

A Business Profile represents a commercial entity - farms, suppliers, manufacturers, service providers, etc. These are **profit-oriented** entities focused on products/services.

### Core Characteristics

- **Created by users** (owner_id)
- **Can have multiple admins** (team members)
- **Products/Services catalog**
- **Job postings**
- **Company updates feed**
- **Can be organization member** (corporate membership)

---

### 2.1 Basic Information

**Table: `business_profiles`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `business_name` | text | Yes | Legal/Trade name | "ABC Feeds Private Limited" |
| `business_slug` | text | Yes | Unique URL slug | "abc-feeds-chennai" |
| `display_name` | text | No | Short name | "ABC Feeds" |
| `logo_url` | text | No | Company logo | "/storage/logos/..." |
| `cover_photo_url` | text | No | Cover image | "/storage/covers/..." |
| `tagline` | text | No | Short description (150 chars) | "Premium Poultry Feed Manufacturer" |
| `about` | text | No | Detailed description (500 chars) | "ABC Feeds has been..." |
| `business_type` | enum | Yes | Type of business | "feed_mill" |
| `industry_category` | text | No | Sub-category | "Feed Manufacturing" |
| `company_size` | enum | No | Employee count range | "51-200" |
| `founded_year` | integer | No | Year established | 2005 |
| `website_url` | text | No | Company website | "abcfeeds.com" |
| `owner_id` | uuid | Yes | FK to profiles (creator) | - |
| `is_verified` | boolean | Yes | Verified by admin | false |
| `verification_date` | date | No | When verified | null |
| `created_at` | timestamp | Yes | - | - |
| `updated_at` | timestamp | Yes | - | - |

**Business Types:**
- `farm` - Poultry Farm
- `feed_mill` - Feed Manufacturing
- `hatchery` - Hatchery
- `processing_plant` - Processing/Slaughter
- `medicine_company` - Pharma/Vaccines
- `equipment_supplier` - Equipment Sales
- `chick_supplier` - Day-old Chicks (DOC)
- `service_provider` - Services (cleaning, consulting, etc.)
- `laboratory` - Testing Lab
- `logistics` - Transport/Logistics
- `retail` - Retail Store
- `distributor` - Distribution/Trading
- `integrator` - Integrated Operations
- `other` - Other business type

**Company Size:**
- `1-10` - 1-10 employees
- `11-50` - 11-50 employees
- `51-200` - 51-200 employees
- `201-500` - 201-500 employees
- `500+` - 500+ employees

---

### 2.2 Location & Contact

**Table: `business_profiles` (continued)**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `headquarters_address` | text | HQ address | "123 Industrial Area, Chennai" |
| `headquarters_state` | text | State | "Tamil Nadu" |
| `headquarters_city` | text | City | "Chennai" |
| `country` | text | Country | "India" |
| `phone` | text | Contact number | "+914412345678" |
| `email` | text | Business email | "contact@abcfeeds.com" |
| `whatsapp_business` | text | WhatsApp number | "+919876543210" |

**Table: `business_locations`** (Multiple branches)

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `business_profile_id` | uuid | FK to business_profiles |
| `location_type` | enum | Branch/Office/Factory/Warehouse |
| `address` | text | Full address |
| `state` | text | State |
| `city` | text | City |
| `pincode` | text | PIN/ZIP code |
| `phone` | text | Location phone |
| `is_headquarters` | boolean | Is HQ location |
| `created_at` | timestamp | - |

**Service Coverage:**

**Table: `business_service_areas`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `business_profile_id` | uuid | FK to business_profiles |
| `state` | text | State covered |
| `districts` | text[] | Districts (optional) |
| `delivery_available` | boolean | Delivery service |
| `created_at` | timestamp | - |

---

### 2.3 Legal & Registration

**Table: `business_profiles` (continued)**

| Field | Type | Description | Example | Visibility |
|-------|------|-------------|---------|-----------|
| `registration_number` | text | Company reg. no. | "U15139TN2005PTC123456" | Private |
| `tax_id` | text | GST/Tax ID | "33AAACC1234D1Z5" | Private |
| `pan_number` | text | PAN (India) | "AAACC1234D" | Private |
| `fssai_license` | text | FSSAI number | "12345678901234" | Public |
| `trade_license` | text | Trade license | "TL-12345" | Private |

**Note:** Legal fields are private (only visible to owner/admins).

---

### 2.4 Team & Roles

Users can be associated with business profiles in different capacities.

**Table: `business_team_members`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `business_profile_id` | uuid | FK to business_profiles |
| `profile_id` | uuid | FK to profiles |
| `role` | enum | Member's role |
| `designation` | text | Job title |
| `department` | text | Department (optional) |
| `permissions` | jsonb | Permission flags |
| `is_public` | boolean | Show on business page |
| `join_date` | date | When joined |
| `created_at` | timestamp | - |

**Roles:**
- `owner` - Business owner (full access)
- `admin` - Administrator (can edit profile)
- `employee` - Regular employee (listed on page)
- `consultant` - External consultant

**Permissions (for admins):**
```json
{
  "can_edit_profile": true,
  "can_manage_products": true,
  "can_manage_jobs": true,
  "can_manage_team": false,
  "can_post_updates": true,
  "can_view_analytics": true
}
```

**Display on Business Page:**
```
👥 OUR TEAM (25)

Leadership:
├── Rajesh Kumar - Founder & CEO
└── Priya Devi - Operations Director

Departments:
├── Sales Team (10)
├── Production (8)
└── Quality Control (5)
```

---

### 2.4.1 Business Contact Persons

For inquiries and customer support, businesses need designated contact persons.

**Table: `business_contact_persons`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `business_profile_id` | uuid | Yes | FK to business_profiles | - |
| `profile_id` | uuid | Yes | FK to profiles (must be team member) | - |
| `contact_type` | enum | Yes | Purpose of contact | "sales" |
| `designation` | text | No | Job title | "Sales Manager" |
| `department` | text | No | Department | "Sales" |
| `is_primary` | boolean | Yes | Primary contact | true |
| `phone` | text | No | Direct phone | "+919876543210" |
| `email` | text | No | Direct email | "sales@abcfeeds.com" |
| `whatsapp` | text | No | WhatsApp | "+919876543210" |
| `available_hours` | text | No | Availability | "Mon-Sat 9AM-6PM" |
| `languages` | text[] | No | Languages spoken | ["tamil", "english"] |
| `sort_order` | integer | Yes | Display order | 1 |
| `created_at` | timestamp | Yes | - | - |

**Contact Types:**
- `sales` - Sales inquiries
- `technical` - Technical support
- `admin` - General administration
- `customer_service` - Customer support
- `orders` - Order processing
- `hr` - Human resources (for jobs)

**Rules:**
1. Contact person MUST be a PoultryCo user (profile_id required)
2. Contact person MUST be a team member of the business
3. One primary contact required per business
4. Can have multiple contacts for different purposes

**Display on Business Page:**
```
📞 CONTACT US

Primary Contact:
├── Rajesh Kumar - CEO
    📱 +919876543210
    📧 rajesh@abcfeeds.com
    💬 WhatsApp available

Sales Inquiries:
├── Priya Devi - Sales Manager
    📱 +919876543211
    📧 sales@abcfeeds.com
    🕐 Mon-Sat 9AM-6PM

Technical Support:
├── Suresh Babu - Technical Manager
    📱 +919876543212
    📧 tech@abcfeeds.com
    🗣️ Tamil, English, Telugu
```

**Why Separate Table:**
- Large businesses have multiple contact points
- Different people handle different inquiries
- Contact persons must be verified users (not just text)
- Enables direct messaging to right person
- Tracks inquiry routing

---

### 2.5 Farm-Specific Information

**Table: `business_farm_details`**

Only for `business_type = 'farm'`

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `business_profile_id` | uuid | FK to business_profiles (PK) | - |
| `farm_type` | text[] | Type(s) of farm | ["broiler", "layer"] |
| `total_capacity` | integer | Total bird capacity | 50000 |
| `number_of_sheds` | integer | Shed count | 8 |
| `farming_practice` | text[] | Practices | ["conventional", "climate_controlled"] |
| `primary_breeds` | text[] | Breeds raised | ["Cobb-500", "Ross-308"] |
| `feed_conversion_ratio` | decimal | Average FCR | 1.65 |
| `mortality_rate` | decimal | Average mortality % | 3.5 |
| `certifications` | text[] | Farm certifications | ["Organic", "Animal Welfare"] |
| `bio_security_level` | enum | Biosecurity level | "high" |
| `climate_control` | boolean | Has climate control | true |
| `automated_feeding` | boolean | Automated feeding | true |
| `automated_watering` | boolean | Automated watering | true |

**Farm Types:**
- `broiler` - Broiler farm
- `layer` - Layer farm
- `breeder` - Breeder farm
- `hatchery` - Hatchery operations
- `backyard` - Backyard farming
- `integrated` - Integrated farming

**Farming Practices:**
- `conventional` - Conventional
- `organic` - Organic certified
- `free_range` - Free-range
- `cage_free` - Cage-free
- `climate_controlled` - Climate control
- `biosecure` - High biosecurity

**Biosecurity Levels:**
- `basic` - Basic biosecurity
- `medium` - Medium level
- `high` - High level
- `compartmentalized` - Compartmentalized

---

### 2.6 Supplier-Specific Information

**Table: `business_supplier_details`**

Only for supplier/vendor business types.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `business_profile_id` | uuid | FK to business_profiles (PK) | - |
| `supplier_categories` | text[] | Product categories | ["feed", "medicine"] |
| `brands_dealt` | text[] | Brands represented | ["Venky's", "Suguna"] |
| `minimum_order_value` | text | MOV info | "₹10,000 minimum" |
| `payment_terms` | text[] | Payment options | ["cash", "credit_30_days"] |
| `delivery_available` | boolean | Delivery service | true |
| `delivery_charges` | text | Delivery info | "Free above ₹50,000" |
| `warehouse_capacity` | text | Storage capacity | "500 MT" |

**Supplier Categories:**
- `feed` - Poultry feed
- `medicine` - Medicines & vaccines
- `equipment` - Farm equipment
- `chicks` - Day-old chicks
- `supplements` - Feed supplements
- `disinfectants` - Sanitization
- `packaging` - Packaging materials
- `spare_parts` - Equipment parts

---

### 2.7 Products & Services

**Table: `business_products`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `business_profile_id` | uuid | Yes | FK to business_profiles | - |
| `product_type` | enum | Yes | Product or Service | "product" |
| `product_name` | text | Yes | Name | "Broiler Starter Feed" |
| `category` | text | Yes | Category | "Feed" |
| `sub_category` | text | No | Sub-category | "Starter Feed" |
| `description` | text | Yes | Full description (500 chars) | "High protein starter feed..." |
| `specifications` | jsonb | No | Key specs (JSON) | See below |
| `price` | decimal | No | Price | 1450.00 |
| `price_unit` | text | No | Unit | "per 50kg bag" |
| `price_visibility` | enum | Yes | Who can see price | "public" |
| `moq` | text | No | Minimum order | "10 bags" |
| `availability_status` | enum | Yes | Stock status | "in_stock" |
| `sku` | text | No | SKU/Product code | "BSF-50-001" |
| `is_featured` | boolean | Yes | Featured product | true |
| `sort_order` | integer | Yes | Display order | 1 |
| `created_at` | timestamp | Yes | - | - |
| `updated_at` | timestamp | Yes | - | - |

**Product Types:**
- `product` - Physical product
- `service` - Service offering

**Price Visibility:**
- `public` - Everyone can see
- `private` - Hide price (show "Contact for price")
- `on_request` - Show "Price on request"

**Availability Status:**
- `in_stock` - Available now
- `out_of_stock` - Out of stock
- `on_request` - Available on order
- `discontinued` - No longer available

**Specifications (JSON example):**
```json
{
  "crude_protein": "22%",
  "crude_fat": "5%",
  "crude_fiber": "4%",
  "metabolizable_energy": "2900 kcal/kg",
  "packaging": "50kg HDPE bag",
  "shelf_life": "3 months"
}
```

**Table: `product_images`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `product_id` | uuid | FK to business_products |
| `image_url` | text | Image URL |
| `is_primary` | boolean | Main image |
| `sort_order` | integer | Display order |
| `created_at` | timestamp | - |

**Maximum:** 5 images per product, 1 primary image.

---

### 2.8 Product Reviews & Ratings

**Table: `product_reviews`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `product_id` | uuid | FK to business_products |
| `reviewer_profile_id` | uuid | FK to profiles |
| `rating` | integer | Rating (1-5 stars) |
| `review_text` | text | Review content (500 chars) |
| `is_verified_purchase` | boolean | Verified buyer (future) |
| `helpful_count` | integer | Helpful votes |
| `created_at` | timestamp | - |
| `updated_at` | timestamp | - |

**Rules:**
1. Only connected users can review (prevents spam)
2. One review per product per user
3. Can edit own review
4. Business can respond to reviews
5. Display average rating on product

**Display:**
```
★★★★☆ 4.2 (24 reviews)

★★★★★ Excellent quality feed
Rajesh Kumar • 2 weeks ago
"Been using for 3 months, birds are healthy..."
👍 Helpful (12)
```

---

### 2.9 Job Postings

**Table: `business_jobs`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `business_profile_id` | uuid | Yes | FK to business_profiles | - |
| `job_title` | text | Yes | Position title | "Farm Manager" |
| `employment_type` | enum | Yes | Job type | "full_time" |
| `job_category` | text | Yes | Category | "Farm Operations" |
| `experience_required` | text | No | Experience needed | "3-5 years" |
| `location_state` | text | Yes | Job location state | "Tamil Nadu" |
| `location_city` | text | No | City | "Namakkal" |
| `is_remote` | boolean | Yes | Remote work | false |
| `salary_min` | decimal | No | Min salary | 25000 |
| `salary_max` | decimal | No | Max salary | 40000 |
| `salary_currency` | text | No | Currency | "INR" |
| `salary_period` | enum | No | Per month/year | "month" |
| `show_salary` | boolean | Yes | Display salary | false |
| `job_description` | text | Yes | Full description | "We are looking for..." |
| `requirements` | text | Yes | Requirements | "Qualification: B.V.Sc..." |
| `benefits` | text | No | Job benefits | "Health insurance, PF..." |
| `application_method` | enum | Yes | How to apply | "external" |
| `application_email` | text | No | Email (if external) | "jobs@abcfeeds.com" |
| `application_url` | text | No | Apply URL (if external) | "abcfeeds.com/careers" |
| `application_instructions` | text | No | Instructions | "Send resume to..." |
| `application_deadline` | date | No | Deadline | 2025-12-31 |
| `is_active` | boolean | Yes | Active job | true |
| `views_count` | integer | Yes | View count | 145 |
| `applications_count` | integer | Yes | Application count | 23 |
| `posted_date` | date | Yes | When posted | 2025-10-01 |
| `created_at` | timestamp | Yes | - | - |
| `updated_at` | timestamp | Yes | - | - |

**Employment Types:**
- `full_time` - Full-time
- `part_time` - Part-time
- `contract` - Contract
- `internship` - Internship
- `temporary` - Temporary

**Application Methods:**
- `external` - External (email/website)
- `in_app` - Apply through PoultryCo (future)

**Job Categories (Poultry-specific):**
- Farm Operations
- Veterinary Services
- Feed Mill Operations
- Hatchery Operations
- Quality Control
- Sales & Marketing
- Logistics & Supply Chain
- Finance & Accounting
- Administration
- Technical & Engineering

---

### 2.10 Certifications & Achievements

**Table: `business_certifications`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `business_profile_id` | uuid | FK to business_profiles |
| `certification_type` | enum | Type |
| `certification_name` | text | Name |
| `issuing_body` | text | Issuing organization |
| `issue_date` | date | Issue date |
| `expiry_date` | date | Expiry (if applicable) |
| `certificate_number` | text | Certificate ID |
| `document_url` | text | Uploaded certificate |
| `is_verified` | boolean | Admin verified |
| `sort_order` | integer | Display order |
| `created_at` | timestamp | - |

**Certification Types:**
- `quality` - Quality standards (ISO, HACCP)
- `organic` - Organic certification
- `animal_welfare` - Animal welfare
- `environmental` - Environmental compliance
- `export` - Export license
- `biosecurity` - Biosecurity certification
- `award` - Industry awards
- `membership` - Professional memberships

---

### 2.11 Business Stats & Metrics

**Table: `business_stats`**

| Field | Type | Description |
|-------|------|-------------|
| `business_profile_id` | uuid | FK to business_profiles (PK) |
| `followers_count` | integer | Followers |
| `products_count` | integer | Total products |
| `services_count` | integer | Total services |
| `jobs_count` | integer | Active jobs |
| `team_members_count` | integer | Team size |
| `average_product_rating` | decimal | Avg rating (1-5) |
| `total_reviews` | integer | Review count |
| `profile_views` | integer | Profile views (30 days) |
| `product_views` | integer | Product views (30 days) |
| `updated_at` | timestamp | Last update |

---

## Entity 3: Organization Profile

### Overview

An **Organization Profile** represents member-based groups - associations, federations, councils, forums, societies, and institutions. These are **not commercial** entities but community/industry bodies focused on member services and advocacy.

### Core Characteristics

- **Member-centric** (not product/profit-oriented)
- **Governance structure** (President, Secretary, Board)
- **Member management** (individuals AND businesses can join)
- **Event management** (conferences, meetings, training)
- **Member services** (resources, benefits, advocacy)
- **Communication hub** (announcements, discussions)

### Key Difference from Business Profile

| Aspect | Business Profile | Organization Profile |
|--------|------------------|---------------------|
| **Purpose** | Commercial (products/services) | Member services & advocacy |
| **Focus** | Selling products/services | Supporting members |
| **Revenue** | Product sales | Membership fees |
| **Members** | Employees/team | Members (pay to join) |
| **Products** | Yes (core feature) | No |
| **Events** | Optional | Core feature |
| **Governance** | Owner/hierarchy | Democratic/elected |

---

### 3.1 Basic Information

**Table: `organizations`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `organization_name` | text | Yes | Full name | "National Egg Coordination Committee" |
| `organization_slug` | text | Yes | Unique URL slug | "necc" |
| `short_name` | text | No | Abbreviation | "NECC" |
| `logo_url` | text | No | Logo | "/storage/logos/..." |
| `cover_photo_url` | text | No | Cover image | "/storage/covers/..." |
| `tagline` | text | No | Short description (150 chars) | "Uniting egg producers across India" |
| `about` | text | Yes | Detailed description (1000 chars) | "NECC was established in..." |
| `organization_type` | enum | Yes | Type | "association" |
| `industry_focus` | text[] | No | Focus areas | ["layers", "eggs"] |
| `geographic_scope` | enum | Yes | Scope | "national" |
| `founded_year` | integer | No | Year established | 1982 |
| `registration_number` | text | No | Legal reg. number | "REG/1982/12345" |
| `website_url` | text | No | Website | "necc.org.in" |
| `creator_id` | uuid | Yes | FK to profiles (who created) | - |
| `is_verified` | boolean | Yes | Verified by admin | true |
| `verification_date` | date | No | When verified | 2025-01-15 |
| `created_at` | timestamp | Yes | - | - |
| `updated_at` | timestamp | Yes | - | - |

**Organization Types:**
- `association` - Association (Tamil Nadu Poultry Farmers Association)
- `federation` - Federation (All India Poultry Breeders Federation)
- `council` - Council (PoultryTech Innovation Council - PTIC)
- `forum` - Forum (Poultry Health Forum)
- `society` - Society (Veterinary Poultry Society)
- `institution` - Institution (Universities, Research Centers)
- `cooperative` - Cooperative (Farmer Cooperative)
- `chamber` - Chamber of Commerce (Poultry Chamber)
- `network` - Network (Young Poultry Professionals Network)
- `community` - Community (Organic Poultry Community)

**Geographic Scope:**
- `local` - City/District level
- `state` - State/Province level
- `regional` - Multi-state region
- `national` - Country level
- `international` - Multi-country
- `global` - Worldwide

---

### 3.2 Location & Contact

**Table: `organizations` (continued)**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `headquarters_address` | text | HQ address | "NECC Building, Chennai" |
| `headquarters_state` | text | State | "Tamil Nadu" |
| `headquarters_city` | text | City | "Chennai" |
| `country` | text | Country | "India" |
| `phone` | text | Contact number | "+914412345678" |
| `email` | text | Official email | "info@necc.org.in" |
| `whatsapp_number` | text | WhatsApp | "+919876543210" |

**Table: `organization_offices`** (Regional offices)

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `office_type` | enum | Regional/Branch/Chapter |
| `office_name` | text | Office name |
| `address` | text | Full address |
| `state` | text | State |
| `city` | text | City |
| `phone` | text | Office phone |
| `is_headquarters` | boolean | Is main office |
| `created_at` | timestamp | - |

---

### 3.3 Leadership & Governance

**Table: `organization_leadership`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `profile_id` | uuid | FK to profiles |
| `position` | text | Position title |
| `position_type` | enum | Position category |
| `term_start_date` | date | Term start |
| `term_end_date` | date | Term end (null if ongoing) |
| `is_current` | boolean | Currently serving |
| `bio` | text | Position description |
| `sort_order` | integer | Display order |
| `created_at` | timestamp | - |

**Position Types:**
- `president` - President/Chairman
- `vice_president` - Vice President
- `secretary` - Secretary
- `treasurer` - Treasurer
- `board_member` - Board Member
- `committee_member` - Committee Member
- `advisor` - Advisor
- `founder` - Founder

**Display:**
```
LEADERSHIP TEAM

President
└── Dr. Rajesh Kumar (2023-2025)
    Chairman & Senior Poultry Consultant

Secretary
└── Priya Devi (2023-2025)
    Secretary & Communications Head

Treasurer
└── Suresh Babu (2023-2025)
    Financial Management

Board Members (12)
├── [Member profiles...]
```

---

### 3.4 Membership System

This is the **core** feature of organizations.

**Table: `organization_membership_tiers`**

Define membership types offered by organization.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | uuid | Primary key | - |
| `organization_id` | uuid | FK to organizations | - |
| `tier_name` | text | Tier name | "Regular Member" |
| `tier_type` | enum | Member type | "personal" |
| `annual_fee` | decimal | Yearly fee | 1000.00 |
| `currency` | text | Currency | "INR" |
| `benefits` | text | Benefits description | "Access to all events..." |
| `voting_rights` | boolean | Can vote | true |
| `directory_access` | boolean | Access member directory | true |
| `event_discount` | integer | Event discount % | 20 |
| `is_active` | boolean | Currently offered | true |
| `sort_order` | integer | Display order | 1 |
| `created_at` | timestamp | - | - |

**Tier Types:**
- `personal` - Individual membership
- `business` - Business/corporate membership

**Example Tiers:**

**Personal:**
- Regular Member - ₹1,000/year
- Life Member - ₹10,000 (one-time)
- Patron Member - ₹25,000/year
- Student Member - ₹500/year

**Business:**
- Silver Corporate - ₹50,000/year
- Gold Corporate - ₹1,00,000/year
- Platinum Corporate - ₹2,00,000/year

---

**Table: `organization_members`**

The **core membership junction table** linking users/businesses to organizations.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `organization_id` | uuid | Yes | FK to organizations | - |
| `member_type` | enum | Yes | personal/business | "personal" |
| `member_id` | uuid | Yes | FK to profiles OR business_profiles | - |
| `membership_tier_id` | uuid | Yes | FK to organization_membership_tiers | - |
| `member_number` | text | No | Organization's member ID | "NECC-12345" |
| `status` | enum | Yes | Membership status | "active" |
| `join_date` | date | Yes | When joined | 2015-06-15 |
| `renewal_date` | date | No | Next renewal | 2026-06-15 |
| `expiry_date` | date | No | Expiry (if applicable) | null |
| `fee_paid` | boolean | Yes | Payment status | true |
| `last_payment_date` | date | No | Last payment | 2025-06-15 |
| `voting_rights` | boolean | Yes | Has voting rights | true |
| `office_position` | text | No | If office bearer | "President" |
| `committee_memberships` | text[] | No | Committees member of | ["Executive", "Finance"] |
| `notes` | text | No | Admin notes | "Founding member" |
| `is_featured` | boolean | Yes | Featured member | false |
| `created_at` | timestamp | Yes | - | - |
| `updated_at` | timestamp | Yes | - | - |

**Member Types:**
- `personal` - Individual member (links to `profiles` table)
- `business` - Corporate member (links to `business_profiles` table)

**Status:**
- `pending_approval` - Application submitted, awaiting approval
- `active` - Active member
- `expired` - Membership expired
- `suspended` - Temporarily suspended
- `cancelled` - Membership cancelled
- `pending_signup` - Invited but not yet joined PoultryCo

**Composite Index:** `(member_type, member_id)` for polymorphic lookup

**Query Examples:**

```sql
-- Get all personal members
SELECT p.*, om.member_number, om.status
FROM organization_members om
JOIN profiles p ON om.member_id = p.id
WHERE om.organization_id = 'org-uuid'
  AND om.member_type = 'personal';

-- Get all business members
SELECT bp.*, om.member_number, om.status
FROM organization_members om
JOIN business_profiles bp ON om.member_id = bp.id
WHERE om.organization_id = 'org-uuid'
  AND om.member_type = 'business';
```

---

### 3.5 Membership Applications

**Table: `organization_membership_applications`**

Track membership applications before approval.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `applicant_type` | enum | personal/business |
| `applicant_id` | uuid | FK to profiles OR business_profiles |
| `membership_tier_id` | uuid | FK to organization_membership_tiers |
| `application_message` | text | Why joining (optional) |
| `referral_code` | text | Referral code (optional) |
| `status` | enum | Application status |
| `reviewed_by` | uuid | FK to profiles (admin) |
| `review_date` | timestamp | When reviewed |
| `rejection_reason` | text | If rejected |
| `created_at` | timestamp | Application date |

**Application Status:**
- `pending` - Awaiting review
- `approved` - Approved (creates organization_members record)
- `rejected` - Rejected

---

### 3.6 Member Invitations (Bulk Import)

**Table: `organization_member_invitations`**

Track invitations sent to potential members.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `invitee_name` | text | Name |
| `invitee_phone` | text | Phone number |
| `invitee_email` | text | Email |
| `member_type` | enum | personal/business |
| `membership_tier_id` | uuid | FK to membership tier |
| `member_number` | text | Pre-assigned member number |
| `invitation_token` | text | Unique invitation token |
| `invitation_url` | text | Generated invite URL |
| `status` | enum | Invitation status |
| `invited_by` | uuid | FK to profiles (admin) |
| `invited_at` | timestamp | When invited |
| `joined_at` | timestamp | When joined |
| `reminder_count` | integer | Reminders sent |
| `last_reminder_at` | timestamp | Last reminder |

**Invitation Status:**
- `pending` - Sent, not yet joined
- `joined` - User joined PoultryCo
- `expired` - Invitation expired
- `cancelled` - Cancelled by admin

**Invitation URL Format:**
```
https://poultryco.net/join/{org_short_name}/{invitation_token}

Example:
https://poultryco.net/join/necc/abc123def456
```

---

### 3.7 Event Management

Organizations can host events (conferences, training, meetings).

**Table: `organization_events`**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | uuid | Yes | Primary key | - |
| `organization_id` | uuid | Yes | FK to organizations | - |
| `event_name` | text | Yes | Event name | "PTSE 2025" |
| `event_type` | enum | Yes | Event category | "conference" |
| `description` | text | Yes | Event details | "Annual poultry summit..." |
| `event_banner_url` | text | No | Banner image | "/storage/events/..." |
| `start_date` | date | Yes | Start date | 2025-05-15 |
| `end_date` | date | Yes | End date | 2025-05-16 |
| `start_time` | time | No | Start time | 09:00:00 |
| `end_time` | time | No | End time | 18:00:00 |
| `timezone` | text | Yes | Timezone | "Asia/Kolkata" |
| `venue_name` | text | No | Venue | "Chennai Trade Centre" |
| `venue_address` | text | No | Full address | "..." |
| `venue_city` | text | No | City | "Chennai" |
| `venue_state` | text | No | State | "Tamil Nadu" |
| `is_online` | boolean | Yes | Virtual event | false |
| `meeting_link` | text | No | Online meeting URL | "zoom.us/..." |
| `registration_required` | boolean | Yes | Need registration | true |
| `registration_open_date` | date | No | Registration opens | 2025-03-01 |
| `registration_close_date` | date | No | Registration closes | 2025-05-10 |
| `max_attendees` | integer | No | Max capacity | 2500 |
| `is_member_only` | boolean | Yes | Members only | false |
| `member_fee` | decimal | No | Member ticket price | 0.00 |
| `non_member_fee` | decimal | No | Non-member price | 500.00 |
| `currency` | text | No | Currency | "INR" |
| `agenda_url` | text | No | Agenda document | "/storage/agenda.pdf" |
| `status` | enum | Yes | Event status | "upcoming" |
| `created_by` | uuid | Yes | FK to profiles | - |
| `created_at` | timestamp | Yes | - | - |
| `updated_at` | timestamp | Yes | - | - |

**Event Types:**
- `conference` - Conference/Summit
- `training` - Training Program
- `workshop` - Workshop
- `webinar` - Webinar
- `meeting` - Meeting (AGM, EGM)
- `expo` - Exhibition
- `networking` - Networking Event
- `field_visit` - Farm Visit
- `seminar` - Seminar

**Event Status:**
- `draft` - Being planned
- `upcoming` - Published, not started
- `ongoing` - Currently happening
- `completed` - Finished
- `cancelled` - Cancelled

---

**Table: `organization_event_registrations`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `event_id` | uuid | FK to organization_events |
| `profile_id` | uuid | FK to profiles |
| `registration_type` | enum | member/non_member |
| `ticket_number` | text | Generated ticket number |
| `qr_code_url` | text | QR code for check-in |
| `fee_paid` | boolean | Payment status |
| `payment_date` | timestamp | When paid |
| `check_in_status` | boolean | Checked in |
| `check_in_time` | timestamp | Check-in time |
| `badge_printed` | boolean | Badge printed |
| `status` | enum | Registration status |
| `created_at` | timestamp | Registration date |

**Registration Status:**
- `confirmed` - Registered
- `waitlist` - On waiting list
- `cancelled` - Cancelled by user
- `no_show` - Didn't attend

---

**Table: `organization_event_speakers`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `event_id` | uuid | FK to organization_events |
| `profile_id` | uuid | FK to profiles (if on platform) |
| `speaker_name` | text | Name (if not on platform) |
| `designation` | text | Title |
| `organization` | text | Organization |
| `bio` | text | Speaker bio |
| `photo_url` | text | Photo |
| `session_title` | text | Session title |
| `session_description` | text | Session details |
| `session_date` | date | Session date |
| `session_start_time` | time | Start time |
| `session_end_time` | time | End time |
| `sort_order` | integer | Display order |
| `created_at` | timestamp | - |

---

**Table: `organization_event_exhibitors`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `event_id` | uuid | FK to organization_events |
| `business_profile_id` | uuid | FK to business_profiles (if on platform) |
| `exhibitor_name` | text | Name (if not on platform) |
| `booth_number` | text | Booth/Stall number |
| `category` | text | Exhibitor category |
| `products_showcasing` | text | Products displaying |
| `logo_url` | text | Logo |
| `description` | text | About exhibitor |
| `contact_person` | text | Contact person |
| `contact_phone` | text | Phone |
| `contact_email` | text | Email |
| `sort_order` | integer | Display order |
| `created_at` | timestamp | - |

---

### 3.8 Member Resources

Organizations provide resources to members.

**Table: `organization_resources`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `resource_title` | text | Title |
| `resource_type` | enum | Type |
| `description` | text | Description |
| `file_url` | text | File URL (if document) |
| `external_url` | text | External link (if link) |
| `visibility` | enum | Who can access |
| `category` | text | Category |
| `download_count` | integer | Downloads |
| `uploaded_by` | uuid | FK to profiles |
| `created_at` | timestamp | - |

**Resource Types:**
- `document` - PDF, DOC, etc.
- `video` - Video content
- `link` - External link
- `form` - Forms/templates
- `presentation` - Presentation files

**Visibility:**
- `public` - Everyone
- `members_only` - Only members
- `leadership_only` - Only leadership

---

### 3.9 Announcements & Communications

**Table: `organization_announcements`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `title` | text | Announcement title |
| `content` | text | Full content |
| `announcement_type` | enum | Type |
| `priority` | enum | Priority level |
| `target_audience` | enum | Who to notify |
| `send_notification` | boolean | Push notification |
| `send_email` | boolean | Send email |
| `send_sms` | boolean | Send SMS |
| `is_pinned` | boolean | Pin to top |
| `published_at` | timestamp | Publish time |
| `created_by` | uuid | FK to profiles |
| `created_at` | timestamp | - |

**Announcement Types:**
- `general` - General announcement
- `event` - Event notification
- `urgent` - Urgent notice
- `policy` - Policy update
- `opportunity` - Opportunity alert

**Priority:**
- `low` - Normal
- `medium` - Important
- `high` - Urgent

**Target Audience:**
- `all_members` - All members
- `personal_members` - Only individual members
- `business_members` - Only corporate members
- `specific_tier` - Specific tier (e.g., only life members)

---

### 3.10 Committees

**Table: `organization_committees`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `committee_name` | text | Committee name |
| `description` | text | Purpose |
| `is_active` | boolean | Active committee |
| `created_at` | timestamp | - |

**Example Committees:**
- Executive Committee
- Finance Committee
- Technical Committee
- Membership Committee
- Event Organizing Committee
- Policy & Advocacy Committee

**Table: `organization_committee_members`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `committee_id` | uuid | FK to organization_committees |
| `profile_id` | uuid | FK to profiles |
| `role` | text | Role in committee |
| `is_chairperson` | boolean | Committee head |
| `join_date` | date | When joined |
| `created_at` | timestamp | - |

---

### 3.11 Organization Stats

**Table: `organization_stats`**

| Field | Type | Description |
|-------|------|-------------|
| `organization_id` | uuid | FK to organizations (PK) |
| `total_members` | integer | Total members |
| `personal_members` | integer | Individual members |
| `business_members` | integer | Corporate members |
| `active_members` | integer | Active members |
| `new_members_this_month` | integer | Recent joins |
| `followers_count` | integer | Followers (non-members) |
| `events_conducted` | integer | Past events |
| `upcoming_events` | integer | Future events |
| `resources_count` | integer | Resources uploaded |
| `announcements_count` | integer | Total announcements |
| `updated_at` | timestamp | Last update |

---

## Membership System

### Overview

The membership system connects personal profiles and business profiles to organizations.

### Member Journey

#### Personal Member Journey

```
1. User discovers organization (search/invitation/referral)
   ↓
2. Views organization page
   ↓
3. Clicks "Become a Member"
   ↓
4. Checks if logged in
   ├── NO → Sign up first
   └── YES → Continue
   ↓
5. Selects membership tier
   ↓
6. Fills application form
   ↓
7. Submits application
   ↓
8. Status: pending_approval
   ↓
9. Organization admin reviews
   ├── Approves → Status: active
   │             Badge added to profile
   │             Welcome email sent
   └── Rejects → Status: rejected
                 Rejection email sent
```

#### Business Member Journey

```
1. Business admin discovers organization
   ↓
2. Views organization page
   ↓
3. Clicks "Join as Business"
   ↓
4. Selects business profile (if multiple)
   ↓
5. Selects membership tier (Silver/Gold/Platinum)
   ↓
6. Designates primary contact person
   ↓
7. Submits application
   ↓
8. Status: pending_approval
   ↓
9. Organization admin reviews
   ├── Approves → Status: active
   │             Badge added to business profile
   │             Benefits activated
   └── Rejects → Status: rejected
```

#### Bulk Import Journey

```
1. Organization admin uploads CSV
   ↓
2. System processes each row
   ↓
3. For each member:
   ├── Check if user exists (by phone/email)
   │   ├── EXISTS → Auto-link
   │   │           Status: active
   │   │           Badge added
   │   │           Notification sent
   │   └── NOT EXISTS → Create invitation
   │                    Status: pending_signup
   │                    Send SMS/Email with invite link
   ↓
4. Invitation tracking
   ├── User clicks invite link
   ├── Pre-filled signup form
   ├── User completes signup
   └── Status: active
       Badge added
       Welcome email sent
```

---

### Membership Display Rules

#### On Personal Profile

```
✅ Show if: status = active
❌ Hide if: status != active OR user toggled role off

Display:
┌────────────────────────────────┐
│ 🏆 PROFESSIONAL MEMBERSHIPS    │
│                                │
│ ⭐ NECC                        │
│    National Egg Coordination   │
│    Regular Member #12345       │
│    Since 2015 • ✓ Active       │
└────────────────────────────────┘
```

#### On Business Profile

```
✅ Show if: status = active

Display:
┌────────────────────────────────┐
│ 🏆 INDUSTRY MEMBERSHIPS        │
│                                │
│ ⭐ PTIC                        │
│    Gold Corporate Member       │
│    Since 2023 • ✓ Active       │
└────────────────────────────────┘
```

#### On Organization Page

```
Filter options:
- All Members
- Individual Members
- Business Members
- By Tier
- By Location
- By Status (Active/Expired)

Display:
┌────────────────────────────────┐
│ 👥 MEMBERS (5,280)             │
│                                │
│ Individual: 4,800              │
│ Corporate: 480                 │
│                                │
│ [Filter dropdown]              │
│                                │
│ Member cards...                │
└────────────────────────────────┘
```

---

## Relationships & Connections

### Connection Types

**Table: `connections`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to profiles |
| `connected_user_id` | uuid | FK to profiles |
| `status` | enum | Connection status |
| `requester_id` | uuid | Who sent request |
| `created_at` | timestamp | Connection date |
| `updated_at` | timestamp | - |

**Connection Status:**
- `pending` - Request sent, awaiting approval
- `accepted` - Mutual connection
- `rejected` - Request rejected
- `blocked` - User blocked

**Rules:**
1. Connections are mutual (both users connected)
2. Can send connection request
3. Can accept/reject requests
4. Can remove connection (unfriend)
5. Can block user

---

### Follow System

**Table: `follows`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `follower_id` | uuid | FK to profiles (who follows) |
| `following_type` | enum | What they follow |
| `following_id` | uuid | ID of followed entity |
| `created_at` | timestamp | Follow date |

**Following Types:**
- `profile` - Following a personal profile
- `business` - Following a business profile
- `organization` - Following an organization

**Rules:**
1. Follow is one-way (not mutual)
2. Can follow without being connected
3. Can unfollow anytime
4. Following != Connection

**Difference:**

| Aspect | Connection | Follow |
|--------|-----------|--------|
| Type | Mutual | One-way |
| Permission | Requires acceptance | Instant |
| Access | Full profile & contact | Public content only |
| Endorsements | Can endorse skills | Cannot |
| Messaging | Can send messages | Limited |

---

## Skills & Endorsements

### Global Skills Repository

**Table: `skills`**

Contains all skills available on the platform.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `skill_name` | text | Skill name (unique) |
| `skill_category` | enum | Category |
| `usage_count` | integer | Platform-wide usage |
| `is_approved` | boolean | Admin approved |
| `suggested_by` | uuid | FK to profiles (who suggested) |
| `created_at` | timestamp | - |

**Auto-suggest Algorithm:**
```sql
-- When user types "bro"
SELECT skill_name, usage_count
FROM skills
WHERE skill_name ILIKE '%bro%'
  AND is_approved = true
ORDER BY usage_count DESC
LIMIT 10;

-- Results:
-- Broiler Management (1250 users)
-- Broiler Nutrition (890 users)
-- Broiler Disease Management (645 users)
```

### User Skills

**Table: `profile_skills`**

Links users to their skills.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `profile_id` | uuid | FK to profiles |
| `skill_id` | uuid | FK to skills |
| `proficiency_level` | enum | beginner/intermediate/expert |
| `years_of_experience` | integer | Years using skill |
| `endorsement_count` | integer | Endorsements |
| `created_at` | timestamp | - |

### Skill Endorsements

**Table: `skill_endorsements`**

Connections can endorse each other's skills.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `profile_skill_id` | uuid | FK to profile_skills |
| `endorser_profile_id` | uuid | FK to profiles |
| `created_at` | timestamp | - |

**Rules:**
1. Only mutual connections can endorse
2. One endorsement per skill per person
3. Cannot endorse own skills
4. Can remove endorsement

**Endorsement Flow:**
```
1. View friend's profile
   ↓
2. See their skills
   ↓
3. Click "Endorse" on skill you can verify
   ↓
4. Endorsement added
   ↓
5. Friend gets notification
   "Rajesh endorsed you for Broiler Management"
```

---

## Privacy & Visibility

### 9.1 Profile Privacy Settings

Users need granular control over what information is visible and who can contact them.

**Table: `profile_privacy_settings`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `profile_id` | uuid | - | Primary key, FK to profiles |
| `phone_visible_to` | enum | connections | Who can see phone number |
| `email_visible_to` | enum | connections | Who can see email |
| `whatsapp_visible_to` | enum | connections | Who can see WhatsApp |
| `show_in_search` | boolean | true | Appear in search results |
| `show_to_non_members` | boolean | true | Visible to non-logged-in users |
| `show_connections_list` | boolean | true | Show my connections |
| `show_endorsements` | boolean | true | Show skill endorsements |
| `allow_connection_requests` | boolean | true | Accept connection requests |
| `allow_message_requests` | boolean | true | Accept messages from non-connections |
| `updated_at` | timestamp | - | Last settings update |

**Visibility Options:**
- `public` - Everyone can see
- `connections` - Only my connections
- `nobody` - Hidden from everyone

**Privacy Presets:**

```
OPEN PROFILE (Default):
├── phone_visible_to: connections
├── email_visible_to: connections
├── show_in_search: true
├── show_to_non_members: true
└── allow_connection_requests: true

PRIVATE PROFILE:
├── phone_visible_to: nobody
├── email_visible_to: connections
├── show_in_search: false
├── show_to_non_members: false
└── allow_connection_requests: false

BUSINESS PROFILE:
├── phone_visible_to: public
├── email_visible_to: public
├── show_in_search: true
├── show_to_non_members: true
└── allow_connection_requests: true
```

**User Interface:**
```
PRIVACY SETTINGS

Contact Information:
├── Phone Number:     [Connections Only ▼]
├── Email:            [Connections Only ▼]
└── WhatsApp:         [Connections Only ▼]

Profile Visibility:
├── ☑ Show my profile in search results
├── ☑ Show my profile to non-members
├── ☑ Show my connections list
└── ☑ Show endorsements on my profile

Communication:
├── ☑ Allow connection requests
├── ☑ Allow message requests from anyone
└── ☐ Only messages from connections

[Save Settings]
```

---

### 9.2 Profile Verification System

Multi-level verification builds trust and credibility.

**Table: `profile_verifications`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `profile_id` | uuid | FK to profiles |
| `verification_type` | enum | Type of verification |
| `verification_status` | enum | Current status |
| `document_url` | text | Uploaded document |
| `document_number` | text | License/ID number |
| `verified_by` | uuid | Admin who verified (FK to profiles) |
| `verified_at` | timestamp | Verification date |
| `expires_at` | timestamp | Expiry date (if applicable) |
| `rejection_reason` | text | Why rejected |
| `notes` | text | Admin notes |
| `created_at` | timestamp | Submission date |
| `updated_at` | timestamp | Last update |

**Verification Types:**
- `phone` - Phone number (OTP)
- `email` - Email address (link)
- `government_id` - Aadhaar/Passport/Driving License
- `vet_license` - Veterinary license
- `business_registration` - Business registration certificate
- `address` - Address proof
- `photo_id` - Photo ID verification
- `educational_certificate` - Degree/diploma
- `professional_license` - Other professional licenses

**Verification Status:**
- `pending` - Submitted, awaiting review
- `verified` - Approved
- `rejected` - Not approved
- `expired` - Verification expired (needs renewal)

**Verification Levels:**

```sql
-- Add to profiles table
ALTER TABLE profiles
ADD COLUMN verification_level text DEFAULT 'basic';

Levels:
├── basic      = Phone + Email verified
├── verified   = + Government ID verified
└── trusted    = + Professional credentials verified
                  (Vet license, business reg, etc.)
```

**Verification Badge Display:**

```
Profile Name
├── ✓ Phone Verified (basic)
├── ✓✓ ID Verified (verified)
└── ⭐ Trusted Professional (trusted)
    ├── ✓ Vet License Verified
    └── ✓ 5+ Years on Platform
```

**Verification Flow:**

```
1. User submits verification request
   ↓
2. Uploads required document
   ↓
3. Status: pending
   ↓
4. Admin reviews document
   ├── Check document authenticity
   ├── Match details with profile
   └── Cross-reference with databases
   ↓
5. Approve or Reject
   ├── APPROVE → Status: verified
   │            Badge added to profile
   │            Trust score increased
   └── REJECT  → Status: rejected
                Reason sent to user
                Can resubmit
```

**Trust Score Impact:**

```javascript
calculateTrustScore(profile) {
  let score = 0;
  
  // Verifications (40 points)
  if (hasVerification('phone')) score += 5;
  if (hasVerification('email')) score += 5;
  if (hasVerification('government_id')) score += 10;
  if (hasVerification('vet_license')) score += 20;
  if (hasVerification('business_registration')) score += 15;
  
  // Profile Completeness (30 points)
  score += (profile.profile_strength * 0.3);
  
  // Network & Engagement (30 points)
  if (profile.connections_count >= 10) score += 10;
  if (profile.endorsements_count >= 5) score += 10;
  if (profile.organization_memberships >= 1) score += 10;
  
  return Math.min(score, 100);
}
```

---

### 9.3 Profile Completeness Tracking

Detailed tracking helps users know what to complete.

**Table: `profile_completeness_checks`**

| Field | Type | Description |
|-------|------|-------------|
| `profile_id` | uuid | Primary key, FK to profiles |
| `has_profile_photo` | boolean | Profile picture uploaded |
| `has_headline` | boolean | Headline added |
| `has_bio` | boolean | About section filled |
| `has_location` | boolean | Location specified |
| `has_phone_verified` | boolean | Phone verified |
| `has_email_verified` | boolean | Email verified |
| `has_roles` | boolean | At least one role added |
| `has_experience` | boolean | Work experience added |
| `has_education` | boolean | Education added |
| `has_skills` | boolean | At least 3 skills added |
| `has_certifications` | boolean | Certificate uploaded |
| `has_connections` | boolean | At least 5 connections |
| `has_organization_membership` | boolean | Member of organization |
| `has_endorsements` | boolean | Received endorsement |
| `profile_strength` | integer | Calculated percentage |
| `last_calculated_at` | timestamp | Last calculation |

**Profile Strength Calculation:**

```javascript
const WEIGHTS = {
  // Basic Info (40%)
  has_profile_photo: 10,
  has_headline: 5,
  has_bio: 10,
  has_location: 5,
  has_phone_verified: 5,
  has_email_verified: 5,
  
  // Professional Info (40%)
  has_roles: 10,
  has_experience: 10,
  has_education: 10,
  has_skills: 10,
  
  // Network & Engagement (20%)
  has_connections: 10,
  has_organization_membership: 5,
  has_endorsements: 5
};

function calculateProfileStrength(checks) {
  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    if (checks[key]) total += weight;
  }
  return Math.min(total, 100);
}
```

**UI Display:**

```
┌─────────────────────────────────────────┐
│ PROFILE STRENGTH: 75% ████████████░░░░  │
│                                         │
│ Complete these to reach 100%:          │
│                                         │
│ ☑ Add profile photo             +10%   │
│ ☑ Add headline                  +5%    │
│ ☑ Write about yourself          +10%   │
│ ☑ Add location                  +5%    │
│ ☑ Verify phone                  +5%    │
│ ☑ Verify email                  +5%    │
│ ☑ Add at least one role         +10%   │
│ ☑ Add work experience           +10%   │
│ ☑ Add education                 +10%   │
│ ☑ Add 3 skills                  +10%   │
│ ☐ Get 5 connections             +10%   │ ← Next
│ ☐ Join an organization          +5%    │
│ ☐ Get your first endorsement    +5%    │
│                                         │
│ [Complete Profile]                      │
└─────────────────────────────────────────┘
```

---

### 9.4 Profile Badges & Achievements

Gamification through achievements and badges.

**Table: `profile_badges`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `profile_id` | uuid | FK to profiles |
| `badge_type` | text | Badge identifier |
| `badge_level` | enum | Badge level |
| `earned_at` | timestamp | When earned |
| `expires_at` | timestamp | Expiry (null if permanent) |
| `is_visible` | boolean | User can hide badges |
| `display_order` | integer | User-defined order |

**Badge Types:**

**Community Badges:**
- `early_adopter` - First 1,000 users
- `founding_member` - First 100 users of PTIC
- `active_contributor` - 50+ posts/answers
- `helpful_expert` - 100+ helpful votes
- `community_leader` - 500+ connections

**Profile Badges:**
- `profile_complete` - 100% profile strength
- `verified_professional` - All verifications complete
- `trusted_member` - Trust score 90+

**Network Badges:**
- `well_connected` - 50+ connections
- `super_connector` - 200+ connections
- `organization_member` - Member of organization
- `multi_organization` - Member of 3+ organizations

**Role Badges:**
- `certified_vet` - Verified veterinarian
- `experienced_farmer` - 10+ years farming
- `industry_expert` - 20+ years experience

**Engagement Badges:**
- `question_master` - Asked 50+ questions
- `answer_champion` - Provided 100+ answers
- `skill_endorser` - Endorsed 50+ skills
- `event_attendee` - Attended 5+ events

**Badge Levels:**
- `bronze` - Entry level
- `silver` - Intermediate
- `gold` - Advanced
- `platinum` - Elite

**Badge Display:**

```
Profile Header:
┌─────────────────────────────────────────┐
│ 👤 Rajesh Kumar                         │
│ Poultry Farmer & Consultant             │
│                                         │
│ 🏅 BADGES (6)                           │
│ ⭐ Verified Professional                │
│ 🥇 Community Leader                     │
│ 🎓 Early Adopter                        │
│ [View All]                              │
└─────────────────────────────────────────┘
```

**Badge Unlock Notification:**

```
🎉 BADGE UNLOCKED!

⭐ Profile Complete

You've completed your profile to 100%!
This helps others trust and connect with you.

[View Profile] [Share Achievement]
```

---

### Profile Visibility Levels

**Personal Profile:**

| Section | Public | Connections Only | Private |
|---------|--------|------------------|---------|
| Name | ✓ | ✓ | ✓ |
| Photo | ✓ | ✓ | ✓ |
| Headline | ✓ | ✓ | ✓ |
| Location (City/State) | ✓ | ✓ | ✓ |
| Roles | ✓ | ✓ | ✓ |
| About | ✓ | ✓ | ✓ |
| Phone | - | ✓ | ✓ |
| Email | - | ✓ | ✓ |
| WhatsApp | - | ✓ | ✓ |
| Experience | ✓ | ✓ | ✓ |
| Education | ✓ | ✓ | ✓ |
| Skills | ✓ | ✓ | ✓ |
| Certifications | ✓ | ✓ | ✓ |
| Role Details | ✓ | ✓ | ✓ |
| Vet License Number | - | - | ✓ |
| Memberships | ✓ | ✓ | ✓ |
| Stats | ✓ | ✓ | ✓ |

**Business Profile:**

| Section | Visibility |
|---------|-----------|
| Basic Info | Public |
| Contact | Public |
| Products | Public |
| Team (if marked public) | Public |
| Jobs | Public |
| Legal Info | Private (owners/admins only) |

**Organization Profile:**

| Section | Visibility |
|---------|-----------|
| Basic Info | Public |
| Leadership | Public |
| Member Count | Public |
| Member Directory | Members Only |
| Events (published) | Public |
| Announcements | Public/Members based on setting |
| Resources | Based on resource setting |

---

## Data Flow Diagrams

### User Signup & Profile Creation

```
┌─────────────────────────────────────────────────────────┐
│                    USER SIGNUP FLOW                      │
└─────────────────────────────────────────────────────────┘

1. User visits PoultryCo
   ↓
2. Click "Sign Up"
   ↓
3. Enter: Phone Number
   ↓
4. Send OTP
   ↓
5. Verify OTP
   ↓
6. Supabase creates: auth.users record
   ↓
7. Trigger: Create profiles record (1:1)
   profiles.id = auth.users.id
   ↓
8. User lands on: Profile Setup Wizard
   ↓
9. Step 1: Basic Info
   - Full Name ✓
   - Location ✓
   - Profile Photo (optional)
   ↓
10. Step 2: Role Selection
    - Select roles (Farmer, Vet, etc.) ✓
    - Creates: profile_roles records
    ↓
11. Step 3: Role Details
    - Based on selected roles
    - Creates: profile_farmer_details OR
              profile_veterinarian_details, etc.
    ↓
12. Step 4: Skip or Continue
    - Add Experience (optional)
    - Add Skills (optional)
    ↓
13. Profile Created!
    - profile_strength calculated
    - Welcome email sent
    - Redirect to Home Feed
```

### Organization Member Invitation Flow

```
┌─────────────────────────────────────────────────────────┐
│              ORGANIZATION BULK INVITE FLOW               │
└─────────────────────────────────────────────────────────┘

1. Organization Admin → Dashboard
   ↓
2. Click "Invite Members"
   ↓
3. Upload CSV:
   name, phone, email, member_number, tier
   ↓
4. System processes each row:
   ↓
   For each member:
   ├─→ Check if phone exists in profiles
   │   ↓
   │   YES:
   │   ├─→ Create organization_members record
   │   │   - member_id = profile.id
   │   │   - status = 'active'
   │   ├─→ Add badge to profile
   │   └─→ Send notification
   │
   │   NO:
   │   ├─→ Create organization_member_invitations record
   │   │   - status = 'pending'
   │   ├─→ Generate invitation_token
   │   ├─→ Generate invitation_url
   │   └─→ Send SMS/Email with invite link
   ↓
5. Invitation SMS:
   "NECC invites you to join PoultryCo!
    Member #12345
    Click: poultryco.net/join/necc/abc123"
   ↓
6. User clicks link:
   ↓
7. Pre-filled Signup:
   - Name: [from CSV] ✓
   - Phone: [from CSV] ✓
   - Member of: NECC ✓
   - Just add: Password + Photo
   ↓
8. User submits:
   ↓
9. Create auth.users
   ↓
10. Create profiles
    ↓
11. Update organization_member_invitations:
    status = 'joined'
    ↓
12. Create organization_members:
    - status = 'active'
    - member_number = [from invitation]
    ↓
13. Badge added to profile
    ↓
14. Welcome email
    ↓
15. Redirect to Organization page
```

### Event Registration Flow

```
┌─────────────────────────────────────────────────────────┐
│                   EVENT REGISTRATION FLOW                │
└─────────────────────────────────────────────────────────┘

1. User discovers event
   - Organization page
   - Home feed
   - Search
   - Direct link
   ↓
2. View event page
   /organizations/{org_id}/events/{event_id}
   ↓
3. Click "Register"
   ↓
4. Check login:
   ├─→ NOT logged in → Redirect to signup
   │                   "Sign up to register for PTSE 2025"
   └─→ Logged in → Continue
   ↓
5. Select registration type:
   - Check if user is organization member
   ├─→ MEMBER → Show member price
   └─→ NON-MEMBER → Show regular price
   ↓
6. Fill form:
   - Name [pre-filled from profile]
   - Email [pre-filled]
   - Phone [pre-filled]
   - Additional questions (if any)
   ↓
7. Payment (if required):
   - Payment gateway integration
   - OR "Free" for certain events
   ↓
8. Create organization_event_registrations:
   - Generate ticket_number
   - Generate qr_code for check-in
   - status = 'confirmed'
   ↓
9. Send confirmation:
   - Email with ticket
   - QR code for event entry
   - Event details
   - Calendar invite (.ics file)
   ↓
10. Badge on profile:
    "Attending PTSE 2025"
    ↓
11. Pre-event features:
    - View other attendees
    - View speakers
    - View exhibitors
    - Schedule 1:1 meetings
    ↓
12. At event:
    - QR code scan for check-in
    - Update: check_in_status = true
    - Print badge
    ↓
13. Post-event:
    - Access recordings
    - Download certificate
    - Feedback form
    - Continue networking
```

---

## User Journeys

### Journey 1: New Farmer Joins

```
DAY 1:
- Discovers PoultryCo from PTIC invitation
- Signs up via SMS invite link
- Creates profile:
  - Name: Rajesh Kumar
  - Location: Namakkal, TN
  - Role: Farmer
  - Farm: Broiler, 10,000 birds
- Automatically becomes PTIC member
- Badge appears: "PTIC Member #456"

DAY 2:
- Completes profile:
  - Adds profile photo
  - Adds work experience
  - Adds 5 skills
  - Profile strength: 80%
- Browses PTIC member directory
- Connects with 3 fellow farmers

DAY 3:
- Posts question: "Heat stress management tips?"
- Gets 5 answers from vets
- Marks best answer
- Connects with helpful vet

WEEK 2:
- Joins Tamil Nadu Poultry Association
- Now has 2 membership badges
- Endorsed for "Broiler Management" by 3 connections
- Following 2 feed suppliers

MONTH 2:
- Registers for PTSE 2025 event
- Creates business profile for his farm
- Lists his farm for contract farming opportunities
- 25 connections, Active community member
```

### Journey 2: Veterinarian Builds Practice

```
DAY 1:
- Signs up via colleague's referral
- Creates profile:
  - Name: Dr. Priya Devi
  - Role: Veterinarian
  - License: VET-TN-12345
  - Specialization: Poultry Medicine, Nutrition
  - Service areas: Namakkal, Erode

DAY 2:
- Uploads vet license certificate
- Adds consultation fees: ₹500-₹1000
- Adds 10 skills
- Profile strength: 90%

WEEK 1:
- Joins Tamil Nadu Vet Council
- Answers 15 questions on platform
- Gets 50 "helpful" votes
- 10 farmers connect after seeing answers

WEEK 2:
- Featured as "Top Vet" on platform
- Receives 5 consultation requests
- Creates business profile: "Priya Vet Clinic"
- Adds services & products

MONTH 2:
- 100+ connections
- Average 4.8⭐ rating from consultations
- Endorsed for 8 skills
- Regular contributor to Q&A
- Growing client base through platform
```

### Journey 3: Feed Mill Joins as Business

```
DAY 1:
- Owner creates personal profile
- Creates business profile:
  - ABC Feeds Private Limited
  - Feed Manufacturer
  - 50 employees
  - 3 branch locations

DAY 2:
- Adds 20 products:
  - Broiler Starter
  - Layer Mash
  - Breeder Feed
  - Supplements
- Each product: photos, specs, prices
- Adds team members (10 employees join)

WEEK 1:
- Applies for PTIC corporate membership
- Gets approved: Gold Member
- Badge appears on business profile
- Listed in PTIC corporate members

WEEK 2:
- Posts 2 job openings
  - Sales Executive
  - Quality Control Manager
- Receives 50 applications
- Gets 500 profile views

MONTH 2:
- 200 followers
- Products featured on platform
- 15 product reviews (4.5⭐ average)
- Registers as PTSE 2025 exhibitor
- Active in supplier discussions
- Lead generation through platform
```

---

## Implementation Notes

### New Tables Added

**Critical additions to the specification:**

1. `profile_slug` field added to profiles
2. `business_slug` field added to business_profiles
3. `organization_slug` field added to organizations
4. `key_achievements` field added to profile_experience
5. `avg_batch_size`, `batches_per_year`, `own_hatchery` added to profile_farmer_details
6. `consultation_mode`, `typical_fees_range`, `farms_served_count` added to profile_veterinarian_details
7. `payment_terms_offered`, `delivery_time_typical` added to profile_supplier_details
8. `related_skills`, `skill_synonyms` fields added to skills table
9. `business_contact_persons` - New table for multiple contacts
10. `profile_privacy_settings` - New table for granular privacy control
11. `profile_verifications` - New table for multi-level verification system
12. `profile_completeness_checks` - New table for gamification tracking
13. `profile_badges` - New table for achievements and badges
14. `last_active_at`, `last_profile_update_at` added to profiles
15. `verification_level` field to be added to profiles

### Database Setup Order

1. **Core Tables First:**
   ```
   profiles (with slug, last_active_at, last_profile_update_at, verification_level)
   business_profiles (with slug)
   organizations (with slug)
   ```

2. **Role & Details:**
   ```
   profile_roles
   profile_farmer_details
   profile_veterinarian_details
   profile_supplier_details
   profile_researcher_details
   profile_consultant_details
   ```

3. **Professional Info:**
   ```
   profile_experience (with key_achievements)
   profile_education
   profile_certifications
   skills (with related_skills, skill_synonyms)
   profile_skills
   skill_endorsements
   ```

4. **Business Related:**
   ```
   business_locations
   business_service_areas
   business_team_members
   business_contact_persons (NEW)
   business_farm_details
   business_supplier_details
   business_products
   product_images
   product_reviews
   business_jobs
   business_certifications
   ```

5. **Organization Related:**
   ```
   organization_offices
   organization_leadership
   organization_membership_tiers
   organization_members
   organization_membership_applications
   organization_member_invitations
   organization_events
   organization_event_registrations
   organization_event_speakers
   organization_event_exhibitors
   organization_resources
   organization_announcements
   organization_committees
   organization_committee_members
   ```

6. **Relationships:**
   ```
   connections
   follows
   ```

7. **Privacy, Verification & Gamification:**
   ```
   profile_privacy_settings (NEW)
   profile_verifications (NEW)
   profile_completeness_checks (NEW)
   profile_badges (NEW)
   ```

8. **Stats & Metrics:**
   ```
   profile_stats
   business_stats
   organization_stats
   ```

### Row Level Security (RLS) Considerations

**Profiles:**
- Public: Name, headline, location, roles, experience, education, skills
- Connections only: Phone, email, full role details
- Private: License numbers, sensitive info

**Business Profiles:**
- Public: All except legal info
- Owners/Admins only: Legal info, edit access

**Organizations:**
- Public: Basic info, events, announcements
- Members only: Member directory, resources
- Leadership only: Admin functions

**Organization Members:**
- Public: Member count
- Members only: Full directory
- Admin only: Pending approvals, invitations

### Indexes Required

**High Priority:**
```sql
-- Lookups
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_business_profiles_owner ON business_profiles(owner_id);
CREATE INDEX idx_organizations_creator ON organizations(creator_id);

-- Memberships
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_composite ON organization_members(member_type, member_id);
CREATE INDEX idx_org_members_status ON organization_members(status);

-- Connections
CREATE INDEX idx_connections_user ON connections(user_id);
CREATE INDEX idx_connections_connected ON connections(connected_user_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_composite ON follows(following_type, following_id);

-- Skills
CREATE INDEX idx_profile_skills_profile ON profile_skills(profile_id);
CREATE INDEX idx_profile_skills_skill ON profile_skills(skill_id);
CREATE INDEX idx_skills_name_trigram ON skills USING gin(skill_name gin_trgm_ops);

-- Search
CREATE INDEX idx_profiles_search ON profiles USING gin(to_tsvector('english', full_name || ' ' || COALESCE(headline, '') || ' ' || COALESCE(bio, '')));
CREATE INDEX idx_business_search ON business_profiles USING gin(to_tsvector('english', business_name || ' ' || COALESCE(about, '')));
CREATE INDEX idx_org_search ON organizations USING gin(to_tsvector('english', organization_name || ' ' || COALESCE(about, '')));
```

### Functions & Triggers

**Auto-update stats:**
```sql
-- Trigger to update profile_strength when profile updated
-- Trigger to increment usage_count on skills when added
-- Trigger to update *_stats tables on changes
```

**Invitation token generation:**
```sql
-- Function to generate unique invitation tokens
-- Function to generate QR codes for event tickets
```

**Search functions:**
```sql
-- Full-text search across profiles
-- Skill auto-suggest function
```

---

## Summary

This specification defines a comprehensive three-profile system for PoultryCo:

1. **Personal Profiles** - Individual professionals with multiple roles
2. **Business Profiles** - Commercial entities with products/services
3. **Organization Profiles** - Member-based groups with events & governance

**Key Features:**
- ✅ Multi-role support for individuals
- ✅ Flexible membership system (personal & business)
- ✅ Bulk member invitation for viral growth
- ✅ Event management for organizations
- ✅ Skills & endorsements for credibility
- ✅ Privacy controls at granular level
- ✅ Gamification for profile completion

**Next Steps:**
1. Review and approve this specification
2. Create SQL schema files
3. Implement RLS policies
4. Build UI/UX based on this structure

---

---

## Document Change Log

### Version 1.1 (Current)
**Date:** October 17, 2025  
**Changes:**
- ✅ Added SEO-friendly slugs to all profile types
- ✅ Added key_achievements to experience
- ✅ Enhanced role-specific details (farmer, vet, supplier)
- ✅ Added skill synonyms and related skills
- ✅ Added business_contact_persons table
- ✅ Added profile_privacy_settings (granular control)
- ✅ Added profile_verifications (multi-level system)
- ✅ Added profile_completeness_checks (gamification)
- ✅ Added profile_badges (achievements)
- ✅ Added last_active_at and verification_level fields
- ⏸️ Deferred: Multi-language support (future extension)

### Version 1.0
**Date:** October 17, 2025  
**Initial Release:**
- Personal Profile specification
- Business Profile specification
- Organization Profile specification
- Membership system
- Skills & endorsements
- Basic privacy & visibility

---

**Document Status:** **APPROVED** - Ready for Schema Creation  
**Next Step:** Create SQL schema files  
**Approved By:** PoultryCo Development Team  
**Date:** October 17, 2025


