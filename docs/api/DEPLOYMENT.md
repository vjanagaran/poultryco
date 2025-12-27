# 🚀 PoultryCo API - Deployment Guide

## AWS ECS Fargate Deployment

### Prerequisites

- AWS CLI configured
- Docker installed
- ECR repository created
- ECS cluster created
- RDS PostgreSQL 18.1 instance running (with SSL enabled)
- AWS SES configured for SMTP email delivery
- S3 bucket created
- Secrets Manager secrets created

---

## Step 1: Build and Push Docker Image

```bash
# Navigate to API directory
cd apps/api

# Build Docker image
docker build -t poultryco-api:latest .

# Tag for ECR
docker tag poultryco-api:latest YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/poultryco-api:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Push to ECR
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/poultryco-api:latest
```

---

## Step 2: Create ECS Task Definition

Create `task-definition.json`:

```json
{
  "family": "poultryco-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "poultryco-api",
      "image": "YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/poultryco-api:latest",
      "portMappings": [
        {
          "containerPort": 3002,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3002"
        },
        {
          "name": "API_PREFIX",
          "value": "api/v1"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/jwt-secret"
        },
        {
          "name": "SES_SMTP_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/ses-smtp-host"
        },
        {
          "name": "SES_SMTP_USERNAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/ses-smtp-username"
        },
        {
          "name": "SES_SMTP_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/ses-smtp-password"
        },
        {
          "name": "SES_SENDER_EMAIL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/ses-sender-email"
        },
        {
          "name": "AWS_ACCESS_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/aws-access-key"
        },
        {
          "name": "AWS_SECRET_ACCESS_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:poultryco/aws-secret-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/poultryco-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3002/api/v1/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

---

## Step 3: Create Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name poultryco-api-tg \
  --protocol HTTP \
  --port 3002 \
  --vpc-id YOUR_VPC_ID \
  --target-type ip \
  --health-check-path /api/v1/health \
  --health-check-interval-seconds 30

# Create load balancer
aws elbv2 create-load-balancer \
  --name poultryco-api-lb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn YOUR_LB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=YOUR_TG_ARN
```

---

## Step 4: Create ECS Service

```bash
aws ecs create-service \
  --cluster poultryco-cluster \
  --service-name poultryco-api \
  --task-definition poultryco-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=YOUR_TG_ARN,containerName=poultryco-api,containerPort=3002"
```

---

## Step 5: Configure Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/poultryco-cluster/poultryco-api \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/poultryco-cluster/poultryco-api \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

`scaling-policy.json`:

```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleInCooldown": 300,
  "ScaleOutCooldown": 60
}
```

---

## Step 6: Configure CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name poultryco-api-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# High memory alarm
aws cloudwatch put-metric-alarm \
  --alarm-name poultryco-api-high-memory \
  --alarm-description "Alert when memory exceeds 80%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## Step 7: Setup CI/CD with GitHub Actions

Create `.github/workflows/deploy-api.yml`:

```yaml
name: Deploy API to ECS

on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: poultryco-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd apps/api
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster poultryco-cluster \
            --service poultryco-api \
            --force-new-deployment
```

---

## Monitoring & Maintenance

### CloudWatch Logs

```bash
# View logs
aws logs tail /ecs/poultryco-api --follow

# Filter errors
aws logs filter-log-events \
  --log-group-name /ecs/poultryco-api \
  --filter-pattern "ERROR"
```

### Service Health

```bash
# Check service status
aws ecs describe-services \
  --cluster poultryco-cluster \
  --services poultryco-api

# Check task health
aws ecs list-tasks \
  --cluster poultryco-cluster \
  --service-name poultryco-api

# View task details
aws ecs describe-tasks \
  --cluster poultryco-cluster \
  --tasks TASK_ARN
```

### Rollback

```bash
# List task definition revisions
aws ecs list-task-definitions --family-prefix poultryco-api

# Update service to previous revision
aws ecs update-service \
  --cluster poultryco-cluster \
  --service poultryco-api \
  --task-definition poultryco-api:PREVIOUS_REVISION
```

---

## Cost Optimization

- Use **Fargate Spot** for non-critical workloads
- Enable **Container Insights** selectively
- Set appropriate **CPU/Memory** limits
- Use **S3 lifecycle policies** for old uploads
- Enable **CloudWatch Logs retention** policies

---

## Security Checklist

- ✅ Use Secrets Manager for credentials
- ✅ Enable encryption at rest (RDS, S3)
- ✅ Enable encryption in transit (TLS/SSL)
- ✅ Configure WAF rules
- ✅ Enable VPC Flow Logs
- ✅ Use least privilege IAM roles
- ✅ Enable CloudTrail logging
- ✅ Configure security groups properly
- ✅ Use private subnets for ECS tasks
- ✅ Enable GuardDuty

---

**Deployment Complete! 🎉**

API will be available at: `http://YOUR_LOAD_BALANCER_DNS/api/v1`
