#!/bin/bash

# Update Load Balancer Target Groups to point to EC2 instance
# Registers EC2 instance with web (3000), admin (3001), and API (3002) target groups

set -e

AWS_REGION="ap-south-1"
EC2_INSTANCE_ID="i-0fe2fe8b26041a4f9"
EC2_IP="15.206.247.73"

# Target groups (from existing setup)
WEB_TG_NAME="poultryco-web-tg"
ADMIN_TG_NAME="poultryco-admin-tg"
API_TG_NAME="poultryco-api-tg"

echo "🔧 Updating Load Balancer Target Groups for EC2 instance..."
echo "📍 Region: ${AWS_REGION}"
echo "🖥️  EC2 Instance: ${EC2_INSTANCE_ID} (${EC2_IP})"
echo ""

# Function to get target group ARN
get_tg_arn() {
  local tg_name=$1
  aws elbv2 describe-target-groups \
    --names "${tg_name}" \
    --region ${AWS_REGION} \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text
}

# Function to get target type
get_tg_type() {
  local tg_arn=$1
  aws elbv2 describe-target-groups \
    --target-group-arns "${tg_arn}" \
    --region ${AWS_REGION} \
    --query 'TargetGroups[0].TargetType' \
    --output text
}

# Function to register EC2 instance with target group
register_target() {
  local tg_arn=$1
  local tg_name=$2
  local port=$3
  local target_type=$(get_tg_type "${tg_arn}")
  
  echo "📝 Registering with ${tg_name} (port ${port}, type: ${target_type})..."
  
  # Determine target ID based on target type
  if [ "${target_type}" == "instance" ]; then
    target_id="${EC2_INSTANCE_ID}"
    echo "   Using instance ID: ${target_id}"
  elif [ "${target_type}" == "ip" ]; then
    # Get EC2 private IP
    target_id=$(aws ec2 describe-instances \
      --instance-ids "${EC2_INSTANCE_ID}" \
      --region ${AWS_REGION} \
      --query 'Reservations[0].Instances[0].PrivateIpAddress' \
      --output text)
    echo "   Using private IP: ${target_id}"
  else
    echo "   ❌ Unsupported target type: ${target_type}"
    return 1
  fi
  
  # Check if already registered
  existing=$(aws elbv2 describe-target-health \
    --target-group-arn "${tg_arn}" \
    --region ${AWS_REGION} \
    --query "TargetHealthDescriptions[?Target.Id=='${target_id}' && Target.Port==\`${port}\`]" \
    --output text 2>/dev/null || echo "")
  
  if [ -n "${existing}" ]; then
    echo "   ✅ Target already registered"
    return 0
  fi
  
  # Register the target
  aws elbv2 register-targets \
    --target-group-arn "${tg_arn}" \
    --targets "Id=${target_id},Port=${port}" \
    --region ${AWS_REGION} > /dev/null
  
  echo "   ✅ Successfully registered ${target_id}:${port}"
}

# Get target group ARNs
echo "🔍 Step 1: Getting target group ARNs..."
WEB_TG_ARN=$(get_tg_arn "${WEB_TG_NAME}")
ADMIN_TG_ARN=$(get_tg_arn "${ADMIN_TG_NAME}")
API_TG_ARN=$(get_tg_arn "${API_TG_NAME}")

echo "   Web TG:   ${WEB_TG_ARN}"
echo "   Admin TG: ${ADMIN_TG_ARN}"
echo "   API TG:   ${API_TG_ARN}"
echo ""

# Get EC2 private IP
echo "🔍 Step 2: Getting EC2 instance details..."
EC2_PRIVATE_IP=$(aws ec2 describe-instances \
  --instance-ids "${EC2_INSTANCE_ID}" \
  --region ${AWS_REGION} \
  --query 'Reservations[0].Instances[0].PrivateIpAddress' \
  --output text)
echo "   Private IP: ${EC2_PRIVATE_IP}"
echo ""

# Register targets
echo "📝 Step 3: Registering EC2 instance with target groups..."
register_target "${WEB_TG_ARN}" "${WEB_TG_NAME}" "3000"
register_target "${ADMIN_TG_ARN}" "${ADMIN_TG_NAME}" "3001"
register_target "${API_TG_ARN}" "${API_TG_NAME}" "3002"
echo ""

# Check target health
echo "🏥 Step 4: Checking target health status..."
echo ""
echo "Web Target Group (port 3000):"
aws elbv2 describe-target-health \
  --target-group-arn "${WEB_TG_ARN}" \
  --region ${AWS_REGION} \
  --query 'TargetHealthDescriptions[*].[Target.Id,Target.Port,TargetHealth.State,TargetHealth.Reason]' \
  --output table

echo ""
echo "Admin Target Group (port 3001):"
aws elbv2 describe-target-health \
  --target-group-arn "${ADMIN_TG_ARN}" \
  --region ${AWS_REGION} \
  --query 'TargetHealthDescriptions[*].[Target.Id,Target.Port,TargetHealth.State,TargetHealth.Reason]' \
  --output table

echo ""
echo "API Target Group (port 3002):"
aws elbv2 describe-target-health \
  --target-group-arn "${API_TG_ARN}" \
  --region ${AWS_REGION} \
  --query 'TargetHealthDescriptions[*].[Target.Id,Target.Port,TargetHealth.State,TargetHealth.Reason]' \
  --output table

echo ""
echo "✅ Target group update complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Wait a few minutes for health checks to pass"
echo "   2. Verify targets are healthy: aws elbv2 describe-target-health --target-group-arn <TG_ARN>"
echo "   3. Test via load balancer DNS: http://Maaya-136239732.ap-south-1.elb.amazonaws.com"

