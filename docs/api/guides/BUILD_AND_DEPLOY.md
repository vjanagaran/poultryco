# Build and Deploy Docker Image to ECR

## Problem

The ECS service cannot start tasks because the Docker image doesn't exist in ECR:
```
CannotPullContainerError: pull image manifest has been retried 7 time(s): 
failed to resolve ref 511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/api:latest: not found
```

## Solution: Build and Push Docker Image

### Option 1: Use Deploy Script (Recommended)

```bash
cd apps/api
chmod +x deploy.sh
./deploy.sh
```

This will:
1. Build the Docker image
2. Tag it for ECR
3. Push to ECR
4. Update the ECS service

### Option 2: Manual Steps

#### 1. Build Docker Image

```bash
cd /Users/vjanagaran/Programs/poultryco

# Build the image
docker build -f apps/api/Dockerfile -t poultryco/api:latest .

# Tag for ECR
docker tag poultryco/api:latest 511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/api:latest
```

#### 2. Login to ECR

```bash
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  511358949452.dkr.ecr.ap-south-1.amazonaws.com
```

#### 3. Push to ECR

```bash
docker push 511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/api:latest
```

#### 4. Update ECS Service

```bash
aws ecs update-service \
  --cluster poultryco-cluster \
  --service poultryco-api \
  --force-new-deployment \
  --region ap-south-1
```

## Verify Image in ECR

```bash
aws ecr describe-images \
  --repository-name poultryco/api \
  --region ap-south-1 \
  --query 'imageDetails[*].{Tags:imageTags,PushedAt:imagePushedAt}' \
  --output table
```

## After Pushing Image

Once the image is pushed, ECS will automatically:
1. Pull the image
2. Start tasks
3. Register with target group
4. Pass health checks

Monitor with:

```bash
# Check service status
aws ecs describe-services \
  --cluster poultryco-cluster \
  --services poultryco-api \
  --region ap-south-1 \
  --query 'services[0].{RunningCount:runningCount,DesiredCount:desiredCount}'

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names poultryco-api-tg --region ap-south-1 --query 'TargetGroups[0].TargetGroupArn' --output text) \
  --region ap-south-1

# Test API
curl https://api.poultryco.net/v1/health
```

## Troubleshooting

### Error: "CannotPullContainerError"
- Image doesn't exist in ECR → Build and push image
- ECR repository doesn't exist → Run `./ecs-setup.sh` first
- Wrong image tag → Check task definition uses correct tag

### Error: "AccessDenied" when pushing
- ECR permissions missing → Ensure IAM user has `ecr:PutImage` permission

### Build fails
- Check Dockerfile syntax
- Ensure all dependencies are available
- Check build logs for specific errors

