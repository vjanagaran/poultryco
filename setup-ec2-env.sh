#!/bin/bash

# EC2 Environment Setup Script
# Configures environment variables from AWS Secrets Manager

set -e

echo "🔧 Setting up EC2 environment..."

# Create logs directory
mkdir -p ~/poultryco/logs

# Create WhatsApp sessions directory
mkdir -p ~/poultryco/apps/api/whatsapp-sessions
chmod 755 ~/poultryco/apps/api/whatsapp-sessions

# Install unzip if not available (needed for AWS CLI)
if ! command -v unzip &> /dev/null; then
    echo "Installing unzip..."
    sudo apt-get update -y
    sudo apt-get install -y unzip
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Configure AWS region
export AWS_REGION="ap-south-1"
export AWS_DEFAULT_REGION="ap-south-1"

# Create .env file for API from Secrets Manager
echo "📝 Fetching secrets from AWS Secrets Manager..."

# Function to get secret value
get_secret() {
    local secret_name=$1
    aws secretsmanager get-secret-value \
        --secret-id "$secret_name" \
        --region ap-south-1 \
        --query SecretString \
        --output text 2>/dev/null || echo ""
}

# Fetch secrets and create .env file
# Note: Values are quoted to handle spaces and special characters
cat > ~/poultryco/apps/api/.env << EOF
# Environment
NODE_ENV=production
PORT=3002
API_PREFIX=v1

# CORS
CORS_ORIGIN=https://poultryco.net,https://www.poultryco.net,https://admin.poultryco.net,http://localhost:3000,http://localhost:3001
ADMIN_URL=https://admin.poultryco.net,http://localhost:3001,http://localhost:3000

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Database
# Note: URL-encode the password part to handle # character (dotenv treats # as comment)
# Extract and encode password from DATABASE_URL
DB_URL=$(get_secret "poultryco/database-url")
# If password contains #, URL-encode it (convert # to %23)
if [[ "$DB_URL" == *"#"* ]]; then
  # Extract parts: postgresql://user:password@host
  DB_URL_ENCODED=$(echo "$DB_URL" | sed 's/\(postgresql:\/\/[^:]*:\)\([^@]*\)\(@.*\)/\1'"$(echo "$DB_URL" | sed 's/.*:\([^@]*\)@.*/\1/' | sed 's/#/%23/g')"'\3/')
  # More robust: use perl or python if available, otherwise manual encoding
  if command -v python3 &> /dev/null; then
    DATABASE_URL=$(python3 -c "import urllib.parse; url='$DB_URL'; parts=url.split('@'); auth=parts[0]; rest='@'.join(parts[1:]); protocol_user=auth.rsplit(':', 1)[0]; password=auth.rsplit(':', 1)[1] if ':' in auth else ''; encoded_pass=urllib.parse.quote(password, safe=''); print(f'{protocol_user}:{encoded_pass}@{rest}')")
  else
    # Fallback: simple sed replacement for # -> %23
    DATABASE_URL=$(echo "$DB_URL" | sed 's/#/%23/g')
  fi
else
  DATABASE_URL="$DB_URL"
fi

# JWT Secrets
JWT_SECRET="$(get_secret "poultryco/jwt-secret")"
ADMIN_JWT_SECRET="$(get_secret "poultryco/admin-jwt-secret")"

# AWS SES
SES_SMTP_HOST="$(get_secret "poultryco/ses-smtp-host")"
SES_SMTP_USERNAME="$(get_secret "poultryco/ses-smtp-username")"
SES_SMTP_PASSWORD="$(get_secret "poultryco/ses-smtp-password")"
SES_SENDER_EMAIL="$(get_secret "poultryco/ses-sender-email")"
AWS_REGION="$(get_secret "poultryco/aws-region")"

# S3
S3_BUCKET_NAME="$(get_secret "poultryco/s3-bucket-name")"
AWS_ACCESS_KEY_ID="$(get_secret "poultryco/aws-access-key-id")"
AWS_SECRET_ACCESS_KEY="$(get_secret "poultryco/aws-secret-access-key")"
EOF

echo "✅ Environment file created"

# Verify Chromium path (Ubuntu standard location)
if [ -f "/usr/bin/chromium-browser" ]; then
    echo "✅ Chromium found at /usr/bin/chromium-browser"
elif [ -f "/snap/bin/chromium" ]; then
    echo "✅ Chromium found at /snap/bin/chromium (snap package)"
    # Create symlink for consistency
    sudo ln -sf /snap/bin/chromium /usr/bin/chromium-browser 2>/dev/null || true
else
    echo "⚠️  Warning: Chromium not found. Installing..."
    sudo apt-get update -y
    sudo apt-get install -y chromium-browser
fi

# Verify /dev/shm size
SHM_SIZE=$(df -h /dev/shm | tail -1 | awk '{print $2}')
echo "📊 /dev/shm size: ${SHM_SIZE}"

# Create systemd service for PM2 (if needed)
if [ ! -f "/etc/systemd/system/pm2-ubuntu.service" ]; then
    echo "📝 PM2 systemd service will be created by 'pm2 startup' command"
fi

echo "✅ Environment setup complete"

