# Admin App Environment Setup

## Quick Start

1. **Copy the example file:**
   ```bash
   cd apps/admin
   cp .env.example .env.local
   ```

2. **Update the API URL:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### `NEXT_PUBLIC_API_URL` (Required)
- **Description:** Base URL for the REST API
- **Development:** `http://localhost:3002/api/v1`
- **Production:** `https://api.poultryco.net/api/v1`
- **Usage:** Used by API client to make requests

### `NODE_ENV` (Optional)
- **Description:** Node.js environment
- **Default:** `development`
- **Options:** `development`, `production`, `test`

### `PORT` (Optional)
- **Description:** Port for Next.js dev server
- **Default:** `3001`
- **Note:** Only used in development

## Environment File Locations

- **`.env.example`** - Template file (committed to git)
- **`.env.local`** - Local development (gitignored)
- **`.env.production`** - Production (gitignored, set in Vercel)

## Authentication

The admin app uses JWT tokens from the API:
- Login endpoint: `POST /admin/auth/login`
- Token stored in cookie: `admin_token`
- Token included in API requests automatically

## Migration from Supabase

**Old variables (no longer needed):**
- ❌ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ❌ `SUPABASE_SERVICE_ROLE_KEY`

**New variable:**
- ✅ `NEXT_PUBLIC_API_URL`

All database operations now go through the REST API.

## Troubleshooting

### API Connection Issues
- Verify API server is running on port 3002
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure API server is accessible from admin app

### Authentication Issues
- Verify admin user exists in database
- Check JWT_SECRET matches between API and admin app
- Clear cookies and try logging in again

## Production Deployment

For Vercel deployment:
1. Go to Vercel project settings
2. Add environment variable: `NEXT_PUBLIC_API_URL`
3. Set value to production API URL
4. Redeploy

