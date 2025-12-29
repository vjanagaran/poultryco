# Authentication System - Complete Reference

**Last Updated:** December 6, 2025  
**Status:** ✅ Production Ready

---

## 📋 Overview

PoultryCo's authentication system uses a **custom OTP-based authentication** built on PostgreSQL, supporting multi-channel verification (Email, SMS, WhatsApp) with template-driven messaging.

### Supported Channels
- ✅ Email (via AWS SES SMTP)
- ✅ SMS (via Twilio - future)
- ✅ WhatsApp (via Meta - future)

### Key Features
- OTP-based authentication (no passwords required)
- Multi-channel verification (email, phone)
- Template-driven OTP messages (database configurable)
- Secure OTP hashing (bcryptjs)
- JWT token-based sessions
- Auto-login token support
- Rate limiting and attempt tracking
- Email/phone verification flags

---

## 🔐 Authentication Flow

### 1. Request OTP

**Endpoint:** `POST /api/v1/auth/otp/request`

**Request:**
```json
{
  "identifier": "user@example.com",
  "channel": "email",
  "requestType": "verify_email"
}
```

**Flow:**
1. User provides email or phone number
2. System generates 6-digit OTP
3. OTP is hashed using bcryptjs
4. OTP request stored in `auth_requests` table
5. Template loaded from `auth_templates` table
6. OTP sent via configured channel (Email via SES SMTP)
7. Response includes expiry time (10 minutes default)

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to user@example.com",
  "isNewUser": true,
  "expiresIn": 10
}
```

### 2. Verify OTP

**Endpoint:** `POST /api/v1/auth/otp/verify`

**Request:**
```json
{
  "identifier": "user@example.com",
  "channel": "email",
  "code": "123456"
}
```

**Flow:**
1. System finds active OTP request
2. Verifies code against hashed value
3. Checks expiry and attempt limits
4. Creates/updates user in `auth_users` table
5. Marks email/phone as verified
6. Generates JWT token
7. Stores auto-login token (hashed)
8. Returns user data and JWT

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "phoneVerified": false
  },
  "token": "jwt-token-here"
}
```

---

## 💾 Database Schema

### auth_users Table

```sql
CREATE TABLE auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  whatsapp_flag BOOLEAN NOT NULL DEFAULT false,
  token TEXT,  -- Auto-login token (hashed)
  token_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ,
  CONSTRAINT check_identifier CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
```

### auth_requests Table

```sql
CREATE TABLE auth_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  identifier TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  code_hash TEXT NOT NULL,  -- Hashed OTP
  code_expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  request_type TEXT NOT NULL CHECK (request_type IN ('verify_email', 'verify_phone')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### auth_templates Table

```sql
CREATE TABLE auth_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  template_type TEXT NOT NULL CHECK (template_type IN ('otp', 'invite', 'welcome', 'password_reset', 'resend')),
  name TEXT NOT NULL,
  subject TEXT,
  body_template TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🛠️ Implementation Details

### OTP Service

**Location:** `apps/api/src/modules/auth/services/otp.service.ts`

**Features:**
- Generates cryptographically secure 6-digit OTPs
- Hashes OTPs using bcryptjs (10 rounds)
- Verifies OTPs against hashes
- Manages expiry timestamps
- Configurable length, expiry, max attempts

### Email Service

**Location:** `apps/api/src/modules/auth/services/email.service.ts`

**Features:**
- Sends emails via AWS SES SMTP
- Rate limiting per user (60 seconds default)
- HTML and plain text support
- Template rendering integration

### Template Service

**Location:** `apps/api/src/modules/auth/services/template.service.ts`

**Features:**
- Fetches templates from database
- Renders dynamic variables ({{code}}, {{expiry}})
- Supports multiple languages
- Priority-based template selection

### OTP Auth Service

**Location:** `apps/api/src/modules/auth/services/otp-auth.service.ts`

**Features:**
- Orchestrates OTP request flow
- Handles user creation/update
- Manages rate limiting
- Tracks verification attempts
- Generates JWT tokens

---

## 🔒 Security Features

### OTP Security
- **Hashing:** All OTPs hashed with bcryptjs before storage
- **Expiry:** OTPs expire after 10 minutes (configurable)
- **Attempt Limits:** Maximum 5 verification attempts per OTP
- **Rate Limiting:** Minimum 60 seconds between OTP requests per user
- **One-time Use:** OTPs marked as verified after successful use

### Token Security
- **JWT Tokens:** Signed with secret key, 7-day expiry
- **Auto-login Tokens:** Hashed before storage
- **Token Rotation:** Refresh endpoint for token renewal
- **Secure Storage:** Tokens never logged or exposed

### Database Security
- **SSL Required:** All database connections use SSL
- **Prepared Statements:** Drizzle ORM prevents SQL injection
- **Indexes:** Optimized queries with proper indexes
- **Constraints:** Database-level validation

---

## 📡 API Endpoints

### Request OTP
```bash
POST /api/v1/auth/otp/request
Content-Type: application/json

{
  "identifier": "user@example.com",
  "channel": "email",
  "requestType": "verify_email"
}
```

### Verify OTP
```bash
POST /api/v1/auth/otp/verify
Content-Type: application/json

{
  "identifier": "user@example.com",
  "channel": "email",
  "code": "123456"
}
```

### Get Current User
```bash
GET /api/v1/auth/me
Authorization: Bearer {jwt-token}
```

### Refresh Token
```bash
POST /api/v1/auth/refresh
Authorization: Bearer {jwt-token}
```

### Logout
```bash
POST /api/v1/auth/logout
Authorization: Bearer {jwt-token}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# AWS SES SMTP
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USERNAME=your-smtp-username
SES_SMTP_PASSWORD=your-smtp-password
SES_SENDER_EMAIL=account@auth.poultryco.net
SES_SENDER_NAME=PoultryCo Account
SES_MIN_INTERVAL_PER_USER=60

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RATE_LIMIT_SECONDS=60

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
```

---

## 🧪 Testing

### Test OTP Request
```bash
curl -X POST http://localhost:3002/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "channel": "email",
    "requestType": "verify_email"
  }'
```

### Test OTP Verification
```bash
curl -X POST http://localhost:3002/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "channel": "email",
    "code": "123456"
  }'
```

### Verify Database Records
```sql
-- Check user created
SELECT id, email, email_verified, status 
FROM auth_users 
WHERE email = 'test@example.com';

-- Check OTP request
SELECT id, identifier, channel, verified_at, attempts
FROM auth_requests 
WHERE identifier = 'test@example.com'
ORDER BY created_at DESC LIMIT 1;
```

---

## 🐛 Troubleshooting

### Issue: OTP Not Received
**Check:**
1. SES SMTP credentials configured correctly
2. SES account verified (sandbox mode limitations)
3. Email address is valid
4. Check application logs for errors
5. Verify template exists in database

### Issue: OTP Verification Fails
**Check:**
1. OTP not expired (10 minutes)
2. Attempts not exceeded (5 max)
3. Code entered correctly
4. Check database for OTP request record

### Issue: Rate Limit Error
**Solution:**
- Wait 60 seconds between requests
- Check `SES_MIN_INTERVAL_PER_USER` configuration

---

## 📊 Database Queries

### Check Active OTP Requests
```sql
SELECT 
  identifier,
  channel,
  request_type,
  attempts,
  created_at,
  code_expires_at,
  verified_at
FROM auth_requests
WHERE verified_at IS NULL
  AND code_expires_at > NOW()
ORDER BY created_at DESC;
```

### Check User Verification Status
```sql
SELECT 
  id,
  email,
  phone,
  email_verified,
  phone_verified,
  status,
  created_at
FROM auth_users
ORDER BY created_at DESC;
```

### Check Template Usage
```sql
SELECT 
  channel,
  template_type,
  name,
  is_active,
  priority
FROM auth_templates
WHERE is_active = true
ORDER BY channel, template_type, priority DESC;
```

---

## 🎯 Next Steps

### Immediate
- [x] Email OTP implementation
- [ ] SMS OTP integration (Twilio)
- [ ] WhatsApp OTP integration (Meta)
- [ ] Admin authentication (password-based)

### Short-term
- [ ] OTP resend functionality
- [ ] Multi-device OTP support
- [ ] OTP delivery status tracking
- [ ] Template management UI

### Long-term
- [ ] Biometric authentication
- [ ] Social login integration
- [ ] Two-factor authentication
- [ ] Device fingerprinting

---

## 📁 File Locations

### Backend Services
```
apps/api/src/modules/auth/
├── services/
│   ├── otp.service.ts           # OTP generation & hashing
│   ├── email.service.ts         # Email delivery via SES
│   ├── template.service.ts      # Template rendering
│   └── otp-auth.service.ts      # OTP auth orchestration
├── auth.controller.ts            # API endpoints
├── auth.service.ts              # Auth business logic
└── auth.module.ts               # Module configuration
```

### Database Schema
```
aws/database/schema/
└── 00_auth_custom.sql           # Auth tables & templates
```

---

**For API documentation:** See `/api/docs`  
**For deployment:** See `apps/api/DEPLOYMENT.md`  
**For quick reference:** See `apps/api/QUICK_REFERENCE.md`
