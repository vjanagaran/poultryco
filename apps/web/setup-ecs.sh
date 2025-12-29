#!/bin/bash

# Setup script for Web App ECS infrastructure
# Creates ECR repository, CloudWatch log group, and registers initial task definition

set -e

AWS_REGION="ap-south-1"
AWS_ACCOUNT_ID="511358949452"
ECR_REPOSITORY="poultryco/web"
ECS_CLUSTER="poultryco-cluster"
LOG_GROUP="/ecs/poultryco-web"

echo "🔧 Setting up ECS infrastructure for Web App..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

# Step 1: Create ECR repository
echo ""
echo "📦 Step 1: Creating ECR repository..."
if aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} &> /dev/null; then
    echo "   ✅ Repository already exists"
else
    aws ecr create-repository \
        --repository-name ${ECR_REPOSITORY} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256
    echo "   ✅ Repository created"
fi

# Step 2: Create CloudWatch log group
echo ""
echo "📝 Step 2: Creating CloudWatch log group..."
if aws logs describe-log-groups --log-group-name-prefix ${LOG_GROUP} --region ${AWS_REGION} --query "logGroups[?logGroupName=='${LOG_GROUP}']" --output text | grep -q ${LOG_GROUP}; then
    echo "   ✅ Log group already exists"
else
    aws logs create-log-group \
        --log-group-name ${LOG_GROUP} \
        --region ${AWS_REGION}
    echo "   ✅ Log group created"
fi

# Step 3: Register task definition
echo ""
echo "📋 Step 3: Registering task definition..."
if [ -f "task-definition.json" ]; then
    aws ecs register-task-definition \
        --cli-input-json file://task-definition.json \
        --region ${AWS_REGION} > /dev/null
    echo "   ✅ Task definition registered"
else
    echo "   ⚠️  task-definition.json not found. Skipping."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Build and push Docker image: ./deploy.sh"
echo "  2. Create target group and ECS service (see deployment guide)"

