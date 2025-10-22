# 🚀 Build Production APK - Quick Start

## ✅ Setup Complete!

I've configured your project with:
- ✅ `eas.json` - Build configuration file
- ✅ Build scripts in `package.json`
- ✅ EAS CLI is installed
- ✅ You're logged in as: **vjanagaran**

## 📱 Build Your Production APK Now

### Step 1: Configure EAS Project (One-time setup)

Open your terminal and run:

```bash
cd /Users/janagaran/Programs/poultryco/apps/mobile
eas build:configure --platform android
```

When prompted:
- **"Would you like to automatically create an EAS project?"** → Answer **Y** (Yes)
- This will create a project ID and link it to your Expo account

### Step 2: Build the Production APK

After configuration, run:

```bash
npm run build:android
```

Or directly:

```bash
eas build --platform android --profile production
```

### Step 3: Monitor the Build

- You'll see a URL like: `https://expo.dev/accounts/vjanagaran/projects/poultryco/builds/...`
- Click it to watch the build progress in your browser
- Build typically takes **10-20 minutes**

### Step 4: Download Your APK

Once complete:
- Download from the URL provided
- Or run: `eas build:download --platform android`

---

## 🎯 Quick Commands

```bash
# Navigate to mobile directory
cd /Users/janagaran/Programs/poultryco/apps/mobile

# Configure project (first time only)
eas build:configure --platform android

# Build production APK
npm run build:android

# Build preview/test APK
npm run build:android:preview

# Check build status
eas build:list

# Download latest build
eas build:download --platform android
```

---

## 🔧 Build Profiles Available

### Production (Recommended for release)
```bash
npm run build:android
```
- Optimized for production
- Smallest file size
- Ready for distribution

### Preview (For testing)
```bash
npm run build:android:preview
```
- Good for internal testing
- APK format for easy sharing

---

## 📋 What Happens During Build?

1. **Upload**: Your code is uploaded to Expo's build servers
2. **Install**: Dependencies are installed
3. **Build**: Android APK is compiled
4. **Sign**: App is signed with auto-generated credentials
5. **Download**: APK is ready for download

---

## 🔐 Environment Variables

Your `.env.local` file is detected and will be included in the build.

If you need to use secrets in EAS (recommended for production):

```bash
eas secret:create --scope project --name SUPABASE_URL --value "your_value"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your_value"
```

---

## ❓ Troubleshooting

### "Invalid project ID" error
- Run `eas build:configure` first
- Make sure you answer "Y" to create the project

### Build fails
- Check the build logs in the Expo dashboard
- Ensure all dependencies are properly installed
- Verify environment variables are set

### Can't download APK
- Use: `eas build:download --platform android`
- Or download directly from the Expo dashboard

---

## 📦 After Building

1. **Test the APK**:
   - Transfer to your Android device
   - Install and test all features
   - Check performance

2. **Share with testers**:
   - Share the APK file directly
   - Or use the Expo link for easy distribution

3. **Prepare for Play Store** (optional):
   - Change `buildType` to `"aab"` in `eas.json`
   - Set up proper app signing
   - Create store listings

---

## 🎉 Ready to Build!

Run these commands now:

```bash
cd /Users/janagaran/Programs/poultryco/apps/mobile
eas build:configure --platform android
npm run build:android
```

That's it! Your production APK will be ready in about 15-20 minutes.

---

## 📚 Additional Resources

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Detailed Build Guide](./BUILD_GUIDE.md)
- [Expo Dashboard](https://expo.dev/accounts/vjanagaran/projects)

---

**Need help?** Check the detailed `BUILD_GUIDE.md` in this directory.

