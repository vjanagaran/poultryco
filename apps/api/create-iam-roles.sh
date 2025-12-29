#!/bin/bash

# Create IAM roles required for ECS Fargate tasks
# NOTE: This requires IAM permissions. If you get AccessDenied, use AWS Console instead.
# See CREATE_IAM_ROLES_MANUAL.md for manual steps.

set -e

AWS_ACCOUNT_ID="511358949452"
AWS_REGION="ap-south-1"

echo "🔐 Creating IAM roles for ECS tasks..."
echo "⚠️  Note: This requires IAM permissions. If you get AccessDenied, see CREATE_IAM_ROLES_MANUAL.md"
echo ""

# Step 1: Create ECS Task Execution Role
echo "📋 Step 1: Creating ecsTaskExecutionRole..."

# Trust policy for ECS
cat > /tmp/ecs-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
  2>/dev/null || echo "⚠️  Role may already exist, attaching policies..."

# Attach managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Attach Secrets Manager read policy (required for retrieving secrets)
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite 2>/dev/null || \
  echo "⚠️  SecretsManagerReadWrite policy may already be attached or doesn't exist"

# Create and attach custom policy for Secrets Manager access (more specific)
cat > /tmp/secrets-manager-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:poultryco/*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name SecretsManagerAccess \
  --policy-document file:///tmp/secrets-manager-policy.json 2>/dev/null || \
  echo "⚠️  Policy may already exist"

rm -f /tmp/secrets-manager-policy.json

echo "✅ ecsTaskExecutionRole created/updated with Secrets Manager access"
echo ""

# Step 2: Create ECS Task Role
echo "📋 Step 2: Creating ecsTaskRole..."

# Create role
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
  2>/dev/null || echo "⚠️  Role may already exist, attaching policies..."

# Attach policies for S3, Secrets Manager, etc.
aws iam attach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

echo "✅ ecsTaskRole created/updated"
echo ""

# Cleanup
rm -f /tmp/ecs-trust-policy.json

echo "✅ IAM roles created successfully!"
echo ""
echo "Roles:"
echo "  - ecsTaskExecutionRole: arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole"
echo "  - ecsTaskRole: arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskRole"

