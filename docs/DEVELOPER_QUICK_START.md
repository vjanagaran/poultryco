# PoultryCo Developer Quick Start Guide

## 🚀 New Features Overview

### 1. **Connection System** ✅
- Mutual connections (like LinkedIn)
- One-way follows (like Twitter)
- Connection requests with accept/reject flow
- Integration with invitations

### 2. **Invitation System** ✅
- WhatsApp invites via Wati
- SMS invites via Twilio
- Email invitations
- Social media sharing
- Contact import (Google, Phone, CSV)

### 3. **Business Services** ✅
- Extended product system to support services
- Custom fields per service type
- Service inquiry system
- Integrated with messaging

### 4. **Organization Features** ✅
- Customizable membership tiers
- Custom roles (Chairman, President, etc.)
- Member management
- Communication tools
- Group messaging

### 5. **Event Management** ✅
- Multiple event types (conference, workshop, expo)
- Session scheduling
- Speaker management
- Ticketing with QR codes
- Sponsor management
- Expo stall allocation
- Check-in system
- Custom branding

### 6. **Third-Party Integrations** ✅
- Wati (WhatsApp Business)
- Twilio (SMS)
- Social sharing
- Contact imports

## 📁 Key Files to Review

### Schema Files
- `37_connection_system_extensions.sql` - Connection/invitation tables
- `38_product_service_extension.sql` - Service support
- `39_organization_membership_system.sql` - Membership system
- `40_messaging_groups_minimal_extension.sql` - Group messaging
- `41_event_management_system.sql` - Event tables
- `42_event_management_policies.sql` - Event RLS & functions
- `43_third_party_integrations.sql` - Integration tables

### Documentation
- `docs/platform/DEVELOPMENT_PLAN_MODULES.md` - Detailed implementation plan
- `docs/platform/MVP_IMPLEMENTATION_PLAN.md` - MVP roadmap
- `docs/platform/EXISTING_VS_NEW_FEATURES.md` - Feature comparison

## 🛠 Development Setup

### 1. Database Setup
```bash
# All schemas have been applied to Supabase
# No migration needed, start building!
```

### 2. Environment Variables
```env
# Add to .env.local
NEXT_PUBLIC_WATI_API_KEY=your_wati_key
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
AWS_SES_ACCESS_KEY=your_ses_key
AWS_SES_SECRET_KEY=your_ses_secret
```

### 3. Install Dependencies
```bash
npm install
# Additional packages needed:
npm install twilio @aws-sdk/client-ses qrcode react-qr-reader
```

## 🏗 Architecture Decisions

### 1. Profile System
- `profiles.id` = `auth.uid()` (direct mapping)
- Three distinct profile types:
  - Personal profiles (`/me/`)
  - Business profiles (`/com/`)
  - Organization profiles (`/org/`)

### 2. Polymorphic Relationships
- `member_id` + `member_type` pattern for flexible associations
- Used in: organization_members, event_speakers, etc.

### 3. Messaging Integration
- All inquiries use existing messaging system
- Organization announcements create conversation groups
- Email/WhatsApp as paid add-ons

### 4. Event Architecture
- Events owned by organizations only
- Comprehensive feature set for PTSE use case
- Customizable branding per event

## 🔧 Common Patterns

### 1. RLS Policies
```sql
-- Check organization membership
WHERE om.member_id = auth.uid() 
AND om.member_type = 'personal'
AND om.membership_status = 'active'
```

### 2. API Structure
```typescript
// Standard CRUD pattern
GET    /api/{module}          // List with filters
POST   /api/{module}          // Create
GET    /api/{module}/{id}     // Get single
PUT    /api/{module}/{id}     // Update
DELETE /api/{module}/{id}     // Delete

// Actions
POST   /api/{module}/{id}/{action}
```

### 3. Component Structure
```
components/
  {module}/
    {Feature}List.tsx      // Data table/grid
    {Feature}Form.tsx      // Create/edit form
    {Feature}Card.tsx      // Display card
    {Feature}Actions.tsx   // Action buttons
```

## 🎯 Implementation Priorities

### Week 1-2: Foundation
1. Connection/Follow UI
2. Basic invitation flow
3. Service listing pages

### Week 3-4: Organizations
1. Member management UI
2. Role/tier configuration
3. Basic announcements

### Week 5-6: Events Core
1. Event creation wizard
2. Public event pages
3. Registration flow

### Week 7-8: Events Advanced
1. Check-in system
2. Speaker/sponsor management
3. Analytics dashboard

## 🧪 Testing Checklist

### For Each Module:
- [ ] API endpoint tests
- [ ] RLS policy tests
- [ ] UI component tests
- [ ] Integration tests
- [ ] Mobile app sync

### Critical Flows:
- [ ] User registration → profile → connection
- [ ] Organization creation → membership → communication
- [ ] Event creation → registration → check-in
- [ ] Service listing → inquiry → messaging

## 📱 Mobile Considerations

### Priority Features:
1. QR code scanning (events)
2. Push notifications (connections, messages)
3. Contact import
4. Offline support for events

### Native Features:
- Camera for QR scanning
- Contacts API
- Push notifications
- Deep linking

## 🚨 Important Notes

1. **No Migration of Old Data**: Building fresh, no backward compatibility needed
2. **Brand Name**: Use "PoultryCo" not "PoultryBazaar"
3. **Email/SMS Costs**: These are pay-per-use features
4. **PTSE Focus**: Event system designed specifically for PTSE summit

## 📞 Support

- Technical Lead: @janagaran
- Schema Questions: Review SQL files
- UI/UX: Follow existing design system
- API Patterns: Check existing implementations

## 🎉 Let's Build!

Start with the module you're assigned to and follow the patterns established in the codebase. Happy coding!
