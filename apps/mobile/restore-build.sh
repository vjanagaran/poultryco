#!/bin/bash

# Restore mobile app after EAS Build

echo "🔄 Restoring mobile app configuration..."

# Restore package.json if backup exists
if [ -f "package.json.backup" ]; then
    mv package.json.backup package.json
    echo "✅ Restored package.json"
fi

echo "✅ Restoration complete!"

