# Quick Deployment Checklist

## Pre-Deployment

- [ ] AWS CLI configured (`aws configure`)
- [ ] Docker installed and running
- [ ] RDS PostgreSQL instance running
- [ ] AWS Secrets Manager secrets created
- [ ] S3 bucket created
- [ ] DNS access for `poultryco.net` (any DNS provider)

## Deployment Steps

### 1. Initial Setup (One-time)

```bash
cd apps/api
./ecs-setup.sh
```

### 2. Create Secrets in AWS Secrets Manager

See `DEPLOYMENT_GUIDE.md` Step 2 for all required secrets.

### 3. Create or Use Existing Load Balancer & Target Group

**Option A: Use Existing Load Balancer**

First, find your existing resources:
```bash
cd apps/api
./find-existing-resources.sh
```

Then create target group and add listener rule (see DEPLOYMENT_GUIDE.md Step 3.5).

**Option B: Create New Load Balancer**

```bash
# Create target group
aws elbv2 create-target-group \
  --name poultryco-api-tg \
  --protocol HTTP \
  --port 3002 \
  --vpc-id YOUR_VPC_ID \
  --target-type ip \
  --health-check-path /v1/health \
  --region ap-south-1

# Create load balancer
aws elbv2 create-load-balancer \
  --name poultryco-api-lb \
  --subnets YOUR_SUBNET_IDS \
  --security-groups YOUR_SG_ID \
  --region ap-south-1
```

### 4. Register Task Definition

```bash
cd apps/api
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ap-south-1
```

**⚠️ Update `task-definition.json` with:**
- Your VPC subnet IDs
- Your security group IDs
- Your IAM role ARNs

### 5. Create ECS Service

```bash
aws ecs create-service \
  --cluster poultryco-cluster \
  --service-name poultryco-api \
  --task-definition poultryco-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[...],securityGroups=[...]}" \
  --load-balancers "targetGroupArn=YOUR_TG_ARN,containerName=poultryco-api,containerPort=3002" \
  --region ap-south-1
```

### 6. Configure DNS

**Get ALB DNS Name:**
```bash
aws elbv2 describe-load-balancers \
  --names poultryco-api-lb \
  --region ap-south-1 \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

**Create DNS Record in Your DNS Provider:**
- **Type:** `A` (ALIAS) or `CNAME`
- **Name:** `api`
- **Target/Value:** `YOUR_ALB_DNS_NAME` (from above)
- **TTL:** `300` or `3600`

**Note:** Use ALIAS if supported, otherwise CNAME works fine.

### 7. Deploy Application

```bash
cd apps/api
./deploy.sh
```

## Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster poultryco-cluster \
  --services poultryco-api \
  --region ap-south-1

# Test API
curl https://api.poultryco.net/v1/health
```

## Important Notes

1. **Port:** API runs on port 3002 (updated in Dockerfile)
2. **Region:** All resources in `ap-south-1` (Mumbai)
3. **ECR:** `511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/api`
4. **Domain:** `api.poultryco.net`

## Troubleshooting

- **Service not starting:** Check CloudWatch logs `/ecs/poultryco-api`
- **Health check failing:** Verify port 3002 and health check path
- **Domain not resolving:** Check DNS record in your provider and DNS propagation

