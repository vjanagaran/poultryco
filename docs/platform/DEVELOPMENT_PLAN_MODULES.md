# PoultryCo Development Plan - Module by Module

## Key Architectural Clarifications

### 1. Backend: Supabase (No Custom APIs)
- All data operations use Supabase client SDK
- Database functions (RPCs) handle complex logic  
- RLS policies manage authorization
- Edge Functions only for external integrations

### 2. Platform Strategy: Web-First
- Focus 100% on web platform
- Mobile app development is a future phase
- Ensure responsive design for mobile browsers

### 3. URL Structure
- Personal profiles: `/me/:username`
- Business profiles: `/com/:slug`
- Organization profiles: `/org/:slug`

## Overview
This document outlines the development plan for implementing all the new functionalities added through recent schema changes. Each module includes detailed tasks, Supabase integration, UI components, and integration points.

## Module 1: Connection & Follow System
**Objective**: Implement dual connection system with mutual connections and one-way follows

### Supabase Integration
1. **RPC Functions** (Already created in schema)
   - `handle_connection_request()` - Send connection/follow request
   - `accept_connection_request()` - Accept connection request  
   - `reject_connection_request()` - Reject connection request
   - `remove_connection()` - Remove connection/unfollow

2. **Direct Table Access**
   ```typescript
   // Get connections
   supabase.from('network_connections')
     .select('*')
     .eq('status', 'accepted')
   
   // Get followers/following
   supabase.from('follows')
     .select('*')
     .eq('follower_id', userId)
   ```

3. **Real-time Subscriptions**
   - Subscribe to connection status changes
   - Update UI when new requests arrive

### Frontend Tasks (Web Only)
1. **Components**
   - `ConnectionButton.tsx` - Smart button showing connection status
   - `ConnectionRequestList.tsx` - Manage pending requests
   - `ConnectionsList.tsx` - Display connections/followers/following
   - `PeopleYouMayKnow.tsx` - Connection suggestions

2. **Pages**
   - `/network` - Network overview page
   - `/network/requests` - Pending requests
   - `/network/connections` - Manage connections

### Responsive Design
1. Ensure all components work on mobile browsers
2. Touch-friendly UI elements
3. Progressive Web App (PWA) features for notifications

---

## Module 2: Invitation System
**Objective**: Enable invitations via WhatsApp, SMS, email, and social sharing

### Supabase Integration
1. **RPC Functions** (Already created)
   - `queue_whatsapp_message()` - Queue WhatsApp messages
   - `queue_sms_message()` - Queue SMS messages
   - `generate_share_url()` - Generate social share URLs
   - `process_contact_import()` - Process bulk imports

2. **Edge Functions** (To be created)
   - `/functions/send-whatsapp` - Wati API integration
   - `/functions/send-sms` - Twilio API integration
   - `/functions/process-whatsapp-queue` - Queue processor
   - `/functions/process-sms-queue` - Queue processor

3. **Direct Table Access**
   - `invitations` table for tracking
   - `share_tracking` table for analytics

### Frontend Tasks (Web Only)
1. **Components**
   - `InviteModal.tsx` - Multi-channel invitation UI
   - `ContactImporter.tsx` - Import from Google/phone
   - `ShareButtons.tsx` - Social media share buttons
   - `InvitationTracker.tsx` - Track sent invitations

2. **Features**
   - Contact permission handling
   - CSV upload for bulk invites
   - Custom invitation messages
   - Share profile/content links

---

## Module 3: Business Products & Services
**Objective**: Extend product system to support services with custom fields

### Supabase Integration
1. **Direct Table Operations**
   ```typescript
   // Create/Update product or service
   supabase.from('business_products')
     .insert({ item_type: 'service', ... })
   
   // List with filters
   supabase.from('business_products_services_view')
     .select('*')
     .eq('item_type', 'service')
   ```

2. **RPC Functions**
   - `search_business_products_services()` - Advanced search

3. **Business Logic**
   - Use JSONB columns for custom fields
   - Validation in frontend + database constraints
   - Inquiries create entries in messaging system

### Frontend Tasks (Web Only)
1. **Components**
   - `ProductServiceForm.tsx` - Dynamic form based on type
   - `ProductServiceCard.tsx` - Display card
   - `ProductServiceList.tsx` - Grid/list view
   - `InquiryButton.tsx` - Quick inquiry action

2. **Pages**
   - `/com/:slug/products` - Business products page
   - `/com/:slug/services` - Business services page
   - `/marketplace` - Browse all products/services

---

## Module 4: Organization Membership System
**Objective**: Comprehensive membership management with tiers and roles

### Supabase Integration
1. **Direct Table Operations**
   - `organization_membership_tiers` - Manage tiers
   - `organization_roles` - Manage roles
   - `organization_members` - Member CRUD
   - `organization_membership_history` - Track changes

2. **Views & RPC Functions**
   - `organization_members_detail` view - Member details
   - `add_organization_member()` - Add new member
   - `update_member_tier()` - Change tier
   - `check_member_permission()` - Permission checks

3. **Business Logic**
   - RLS policies enforce permissions
   - Database triggers track history
   - Membership status managed by database

### Frontend Tasks (Web Only)
1. **Components**
   - `MembershipTierManager.tsx` - Create/edit tiers
   - `RoleManager.tsx` - Manage custom roles
   - `MemberList.tsx` - Members table with actions
   - `MembershipApplication.tsx` - Apply to join
   - `MemberBadge.tsx` - Display on profiles

2. **Pages**
   - `/org/:slug/admin/members` - Member management
   - `/org/:slug/admin/settings` - Org settings
   - `/org/:slug/join` - Public membership page

---

## Module 5: Organization Communication
**Objective**: Messaging system for announcements and member communication

### Supabase Integration  
1. **Enhanced Messaging Tables**
   - `conversations` table with `organization_id`
   - `conversation_participants` for members
   - `messages` table for content

2. **RPC Functions**
   - `create_org_announcement_group()` - Auto-create groups
   - `send_org_announcement()` - Send to members

3. **Integration with External Channels**
   - Queue messages in `email_queue` table
   - Queue WhatsApp in `whatsapp_queue` table
   - Edge functions process queues

### Frontend Tasks (Web Only)
1. **Components**
   - `AnnouncementComposer.tsx` - Create announcements
   - `BroadcastModal.tsx` - Send broadcasts
   - `OrgChatInterface.tsx` - Organization chat UI
   - `MessageChannelSelector.tsx` - Choose delivery method

---

## Module 6: Event Management System
**Objective**: Comprehensive event management for conferences, workshops, expos

### Supabase Integration
1. **Direct Table Operations**
   - `events`, `event_sessions`, `event_speakers`
   - `event_ticket_types`, `event_registrations`
   - `event_sponsors`, `event_sponsor_tiers`
   - `event_expo_stalls`, `event_checkins`

2. **RPC Functions & Views**
   - `register_for_event()` - Handle registration
   - `checkin_attendee()` - QR code check-in
   - `get_event_dashboard_stats()` - Analytics
   - `event_analytics` - Materialized view

3. **Business Logic**
   - Database constraints handle capacity
   - Triggers generate QR codes
   - RLS policies enforce permissions

### Frontend Tasks (Web Only)
1. **Event Creation & Management**
   - `EventWizard.tsx` - Multi-step event creation
   - `SessionScheduler.tsx` - Drag-drop session planner
   - `TicketTypeManager.tsx` - Configure ticket types
   - `SponsorTierSetup.tsx` - Define sponsor packages
   - `EventDashboard.tsx` - Real-time analytics

2. **Event Public Pages**
   - `/events/:slug` - Event landing page
   - `/events/:slug/register` - Registration flow
   - `/events/:slug/agenda` - Session schedule
   - `/events/:slug/speakers` - Speaker profiles
   - `/events/:slug/sponsors` - Sponsor showcase

3. **Event Management**
   - `CheckInScanner.tsx` - QR code scanner
   - `AttendeeList.tsx` - Manage attendees
   - `BadgePrinter.tsx` - Print attendee badges
   - `ExpoFloorPlan.tsx` - Manage stall allocation

### Web-Based Mobile Features
1. **PWA Features for Attendees**
   - QR ticket display (save to home screen)
   - Browser notifications for sessions
   - Offline schedule access
   - Mobile-optimized UI

2. **Web Check-in System**
   - Browser-based QR scanner
   - Real-time sync with Supabase
   - Touch-optimized interface

---

## Module 7: Third-Party Integrations
**Objective**: WhatsApp, SMS, and social sharing integrations

### Supabase Integration
1. **Tables for Queue Management**
   - `whatsapp_queue` - WhatsApp messages
   - `sms_queue` - SMS messages
   - `contact_imports` - Import tracking
   - `integration_credentials` - API keys (encrypted)

2. **Edge Functions Required**
   - `/functions/process-whatsapp-queue`
   - `/functions/process-sms-queue`
   - `/functions/sync-contacts`

3. **RPC Functions**
   - `queue_whatsapp_message()`
   - `queue_sms_message()`
   - `generate_share_url()`
   - `process_contact_import()`

### Frontend Tasks
1. **Components**
   - `WhatsAppOptIn.tsx` - Opt-in for WhatsApp
   - `MessagePreferences.tsx` - Channel preferences
   - `CostEstimator.tsx` - Show messaging costs
   - `DeliveryStatus.tsx` - Track message delivery

---

## Module 8: Enhanced Email System
**Objective**: Complete email campaign and automation system

### Supabase Integration
1. **Email System Tables**
   - `email_queue` - Message queue
   - `email_templates` - Template storage
   - `email_campaigns` - Campaign management
   - `email_preferences` - User preferences

2. **Edge Functions**
   - `/functions/process-email-queue` (already created)
   - Set up cron trigger in Supabase dashboard

3. **Configuration**
   - Store AWS SES credentials in Supabase Vault
   - Configure sender domains

### Frontend Tasks
1. **Admin Components**
   - `EmailTemplateEditor.tsx` - Visual template editor
   - `CampaignWorkflow.tsx` - Drag-drop workflow builder
   - `EmailAnalytics.tsx` - Campaign performance

---

## Implementation Priority & Timeline

### Phase 1: Core Features (Weeks 1-3)
1. Connection & Follow System
2. Business Products & Services
3. Basic Organization Membership

### Phase 2: Communication (Weeks 4-5)
1. Organization Communication
2. Invitation System (Email only)
3. Email System Completion

### Phase 3: Events MVP (Weeks 6-8)
1. Basic Event Creation
2. Ticket Sales
3. Registration & Check-in
4. Event Public Pages

### Phase 4: Advanced Features (Weeks 9-10)
1. WhatsApp/SMS Integration
2. Social Sharing
3. Contact Import
4. Advanced Event Features (Sponsors, Expo)

### Phase 5: Polish & Optimization (Weeks 11-12)
1. Mobile App Updates
2. Performance Optimization
3. Analytics Dashboard
4. Admin Tools Enhancement

---

## Technical Considerations

### State Management
- Use React Query for API data caching
- Zustand for global UI state
- Real-time updates with Supabase subscriptions

### Component Library
- Extend existing design system
- Create reusable form components
- Implement loading/error states

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

### Performance
- Implement pagination for large lists
- Use virtual scrolling for member lists
- Optimize images and implement lazy loading
- Cache event data aggressively

### Security
- Validate all permissions server-side
- Implement rate limiting for invitations
- Sanitize user inputs
- Audit trail for sensitive actions

---

## Success Metrics

### Module KPIs
1. **Connections**: Daily active connections, request acceptance rate
2. **Invitations**: Invitation conversion rate, channel effectiveness
3. **Products/Services**: Listing creation rate, inquiry conversion
4. **Organizations**: Member growth, engagement rate
5. **Events**: Ticket sales, check-in rate, attendee satisfaction

### Technical Metrics
- API response times < 200ms
- Page load times < 3s
- 99.9% uptime
- Zero critical security issues

---

## Next Steps

1. Review and prioritize features with stakeholders
2. Set up development environment for team
3. Create detailed API documentation
4. Design UI mockups for key flows
5. Set up CI/CD pipeline
6. Begin Phase 1 implementation

---

## Resources Needed

### Team
- 2 Full-stack developers (React + Supabase)
- 1 UI/UX designer
- 1 QA engineer  
- 1 DevOps engineer (part-time)

Note: No backend or mobile developers needed in current phase

### External Services
- Wati API account
- Twilio account
- AWS SES production access
- Monitoring tools (Sentry, Datadog)

### Timeline
Total estimated time: 12 weeks for full implementation
MVP (Phase 1-3): 8 weeks
