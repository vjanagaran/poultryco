#!/bin/bash

# PoultryCo Production APK Build Script
# This script helps you build a production APK for Android

set -e

echo "🚀 PoultryCo Production APK Builder"
echo "===================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed."
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI is installed"
fi

# Check if logged in
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to EAS"
    echo "🔐 Please login..."
    eas login
else
    USERNAME=$(eas whoami)
    echo "✅ Logged in as: $USERNAME"
fi

echo ""
echo "📋 Build Options:"
echo "1. Production APK (recommended for release)"
echo "2. Preview APK (for testing)"
echo "3. Configure EAS project (first time setup)"
echo "4. Check build status"
echo "5. Download latest build"
echo ""

read -p "Select an option (1-5): " option

case $option in
    1)
        echo ""
        echo "🏗️  Building Production APK..."
        echo "This will take about 15-20 minutes."
        echo ""
        npm run build:android
        ;;
    2)
        echo ""
        echo "🏗️  Building Preview APK..."
        echo "This will take about 15-20 minutes."
        echo ""
        npm run build:android:preview
        ;;
    3)
        echo ""
        echo "⚙️  Configuring EAS project..."
        echo ""
        eas build:configure --platform android
        ;;
    4)
        echo ""
        echo "📊 Build Status:"
        echo ""
        eas build:list
        ;;
    5)
        echo ""
        echo "📥 Downloading latest build..."
        echo ""
        eas build:download --platform android
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"

