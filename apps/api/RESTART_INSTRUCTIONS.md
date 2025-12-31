# API Server Restart Instructions

## Issue: WhatsApp Routes Returning 404

The WhatsApp module routes are not registered because the API server needs to be restarted after adding `DatabaseModule` to `WhatsAppModule`.

## Steps to Fix:

### 1. Stop the Current API Server

**Option A: If running in a terminal:**
- Press `Ctrl+C` in the terminal where the API server is running

**Option B: If running as a background process:**
```bash
# Find the process
lsof -ti:3002

# Kill the process (replace PID with actual process ID)
kill <PID>
```

### 2. Restart the API Server

```bash
cd apps/api
npm run dev
```

Or if using a different command:
```bash
npm run start:dev
```

### 3. Verify the Route is Working

After restart, test the endpoint:
```bash
curl http://localhost:3002/v1/whatsapp/accounts
```

You should get an empty array `[]` instead of a 404 error.

### 4. Check for Startup Errors

Look for any errors in the console output when the server starts. Common issues:
- Database connection errors
- Missing environment variables
- Table doesn't exist (run migrations first)

## Why This Happened:

1. `WhatsAppModule` was added to `app.module.ts`
2. `DatabaseModule` was later added to `WhatsAppModule` imports
3. The server was started before the `DatabaseModule` import was added
4. NestJS couldn't inject the database connection, causing the module to fail silently
5. The controller routes were never registered

## After Restart:

- The route `/v1/whatsapp/accounts` should be available
- All WhatsApp endpoints should work
- Check the console for any initialization warnings

