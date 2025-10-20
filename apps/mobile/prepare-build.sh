#!/bin/bash

# Prepare mobile app for EAS Build by making it standalone
# This script temporarily removes monorepo workspace dependencies

echo "🔧 Preparing mobile app for EAS Build..."

# Create a temporary backup of package.json
cp package.json package.json.backup

# Create .npmrc to disable workspaces
cat > .npmrc << EOF
workspaces=false
legacy-peer-deps=true
EOF

echo "✅ Preparation complete!"
echo "📦 You can now run: eas build --platform android --profile production"
echo ""
echo "⚠️  After building, restore with: ./restore-build.sh"

