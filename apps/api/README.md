# 🐔 PoultryCo API

**Version:** 1.0.0  
**Framework:** NestJS 10  
**Database:** PostgreSQL 16.11 (AWS RDS) with Drizzle ORM  
**Authentication:** Custom OTP-based Auth (Email/SMS/WhatsApp) + JWT  
**Real-time:** Socket.io  
**Storage:** AWS S3 + CloudFront  
**Port:** 3002

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Real-time Features](#real-time-features)
- [File Uploads](#file-uploads)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)

---

## 🎯 Overview

PoultryCo API is a comprehensive REST API with real-time capabilities built for the PoultryCo professional networking platform. It serves three client applications:

- **Web App** (Next.js) - Desktop/tablet experience
- **Mobile App** (React Native/Expo) - iOS & Android
- **Admin Portal** (Next.js) - Content management and analytics

### Key Features

✅ **Authentication & Authorization**
- Custom OTP-based authentication (Email, SMS, WhatsApp)
- Multi-channel verification system
- JWT token-based auth
- Role-based access control
- Template-based OTP delivery

✅ **User Management**
- Multi-role profiles (Farmer, Vet, Nutritionist, etc.)
- Professional information (experience, education, skills)
- Privacy settings and verifications

✅ **Social Networking**
- Posts, comments, likes
- Two-way connections (LinkedIn-style)
- One-way follows (Twitter-style)
- Real-time feed

✅ **Messaging System**
- 1:1 conversations
- Group chats
- Real-time delivery with Socket.io
- Read receipts and typing indicators

✅ **Business & Organizations**
- Business profiles with products
- Organization management
- Team and membership management

✅ **Content & Discovery**
- Events management
- Job postings and applications
- Resources (calculators, tools, reference data)
- NECC market data and analytics

✅ **File Management**
- S3 upload with image optimization
- CloudFront CDN delivery
- Presigned URLs for client-side uploads

✅ **Notifications**
- In-app, email, push notifications
- Real-time delivery via Socket.io
- Customizable preferences

---

## 🛠️ Tech Stack

### Core Framework
- **NestJS 10** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Express** - HTTP server

### Database
- **PostgreSQL 16.11** - Relational database (AWS RDS)
- **Drizzle ORM** - Type-safe ORM
- **~120 tables** - Comprehensive schema

### Authentication
- **Custom OTP System** - PostgreSQL-based authentication
- **Multi-channel Delivery** - Email (SES SMTP), SMS, WhatsApp
- **Template System** - Database-driven OTP templates
- **JWT** - Token-based authentication
- **Passport.js** - Authentication middleware
- **bcryptjs** - OTP hashing

### Real-time
- **Socket.io** - WebSocket communication
- Real-time messaging, notifications, presence

### File Storage
- **AWS S3** - Object storage
- **CloudFront** - CDN delivery
- **Sharp** - Image optimization
- **Multer** - File upload handling

### API Documentation
- **Swagger/OpenAPI** - Interactive API docs
- Available at `/api/docs`

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

---

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Health check endpoints
│   ├── app.service.ts          # App-level services
│   │
│   ├── config/                 # Configuration files
│   │
│   ├── database/               # Database layer
│   │   ├── database.module.ts  # Drizzle connection
│   │   └── schema/             # Drizzle schema definitions
│   │       ├── 00-core.ts      # Core tables (auth, profiles)
│   │       ├── 01-reference.ts # Reference data
│   │       ├── 10-users.ts     # User module
│   │       ├── 20-businesses.ts # Business module
│   │       ├── 30-organizations.ts # Organization module
│   │       ├── 40-social.ts    # Social module
│   │       ├── 50-messages.ts  # Messages module
│   │       ├── 60-events.ts    # Events module
│   │       ├── 70-notifications.ts # Notifications module
│   │       ├── 80-resources.ts # Resources module
│   │       ├── 90-analytics.ts # Analytics module
│   │       ├── 100-necc.ts     # NECC market data
│   │       ├── 110-admin.ts    # Admin module
│   │       ├── 120-jobs.ts     # Jobs module
│   │       ├── 130-marketplace.ts # Marketplace module
│   │       └── 900-utilities.ts # Utility tables
│   │
│   └── modules/                # Feature modules
│       ├── auth/               # Authentication
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts
│       │   ├── auth.controller.ts
│       │   ├── cognito.service.ts
│       │   ├── strategies/     # Passport strategies
│       │   ├── guards/         # Auth guards
│       │   └── decorators/     # Custom decorators
│       │
│       ├── users/              # User management
│       ├── businesses/         # Business profiles
│       ├── organizations/      # Organizations
│       ├── social/             # Social features
│       ├── messages/           # Messaging
│       ├── events/             # Events
│       ├── jobs/               # Job board
│       ├── resources/          # Tools & resources
│       ├── necc/               # Market data
│       ├── notifications/      # Notifications
│       │
│       ├── upload/             # File uploads
│       │   ├── upload.module.ts
│       │   ├── upload.service.ts
│       │   ├── upload.controller.ts
│       │   └── s3.service.ts
│       │
│       └── socket/             # Real-time
│           ├── socket.module.ts
│           ├── socket.gateway.ts
│           ├── socket.service.ts
│           └── guards/
│
├── test/                       # E2E tests
├── drizzle/                    # Drizzle migrations
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL 16.11 (AWS RDS)
- AWS Account (Cognito, S3, SES)

### Installation

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Database Setup

```bash
# Generate Drizzle types
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### Run Development Server

```bash
# Start in watch mode
npm run dev

# Or
npm run start:dev
```

The API will be available at:
- **API:** http://localhost:3002/api/v1
- **Docs:** http://localhost:3002/api/docs
- **Health:** http://localhost:3002/api/v1/health

---

## 🔐 Environment Variables

Create a `.env` file in the `apps/api` directory:

```bash
# Application
NODE_ENV=development
PORT=3002
API_PREFIX=api/v1

# Database (AWS RDS PostgreSQL 16.11)
DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/poultryco?sslmode=require
DATABASE_URL_TEST=postgresql://postgres:password@your-rds-endpoint:5432/poultryco_test?sslmode=require

# AWS SES SMTP (for OTP emails)
AWS_REGION=us-east-1
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

# AWS S3
AWS_S3_BUCKET=poultryco-media-staging
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
CLOUDFRONT_URL=https://cdn.poultryco.net

# JWT
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:8081

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:8081

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_VIDEO_TYPES=video/mp4,video/webm
ALLOWED_DOCUMENT_TYPES=application/pdf
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/v1/auth/cognito/validate  # Validate Cognito token
GET    /api/v1/auth/me                # Get current user
POST   /api/v1/auth/refresh           # Refresh JWT token
```

### Users

```
GET    /api/v1/users/search           # Search profiles
GET    /api/v1/users/:slug            # Get profile by slug
PUT    /api/v1/users/me               # Update own profile
GET    /api/v1/users/me/stats         # Get profile stats

# Experience
POST   /api/v1/users/me/experiences   # Add experience
PUT    /api/v1/users/me/experiences/:id # Update experience
DELETE /api/v1/users/me/experiences/:id # Delete experience

# Education
POST   /api/v1/users/me/education     # Add education
PUT    /api/v1/users/me/education/:id # Update education
DELETE /api/v1/users/me/education/:id # Delete education

# Skills
POST   /api/v1/users/me/skills        # Add skill
DELETE /api/v1/users/me/skills/:id    # Remove skill
```

### Upload

```
POST   /api/v1/upload/profile-photo   # Upload profile photo
POST   /api/v1/upload/cover-photo     # Upload cover photo
POST   /api/v1/upload/post-media      # Upload post media (up to 5)
POST   /api/v1/upload/document        # Upload document
POST   /api/v1/upload/presigned-url   # Get presigned URL
DELETE /api/v1/upload/:id             # Delete file
```

### Social (TODO)

```
GET    /api/v1/social/feed            # Get personalized feed
POST   /api/v1/social/posts           # Create post
GET    /api/v1/social/posts/:id       # Get post
PUT    /api/v1/social/posts/:id       # Update post
DELETE /api/v1/social/posts/:id       # Delete post
POST   /api/v1/social/posts/:id/like  # Like post
POST   /api/v1/social/posts/:id/comment # Comment on post

# Connections
GET    /api/v1/social/connections     # Get connections
POST   /api/v1/social/connections     # Send connection request
PUT    /api/v1/social/connections/:id # Accept/reject request
DELETE /api/v1/social/connections/:id # Remove connection

# Follows
POST   /api/v1/social/follows         # Follow user
DELETE /api/v1/social/follows/:id     # Unfollow user
```

### Messages (TODO)

```
GET    /api/v1/messages/conversations # Get conversations
POST   /api/v1/messages/conversations # Create conversation
GET    /api/v1/messages/conversations/:id # Get conversation
POST   /api/v1/messages/conversations/:id/messages # Send message
GET    /api/v1/messages/conversations/:id/messages # Get messages
PUT    /api/v1/messages/:id/read      # Mark as read
```

### Other Modules

- **Businesses:** `/api/v1/businesses/*`
- **Organizations:** `/api/v1/organizations/*`
- **Events:** `/api/v1/events/*`
- **Jobs:** `/api/v1/jobs/*`
- **Resources:** `/api/v1/resources/*`
- **NECC:** `/api/v1/necc/*`
- **Notifications:** `/api/v1/notifications/*`

**Note:** See Swagger docs at `/api/docs` for complete API reference.

---

## 🔒 Authentication

### OTP-based Authentication Flow

1. **User requests OTP** via `/api/v1/auth/otp/request`
   - Provides: `identifier` (email/phone), `channel` (email/sms/whatsapp), `requestType` (verify_email/verify_phone)
   - System generates 6-digit OTP, hashes it, stores in database
   - OTP sent via configured channel (Email via SES SMTP, SMS/WhatsApp via Twilio/Meta)
2. **User receives OTP** via email/SMS/WhatsApp
3. **User verifies OTP** via `/api/v1/auth/otp/verify`
   - Provides: `identifier`, `channel`, `code`
   - System verifies OTP, creates/updates user, marks email/phone as verified
   - Returns JWT token for authenticated sessions
4. **Client uses JWT token** for subsequent requests
5. **Auto-login tokens** stored for seamless re-authentication

### Using Protected Endpoints

```typescript
// Add JWT token to Authorization header
const response = await fetch('http://localhost:3002/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
});
```

---

## ⚡ Real-time Features

### Socket.io Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002', {
  auth: {
    token: jwtToken,
  },
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to Socket.io');
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.io');
});
```

### Messaging Events

```typescript
// Join conversation
socket.emit('conversation:join', { conversationId: '...' });

// Send message
socket.emit('message:send', {
  conversationId: '...',
  content: 'Hello!',
  messageType: 'text',
});

// Listen for new messages
socket.on('message:new', (data) => {
  console.log('New message:', data);
});

// Typing indicator
socket.emit('message:typing', {
  conversationId: '...',
  isTyping: true,
});

socket.on('message:typing', (data) => {
  console.log('User typing:', data);
});

// Mark as read
socket.emit('message:read', {
  conversationId: '...',
  messageId: '...',
});
```

### Notification Events

```typescript
// Subscribe to notifications
socket.emit('notification:subscribe');

// Listen for notifications
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

### Presence Events

```typescript
// Update presence
socket.emit('presence:update', { status: 'online' }); // online, away, busy

// Listen for presence changes
socket.on('presence:changed', (data) => {
  console.log('Presence changed:', data);
});

// User online/offline
socket.on('user:online', (data) => {
  console.log('User online:', data.profileId);
});

socket.on('user:offline', (data) => {
  console.log('User offline:', data.profileId);
});
```

---

## 📤 File Uploads

### Direct Upload (Server-side)

```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:3002/api/v1/upload/profile-photo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
  },
  body: formData,
});

const { url, id } = await response.json();
```

### Presigned URL (Client-side)

```typescript
// 1. Get presigned URL
const response = await fetch('http://localhost:3002/api/v1/upload/presigned-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: 'profile.jpg',
    contentType: 'image/jpeg',
    folder: 'profiles/photos',
  }),
});

const { uploadUrl, cdnUrl, key } = await response.json();

// 2. Upload directly to S3
await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpeg',
  },
  body: file,
});

// 3. Use cdnUrl in your app
console.log('File available at:', cdnUrl);
```

---

## 🗄️ Database Schema

The API uses Drizzle ORM with a comprehensive PostgreSQL schema:

- **~120 tables** across 28 modules
- **Module prefixes:** `usr_`, `biz_`, `org_`, `soc_`, `msg_`, `nec_`, etc.
- **Naming convention:** snake_case, plural table names
- **Relations:** Properly defined foreign keys and indexes

See `/aws/database/schema/` for SQL schema files.

---

## 🧪 Development

### Scripts

```bash
# Development
npm run dev              # Start with watch mode
npm run start:dev        # Start with watch mode
npm run start:debug      # Start with debug mode

# Build
npm run build            # Build for production

# Production
npm run start:prod       # Start production server

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run E2E tests

# Database
npm run db:generate      # Generate Drizzle types
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio
```

### Adding New Endpoints

1. Create module files:
```bash
nest g module modules/feature
nest g service modules/feature
nest g controller modules/feature
```

2. Implement service logic
3. Add controller endpoints
4. Update `app.module.ts`
5. Test with Swagger docs

---

## 🚢 Deployment

For detailed deployment instructions, see **[docs/api/DEPLOYMENT.md](../../docs/api/DEPLOYMENT.md)**

### Quick Overview

1. **Build Docker image:**
```bash
docker build -t poultryco-api .
```

2. **Push to ECR:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker tag poultryco-api:latest YOUR_ECR_URL/poultryco-api:latest
docker push YOUR_ECR_URL/poultryco-api:latest
```

3. **Deploy to ECS Fargate:**
- Create ECS cluster
- Create task definition
- Create service
- Configure load balancer
- Set environment variables

### Environment Variables (Production)

Store sensitive credentials in **AWS Secrets Manager** and reference them in ECS task definition.

---

## 📚 Additional Resources

- **Swagger API Docs:** http://localhost:3002/api/docs
- **NestJS Documentation:** https://docs.nestjs.com
- **Drizzle ORM:** https://orm.drizzle.team
- **Socket.io:** https://socket.io/docs/v4
- **AWS SES SMTP:** https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html

### Documentation Files

- **This README** - Setup and usage guide
- **[DEPLOYMENT.md](../../docs/api/DEPLOYMENT.md)** - AWS ECS Fargate deployment
- **[API_SUMMARY.md](../../docs/api/API_SUMMARY.md)** - Complete API summary
- **[QUICK_REFERENCE.md](../../docs/api/QUICK_REFERENCE.md)** - Quick reference card

---

## 🤝 Team Handoff

### For Frontend Developers

1. **Authentication:**
   - Request OTP via `/api/v1/auth/otp/request` with email/phone
   - User receives OTP via email/SMS/WhatsApp
   - Verify OTP via `/api/v1/auth/otp/verify` with code
   - Store returned JWT token
   - Include in `Authorization: Bearer {token}` header

2. **API Integration:**
   - Base URL: `http://localhost:3002/api/v1`
   - All endpoints documented in Swagger
   - TypeScript types available in Drizzle schema

3. **Real-time:**
   - Connect to Socket.io with JWT token
   - Subscribe to relevant events
   - Handle real-time updates

4. **File Uploads:**
   - Use presigned URLs for large files
   - Direct upload for profile photos
   - CDN URLs for display

### For Backend Developers

1. **Code Structure:**
   - Follow NestJS module pattern
   - Use Drizzle ORM for database queries
   - Implement service logic in `.service.ts`
   - Add API endpoints in `.controller.ts`

2. **Database:**
   - Schema defined in `src/database/schema/`
   - Use migrations for schema changes
   - Follow naming conventions

3. **Testing:**
   - Write unit tests for services
   - Write E2E tests for controllers
   - Maintain >80% code coverage

---

## 📝 License

Proprietary - PoultryCo Platform

---

**Built with ❤️ by the PoultryCo Team**

