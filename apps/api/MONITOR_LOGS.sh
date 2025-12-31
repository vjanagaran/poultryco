#!/bin/bash
# WhatsApp Connection Log Monitor
# Monitors both API and Admin logs for WhatsApp-related issues

echo "🔍 Monitoring WhatsApp Connection Logs..."
echo "Press Ctrl+C to stop"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Monitor API logs
tail -f /tmp/api-debug.log 2>/dev/null | while read line; do
  if echo "$line" | grep -qiE "QR|qr"; then
    echo -e "${GREEN}[QR]${NC} $line"
  elif echo "$line" | grep -qiE "authenticated|ready|connected"; then
    echo -e "${GREEN}[AUTH]${NC} $line"
  elif echo "$line" | grep -qiE "error|Error|ERROR|failed|Failed"; then
    echo -e "${RED}[ERROR]${NC} $line"
  elif echo "$line" | grep -qiE "Protocol error|Session closed"; then
    echo -e "${RED}[CRITICAL]${NC} $line"
  elif echo "$line" | grep -qiE "whatsapp|WhatsApp"; then
    echo -e "${BLUE}[WA]${NC} $line"
  fi
done

