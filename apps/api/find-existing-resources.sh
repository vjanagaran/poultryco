#!/bin/bash

# Script to find existing AWS resources for PoultryCo API deployment

set -e

AWS_REGION="ap-south-1"

echo "🔍 Finding existing AWS resources..."
echo "📍 Region: ${AWS_REGION}"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI is not installed"
  echo "Please install AWS CLI first (see AWS_CLI_SETUP.md)"
  exit 1
fi

# Find Load Balancers
echo "📊 Existing Load Balancers:"
echo "---------------------------"
aws elbv2 describe-load-balancers \
  --region ${AWS_REGION} \
  --query 'LoadBalancers[*].{Name:LoadBalancerName,DNS:DNSName,ARN:LoadBalancerArn,State:State.Code}' \
  --output table

echo ""
echo "💡 To get details of a specific load balancer:"
echo "   aws elbv2 describe-load-balancers --load-balancer-arns YOUR_LB_ARN --region ${AWS_REGION}"

# Find Target Groups
echo ""
echo "📊 Existing Target Groups:"
echo "---------------------------"
aws elbv2 describe-target-groups \
  --region ${AWS_REGION} \
  --query 'TargetGroups[*].{Name:TargetGroupName,Port:Port,Protocol:Protocol,ARN:TargetGroupArn,HealthCheck:HealthCheckPath}' \
  --output table

# Find ECS Clusters
echo ""
echo "📊 Existing ECS Clusters:"
echo "---------------------------"
aws ecs list-clusters \
  --region ${AWS_REGION} \
  --query 'clusterArns[*]' \
  --output table

# Find ECR Repositories
echo ""
echo "📊 Existing ECR Repositories:"
echo "---------------------------"
aws ecr describe-repositories \
  --region ${AWS_REGION} \
  --query 'repositories[*].{Name:repositoryName,URI:repositoryUri}' \
  --output table

# Find VPCs
echo ""
echo "📊 Existing VPCs:"
echo "---------------------------"
aws ec2 describe-vpcs \
  --region ${AWS_REGION} \
  --query 'Vpcs[*].{ID:VpcId,Name:Tags[?Key==`Name`].Value|[0],CIDR:CidrBlock}' \
  --output table

# Find Subnets
echo ""
echo "📊 Existing Subnets:"
echo "---------------------------"
aws ec2 describe-subnets \
  --region ${AWS_REGION} \
  --query 'Subnets[*].{ID:SubnetId,Name:Tags[?Key==`Name`].Value|[0],VPC:VpcId,AZ:AvailabilityZone,CIDR:CidrBlock}' \
  --output table

# Find Security Groups
echo ""
echo "📊 Existing Security Groups:"
echo "---------------------------"
aws ec2 describe-security-groups \
  --region ${AWS_REGION} \
  --query 'SecurityGroups[*].{ID:GroupId,Name:GroupName,Description:Description}' \
  --output table

echo ""
echo "✅ Resource discovery complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Note the Load Balancer ARN if you want to use an existing one"
echo "   2. Note the VPC ID and Subnet IDs for ECS service"
echo "   3. Note the Security Group IDs"
echo "   4. Update task-definition.json with your resource IDs"

