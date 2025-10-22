# PoultryCo Mobile - Production APK Build Guide

This guide will help you build a production-ready APK for the PoultryCo mobile app.

## Prerequisites

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Create an Expo account** (if you don't have one):
   - Visit https://expo.dev/signup
   - Or run `eas login` and follow the prompts

3. **Login to EAS:**
   ```bash
   eas login
   ```

## Build Configuration

The project is already configured with `eas.json` which includes three build profiles:

- **development**: For development builds with dev client
- **preview**: For internal testing (APK format)
- **production**: For production release (APK format)

## Building Production APK

### Step 1: Navigate to the mobile app directory
```bash
cd /Users/janagaran/Programs/poultryco/apps/mobile
```

### Step 2: Configure EAS Project (First time only)
```bash
eas build:configure
```

This will:
- Link your project to an Expo account
- Generate a project ID (update the `projectId` in `app.config.js`)

### Step 3: Build the Production APK

**Option A: Using the npm script (Recommended)**
```bash
npm run build:android
```

**Option B: Using EAS CLI directly**
```bash
eas build --platform android --profile production
```

### Step 4: Monitor the Build
- The build will be processed on Expo's servers
- You'll see a URL to monitor the build progress
- The build typically takes 10-20 minutes

### Step 5: Download the APK
Once the build completes:
- Download the APK from the provided URL
- Or use: `eas build:download --platform android --profile production`

## Building Preview/Test APK

For internal testing before production:
```bash
npm run build:android:preview
```

## Local Development Build (Alternative)

If you want to build locally without EAS (requires Android Studio):
```bash
npx expo run:android --variant release
```

**Note:** This requires:
- Android Studio installed
- Android SDK configured
- Environment variables set up

## Environment Variables

Make sure your `.env.local` file in the mobile directory contains:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

These will be included in the build via `app.config.js`.

## Troubleshooting

### Build fails with "Invalid project ID"
- Run `eas build:configure` to set up the project
- Update the `projectId` in `app.config.js` with the generated ID

### Build fails with authentication error
- Run `eas login` to authenticate
- Make sure you're logged into the correct Expo account

### Environment variables not working
- Ensure `.env.local` exists in the mobile directory
- Check that `app.config.js` is correctly loading the variables
- For production builds, you may need to set secrets in EAS:
  ```bash
  eas secret:create --scope project --name SUPABASE_URL --value your_value
  eas secret:create --scope project --name SUPABASE_ANON_KEY --value your_value
  ```

### APK size is too large
- Enable Hermes engine (already configured in Expo 50+)
- Consider using AAB format for Play Store (change `buildType` to `aab` in eas.json)

## Build Profiles Explained

### Development
- Includes development tools
- Larger file size
- For testing during development

### Preview
- Production-like build
- APK format for easy sharing
- Good for internal testing

### Production
- Optimized for release
- Smallest file size
- Ready for distribution

## Next Steps After Building

1. **Test the APK:**
   - Install on physical devices
   - Test all features thoroughly
   - Check performance and stability

2. **Prepare for Play Store (Optional):**
   - Change build type to `aab` in eas.json for production
   - Set up app signing
   - Create store listings
   - Submit for review

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android App Signing](https://docs.expo.dev/app-signing/app-credentials/)
- [Expo Application Services](https://expo.dev/eas)

## Quick Commands Reference

```bash
# Build production APK
npm run build:android

# Build preview APK
npm run build:android:preview

# Check build status
eas build:list

# Download latest build
eas build:download --platform android

# View build logs
eas build:view

# Cancel a build
eas build:cancel
```

