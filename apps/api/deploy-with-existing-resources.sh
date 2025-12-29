#!/bin/bash

# Deploy PoultryCo API using existing AWS resources
# Uses existing load balancer "Maaya", VPC, and security groups

set -e

AWS_REGION="ap-south-1"
ECS_CLUSTER="poultryco-cluster"
ECS_SERVICE="poultryco-api"

# Existing Resources (from your AWS account)
LOAD_BALANCER_ARN="arn:aws:elasticloadbalancing:ap-south-1:511358949452:loadbalancer/app/Maaya/6ac7fdf0d5ef1997"
LOAD_BALANCER_DNS="Maaya-136239732.ap-south-1.elb.amazonaws.com"
VPC_ID="vpc-eb4f6783"
SUBNET_IDS="subnet-bee8bed6,subnet-f359debf,subnet-45e72e3e"
SECURITY_GROUP_ID="sg-022cc0dcf25d29ff5"  # launch-wizard-3
HTTP_LISTENER_ARN="arn:aws:elasticloadbalancing:ap-south-1:511358949452:listener/app/Maaya/6ac7fdf0d5ef1997/548a887f0fbc5d1a"
HTTPS_LISTENER_ARN="arn:aws:elasticloadbalancing:ap-south-1:511358949452:listener/app/Maaya/6ac7fdf0d5ef1997/642544cd2845d526"

echo "🚀 Deploying PoultryCo API with existing resources..."
echo "📍 Region: ${AWS_REGION}"
echo ""

# Step 1: Create Target Group
echo "📦 Step 1: Creating target group for API..."
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
  --output text 2>/dev/null || \
  aws elbv2 describe-target-groups \
    --names poultryco-api-tg \
    --region ${AWS_REGION} \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)

echo "✅ Target Group: ${TARGET_GROUP_ARN}"
echo ""

# Step 2: Add listener rule for api.poultryco.net (HTTP)
echo "📋 Step 2: Adding HTTP listener rule for api.poultryco.net..."
aws elbv2 create-rule \
  --listener-arn ${HTTP_LISTENER_ARN} \
  --priority 100 \
  --conditions Field=host-header,Values=api.poultryco.net \
  --actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
  --region ${AWS_REGION} 2>/dev/null || \
  echo "⚠️  Rule may already exist, continuing..."

echo "✅ HTTP listener rule configured"
echo ""

# Step 3: Add listener rule for api.poultryco.net (HTTPS)
echo "📋 Step 3: Adding HTTPS listener rule for api.poultryco.net..."
aws elbv2 create-rule \
  --listener-arn ${HTTPS_LISTENER_ARN} \
  --priority 100 \
  --conditions Field=host-header,Values=api.poultryco.net \
  --actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
  --region ${AWS_REGION} 2>/dev/null || \
  echo "⚠️  Rule may already exist, continuing..."

echo "✅ HTTPS listener rule configured"
echo ""

# Step 4: Verify ECS service-linked role exists
echo "📋 Step 4: Verifying ECS service-linked role..."
SERVICE_LINKED_ROLE_EXISTS=$(aws iam get-role \
  --role-name AWSServiceRoleForECS \
  --query 'Role.RoleName' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$SERVICE_LINKED_ROLE_EXISTS" = "AWSServiceRoleForECS" ]; then
  echo "✅ ECS service-linked role exists"
else
  echo "⚠️  ECS service-linked role not found"
  echo ""
  echo "This role needs to be created once per AWS account (requires admin access)."
  echo "Run this command with admin credentials:"
  echo ""
  echo "  aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com"
  echo ""
  echo "Or create it in AWS Console:"
  echo "  IAM → Roles → Create role → AWS service → ECS → ECS"
  echo ""
  echo "See ECS_SERVICE_LINKED_ROLE.md for details"
  echo ""
  read -p "Press Enter to continue anyway (will fail if role doesn't exist)..." || true
fi
echo ""

# Step 5: Create ECS cluster (if not exists)
echo "📋 Step 5: Creating ECS cluster (if needed)..."
CLUSTER_EXISTS=$(aws ecs describe-clusters \
  --clusters ${ECS_CLUSTER} \
  --region ${AWS_REGION} \
  --query 'clusters[0].status' \
  --output text 2>/dev/null || echo "INACTIVE")

if [ "$CLUSTER_EXISTS" != "ACTIVE" ]; then
  echo "Creating cluster: ${ECS_CLUSTER}..."
  CLUSTER_OUTPUT=$(aws ecs create-cluster \
    --cluster-name ${ECS_CLUSTER} \
    --region ${AWS_REGION} \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy \
      capacityProvider=FARGATE,weight=1 \
      capacityProvider=FARGATE_SPOT,weight=0 2>&1) || {
    echo "❌ Failed to create cluster"
    echo ""
    echo "Error details:"
    echo "$CLUSTER_OUTPUT" | grep -i "error\|exception\|denied" || echo "$CLUSTER_OUTPUT"
    echo ""
    echo "Common causes:"
    echo "  1. Insufficient IAM permissions (need ecs:CreateCluster)"
    echo "  2. ECS service-linked role issue (though it appears to exist)"
    echo ""
    echo "Your IAM user needs these permissions:"
    echo "  - ecs:CreateCluster"
    echo "  - ecs:DescribeClusters"
    echo "  - iam:PassRole (for service-linked role)"
    echo ""
    echo "See DEPLOYMENT_GUIDE.md for IAM policy requirements"
    exit 1
  }
  echo "✅ Cluster created"
else
  echo "✅ Cluster already exists"
fi
echo ""

# Step 6: Create CloudWatch log group (if not exists)
echo "📋 Step 6: Creating CloudWatch log group (if needed)..."
aws logs create-log-group \
  --log-group-name /ecs/poultryco-api \
  --region ${AWS_REGION} 2>/dev/null || \
  echo "✅ Log group already exists"
echo ""

# Step 7: Register task definition (if not exists)
echo "📋 Step 7: Registering task definition..."
cd "$(dirname "$0")"
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ${AWS_REGION} > /dev/null

echo "✅ Task definition registered"
echo ""

# Get latest task definition
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition poultryco-api \
  --region ${AWS_REGION} \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

# Step 8: Create or update ECS service
echo "🚀 Step 8: Creating/updating ECS service..."
SERVICE_EXISTS=$(aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE} \
  --region ${AWS_REGION} \
  --query 'services[0].status' \
  --output text 2>/dev/null || echo "INACTIVE")

if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
  echo "⚠️  Service already exists, updating network configuration and forcing new deployment..."
  
  # Convert comma-separated subnet IDs to JSON array
  IFS=',' read -ra SUBNET_ARRAY <<< "$SUBNET_IDS"
  SUBNET_JSON="["
  for i in "${!SUBNET_ARRAY[@]}"; do
    if [ $i -gt 0 ]; then
      SUBNET_JSON+=","
    fi
    SUBNET_JSON+="\"${SUBNET_ARRAY[i]}\""
  done
  SUBNET_JSON+="]"
  
  # Create network configuration JSON file
  # Note: assignPublicIp=ENABLED is required for tasks to access AWS Secrets Manager
  # If you have VPC endpoints for Secrets Manager, you can set this to DISABLED
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
  
  # Cleanup
  rm -f /tmp/network-config.json
  
  echo "✅ Service updated with new network configuration"
else
  echo "Creating new service..."
  
  # Convert comma-separated subnet IDs to JSON array
  IFS=',' read -ra SUBNET_ARRAY <<< "$SUBNET_IDS"
  SUBNET_JSON="["
  for i in "${!SUBNET_ARRAY[@]}"; do
    if [ $i -gt 0 ]; then
      SUBNET_JSON+=","
    fi
    SUBNET_JSON+="\"${SUBNET_ARRAY[i]}\""
  done
  SUBNET_JSON+="]"
  
  # Create network configuration JSON file
  # Note: assignPublicIp=ENABLED is required for tasks to access AWS Secrets Manager
  # If you have VPC endpoints for Secrets Manager, you can set this to DISABLED
  cat > /tmp/network-config.json <<EOF
{
  "awsvpcConfiguration": {
    "subnets": ${SUBNET_JSON},
    "securityGroups": ["${SECURITY_GROUP_ID}"],
    "assignPublicIp": "ENABLED"
  }
}
EOF
  
  aws ecs create-service \
    --cluster ${ECS_CLUSTER} \
    --service-name ${ECS_SERVICE} \
    --task-definition ${TASK_DEFINITION} \
    --desired-count 2 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration file:///tmp/network-config.json \
    --load-balancers "targetGroupArn=${TARGET_GROUP_ARN},containerName=poultryco-api,containerPort=3002" \
    --region ${AWS_REGION} > /dev/null
  
  # Cleanup
  rm -f /tmp/network-config.json
  
  echo "✅ Service created"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Details:"
echo "   Cluster: ${ECS_CLUSTER}"
echo "   Service: ${ECS_SERVICE}"
echo "   Load Balancer: ${LOAD_BALANCER_DNS}"
echo "   Target Group: ${TARGET_GROUP_ARN}"
echo ""
echo "🌐 Next Steps:"
echo "   1. Configure DNS: Point api.poultryco.net to ${LOAD_BALANCER_DNS}"
echo "   2. Monitor service:"
echo "      aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
echo "   3. View logs:"
echo "      aws logs tail /ecs/poultryco-api --follow --region ${AWS_REGION}"
echo "   4. Test API (after DNS is configured):"
echo "      curl https://api.poultryco.net/v1/health"

