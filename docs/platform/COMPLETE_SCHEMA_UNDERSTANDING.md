# Complete Schema Understanding - PoultryBazaar Platform

## Platform Architecture Overview

After reviewing all 36 schema files, here's the complete understanding of the PoultryBazaar platform:

## 1. Profile System Architecture

### Three Types of Entities (NOT profile_type column)

The platform uses **separate tables** for different entity types:

1. **`profiles`** - Personal profiles (1:1 with auth.users)
   - Represents individuals (farmers, vets, suppliers, etc.)
   - Has multiple roles via `profile_roles` table
   - Can own businesses and be members of organizations

2. **`business_profiles`** - Business entities
   - Owned by personal profiles (owner_id)
   - Has business admins via `business_admins` table
   - Can have products, jobs, and services

3. **`organizations`** - Community/Association profiles
   - Created by personal profiles (creator_id)
   - Has leadership structure via `organization_leadership`
   - Can have members (both personal and business)

**Key Insight**: There is NO `profile_type` column in the profiles table. The system uses separate tables and references.

## 2. Multi-Role System

### Personal Profiles Can Have Multiple Roles:
- Farmer, Veterinarian, Supplier, Consultant, etc.
- Stored in `profile_roles` table
- Each role can have specific details tables (e.g., `profile_farmer_details`)

### Polymorphic Membership:
- `organization_members` table uses:
  - `member_type` ('personal' or 'business')
  - `member_id` (references either profiles.id or business_profiles.id)

## 3. Existing Systems

### Connection System (File 10)
- **Table**: `connections` - Mutual connections
- **Table**: `follows` - One-way following
- Already has request/accept flow
- No need for major changes

### Messaging System (Files 17, 22)
- **Tables**: `conversations`, `conversation_participants`, `messages`
- Already supports group chats
- Has offline support and optimization
- Just needs organization-specific features

### Notification System (Files 18, 23, 30)
- Complete notification system with triggers
- Automatically creates notifications for connections, messages

### Discovery System (Files 24, 25)
- Location standardization with PostGIS
- Business types taxonomy
- Product categories hierarchy
- Event discovery

### Email System (Files 31-36)
- Email queue and templates
- Campaign management
- Professional templates
- AWS SES ready

## 4. What We're Actually Building

### 1. Enhanced Services (EXTENDS products)
- Products table becomes products/services
- Add service-specific fields
- Custom attributes by category

### 2. Organization Membership System (NEW)
- Membership tiers and benefits
- Custom roles and permissions
- Member management
- Different from existing `organization_members` table

### 3. Event Management (REPLACES organization_events)
- Comprehensive event system
- Sessions, speakers, sponsors
- Ticketing with QR codes
- Check-in system

### 4. Third-party Integrations (NEW)
- WhatsApp via Wati
- SMS via Twilio
- Social sharing
- Contact imports

## 5. Missing Profile Type Solution

Since there's no `profile_type` column but our new code expects it, we need to:

### Option 1: Add profile_type column
```sql
ALTER TABLE profiles 
ADD COLUMN profile_type TEXT DEFAULT 'personal' 
CHECK (profile_type IN ('personal', 'organization'));
```

### Option 2: Use computed field/view
```sql
CREATE VIEW profiles_with_type AS
SELECT 
    p.*,
    CASE 
        WHEN o.id IS NOT NULL THEN 'organization'
        ELSE 'personal'
    END as profile_type
FROM profiles p
LEFT JOIN organizations o ON o.id = p.id;
```

### Option 3: Refactor new code
- Don't assume profile_type exists
- Check if profile is organization by joining tables

## 6. Key Relationships

```
auth.users (1:1) → profiles
    ↓
    → profile_roles (1:many)
    → business_profiles (owner, 1:many)
    → business_admins (1:many)
    → organizations (creator, 1:many)
    → organization_leadership (1:many)
    → organization_members (polymorphic)
    → connections (both sides)
    → follows (both sides)
    → conversations (via participants)
```

## 7. Platform Features Summary

### Existing & Working:
1. ✅ User profiles with roles
2. ✅ Business profiles
3. ✅ Organizations
4. ✅ Connections & follows
5. ✅ Messaging with groups
6. ✅ Notifications
7. ✅ Discovery system
8. ✅ Social posts
9. ✅ Email system
10. ✅ Market data
11. ✅ Admin system
12. ✅ Storage buckets

### We're Adding:
1. 🆕 Services (extending products)
2. 🆕 Enhanced organization membership
3. 🆕 Comprehensive events
4. 🆕 Third-party integrations
5. 🆕 Invitations system
6. 🆕 Share tracking

## 8. Implementation Recommendations

1. **Add profile_type column** to profiles table for consistency
2. **Keep existing systems** - they work well
3. **Extend carefully** - don't break existing functionality
4. **Use polymorphic patterns** where the platform already uses them
5. **Leverage existing indexes** and optimization

## 9. Database Patterns Used

1. **Polymorphic associations** (organization_members)
2. **Hierarchical data** (categories, business types)
3. **Audit trails** (history tables)
4. **Soft deletes** (deleted_at columns)
5. **JSON metadata** for flexibility
6. **PostGIS** for location features
7. **Full-text search** indexes
8. **Materialized views** for performance

## 10. Security Patterns

1. **Row Level Security (RLS)** on all tables
2. **Function-based permissions** (SECURITY DEFINER)
3. **Audit functions** for sensitive operations
4. **Encrypted credentials** for integrations
