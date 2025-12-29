#!/bin/bash

# PoultryCo API - AWS ECS Deployment Script
# Usage: ./deploy.sh [version-tag]

set -e

# Configuration
AWS_ACCOUNT_ID="511358949452"
AWS_REGION="ap-south-1"
ECR_REPOSITORY="poultryco/api"
ECS_CLUSTER="poultryco-cluster"
ECS_SERVICE="poultryco-api"
IMAGE_TAG=${1:-latest}

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo "🚀 Starting deployment..."
echo "📍 Region: ${AWS_REGION}"
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 ECR Repository: ${ECR_URI}"

# Step 1: Build Docker image
echo ""
echo "📦 Step 1: Building Docker image for linux/amd64 (ECS Fargate requirement)..."
cd "$(dirname "$0")/../.."  # Go to repo root
docker build --platform linux/amd64 -f apps/api/Dockerfile -t ${ECR_REPOSITORY}:${IMAGE_TAG} .
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_URI}:latest

# Step 2: Login to ECR
echo ""
echo "🔐 Step 2: Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_URI}

# Step 3: Push to ECR
echo ""
echo "⬆️  Step 3: Pushing image to ECR..."
docker push ${ECR_URI}:${IMAGE_TAG}
docker push ${ECR_URI}:latest

# Step 4: Update ECS service
echo ""
echo "🔄 Step 4: Updating ECS service..."
aws ecs update-service \
  --cluster ${ECS_CLUSTER} \
  --service ${ECS_SERVICE} \
  --force-new-deployment \
  --region ${AWS_REGION} > /dev/null

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Monitor deployment:"
echo "   aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
echo ""
echo "📝 View logs:"
echo "   aws logs tail /ecs/poultryco-api --follow --region ${AWS_REGION}"

