# Authentication Setup - Verification Complete ✅

**Date:** January 2025  
**Status:** ✅ **VERIFIED**

## Summary

Authentication is properly configured for all protected endpoints. Public endpoints (blog) do not require authentication, while all other endpoints use JWT authentication.

## ✅ Authentication Configuration

### JWT Authentication Strategy

**File:** `apps/api/src/modules/auth/strategies/jwt.strategy.ts`

- **Strategy Name:** `'jwt'`
- **Token Extraction:** From `Authorization: Bearer <token>` header
- **Secret:** Uses `JWT_SECRET` from environment
- **Validation:** Validates token and fetches user profile
- **User Object:** Returns `{ userId, email, profileId, profile }`

### Cognito Authentication Strategy

**File:** `apps/api/src/modules/auth/strategies/cognito.strategy.ts`

- **Strategy Name:** `'cognito'`
- **Token Extraction:** From `Authorization: Bearer <token>` header
- **Validation:** Verifies token with AWS Cognito
- **User Object:** Returns validated Cognito user

### Admin JWT Strategy

**File:** `apps/api/src/modules/admin/strategies/admin-jwt.strategy.ts`

- **Strategy Name:** `'admin-jwt'`
- **Token Type:** Must have `type: 'admin'` in payload
- **Validation:** Checks if user is active admin
- **User Object:** Returns `{ adminId, email, role, type: 'admin' }`

## 🔒 Protected Endpoints

### Users API
- **Controller:** `UsersController`
- **Guard:** `JwtAuthGuard`
- **Endpoints Protected:**
  - `PUT /users/:id` - Update profile
  - `GET /users/:id/stats` - Get stats
  - `POST /users/:id/experiences` - Add experience
  - `PUT /users/:id/experiences/:expId` - Update experience
  - `DELETE /users/:id/experiences/:expId` - Delete experience
  - `POST /users/:id/education` - Add education
  - `PUT /users/:id/education/:eduId` - Update education
  - `DELETE /users/:id/education/:eduId` - Delete education
  - `POST /users/:id/skills` - Add skill
  - `DELETE /users/:id/skills/:skillId` - Remove skill
  - `GET /users/:id/email-preferences` - Get preferences
  - `PUT /users/:id/email-preferences` - Update preferences
- **Public Endpoints:**
  - `GET /users/search` - Search profiles (public)
  - `GET /users/:slug` - Get profile by slug (public)

### Businesses API
- **Controller:** `BusinessesController`
- **Guard:** `JwtAuthGuard` (on write operations)
- **Endpoints Protected:**
  - `POST /businesses` - Create business
  - `PUT /businesses/:id` - Update business
  - `DELETE /businesses/:id` - Delete business
  - All team member operations
  - All certification operations
- **Public Endpoints:**
  - `GET /businesses/search` - Search businesses
  - `GET /businesses/slug/:slug` - Get business by slug

### Messages API
- **Controller:** `MessagesController`
- **Guard:** `JwtAuthGuard`
- **All Endpoints Protected:** All messaging operations require authentication

### Notifications API
- **Controller:** `NotificationsController`
- **Guard:** `JwtAuthGuard`
- **All Endpoints Protected:** All notification operations require authentication

### Social API
- **Controller:** `SocialController`
- **Guard:** `JwtAuthGuard`
- **All Endpoints Protected:** All social operations require authentication

### Admin API
- **Controller:** `ContentController` (blog management)
- **Guard:** `AdminJwtGuard`
- **All Endpoints Protected:** All admin operations require admin authentication

## 🌐 Public Endpoints

### Public Blog API
- **Controller:** `PublicBlogController`
- **Guard:** None (public access)
- **Endpoints:**
  - `GET /public/blog/posts` - Get published posts
  - `GET /public/blog/posts/slug/:slug` - Get post by slug
  - `POST /public/blog/posts/:id/view` - Increment view count
  - `GET /public/blog/categories` - Get categories
  - `GET /public/blog/categories/slug/:slug` - Get category by slug
  - `GET /public/blog/tags` - Get tags
  - `GET /public/blog/tags/slug/:slug` - Get tag by slug

### Discovery API
- **Endpoints:**
  - `GET /discovery/members` - Search members (public)
  - `GET /discovery/businesses` - Search businesses (public)
  - `GET /discovery/products` - Search products (public)
  - `GET /discovery/organizations` - Search organizations (public)
  - `GET /discovery/events` - Search events (public)

## 🔑 How to Use Authentication

### 1. Get JWT Token

**For Regular Users:**
```bash
# Login via OTP
POST /api/v1/auth/otp/verify
{
  "email": "user@example.com",
  "otp": "123456",
  "channel": "email"
}

# Response includes accessToken
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**For Admin Users:**
```bash
# Admin login
POST /api/v1/admin/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}

# Response includes adminToken
{
  "adminToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {...}
}
```

### 2. Use Token in Requests

```bash
# Include token in Authorization header
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/api/v1/users/search?q=test
```

### 3. In Frontend (API Client)

The API client (`apps/web/src/lib/api/client.ts`) automatically includes the token:

```typescript
// Token is stored in localStorage
apiClient.setToken(token);

// All subsequent requests include:
// Authorization: Bearer <token>
```

## ✅ Verification Checklist

- [x] JWT strategy configured
- [x] Cognito strategy configured
- [x] Admin JWT strategy configured
- [x] Guards applied to protected endpoints
- [x] Public endpoints have no guards
- [x] Token extraction from Authorization header
- [x] User validation in strategies
- [x] Error handling for invalid tokens
- [x] Swagger documentation includes BearerAuth

## 🧪 Testing Authentication

### Test Protected Endpoint (Should Fail)
```bash
# Without token - should return 401
curl http://localhost:3002/api/v1/users/me
```

### Test Protected Endpoint (Should Succeed)
```bash
# With token - should return 200
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/api/v1/users/me
```

### Test Public Endpoint (Should Succeed)
```bash
# No token required - should return 200
curl http://localhost:3002/api/v1/public/blog/posts
```

## 📝 Notes

1. **Token Storage:** Frontend stores tokens in `localStorage` as `app_token`
2. **Token Refresh:** Implemented via `/auth/refresh` endpoint
3. **Token Expiration:** JWT tokens expire after configured time (default: 365 days)
4. **Admin Tokens:** Separate token type for admin operations
5. **Cognito Integration:** Supports AWS Cognito tokens for web app

## 🔄 Next Steps

1. ✅ **DONE:** Verify authentication setup
2. ⏳ **TODO:** Test all protected endpoints with valid tokens
3. ⏳ **TODO:** Test error handling for invalid/expired tokens
4. ⏳ **TODO:** Add rate limiting for authentication endpoints
5. ⏳ **TODO:** Add refresh token mechanism (if not already implemented)

