# 📊 Profile System Implementation Status & Tasks

**Date:** October 26, 2025  
**Current Status:** Personal Profiles ✅ COMPLETE | Business & Organization Profiles ❌ NOT STARTED  
**Progress:** ~33% Complete

---

## 🎯 Overview

The PoultryCo profile system has **THREE profile types**:

1. **Personal Profiles (`/me/[slug]`)** - ✅ **COMPLETE (100%)**
2. **Business Profiles (`/com/[slug]`)** - ❌ **NOT STARTED (0%)**
3. **Organization Profiles (`/org/[slug]`)** - ❌ **NOT STARTED (0%)**

---

## ✅ COMPLETE: Personal Profile System

### **Database Schema** ✅
All tables exist and are production-ready:

| Table | Status | Records |
|-------|--------|---------|
| `profiles` | ✅ Complete | Core personal profiles |
| `profile_roles` | ✅ Complete | Multi-role system |
| `profile_farmer_details` | ✅ Complete | Farmer-specific fields |
| `profile_veterinarian_details` | ✅ Complete | Vet-specific fields |
| `profile_consultant_details` | ✅ Complete | Consultant fields |
| `profile_supplier_details` | ✅ Complete | Supplier fields |
| `profile_experience` | ✅ Complete | Work history |
| `profile_education` | ✅ Complete | Education history |
| `profile_skills` | ✅ Complete | Skills & endorsements |
| `profile_certifications` | ✅ Complete | Professional certs |

### **UI Components** ✅

**Pages:**
- ✅ `/me` - Own profile view
- ✅ `/me/[slug]` - Other user profile view
- ✅ `/me/edit` - Profile wizard

**Components:**
- ✅ `ProfileView.tsx` - Main profile display
- ✅ `ProfileWizard.tsx` - 5-step profile creation
- ✅ `ProfileHeader.tsx` - Header with photos, name, headline
- ✅ `AboutSection.tsx` - Bio section
- ✅ `RolesSection.tsx` - Role display
- ✅ `ExperienceSection.tsx` - Work history
- ✅ `EducationSection.tsx` - Education history
- ✅ `SkillsSection.tsx` - Skills display
- ✅ `ProfileStrengthCard.tsx` - Completion tracker

**Features Working:**
- ✅ Profile photo upload (WebP conversion)
- ✅ Cover photo upload
- ✅ Multi-role selection & display
- ✅ Experience CRUD
- ✅ Education CRUD
- ✅ Skills CRUD
- ✅ Profile strength calculation
- ✅ Progressive profile updates
- ✅ Real-time updates
- ✅ Privacy controls
- ✅ Public profile slugs (`/me/john-doe`)

---

## ❌ MISSING: Business Profile System

### **Database Schema** ✅ (EXISTS BUT NOT USED)

| Table | Status | Usage |
|-------|--------|-------|
| `business_profiles` | ✅ Schema exists | ❌ No UI |
| `business_profiles_contact` | ✅ Schema exists | ❌ No UI |
| `business_locations` | ✅ Schema exists | ❌ No UI |
| `business_service_areas` | ✅ Schema exists | ❌ No UI |
| `business_team_members` | ✅ Schema exists | ❌ No UI |
| `business_contact_persons` | ✅ Schema exists | ❌ No UI |
| `business_farm_details` | ✅ Schema exists | ❌ No UI |
| `business_supplier_details` | ✅ Schema exists | ❌ No UI |
| `business_certifications` | ✅ Schema exists | ❌ No UI |
| `business_products` | ✅ Schema exists | ❌ No UI |
| `product_images` | ✅ Schema exists | ❌ No UI |
| `business_job_postings` | ✅ Schema exists | ❌ No UI |

### **Missing UI Components** ❌

**Pages Needed:**
- ❌ `/com/[slug]/page.tsx` - Business profile view page
- ❌ `/com/create/page.tsx` - Business creation wizard
- ❌ `/com/[slug]/edit/page.tsx` - Business edit page
- ❌ `/com/[slug]/products/page.tsx` - Products listing
- ❌ `/com/[slug]/jobs/page.tsx` - Jobs listing

**Components Needed:**
- ❌ `BusinessProfileView.tsx` - Main business profile display
- ❌ `BusinessCreationWizard.tsx` - Multi-step business creation
- ❌ `BusinessHeader.tsx` - Logo, name, tagline, actions
- ❌ `BusinessAboutSection.tsx` - About, type, details
- ❌ `BusinessLocationsSection.tsx` - Multiple locations display
- ❌ `BusinessTeamSection.tsx` - Team members grid
- ❌ `BusinessContactSection.tsx` - Multiple contact persons
- ❌ `BusinessProductsSection.tsx` - Products showcase
- ❌ `BusinessJobsSection.tsx` - Open positions
- ❌ `BusinessCertificationsSection.tsx` - Certifications display
- ❌ `ProductCard.tsx` - Individual product display
- ❌ `ProductModal.tsx` - Product detail modal
- ❌ `JobCard.tsx` - Job listing card

**Missing Features:**
- ❌ Business creation flow (owner must be logged-in user)
- ❌ Team member invitation (must be PoultryCo users)
- ❌ Contact person assignment (from team members)
- ❌ Product management (CRUD)
- ❌ Product image upload (multi-image)
- ❌ Job posting management
- ❌ Business verification badge
- ❌ Service area selection
- ❌ Multiple location management
- ❌ Business type-specific fields (farm vs supplier vs feed mill)
- ❌ "Contact Business" button → Start chat
- ❌ Review system integration (see `MVP_TRANSACTION_FEATURES.md`)

---

## ❌ MISSING: Organization Profile System

### **Database Schema** ✅ (EXISTS BUT NOT USED)

| Table | Status | Usage |
|-------|--------|-------|
| `organizations` | ✅ Schema exists | ❌ No UI |
| `organization_offices` | ✅ Schema exists | ❌ No UI |
| `organization_leadership` | ✅ Schema exists | ❌ No UI |
| `organization_membership_tiers` | ✅ Schema exists | ❌ No UI |
| `organization_committees` | ✅ Schema exists | ❌ No UI |
| `organization_committee_members` | ✅ Schema exists | ❌ No UI |
| `organization_resources` | ✅ Schema exists | ❌ No UI |
| `organization_announcements` | ✅ Schema exists | ❌ No UI |
| `organization_members` | ✅ Schema exists | ❌ No UI (polymorphic) |

### **Missing UI Components** ❌

**Pages Needed:**
- ❌ `/org/[slug]/page.tsx` - Organization profile view page
- ❌ `/org/create/page.tsx` - Organization creation wizard
- ❌ `/org/[slug]/edit/page.tsx` - Organization edit page
- ❌ `/org/[slug]/members/page.tsx` - Members directory
- ❌ `/org/[slug]/events/page.tsx` - Events listing
- ❌ `/org/[slug]/resources/page.tsx` - Resources library

**Components Needed:**
- ❌ `OrganizationProfileView.tsx` - Main org profile display
- ❌ `OrganizationCreationWizard.tsx` - Multi-step org creation
- ❌ `OrganizationHeader.tsx` - Logo, name, tagline, member count
- ❌ `OrganizationAboutSection.tsx` - Mission, vision, focus areas
- ❌ `OrganizationLeadershipSection.tsx` - Leadership team display
- ❌ `OrganizationMembersSection.tsx` - Members grid (polymorphic)
- ❌ `OrganizationEventsSection.tsx` - Upcoming events
- ❌ `OrganizationResourcesSection.tsx` - Document library
- ❌ `OrganizationAnnouncementsSection.tsx` - Announcements feed
- ❌ `MembershipTiersCard.tsx` - Membership options
- ❌ `CommitteeCard.tsx` - Committee display
- ❌ `ResourceCard.tsx` - Downloadable resource

**Missing Features:**
- ❌ Organization creation flow
- ❌ Membership tiers management
- ❌ Bulk member invitation (CSV upload)
- ❌ Leadership team management
- ❌ Committee management
- ❌ Resource upload & access control
- ❌ Announcement creation with targeting
- ❌ Email/push notification to members
- ❌ Event management (integrated with events table)
- ❌ Polymorphic membership (personal + business can join)
- ❌ Member directory with filters
- ❌ "Join Organization" button

---

## 📋 Implementation Task List

### **PHASE 1: Business Profiles (8-10 days)**

#### **Task 1.1: Core Business Profile (2 days)**
- [ ] Create `/apps/web/src/app/(platform)/com/[slug]/page.tsx`
- [ ] Create `BusinessProfileView.tsx` component
- [ ] Create `BusinessHeader.tsx` (logo, cover, name, tagline, contact button)
- [ ] Create `BusinessAboutSection.tsx` (about, type, founded, size, website)
- [ ] Implement business data fetching with all joins
- [ ] Add breadcrumbs and SEO metadata

#### **Task 1.2: Business Creation Wizard (2 days)**
- [ ] Create `/apps/web/src/app/(platform)/com/create/page.tsx`
- [ ] Create `BusinessCreationWizard.tsx` (4-step wizard)
  - Step 1: Basic Info (name, type, about)
  - Step 2: Contact & Location (HQ, phone, email)
  - Step 3: Logo & Cover Photo
  - Step 4: Type-Specific Details (farm/supplier/feed mill)
- [ ] Implement slug generation (auto from business name)
- [ ] Add owner_id = current user
- [ ] Create business_profiles_contact record
- [ ] Redirect to `/com/[slug]` on completion

#### **Task 1.3: Business Team Management (1.5 days)**
- [ ] Create `BusinessTeamSection.tsx`
- [ ] Create `InviteTeamMemberModal.tsx` (search PoultryCo users)
- [ ] Implement team member invitation flow
- [ ] Add role/permission assignment
- [ ] Display team grid with photos & roles
- [ ] Add "Remove team member" action (owner only)

#### **Task 1.4: Contact Persons Setup (1 day)**
- [ ] Create `BusinessContactSection.tsx`
- [ ] Create `AssignContactPersonModal.tsx` (from team members)
- [ ] Display multiple contact persons with types (sales, technical, etc.)
- [ ] Add "Contact [Name]" button → Start 1-on-1 chat
- [ ] Implement notification preferences (per contact person)

#### **Task 1.5: Products Management (2 days)**
- [ ] Create `BusinessProductsSection.tsx`
- [ ] Create `ProductCard.tsx`
- [ ] Create `AddProductModal.tsx` (name, description, category, price, images)
- [ ] Implement multi-image upload (cdn-poultryco bucket)
- [ ] Add product CRUD operations
- [ ] Display products grid with "Inquire" button
- [ ] Implement "Inquire about Product" → Auto-start chat with context

#### **Task 1.6: Locations & Service Areas (1 day)**
- [ ] Create `BusinessLocationsSection.tsx`
- [ ] Create `AddLocationModal.tsx`
- [ ] Display multiple locations on map (optional: integrate Leaflet)
- [ ] Add service area selection (state, district, city)
- [ ] Display coverage map/list

#### **Task 1.7: Certifications & Details (0.5 day)**
- [ ] Create `BusinessCertificationsSection.tsx`
- [ ] Display certifications with expiry dates
- [ ] Add certification upload modal
- [ ] Display farm-specific or supplier-specific details conditionally

---

### **PHASE 2: Organization Profiles (6-8 days)**

#### **Task 2.1: Core Organization Profile (2 days)**
- [ ] Create `/apps/web/src/app/(platform)/org/[slug]/page.tsx`
- [ ] Create `OrganizationProfileView.tsx` component
- [ ] Create `OrganizationHeader.tsx` (logo, cover, name, tagline, member count)
- [ ] Create `OrganizationAboutSection.tsx` (mission, vision, focus areas)
- [ ] Implement organization data fetching
- [ ] Add "Join Organization" button

#### **Task 2.2: Organization Creation Wizard (1.5 days)**
- [ ] Create `/apps/web/src/app/(platform)/org/create/page.tsx`
- [ ] Create `OrganizationCreationWizard.tsx` (3-step wizard)
  - Step 1: Basic Info (name, type, about, mission)
  - Step 2: Contact & HQ
  - Step 3: Logo & Cover Photo
- [ ] Implement slug generation
- [ ] Set created_by = current user
- [ ] Auto-add creator as leadership (President/Admin role)

#### **Task 2.3: Leadership Management (1 day)**
- [ ] Create `OrganizationLeadershipSection.tsx`
- [ ] Create `AddLeaderModal.tsx` (search users, assign position)
- [ ] Display leadership team with positions & terms
- [ ] Add term management (current/past)

#### **Task 2.4: Membership System (2 days)**
- [ ] Create `OrganizationMembersSection.tsx`
- [ ] Create `MembershipTiersCard.tsx`
- [ ] Create `InviteMembersModal.tsx` (bulk CSV upload)
- [ ] Implement polymorphic membership (personal + business)
- [ ] Display members directory with filters
- [ ] Add "Join" flow with tier selection
- [ ] Implement membership approval workflow

#### **Task 2.5: Committees (1 day)**
- [ ] Create `CommitteesSection.tsx`
- [ ] Create `CommitteeCard.tsx`
- [ ] Display committees with chairpersons
- [ ] Add committee member management (admin only)

#### **Task 2.6: Resources & Announcements (1.5 days)**
- [ ] Create `OrganizationResourcesSection.tsx`
- [ ] Create `ResourceCard.tsx`
- [ ] Implement resource upload with access control
- [ ] Create `OrganizationAnnouncementsSection.tsx`
- [ ] Create `CreateAnnouncementModal.tsx`
- [ ] Implement announcement targeting (all members, specific tier, leadership)
- [ ] Add email/push notification dispatch

---

### **PHASE 3: Integration & Polish (2-3 days)**

#### **Task 3.1: Profile Switching (0.5 day)**
- [ ] Add dropdown in header: "Switch Profile"
- [ ] List: Personal + All owned businesses + Admin orgs
- [ ] Update context when switching
- [ ] Show active profile indicator in header

#### **Task 3.2: Directory Enhancement (1 day)**
- [ ] Update `/members` page to include businesses & organizations
- [ ] Add filter tabs: "People" | "Businesses" | "Organizations"
- [ ] Update search to include all three types
- [ ] Implement unified search (see `MVP_TRANSACTION_FEATURES.md`)

#### **Task 3.3: Connection & Follow (1 day)**
- [ ] Implement "Connect" button on personal profiles
- [ ] Implement "Follow" button on businesses & organizations
- [ ] Update connection logic to handle all three types
- [ ] Display connections/followers count

#### **Task 3.4: Notifications Integration (0.5 day)**
- [ ] Add notification for team member invitation
- [ ] Add notification for organization membership approval
- [ ] Add notification for new product inquiry
- [ ] Add notification for organization announcements

---

## 🎯 Priority Order for MVP

Based on user request for **transaction features** (see `MVP_TRANSACTION_FEATURES.md`), here's the recommended order:

### **IMMEDIATE (Week 1):**
1. ✅ Business Profile Core (Task 1.1-1.2) - 4 days
2. ✅ Team & Contact Setup (Task 1.3-1.4) - 2.5 days
3. ✅ Contact Button Integration → Chat - 0.5 day

**Result:** Users can create businesses, add contact persons, and start chats for inquiries.

### **WEEK 2:**
4. ✅ Products Management (Task 1.5) - 2 days
5. ✅ "Inquire about Product" → Chat - 0.5 day
6. ✅ Enhanced Search (from `MVP_TRANSACTION_FEATURES.md`) - 2.5 days

**Result:** Products discoverable, inquiries via chat, unified search working.

### **WEEK 3:**
7. ✅ Review System Integration (see `MVP_TRANSACTION_FEATURES.md`) - 5 days

**Result:** Trust system with fake review prevention.

### **WEEK 4 (Post-Inquiry MVP):**
8. ✅ Organization Profiles (Task 2.1-2.6) - 8 days

**Result:** Full organization system for associations & forums.

---

## 📊 Current Database Status

### **Ready to Use (Schema Complete):**
- ✅ `business_profiles` - 0 records
- ✅ `organizations` - 0 records
- ✅ All related tables (locations, team, products, etc.)

### **Existing Data:**
- ✅ `profiles` - Personal profiles with real users
- ✅ `messages` - Messaging system ready
- ✅ `posts` - Stream system ready
- ✅ `notifications` - Notification system ready

**NO MIGRATION NEEDED** - Just need to build the UI!

---

## 🚀 Getting Started

### **Step 1: Business Profile Core (Start Here)**

**Estimated Time:** 4 days  
**Files to Create:**
```
apps/web/src/app/(platform)/com/
├── [slug]/
│   └── page.tsx
├── create/
│   └── page.tsx
│
apps/web/src/components/business/
├── BusinessProfileView.tsx
├── BusinessCreationWizard.tsx
├── BusinessHeader.tsx
├── BusinessAboutSection.tsx
└── steps/
    ├── BasicInfoStep.tsx
    ├── ContactLocationStep.tsx
    ├── PhotosStep.tsx
    └── TypeSpecificStep.tsx
```

**Reference Files (Copy & Adapt):**
- `apps/web/src/components/profile/ProfileView.tsx`
- `apps/web/src/components/profile/ProfileWizard.tsx`
- `apps/web/src/components/profile/sections/ProfileHeader.tsx`

**Database Tables to Use:**
```typescript
// Main query
const { data } = await supabase
  .from('business_profiles')
  .select(`
    *,
    contact:business_profiles_contact(*),
    locations:business_locations(*),
    team:business_team_members(
      *,
      profile:profiles(id, full_name, profile_photo_url, headline)
    ),
    contacts:business_contact_persons(
      *,
      profile:profiles(id, full_name, profile_photo_url, phone, whatsapp_number)
    ),
    owner:profiles(id, full_name, profile_photo_url)
  `)
  .eq('business_slug', slug)
  .single();
```

---

## 📝 Summary

**What's Done:**
- ✅ Personal profiles fully functional
- ✅ All database schemas exist
- ✅ Messaging system ready for inquiries
- ✅ Notification system ready

**What's Needed:**
- ❌ 15-20 new UI components for businesses
- ❌ 12-15 new UI components for organizations
- ❌ 3-4 new page routes
- ❌ Integration with existing chat system
- ❌ Review system implementation

**Total Work:** ~3-4 weeks for complete profile system + transaction features

**Ready to start?** 🚀 Let me know and I'll begin with Business Profile Core!

