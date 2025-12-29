#!/bin/bash

# PoultryCo Web App - AWS ECS Deployment Script
# Usage: ./deploy.sh [version-tag]

set -e

# Configuration
AWS_ACCOUNT_ID="511358949452"
AWS_REGION="ap-south-1"
ECR_REPOSITORY="poultryco/web"
ECS_CLUSTER="poultryco-cluster"
ECS_SERVICE="poultryco-web"
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
docker build --platform linux/amd64 -f apps/web/Dockerfile -t ${ECR_REPOSITORY}:${IMAGE_TAG} .
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
  --cli-input-json file://apps/web/task-definition.json \
  --region ${AWS_REGION} > /dev/null

# Step 5: Check if service exists and create/update accordingly
echo ""
echo "🔄 Step 5: Checking ECS service..."

# Use existing resources (same as API)
SUBNET_IDS="subnet-bee8bed6,subnet-f359debf,subnet-45e72e3e"
SECURITY_GROUP_ID="sg-022cc0dcf25d29ff5"
LOAD_BALANCER_ARN="arn:aws:elasticloadbalancing:ap-south-1:511358949452:loadbalancer/app/Maaya/6ac7fdf0d5ef1997"

# Check if service exists
SERVICE_EXISTS=$(aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE} \
  --region ${AWS_REGION} \
  --query 'services[0].status' \
  --output text 2>/dev/null || echo "INACTIVE")

# Get latest task definition
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition poultryco-web \
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
  
  # Check if target group exists
  TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
    --names poultryco-web-tg \
    --region ${AWS_REGION} \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text 2>/dev/null || echo "")
  
  if [ -z "$TARGET_GROUP_ARN" ] || [ "$TARGET_GROUP_ARN" = "None" ]; then
    echo "   📋 Creating target group..."
    # Get VPC ID from first subnet
    FIRST_SUBNET=$(echo $SUBNET_IDS | cut -d',' -f1)
    VPC_ID=$(aws ec2 describe-subnets \
      --subnet-ids ${FIRST_SUBNET} \
      --region ${AWS_REGION} \
      --query 'Subnets[0].VpcId' \
      --output text)
    
    TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
      --name poultryco-web-tg \
      --protocol HTTP \
      --port 3000 \
      --vpc-id ${VPC_ID} \
      --target-type ip \
      --health-check-path / \
      --health-check-interval-seconds 30 \
      --health-check-timeout-seconds 5 \
      --healthy-threshold-count 2 \
      --unhealthy-threshold-count 3 \
      --region ${AWS_REGION} \
      --query 'TargetGroups[0].TargetGroupArn' \
      --output text)
    echo "   ✅ Target group created: ${TARGET_GROUP_ARN}"
    
    # Add listener rule for www.poultryco.net
    HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners \
      --load-balancer-arn ${LOAD_BALANCER_ARN} \
      --region ${AWS_REGION} \
      --query 'Listeners[?Port==`80`].ListenerArn' \
      --output text)
    
    if [ ! -z "$HTTP_LISTENER_ARN" ] && [ "$HTTP_LISTENER_ARN" != "None" ]; then
      echo "   📋 Adding listener rule for www.poultryco.net..."
      
      # Check if rule already exists
      EXISTING_RULE=$(aws elbv2 describe-rules \
        --listener-arn ${HTTP_LISTENER_ARN} \
        --region ${AWS_REGION} \
        --query "Rules[?Actions[?TargetGroupArn=='${TARGET_GROUP_ARN}']].RuleArn" \
        --output text 2>/dev/null || echo "")
      
      if [ -z "$EXISTING_RULE" ] || [ "$EXISTING_RULE" = "None" ]; then
        # Find available priority (try 10, 20, 30, etc.)
        PRIORITY=10
        while [ $PRIORITY -lt 50000 ]; do
          PRIORITY_IN_USE=$(aws elbv2 describe-rules \
            --listener-arn ${HTTP_LISTENER_ARN} \
            --region ${AWS_REGION} \
            --query "Rules[?Priority=='${PRIORITY}'].Priority" \
            --output text 2>/dev/null || echo "")
          
          if [ -z "$PRIORITY_IN_USE" ] || [ "$PRIORITY_IN_USE" = "None" ]; then
            break
          fi
          PRIORITY=$((PRIORITY + 10))
        done
        
        aws elbv2 create-rule \
          --listener-arn ${HTTP_LISTENER_ARN} \
          --priority ${PRIORITY} \
          --conditions Field=host-header,Values=www.poultryco.net \
          --actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
          --region ${AWS_REGION} > /dev/null
        echo "   ✅ Listener rule created with priority ${PRIORITY}"
      else
        echo "   ✅ Listener rule already exists"
      fi
    fi
  else
    echo "   ✅ Target group exists: ${TARGET_GROUP_ARN}"
    
    # Ensure listener rule exists (target group must be attached to load balancer)
    HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners \
      --load-balancer-arn ${LOAD_BALANCER_ARN} \
      --region ${AWS_REGION} \
      --query 'Listeners[?Port==`80`].ListenerArn' \
      --output text)
    
    if [ ! -z "$HTTP_LISTENER_ARN" ] && [ "$HTTP_LISTENER_ARN" != "None" ]; then
      # Check if rule already exists
      RULE_EXISTS=$(aws elbv2 describe-rules \
        --listener-arn ${HTTP_LISTENER_ARN} \
        --region ${AWS_REGION} \
        --query "Rules[?Conditions[?Field=='host-header' && Values[0]=='www.poultryco.net']]" \
        --output text 2>/dev/null || echo "")
      
      if [ -z "$RULE_EXISTS" ] || [ "$RULE_EXISTS" = "None" ]; then
        echo "   📋 Adding listener rule for www.poultryco.net..."
        
        # Find available priority (try 10, 20, 30, etc.)
        PRIORITY=10
        while [ $PRIORITY -lt 50000 ]; do
          PRIORITY_IN_USE=$(aws elbv2 describe-rules \
            --listener-arn ${HTTP_LISTENER_ARN} \
            --region ${AWS_REGION} \
            --query "Rules[?Priority=='${PRIORITY}'].Priority" \
            --output text 2>/dev/null || echo "")
          
          if [ -z "$PRIORITY_IN_USE" ] || [ "$PRIORITY_IN_USE" = "None" ]; then
            break
          fi
          PRIORITY=$((PRIORITY + 10))
        done
        
        aws elbv2 create-rule \
          --listener-arn ${HTTP_LISTENER_ARN} \
          --priority ${PRIORITY} \
          --conditions Field=host-header,Values=www.poultryco.net \
          --actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
          --region ${AWS_REGION} > /dev/null
        echo "   ✅ Listener rule created with priority ${PRIORITY}"
      else
        echo "   ✅ Listener rule already exists"
      fi
    fi
  fi
  
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
    --load-balancers "targetGroupArn=${TARGET_GROUP_ARN},containerName=poultryco-web,containerPort=3000" \
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

