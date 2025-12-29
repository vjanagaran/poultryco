#!/bin/bash

# Create AWS Secrets Manager secrets for PoultryCo API
# This script creates all required secrets for ECS deployment

set -e

AWS_REGION="ap-south-1"
SECRET_PREFIX="poultryco"

echo "🔐 Creating AWS Secrets Manager secrets for PoultryCo API..."
echo "📍 Region: ${AWS_REGION}"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS CLI is not configured"
  echo "Please run: aws configure"
  exit 1
fi

# Function to create secret if it doesn't exist
create_secret() {
  local secret_name=$1
  local secret_value=$2
  local description=$3
  
  echo "📋 Creating secret: ${SECRET_PREFIX}/${secret_name}..."
  
  # Check if secret exists
  if aws secretsmanager describe-secret \
    --secret-id "${SECRET_PREFIX}/${secret_name}" \
    --region ${AWS_REGION} &> /dev/null; then
    echo "⚠️  Secret already exists, updating..."
    aws secretsmanager update-secret \
      --secret-id "${SECRET_PREFIX}/${secret_name}" \
      --secret-string "${secret_value}" \
      --description "${description}" \
      --region ${AWS_REGION} > /dev/null
    echo "✅ Secret updated"
  else
    aws secretsmanager create-secret \
      --name "${SECRET_PREFIX}/${secret_name}" \
      --secret-string "${secret_value}" \
      --description "${description}" \
      --region ${AWS_REGION} > /dev/null
    echo "✅ Secret created"
  fi
  echo ""
}

# Prompt for values or use defaults
echo "📝 Please provide the following values (press Enter to use defaults or skip):"
echo ""

# Database URL
read -p "Database URL (postgresql://user:pass@host:5432/dbname?sslmode=require): " DB_URL
if [ -z "$DB_URL" ]; then
  DB_URL="postgresql://user:password@host:5432/poultryco?sslmode=require"
  echo "⚠️  Using placeholder database URL. Please update later!"
fi

# JWT Secrets
read -p "JWT Secret (press Enter to generate random): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  echo "✅ Generated random JWT secret"
fi

read -p "Admin JWT Secret (press Enter to generate random): " ADMIN_JWT_SECRET
if [ -z "$ADMIN_JWT_SECRET" ]; then
  ADMIN_JWT_SECRET=$(openssl rand -hex 32)
  echo "✅ Generated random Admin JWT secret"
fi

# AWS SES SMTP
read -p "SES SMTP Host (default: email-smtp.ap-south-1.amazonaws.com): " SES_SMTP_HOST
SES_SMTP_HOST=${SES_SMTP_HOST:-"email-smtp.ap-south-1.amazonaws.com"}

read -p "SES SMTP Username: " SES_SMTP_USERNAME
if [ -z "$SES_SMTP_USERNAME" ]; then
  SES_SMTP_USERNAME="YOUR_SES_SMTP_USERNAME"
  echo "⚠️  Using placeholder. Please update later!"
fi

read -p "SES SMTP Password: " SES_SMTP_PASSWORD
if [ -z "$SES_SMTP_PASSWORD" ]; then
  SES_SMTP_PASSWORD="YOUR_SES_SMTP_PASSWORD"
  echo "⚠️  Using placeholder. Please update later!"
fi

read -p "SES Sender Email (default: noreply@poultryco.net): " SES_SENDER_EMAIL
SES_SENDER_EMAIL=${SES_SENDER_EMAIL:-"noreply@poultryco.net"}

# AWS Credentials
read -p "AWS Region (default: ap-south-1): " AWS_REGION_VALUE
AWS_REGION_VALUE=${AWS_REGION_VALUE:-"ap-south-1"}

read -p "S3 Bucket Name (default: poultryco-cdn): " S3_BUCKET_NAME
S3_BUCKET_NAME=${S3_BUCKET_NAME:-"poultryco-cdn"}

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
  echo "⚠️  Using placeholder. Please update later!"
fi

read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
  echo "⚠️  Using placeholder. Please update later!"
fi

# Cognito (optional for now)
read -p "Cognito User Pool ID (optional, press Enter to skip): " COGNITO_USER_POOL_ID
COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID:-"YOUR_COGNITO_USER_POOL_ID"}

read -p "Cognito Client ID (optional, press Enter to skip): " COGNITO_CLIENT_ID
COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID:-"YOUR_COGNITO_CLIENT_ID"}

echo ""
echo "🚀 Creating secrets..."
echo ""

# Create all secrets
create_secret "database-url" "${DB_URL}" "PostgreSQL database connection URL"
create_secret "jwt-secret" "${JWT_SECRET}" "JWT secret key for user authentication"
create_secret "admin-jwt-secret" "${ADMIN_JWT_SECRET}" "JWT secret key for admin authentication"
create_secret "ses-smtp-host" "${SES_SMTP_HOST}" "AWS SES SMTP hostname"
create_secret "ses-smtp-username" "${SES_SMTP_USERNAME}" "AWS SES SMTP username"
create_secret "ses-smtp-password" "${SES_SMTP_PASSWORD}" "AWS SES SMTP password"
create_secret "ses-sender-email" "${SES_SENDER_EMAIL}" "Default sender email for SES"
create_secret "aws-region" "${AWS_REGION_VALUE}" "AWS region"
create_secret "s3-bucket-name" "${S3_BUCKET_NAME}" "S3 bucket name for file uploads"
create_secret "aws-access-key-id" "${AWS_ACCESS_KEY_ID}" "AWS access key ID for S3 access"
create_secret "aws-secret-access-key" "${AWS_SECRET_ACCESS_KEY}" "AWS secret access key for S3 access"
create_secret "cognito-user-pool-id" "${COGNITO_USER_POOL_ID}" "AWS Cognito User Pool ID"
create_secret "cognito-client-id" "${COGNITO_CLIENT_ID}" "AWS Cognito Client ID"

echo "✅ All secrets created/updated!"
echo ""
echo "📋 Summary:"
echo "   Region: ${AWS_REGION}"
echo "   Secret prefix: ${SECRET_PREFIX}/"
echo ""
echo "⚠️  Important: Review and update any placeholder values:"
echo "   - Database URL"
echo "   - SES SMTP credentials"
echo "   - AWS credentials"
echo "   - Cognito IDs (if using)"
echo ""
echo "To update a secret later:"
echo "   aws secretsmanager update-secret \\"
echo "     --secret-id ${SECRET_PREFIX}/secret-name \\"
echo "     --secret-string \"new-value\" \\"
echo "     --region ${AWS_REGION}"

