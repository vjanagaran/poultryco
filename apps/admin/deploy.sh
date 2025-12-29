#!/bin/bash

# PoultryCo Admin App - AWS ECS Deployment Script
# Usage: ./deploy.sh [version-tag]

set -e

# Configuration
AWS_ACCOUNT_ID="511358949452"
AWS_REGION="ap-south-1"
ECR_REPOSITORY="poultryco/admin"
ECS_CLUSTER="poultryco-cluster"
ECS_SERVICE="poultryco-admin"
IMAGE_TAG=${1:-latest}

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo "🚀 Starting deployment..."
echo "📍 Region: ${AWS_REGION}"
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 ECR Repository: ${ECR_URI}"

# Step 1: Build Docker image
echo ""
echo "📦 Step 1: Building Docker image..."
cd "$(dirname "$0")/../.."  # Go to repo root
docker build --platform linux/amd64 -f apps/admin/Dockerfile -t ${ECR_REPOSITORY}:${IMAGE_TAG} .
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

# Step 4: Register task definition
echo ""
echo "📋 Step 4: Registering task definition..."
aws ecs register-task-definition \
  --cli-input-json file://apps/admin/task-definition.json \
  --region ${AWS_REGION} > /dev/null

# Step 5: Check if service exists and create/update accordingly
echo ""
echo "🔄 Step 5: Checking ECS service..."

# Use existing resources (same as API and Web)
SUBNET_IDS="subnet-bee8bed6,subnet-f359debf,subnet-45e72e3e"
SECURITY_GROUP_ID="sg-022cc0dcf25d29ff5"
ADMIN_TG_ARN="arn:aws:elasticloadbalancing:ap-south-1:511358949452:targetgroup/poultryco-admin-tg/2fd2cfa1eee75af3"

# Check if service exists
SERVICE_EXISTS=$(aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE} \
  --region ${AWS_REGION} \
  --query 'services[0].status' \
  --output text 2>/dev/null || echo "INACTIVE")

# Get latest task definition
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition poultryco-admin \
  --region ${AWS_REGION} \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
  echo "   ✅ Service exists, updating..."
  
  # Convert subnet IDs to JSON array
  IFS=',' read -ra SUBNET_ARRAY <<< "$SUBNET_IDS"
  SUBNET_JSON="["
  for i in "${!SUBNET_ARRAY[@]}"; do
    if [ $i -gt 0 ]; then
      SUBNET_JSON+=","
    fi
    SUBNET_JSON+="\"${SUBNET_ARRAY[i]}\""
  done
  SUBNET_JSON+="]"
  
  # Create network configuration JSON
  cat > /tmp/network-config.json <<EOF
{
  "awsvpcConfiguration": {
    "subnets": ${SUBNET_JSON},
    "securityGroups": ["${SECURITY_GROUP_ID}"],
    "assignPublicIp": "ENABLED"
  }
}
EOF
  
  aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --task-definition ${TASK_DEFINITION} \
    --network-configuration file:///tmp/network-config.json \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null
  
  rm -f /tmp/network-config.json
  echo "   ✅ Service updated"
else
  echo "   ⚠️  Service doesn't exist, creating..."
  
  # Convert subnet IDs to JSON array
  IFS=',' read -ra SUBNET_ARRAY <<< "$SUBNET_IDS"
  SUBNET_JSON="["
  for i in "${!SUBNET_ARRAY[@]}"; do
    if [ $i -gt 0 ]; then
      SUBNET_JSON+=","
    fi
    SUBNET_JSON+="\"${SUBNET_ARRAY[i]}\""
  done
  SUBNET_JSON+="]"
  
  # Create network configuration JSON
  cat > /tmp/network-config.json <<EOF
{
  "awsvpcConfiguration": {
    "subnets": ${SUBNET_JSON},
    "securityGroups": ["${SECURITY_GROUP_ID}"],
    "assignPublicIp": "ENABLED"
  }
}
EOF
  
  # Create service
  aws ecs create-service \
    --cluster ${ECS_CLUSTER} \
    --service-name ${ECS_SERVICE} \
    --task-definition ${TASK_DEFINITION} \
    --desired-count 2 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration file:///tmp/network-config.json \
    --load-balancers "targetGroupArn=${ADMIN_TG_ARN},containerName=poultryco-admin,containerPort=3001" \
    --region ${AWS_REGION} > /dev/null
  
  rm -f /tmp/network-config.json
  echo "   ✅ Service created"
fi

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Monitor deployment:"
echo "   aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
echo ""
echo "📝 View logs:"
echo "   aws logs tail /ecs/${ECS_SERVICE} --follow --region ${AWS_REGION}"

