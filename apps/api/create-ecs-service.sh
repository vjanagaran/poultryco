#!/bin/bash

# Create ECS Service using existing resources
# This script uses your existing load balancer, VPC, and security groups

set -e

AWS_REGION="ap-south-1"
ECS_CLUSTER="poultryco-cluster"
ECS_SERVICE="poultryco-api"

# Existing Resources (from find-existing-resources.sh output)
LOAD_BALANCER_ARN="arn:aws:elasticloadbalancing:ap-south-1:511358949452:loadbalancer/app/Maaya/6ac7fdf0d5ef1997"
VPC_ID="vpc-eb4f6783"
SUBNET_IDS="subnet-bee8bed6,subnet-f359debf,subnet-45e72e3e"
SECURITY_GROUP_ID="sg-022cc0dcf25d29ff5"  # launch-wizard-3 (or use default: sg-5f0cc333)

echo "🚀 Creating ECS Service for PoultryCo API..."
echo "📍 Region: ${AWS_REGION}"
echo ""

# Step 1: Create Target Group
echo "📦 Step 1: Creating target group..."
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
  --name poultryco-api-tg \
  --protocol HTTP \
  --port 3002 \
  --vpc-id ${VPC_ID} \
  --target-type ip \
  --health-check-path /v1/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ${AWS_REGION} \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "✅ Target Group created: ${TARGET_GROUP_ARN}"
echo ""

# Step 2: Get existing listener (port 80 or 443)
echo "🔍 Step 2: Finding existing listener..."
LISTENER_ARN=$(aws elbv2 describe-listeners \
  --load-balancer-arn ${LOAD_BALANCER_ARN} \
  --region ${AWS_REGION} \
  --query 'Listeners[0].ListenerArn' \
  --output text)

if [ -z "$LISTENER_ARN" ]; then
  echo "❌ No listener found on load balancer"
  exit 1
fi

echo "✅ Found listener: ${LISTENER_ARN}"
echo ""

# Step 3: Add listener rule for api.poultryco.net
echo "📋 Step 3: Adding listener rule for api.poultryco.net..."
aws elbv2 create-rule \
  --listener-arn ${LISTENER_ARN} \
  --priority 100 \
  --conditions Field=host-header,Values=api.poultryco.net \
  --actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
  --region ${AWS_REGION} > /dev/null

echo "✅ Listener rule created"
echo ""

# Step 4: Get latest task definition revision
echo "📋 Step 4: Getting latest task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition poultryco-api \
  --region ${AWS_REGION} \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

if [ -z "$TASK_DEFINITION" ]; then
  echo "❌ Task definition not found. Please run ./ecs-setup.sh first"
  exit 1
fi

echo "✅ Using task definition: ${TASK_DEFINITION}"
echo ""

# Step 5: Create ECS Service
echo "🚀 Step 5: Creating ECS service..."
aws ecs create-service \
  --cluster ${ECS_CLUSTER} \
  --service-name ${ECS_SERVICE} \
  --task-definition ${TASK_DEFINITION} \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS}],securityGroups=[${SECURITY_GROUP_ID}],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=${TARGET_GROUP_ARN},containerName=poultryco-api,containerPort=3002" \
  --region ${AWS_REGION} > /dev/null

echo "✅ ECS Service created!"
echo ""
echo "📊 Service Details:"
echo "   Cluster: ${ECS_CLUSTER}"
echo "   Service: ${ECS_SERVICE}"
echo "   Target Group: ${TARGET_GROUP_ARN}"
echo "   Load Balancer: ${LOAD_BALANCER_ARN}"
echo ""
echo "🔍 Monitor service:"
echo "   aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
echo ""
echo "📝 View logs:"
echo "   aws logs tail /ecs/poultryco-api --follow --region ${AWS_REGION}"

