# 🚀 Build Production APK - PoultryCo Mobile

## Quick Start (3 Steps)

### 1️⃣ Configure EAS Project (First Time Only)

```bash
cd apps/mobile
eas build:configure --platform android
```

Answer **Y** when prompted to create an EAS project.

### 2️⃣ Build Production APK

```bash
npm run build:android
```

### 3️⃣ Download APK

Wait 15-20 minutes for the build to complete, then download from the provided URL or run:

```bash
eas build:download --platform android
```

---

## 🎯 Alternative: Use the Interactive Script

```bash
cd apps/mobile
./build-apk.sh
```

This script provides an interactive menu with options to:
1. Build production APK
2. Build preview APK
3. Configure EAS project
4. Check build status
5. Download latest build

---

## ✅ What's Already Set Up

- ✅ EAS CLI installed
- ✅ Logged in as: **vjanagaran**
- ✅ `eas.json` configuration created
- ✅ Build scripts added to `package.json`
- ✅ Environment variables configured

---

## 📋 Build Profiles

### Production
```bash
npm run build:android
```
- Optimized for production release
- Smallest file size
- Ready for distribution

### Preview (Testing)
```bash
npm run build:android:preview
```
- For internal testing
- Easy to share APK

---

## 📚 Documentation

- **Quick Guide**: `apps/mobile/BUILD_APK_NOW.md`
- **Detailed Guide**: `apps/mobile/BUILD_GUIDE.md`
- **Interactive Script**: `apps/mobile/build-apk.sh`

---

## 🔧 System Requirements

- ✅ Node.js 20+ (installed)
- ✅ npm 10+ (installed)
- ✅ EAS CLI (installed)
- ✅ Expo account (logged in)

---

## 🎉 You're Ready!

Run this now to start building:

```bash
cd apps/mobile
eas build:configure --platform android
npm run build:android
```

Your production APK will be ready in about 15-20 minutes! 🎊

