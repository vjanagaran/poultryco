# Environment Variables Update - Custom Auth with SES

## Updated `.env.local` Structure

Remove all Cognito-related variables and add SES SMTP configuration:

```env
# =====================================================
# APPLICATION SETTINGS
# =====================================================
NODE_ENV=development
PORT=3002
API_PREFIX=api/v1

# =====================================================
# DATABASE (PostgreSQL)
# =====================================================
DATABASE_URL=postgresql://postgres:password@host:5432/poultryco

# =====================================================
# AWS Credentials (for S3, SES API if needed)
# =====================================================
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# =====================================================
# AWS S3 (File Storage)
# =====================================================
AWS_S3_BUCKET=cdn.poultryco.net
AWS_S3_REGION=ap-south-1
CLOUDFRONT_URL=https://cdn.poultryco.net

# =====================================================
# SES SMTP Configuration (for OTP emails)
# =====================================================
SES_SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USERNAME=AKIAXOD26LBGDT6JW35E
SES_SMTP_PASSWORD=your-smtp-password-here
SES_SENDER_EMAIL=account@auth.poultryco.net
SES_SENDER_NAME=PoultryCo Account
SES_MIN_INTERVAL_PER_USER=60

# =====================================================
# JWT (Token Authentication)
# =====================================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=3650d

# =====================================================
# OTP Configuration
# =====================================================
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RATE_LIMIT_SECONDS=60

# =====================================================
# CORS (Cross-Origin Resource Sharing)
# =====================================================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:8081
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:8081

# =====================================================
# FILE UPLOAD SETTINGS
# =====================================================
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
ALLOWED_VIDEO_TYPES=video/mp4,video/webm,video/quicktime
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

## Removed Variables (Cognito)

- `AWS_COGNITO_USER_POOL_ID`
- `AWS_COGNITO_CLIENT_ID`
- `AWS_COGNITO_CLIENT_SECRET`
- `AWS_COGNITO_ISSUER`

## New Variables Added

### SES SMTP Configuration
- `SES_SMTP_HOST` - SMTP server hostname
- `SES_SMTP_PORT` - SMTP port (587 for STARTTLS)
- `SES_SMTP_USERNAME` - SMTP username (AWS Access Key ID)
- `SES_SMTP_PASSWORD` - SMTP password (AWS Secret Access Key)
- `SES_SENDER_EMAIL` - From email address
- `SES_SENDER_NAME` - Display name for sender
- `SES_MIN_INTERVAL_PER_USER` - Rate limiting (seconds)

### OTP Configuration
- `OTP_LENGTH` - OTP code length (default: 6)
- `OTP_EXPIRY_MINUTES` - OTP validity period (default: 10)
- `OTP_MAX_ATTEMPTS` - Max verification attempts (default: 5)
- `OTP_RATE_LIMIT_SECONDS` - Min time between OTP requests (default: 60)

## Implementation Summary

### Services Created

1. **OtpService** (`src/modules/auth/services/otp.service.ts`)
   - Generate cryptographically secure OTPs
   - Hash OTPs with bcrypt
   - Verify OTPs
   - Manage expiry timestamps

2. **EmailService** (`src/modules/auth/services/email.service.ts`)
   - Send emails via SES SMTP using nodemailer
   - Rate limiting per user
   - Connection verification

3. **TemplateService** (`src/modules/auth/services/template.service.ts`)
   - Load templates from `auth_templates` table
   - Render templates with variable substitution
   - Support for multiple channels and languages

4. **OtpAuthService** (`src/modules/auth/services/otp-auth.service.ts`)
   - Request OTP (generate, hash, store, send)
   - Verify OTP (check expiry, attempts, verify hash)
   - Auto-create users on verification
   - Generate auto-login tokens

### API Endpoints

- `POST /api/v1/auth/otp/request` - Request OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP and authenticate

### Dependencies Added

- `nodemailer` - SMTP email sending
- `bcrypt` - OTP hashing
- `@types/nodemailer` - TypeScript types
- `@types/bcrypt` - TypeScript types
