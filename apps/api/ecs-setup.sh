#!/bin/bash

# PoultryCo API - ECS Infrastructure Setup Script
# This script sets up the initial ECS infrastructure

set -e

AWS_ACCOUNT_ID="511358949452"
AWS_REGION="ap-south-1"
ECR_REPOSITORY="poultryco/api"
ECS_CLUSTER="poultryco-cluster"
ECS_SERVICE="poultryco-api"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI is not installed or not in PATH"
  echo ""
  echo "Please install AWS CLI:"
  echo "  macOS: brew install awscli"
  echo "  Or visit: https://aws.amazon.com/cli/"
  echo ""
  echo "After installation, configure it with:"
  echo "  aws configure"
  exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS CLI is not configured"
  echo ""
  echo "Please configure AWS CLI with:"
  echo "  aws configure"
  echo ""
  echo "You'll need:"
  echo "  - AWS Access Key ID (from IAM user, NOT root)"
  echo "  - AWS Secret Access Key (from IAM user, NOT root)"
  echo "  - Default region: ap-south-1"
  echo "  - Default output format: json"
  echo ""
  echo "See AWS_ACCESS_KEYS_SETUP.md for instructions on creating IAM user and keys"
  exit 1
fi

echo "🏗️  Setting up ECS infrastructure for PoultryCo API..."
echo "📍 Region: ${AWS_REGION}"

# Step 1: Create ECR repository (if not exists)
echo ""
echo "📦 Step 1: Creating ECR repository..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} 2>/dev/null || \
  aws ecr create-repository \
    --repository-name ${ECR_REPOSITORY} \
    --region ${AWS_REGION} \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256

# Step 2: Create CloudWatch log group
echo ""
echo "📝 Step 2: Creating CloudWatch log group..."
aws logs create-log-group --log-group-name /ecs/poultryco-api --region ${AWS_REGION} 2>/dev/null || \
  echo "Log group already exists"

# Step 3: Create ECS cluster (if not exists)
echo ""
echo "🏭 Step 3: Creating ECS cluster..."
aws ecs describe-clusters --clusters ${ECS_CLUSTER} --region ${AWS_REGION} 2>/dev/null || \
  aws ecs create-cluster \
    --cluster-name ${ECS_CLUSTER} \
    --region ${AWS_REGION} \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy \
      capacityProvider=FARGATE,weight=1 \
      capacityProvider=FARGATE_SPOT,weight=0

# Step 4: Register task definition
echo ""
echo "📋 Step 4: Registering task definition..."
cd "$(dirname "$0")"
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ${AWS_REGION}

echo ""
echo "✅ Infrastructure setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Application Load Balancer (see deployment guide)"
echo "2. Create ECS service (see deployment guide)"
echo "3. Run ./deploy.sh to build and deploy"

