# 🚀 PoultryCo API - AWS ECS Deployment Guide

**Status:** ✅ **DEPLOYED AND LIVE**  
**API Endpoint:** `https://api.poultryco.net/v1`  
**ECR Repository:** `511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/api`  
**Region:** `ap-south-1` (Mumbai)  
**ECS Cluster:** `poultryco-cluster`  
**ECS Service:** `poultryco-api`

---

## Current Deployment Status

- ✅ **API Live:** `https://api.poultryco.net/v1/health`
- ✅ **Tasks Running:** 2/2
- ✅ **Health Checks:** Passing
- ✅ **Database:** Connected (PostgreSQL 18.1)
- ✅ **Load Balancer:** Configured with host-based routing

---

## Prerequisites

- ✅ AWS CLI configured with credentials
- ✅ Docker installed
- ✅ ECR repository: `poultryco/api`
- ✅ RDS PostgreSQL 18.1 instance running
- ✅ AWS Secrets Manager secrets configured
- ✅ S3 bucket for file uploads
- ✅ DNS configured for `api.poultryco.net`

---

## Quick Deployment

For existing deployments, use the deploy script:

```bash
cd apps/api
./deploy.sh [version-tag]
```

This will:
1. Build Docker image (linux/amd64)
2. Push to ECR
3. Update ECS service

---

## Initial Setup (One-Time)

### 1. Infrastructure Setup

```bash
cd apps/api
chmod +x ecs-setup.sh
./ecs-setup.sh
```

Creates:
- ECR repository (if not exists)
- CloudWatch log group `/ecs/poultryco-api`
- ECS cluster `poultryco-cluster`

### 2. Configure AWS Secrets Manager

Use the interactive script:

```bash
cd apps/api
chmod +x create-secrets.sh
./create-secrets.sh
```

Or manually create secrets (see `CREATE_SECRETS_GUIDE.md`).

**Required Secrets:**
- `poultryco/database-url` - PostgreSQL connection string (URL-encode special chars in password)
- `poultryco/jwt-secret` - JWT signing secret
- `poultryco/admin-jwt-secret` - Admin JWT signing secret
- `poultryco/ses-smtp-host` - AWS SES SMTP host
- `poultryco/ses-smtp-username` - SES SMTP username
- `poultryco/ses-smtp-password` - SES SMTP password
- `poultryco/ses-sender-email` - Sender email address
- `poultryco/aws-region` - AWS region (ap-south-1)
- `poultryco/s3-bucket-name` - S3 bucket name
- `poultryco/aws-access-key-id` - AWS access key
- `poultryco/aws-secret-access-key` - AWS secret key
- `poultryco/cors-origin` - CORS allowed origins (comma-separated)

### 3. IAM Roles

Create ECS task execution role:

```bash
cd apps/api
chmod +x create-iam-roles.sh
./create-iam-roles.sh
```

**Note:** If you get permission errors, create roles manually via AWS Console (see IAM section).

### 4. Create ECS Service

If using existing resources (Load Balancer, VPC, Security Groups):

```bash
cd apps/api
chmod +x deploy-with-existing-resources.sh
./deploy-with-existing-resources.sh
```

**Important:** Update the script with your:
- Load Balancer ARN
- VPC ID
- Subnet IDs
- Security Group ID

---

## Deployment Process

### Build and Deploy

```bash
cd apps/api
./deploy.sh
```

This script:
1. Builds Docker image with `--platform linux/amd64`
2. Tags image as `latest` and optional version tag
3. Pushes to ECR
4. Forces new ECS service deployment

### Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster poultryco-cluster \
  --services poultryco-api \
  --region ap-south-1

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names poultryco-api-tg --region ap-south-1 --query 'TargetGroups[0].TargetGroupArn' --output text) \
  --region ap-south-1

# Test API
curl https://api.poultryco.net/v1/health
```

---

## Configuration

### Environment Variables

Configured via AWS Secrets Manager (see `task-definition.json`):

- `NODE_ENV=production`
- `PORT=3002`
- `API_PREFIX=v1`
- `DATABASE_URL` - From Secrets Manager
- `JWT_SECRET` - From Secrets Manager
- `ADMIN_JWT_SECRET` - From Secrets Manager
- `CORS_ORIGIN` - From Secrets Manager
- AWS credentials and SES config from Secrets Manager

### Security Group

Ensure security group `sg-022cc0dcf25d29ff5` allows:
- **Port 3002** from load balancer security group
- **Port 443** from `0.0.0.0/0` (HTTPS)

### Load Balancer

- **Target Group:** `poultryco-api-tg`
- **Health Check:** `/v1/health`
- **Port:** 3002
- **Protocol:** HTTP
- **Listener Rule:** Host header = `api.poultryco.net`

---

## Monitoring

### View Logs

```bash
aws logs tail /ecs/poultryco-api --follow --region ap-south-1
```

### Service Status

```bash
aws ecs describe-services \
  --cluster poultryco-cluster \
  --services poultryco-api \
  --region ap-south-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

### CloudWatch Metrics

Monitor in AWS Console:
- ECS Service Metrics
- Target Group Health Metrics
- Application Logs

---

## Troubleshooting

### Tasks Not Starting

1. Check CloudWatch logs for errors
2. Verify Secrets Manager secrets exist
3. Check IAM role permissions
4. Verify security group rules

### Health Checks Failing

1. Verify security group allows port 3002 from load balancer
2. Check application logs for startup errors
3. Verify health check path: `/v1/health`
4. Check target group health check configuration

### Database Connection Errors

1. Verify `DATABASE_URL` secret is correct
2. **Important:** URL-encode special characters in password (e.g., `#` → `%23`)
3. Check RDS security group allows connections
4. Verify database is accessible from ECS tasks

### Common Issues

- **Invalid URL error:** Password contains special characters - URL-encode them
- **Port timeout:** Security group missing port 3002 rule
- **Secrets access denied:** IAM role missing Secrets Manager permissions

---

## Scaling

Update desired task count:

```bash
aws ecs update-service \
  --cluster poultryco-cluster \
  --service poultryco-api \
  --desired-count 4 \
  --region ap-south-1
```

---

## Rollback

To rollback to previous task definition:

```bash
aws ecs update-service \
  --cluster poultryco-cluster \
  --service poultryco-api \
  --task-definition poultryco-api:PREVIOUS_REVISION \
  --region ap-south-1
```

---

## Related Documentation

- `CREATE_SECRETS_GUIDE.md` - Detailed secrets setup
- `BUILD_AND_DEPLOY.md` - Build and deployment steps
- `DOCKER_SETUP.md` - Docker installation guide
- `QUICK_START.md` - Quick reference

---

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review this guide
3. Verify all prerequisites are met
4. Check AWS service health

---

**Last Updated:** 2025-12-29  
**Deployment Status:** ✅ LIVE
