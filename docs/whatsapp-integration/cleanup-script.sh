#!/bin/bash

# WhatsApp Integration Documentation Cleanup Script
# Moves root-level documentation files to docs/whatsapp-integration/

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs/whatsapp-integration"

echo "🧹 Starting WhatsApp documentation cleanup..."
echo "Root: $ROOT_DIR"
echo "Docs: $DOCS_DIR"
echo ""

# Ensure docs directory exists
mkdir -p "$DOCS_DIR"

# Files to move from root to docs/whatsapp-integration/
FILES_TO_MOVE=(
    "WHATSAPP_INTEGRATION_REVIEW.md"
    "WHATSAPP_FIX_IMPLEMENTATION_GUIDE.md"
    "WHATSAPP_FIX_QUICK_REFERENCE.md"
    "PHONE_EXTRACTION_FIX_SUMMARY.md"
    "WHATSAPP_DEV_VERSION_UPDATE.md"
    "WHATSAPP_INITIALIZATION_LOG_SUMMARY.md"
    "WHATSAPP_LOGS_GUIDE.md"
    "WHATSAPP_ACCOUNTS_STATUS.md"
)

# New names (optional - can keep same names)
NEW_NAMES=(
    "INTEGRATION_REVIEW.md"
    "FIX_IMPLEMENTATION_GUIDE.md"
    "FIX_QUICK_REFERENCE.md"
    "PHONE_EXTRACTION_FIX_SUMMARY.md"
    "DEV_VERSION_UPDATE.md"
    "INITIALIZATION_LOG_SUMMARY.md"
    "LOGS_GUIDE.md"
    "ACCOUNTS_STATUS.md"
)

# Move files
for i in "${!FILES_TO_MOVE[@]}"; do
    OLD_FILE="$ROOT_DIR/${FILES_TO_MOVE[$i]}"
    NEW_FILE="$DOCS_DIR/${NEW_NAMES[$i]}"
    
    if [ -f "$OLD_FILE" ]; then
        echo "📦 Moving ${FILES_TO_MOVE[$i]} → ${NEW_NAMES[$i]}"
        mv "$OLD_FILE" "$NEW_FILE"
    else
        echo "⚠️  File not found: ${FILES_TO_MOVE[$i]}"
    fi
done

# Delete superseded files
SUPERSEDED_FILES=(
    "WHATSAPP_FIX_1_COMPLETE.md"
)

for file in "${SUPERSEDED_FILES[@]}"; do
    if [ -f "$ROOT_DIR/$file" ]; then
        echo "🗑️  Deleting superseded file: $file"
        rm "$ROOT_DIR/$file"
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📁 Documentation is now organized in: docs/whatsapp-integration/"
echo ""
echo "Next steps:"
echo "1. Review moved files"
echo "2. Update any cross-references"
echo "3. Commit changes: git add docs/whatsapp-integration/ && git commit -m 'docs: Consolidate WhatsApp integration documentation'"
echo "4. Create PR"

