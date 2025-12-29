# Web & Admin Apps - AWS ECS Deployment Guide

**Target Domains:**
- **Web App:** `www.poultryco.net`
- **Admin App:** `admin.poultryco.net`

**ECR Repositories:**
- `511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/web`
- `511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/admin`

**Region:** `ap-south-1` (Mumbai)

---

## Prerequisites

- ✅ AWS CLI configured
- ✅ Docker installed
- ✅ Existing Load Balancer (Maaya)
- ✅ Existing VPC and Security Groups
- ✅ ECS Cluster (`poultryco-cluster`)
- ✅ Live API at `https://api.poultryco.net/v1`

---

## Step 1: Create ECR Repositories

```bash
# Web app repository
aws ecr create-repository \
  --repository-name poultryco/web \
  --region ap-south-1 \
  --image-scanning-configuration scanOnPush=true

# Admin app repository
aws ecr create-repository \
  --repository-name poultryco/admin \
  --region ap-south-1 \
  --image-scanning-configuration scanOnPush=true
```

---

## Step 2: Build and Push Docker Images

### Web App

```bash
cd apps/web

# Build Docker image
docker build --platform linux/amd64 -f Dockerfile -t poultryco/web:latest ../..

# Tag for ECR
docker tag poultryco/web:latest 511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/web:latest

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin 511358949452.dkr.ecr.ap-south-1.amazonaws.com

# Push to ECR
docker push 511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/web:latest
```

### Admin App

```bash
cd apps/admin

# Build Docker image
docker build --platform linux/amd64 -f Dockerfile -t poultryco/admin:latest ../..

# Tag for ECR
docker tag poultryco/admin:latest 511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/admin:latest

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin 511358949452.dkr.ecr.ap-south-1.amazonaws.com

# Push to ECR
docker push 511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/admin:latest
```

---

## Step 3: Create Target Groups

### Web App Target Group

```bash
aws elbv2 create-target-group \
  --name poultryco-web-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-eb4f6783 \
  --target-type ip \
  --health-check-path / \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-south-1
```

### Admin App Target Group

```bash
aws elbv2 create-target-group \
  --name poultryco-admin-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-eb4f6783 \
  --target-type ip \
  --health-check-path / \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-south-1
```

**Note:** Save the Target Group ARNs from the output.

---

## Step 4: Configure Load Balancer Listener Rules

### Get Load Balancer ARN

```bash
aws elbv2 describe-load-balancers \
  --region ap-south-1 \
  --query 'LoadBalancers[?LoadBalancerName==`Maaya`].LoadBalancerArn' \
  --output text
```

### Get HTTP Listener ARN

```bash
LB_ARN=$(aws elbv2 describe-load-balancers --region ap-south-1 --query 'LoadBalancers[?LoadBalancerName==`Maaya`].LoadBalancerArn' --output text)

aws elbv2 describe-listeners \
  --load-balancer-arn $LB_ARN \
  --region ap-south-1 \
  --query 'Listeners[?Port==`80`].ListenerArn' \
  --output text
```

### Create Listener Rules

```bash
LB_ARN=$(aws elbv2 describe-load-balancers --region ap-south-1 --query 'LoadBalancers[?LoadBalancerName==`Maaya`].LoadBalancerArn' --output text)
HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $LB_ARN --region ap-south-1 --query 'Listeners[?Port==`80`].ListenerArn' --output text)

WEB_TG_ARN=$(aws elbv2 describe-target-groups --names poultryco-web-tg --region ap-south-1 --query 'TargetGroups[0].TargetGroupArn' --output text)
ADMIN_TG_ARN=$(aws elbv2 describe-target-groups --names poultryco-admin-tg --region ap-south-1 --query 'TargetGroups[0].TargetGroupArn' --output text)

# Rule for www.poultryco.net (priority 10)
aws elbv2 create-rule \
  --listener-arn $HTTP_LISTENER_ARN \
  --priority 10 \
  --conditions Field=host-header,Values=www.poultryco.net \
  --actions Type=forward,TargetGroupArn=$WEB_TG_ARN \
  --region ap-south-1

# Rule for admin.poultryco.net (priority 20)
aws elbv2 create-rule \
  --listener-arn $HTTP_LISTENER_ARN \
  --priority 20 \
  --conditions Field=host-header,Values=admin.poultryco.net \
  --actions Type=forward,TargetGroupArn=$ADMIN_TG_ARN \
  --region ap-south-1
```

---

## Step 5: Create ECS Task Definitions

See `apps/web/task-definition.json` and `apps/admin/task-definition.json` (to be created).

---

## Step 6: Create ECS Services

### Web App Service

```bash
aws ecs create-service \
  --cluster poultryco-cluster \
  --service-name poultryco-web \
  --task-definition poultryco-web:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-bee8bed6,subnet-f359debf,subnet-45e72e3e],securityGroups=[sg-022cc0dcf25d29ff5],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$WEB_TG_ARN,containerName=poultryco-web,containerPort=3000" \
  --region ap-south-1
```

### Admin App Service

```bash
aws ecs create-service \
  --cluster poultryco-cluster \
  --service-name poultryco-admin \
  --task-definition poultryco-admin:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-bee8bed6,subnet-f359debf,subnet-45e72e3e],securityGroups=[sg-022cc0dcf25d29ff5],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$ADMIN_TG_ARN,containerName=poultryco-admin,containerPort=3001" \
  --region ap-south-1
```

---

## Step 7: Configure DNS

In your DNS provider, create:

### For www.poultryco.net
- **Type:** `A` (ALIAS) or `CNAME`
- **Name:** `www`
- **Target:** `Maaya-136239732.ap-south-1.elb.amazonaws.com` (or your ALB DNS name)

### For admin.poultryco.net
- **Type:** `A` (ALIAS) or `CNAME`
- **Name:** `admin`
- **Target:** `Maaya-136239732.ap-south-1.elb.amazonaws.com` (or your ALB DNS name)

---

## Step 8: Environment Variables

Both apps need:
- `NEXT_PUBLIC_API_URL=https://api.poultryco.net/v1`
- `NODE_ENV=production`

Store in ECS task definition or AWS Secrets Manager.

---

## Deployment Scripts

See:
- `apps/web/deploy.sh`
- `apps/admin/deploy.sh`

---

## Monitoring

```bash
# View logs
aws logs tail /ecs/poultryco-web --follow --region ap-south-1
aws logs tail /ecs/poultryco-admin --follow --region ap-south-1

# Check service status
aws ecs describe-services \
  --cluster poultryco-cluster \
  --services poultryco-web poultryco-admin \
  --region ap-south-1
```

---

## Troubleshooting

### Build Issues
- Ensure `output: 'standalone'` is in `next.config.mjs`
- Check Docker build logs for errors
- Verify all dependencies are installed

### Health Check Failures
- Verify security group allows port 3000/3001 from load balancer
- Check container logs for startup errors
- Verify health check path is correct

### DNS Issues
- Wait for DNS propagation (5-30 minutes)
- Verify DNS records point to correct ALB
- Test with `nslookup www.poultryco.net`

---

**Last Updated:** 2025-12-29

