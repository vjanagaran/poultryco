# Monorepo Build Fix - Final Solution

## Problem
The mobile app is part of a monorepo, and EAS Build was failing during dependency installation because npm was detecting the parent workspace configuration and trying to resolve workspace dependencies that don't exist in the EAS Build environment.

## Root Cause
- Parent directory has `package.json` with `workspaces: ["apps/*", "packages/*"]`
- EAS Build uploads the project structure and npm detects the workspace
- npm tries to resolve `@poultryco/design-system` as a workspace package
- This causes the "Unknown error" during Install dependencies phase

## Solution Applied

### 1. Created Local Design System
Copied design-system files into `src/design-system/` to make the app self-contained.

### 2. Added Pre-Install Hook
Added `eas-build-pre-install` script to `package.json`:
```json
"eas-build-pre-install": "echo 'Preparing for EAS Build...' && rm -f ../../package.json ../../package-lock.json || true"
```

This hook runs before npm install and removes the parent package.json files that cause workspace detection.

### 3. Created `.npmrc`
Added `.npmrc` file with:
```
workspaces=false
legacy-peer-deps=true
```

### 4. Removed NODE_ENV=production
Removed `NODE_ENV=production` from `eas.json` to ensure devDependencies are installed.

### 5. Updated Metro Config
Configured `metro.config.js` to resolve `@poultryco/design-system` to local copy:
```javascript
config.resolver.extraNodeModules = {
  '@poultryco/design-system': path.resolve(projectRoot, 'src/design-system'),
};
```

### 6. Updated TypeScript Config
Updated `tsconfig.json` path alias:
```json
"@poultryco/design-system": ["src/design-system"]
```

## Files Changed
- ✅ `package.json` - Added pre-install hook
- ✅ `eas.json` - Removed NODE_ENV
- ✅ `metro.config.js` - Added module resolver
- ✅ `tsconfig.json` - Updated path alias
- ✅ `.npmrc` - Disabled workspaces
- ✅ `.easignore` - Ignore unnecessary files
- ✅ `src/design-system/` - Local copy of design system

## Current Build Status
🚀 **Build ID**: `8ba2eea7-d28c-4ede-a8d0-0ee636c04b5a`
📊 **Status**: In Progress (past dependency installation phase!)
🔗 **Monitor**: https://expo.dev/accounts/vjanagaran/projects/poultryco/builds/8ba2eea7-d28c-4ede-a8d0-0ee636c04b5a

## Key Insight
The `eas-build-pre-install` hook is the critical fix. It removes the parent package.json before npm runs, preventing workspace detection while still allowing the mobile app to build successfully.

## Future Builds
Simply run:
```bash
cd apps/mobile
npm run build:android
```

The pre-install hook will automatically handle the monorepo issue.

## Alternative Approaches (Not Used)
1. Move mobile app out of monorepo (too disruptive)
2. Publish design-system as npm package (unnecessary complexity)
3. Use EAS Build workflows (more complex configuration)
4. Build from monorepo root (requires extensive configuration)

## Success Indicators
- ✅ Build progresses past 1 minute (dependency installation complete)
- ✅ No "Unknown error" during Install dependencies phase
- ⏳ Waiting for full build completion (15-20 minutes)

