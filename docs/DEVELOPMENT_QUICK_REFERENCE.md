# PoultryBazaar Development Quick Reference

## New Database Schema Files (Run in Order)

```bash
# Run migrations in Supabase
supabase db reset  # This will run all migrations in order
```

### Migration Files Created:
1. `37_connection_follow_system.sql` - Connections and follows
2. `38_product_service_extension.sql` - Services support
3. `39_organization_membership_system.sql` - Membership tiers
4. `40_messaging_groups_extension.sql` - Group messaging
5. `41_event_management_system.sql` - Event management
6. `42_event_management_policies.sql` - Event RLS policies  
7. `43_third_party_integrations.sql` - WhatsApp/SMS/Social

## Key Database Functions

### Connection System
```sql
-- Send connection request
SELECT handle_connection_request(from_profile_id, to_profile_id, 'connect', 'Optional message');

-- Accept/Reject connection
SELECT respond_to_connection_request(connection_id, 'accepted'); -- or 'rejected'

-- Get connection status
SELECT get_connection_status(from_profile_id, to_profile_id);
```

### Organization Membership
```sql
-- Add member to organization
SELECT add_organization_member(org_id, profile_id, tier_id, role_id, valid_until);

-- Update member tier
SELECT update_member_tier(member_id, new_tier_id, performed_by, 'Notes');

-- Check member permission
SELECT check_member_permission(profile_id, org_id, 'manage_events');
```

### Event Management
```sql
-- Register for event
SELECT register_for_event(event_id, ticket_type_id, '{}'::jsonb);

-- Check in attendee
SELECT checkin_attendee(qr_code, session_id, '{}'::jsonb);

-- Get event stats
SELECT get_event_dashboard_stats(event_id);
```

### Messaging
```sql
-- Create group conversation
SELECT create_group_conversation('Group Name', 'Description', 'general', org_id, ARRAY[member_ids]);

-- Send organization announcement
SELECT send_org_announcement(org_id, 'Message', tier_id, role_id, send_email, send_whatsapp);
```

### Integrations
```sql
-- Queue WhatsApp message
SELECT queue_whatsapp_message(phone, 'text', 'Message content', null, '{}'::jsonb, 'invitation', context_id);

-- Queue SMS
SELECT queue_sms_message(phone, 'Message', 'context_type', context_id);

-- Generate share URL
SELECT generate_share_url('facebook', 'profile', 'https://poultryco.com/p/123', 'Check out my profile!');
```

## React Components to Build

### Connection System
```typescript
// Components needed
<ConnectButton profileId={profileId} />
<ConnectionRequestModal />
<ConnectionsList />
<PendingRequests />
<FollowersList />
```

### Organization Features
```typescript
// Components needed
<MembershipTierCard tier={tier} />
<MemberDirectory organizationId={orgId} />
<RoleManager />
<AnnouncementComposer />
<MemberInvite />
```

### Event Management
```typescript
// Components needed
<EventCreationWizard />
<EventPage eventId={eventId} />
<TicketPurchase />
<QRScanner />
<EventDashboard />
<SpeakerCard />
<SponsorSection />
<CheckInInterface />
```

### Service Features
```typescript
// Components needed
<ServiceForm />
<ServiceCard service={service} />
<ServiceFilters />
```

## API Routes Structure

```typescript
// apps/web/src/app/api/

// Connections
/api/connections/
  - request/route.ts
  - respond/route.ts
  - follow/route.ts
  - status/[profileId]/route.ts
  - list/route.ts

// Organizations  
/api/organizations/
  - [id]/
    - members/route.ts
    - announce/route.ts
    - tiers/route.ts

// Events
/api/events/
  - create/route.ts
  - [id]/
    - register/route.ts
    - checkin/route.ts
    - dashboard/route.ts
    - sessions/route.ts
    - sponsors/route.ts

// Integrations
/api/integrations/
  - whatsapp/route.ts
  - sms/route.ts
  - contacts/import/route.ts
  - share/route.ts
```

## Environment Variables Needed

```bash
# .env.local

# WhatsApp (Wati)
WATI_API_KEY=
WATI_BASE_URL=
WATI_ACCESS_TOKEN=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Social APIs (Optional)
FACEBOOK_APP_ID=
TWITTER_API_KEY=
LINKEDIN_CLIENT_ID=

# Google Contacts
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Mobile Specific Code

### Expo Packages Needed
```bash
expo install expo-barcode-scanner
expo install expo-contacts
expo install expo-sharing
expo install expo-notifications
```

### Key Mobile Features
```typescript
// QR Scanner
import { BarCodeScanner } from 'expo-barcode-scanner';

// Contacts Import  
import * as Contacts from 'expo-contacts';

// Share
import * as Sharing from 'expo-sharing';

// Push Notifications
import * as Notifications from 'expo-notifications';
```

## Testing Commands

```bash
# Test database functions
supabase db test

# Test API endpoints
npm run test:api

# Test React components
npm run test:components

# E2E tests
npm run test:e2e
```

## Common Issues & Solutions

### Issue: Connection request not working
```sql
-- Check if profiles exist
SELECT * FROM profiles WHERE id IN (from_id, to_id);

-- Check existing connections
SELECT * FROM connections WHERE from_profile_id = ? AND to_profile_id = ?;
```

### Issue: Event registration failing
```sql
-- Check ticket availability
SELECT * FROM event_ticket_types WHERE id = ? AND is_active = true;

-- Check existing registration
SELECT * FROM event_registrations WHERE event_id = ? AND attendee_id = ?;
```

### Issue: Group messages not sending
```sql
-- Check conversation members
SELECT * FROM conversation_members WHERE conversation_id = ?;

-- Check message policies
SELECT * FROM conversations WHERE id = ?;
```

## Performance Tips

1. **Use indexes effectively**
   - Connection queries use composite index
   - Event queries use date-based indexes
   - Message queries use conversation index

2. **Batch operations**
   - Use `Promise.all()` for multiple API calls
   - Batch WhatsApp/SMS messages
   - Group database updates

3. **Cache frequently accessed data**
   - Connection status
   - Member permissions  
   - Event details

4. **Optimize images**
   - Resize before upload
   - Use WebP format
   - Implement lazy loading

## Deployment Checklist

- [ ] Run all migrations
- [ ] Set environment variables
- [ ] Test third-party integrations
- [ ] Configure rate limits
- [ ] Enable monitoring
- [ ] Setup error tracking
- [ ] Create admin accounts
- [ ] Test payment flows (if applicable)
- [ ] Verify email templates
- [ ] Check mobile app builds
