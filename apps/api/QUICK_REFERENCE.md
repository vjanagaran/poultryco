# 🚀 PoultryCo API - Quick Reference Card

## 📍 Endpoints

**Base URL:** `http://localhost:3002/api/v1`  
**Docs:** `http://localhost:3002/api/docs`

---

## 🔐 Authentication

```bash
# 1. Validate Cognito token (get app JWT)
POST /auth/cognito/validate
Body: { "token": "cognito-jwt-token" }
Response: { "accessToken": "app-jwt", "expiresIn": "7d", "user": {...} }

# 2. Get current user
GET /auth/me
Headers: { "Authorization": "Bearer app-jwt" }

# 3. Refresh token
POST /auth/refresh
Headers: { "Authorization": "Bearer app-jwt" }
```

---

## 👤 Users

```bash
# Search profiles
GET /users/search?q=john&role=farmer&state=Tamil+Nadu&limit=20

# Get profile
GET /users/:slug

# Update own profile
PUT /users/me
Body: { "firstName": "John", "headline": "Poultry Farmer" }

# Get stats
GET /users/me/stats

# Experience
POST /users/me/experiences
PUT /users/me/experiences/:id
DELETE /users/me/experiences/:id

# Education
POST /users/me/education
PUT /users/me/education/:id
DELETE /users/me/education/:id

# Skills
POST /users/me/skills
DELETE /users/me/skills/:skillId
```

---

## 📤 File Upload

```bash
# Profile photo
POST /upload/profile-photo
Content-Type: multipart/form-data
Body: FormData with 'file'

# Cover photo
POST /upload/cover-photo
Content-Type: multipart/form-data
Body: FormData with 'file'

# Post media (up to 5 files)
POST /upload/post-media
Content-Type: multipart/form-data
Body: FormData with 'files[]'

# Document
POST /upload/document
Content-Type: multipart/form-data
Body: FormData with 'file'

# Get presigned URL (client-side upload)
POST /upload/presigned-url
Body: { "fileName": "photo.jpg", "contentType": "image/jpeg", "folder": "profiles/photos" }
Response: { "uploadUrl": "...", "cdnUrl": "...", "key": "..." }

# Delete file
DELETE /upload/:uploadId
```

---

## 🔌 Socket.io Events

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002', {
  auth: { token: jwtToken }
});
```

### Messaging
```javascript
// Join conversation
socket.emit('conversation:join', { conversationId: 'uuid' });

// Send message
socket.emit('message:send', {
  conversationId: 'uuid',
  content: 'Hello!',
  messageType: 'text'
});

// Listen for new messages
socket.on('message:new', (data) => {
  console.log(data); // { conversationId, senderId, content, timestamp }
});

// Typing indicator
socket.emit('message:typing', { conversationId: 'uuid', isTyping: true });
socket.on('message:typing', (data) => {});

// Read receipt
socket.emit('message:read', { conversationId: 'uuid', messageId: 'uuid' });
socket.on('message:read', (data) => {});
```

### Notifications
```javascript
// Subscribe
socket.emit('notification:subscribe');

// Listen
socket.on('notification:new', (notification) => {
  console.log(notification);
});
```

### Presence
```javascript
// Update status
socket.emit('presence:update', { status: 'online' }); // online, away, busy

// Listen for changes
socket.on('presence:changed', (data) => {});
socket.on('user:online', (data) => {});
socket.on('user:offline', (data) => {});
```

---

## 🗄️ Database Schema

### Naming Convention
- **Prefixes:** `usr_`, `biz_`, `org_`, `soc_`, `msg_`, `nec_`, etc.
- **Format:** snake_case, plural table names
- **Example:** `usr_experiences`, `soc_posts`, `msg_conversations`

### Key Tables
```
profiles                  # Core user profiles
usr_profile_roles         # Multi-role support
usr_experiences           # Work experience
usr_education             # Education history
usr_profile_skills        # Skills & endorsements

biz_profiles              # Business profiles
biz_team_members          # Team management
biz_certifications        # Business certifications

org_profiles              # Organization profiles
org_members               # Organization members
org_announcements         # Announcements

soc_posts                 # Social posts
soc_post_likes            # Post likes
soc_post_comments         # Comments
soc_connections           # Two-way connections
soc_follows               # One-way follows

msg_conversations         # Conversations
msg_participants          # Conversation participants
msg_messages              # Messages

evt_events                # Events
evt_attendees             # Event attendees

ntf_notifications         # Notifications
ntf_preferences           # Notification preferences

nec_zones                 # NECC zones
nec_prices                # NECC prices
nec_annotations           # Expert annotations

media_uploads             # File uploads tracking
email_queue               # Email queue
audit_log                 # Audit trail
```

---

## 🛠️ Development Commands

```bash
# Install
npm install

# Development
npm run dev              # Start with watch mode
npm run start:dev        # Alternative
npm run start:debug      # With debugger

# Build
npm run build

# Production
npm run start:prod

# Database
npm run db:generate      # Generate Drizzle types
npm run db:push          # Push schema
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio

# Linting
npm run lint             # Check
npm run lint:fix         # Fix

# Testing
npm run test             # Unit tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage
npm run test:e2e         # E2E tests
```

---

## 🔧 Environment Variables (Essential)

```bash
# Application
NODE_ENV=development
PORT=3002

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/poultryco

# AWS Cognito
AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=your-client-id

# AWS S3
AWS_S3_BUCKET=poultryco-media
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
CLOUDFRONT_URL=https://cdn.poultryco.net

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## 📊 Response Formats

### Success Response
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "createdAt": "2025-12-02T10:00:00Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Paginated Response
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 🚨 Common Issues & Solutions

### Connection Refused
```bash
# Check if API is running
curl http://localhost:3002/api/v1/health

# Check port
lsof -i :3002

# Restart
npm run dev
```

### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Verify RDS is accessible
# Check security groups
```

### Cognito Token Invalid
```bash
# Token expired - refresh from Cognito
# Wrong user pool ID - check AWS_COGNITO_USER_POOL_ID
# Token from different environment
```

### S3 Upload Failed
```bash
# Check AWS credentials
# Verify bucket exists
# Check bucket permissions
# Verify CORS configuration
```

---

## 📞 Support

- **Swagger Docs:** http://localhost:3002/api/docs
- **README:** `/apps/api/README.md`
- **Deployment Guide:** `/apps/api/DEPLOYMENT.md`
- **Summary:** `/apps/api/API_SUMMARY.md`

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0

