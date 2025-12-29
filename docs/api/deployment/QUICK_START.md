# Quick Start - Deploy PoultryCo API

## Prerequisites Checklist

- [x] AWS CLI configured (`aws configure`)
- [x] IAM user created: `developer-cli-access`
- [x] Existing load balancer: `Maaya`
- [x] Existing VPC: `vpc-eb4f6783`
- [x] ECR repository: `poultryco/api`
- [ ] IAM roles created (run `./create-iam-roles.sh`)
- [ ] Secrets created in AWS Secrets Manager
- [ ] DNS configured for `api.poultryco.net`

---

## Step-by-Step Deployment

### 1. Create IAM Roles (One-time)

**⚠️ Important:** Your IAM user may not have permissions to create roles. Use one of these options:

**Option A: AWS Console (Recommended)**
- See `CREATE_IAM_ROLES_MANUAL.md` for step-by-step instructions
- Create roles: `ecsTaskExecutionRole` and `ecsTaskRole`

**Option B: Script (if you have IAM permissions)**
```bash
cd apps/api
./create-iam-roles.sh
```

**Option C: Add IAM permissions to your user**
- Attach `IAMFullAccess` policy to `developer-cli-access` user
- Then run `./create-iam-roles.sh`

This creates:
- `ecsTaskExecutionRole` - For ECS to pull images, write logs, get secrets
- `ecsTaskRole` - For tasks to access S3, Secrets Manager, etc.

### 2. Run Initial Setup

```bash
cd apps/api
./ecs-setup.sh
```

This creates:
- CloudWatch log group: `/ecs/poultryco-api`
- ECS cluster: `poultryco-cluster`
- Registers task definition

### 3. Create Secrets (One-time)

Create all required secrets in AWS Secrets Manager:

```bash
# See DEPLOYMENT_GUIDE.md Step 2 for complete list
# Example:
aws secretsmanager create-secret \
  --name poultryco/database-url \
  --secret-string "postgresql://user:pass@host:5432/db?sslmode=require" \
  --region ap-south-1
```

### 4. Deploy with Existing Resources

```bash
cd apps/api
./deploy-with-existing-resources.sh
```

This will:
- Create target group
- Add listener rules for `api.poultryco.net`
- Create ECS service using existing VPC/subnets/security groups

### 5. Configure DNS

In your DNS provider, create:
- **Type:** `A` (ALIAS) or `CNAME`
- **Name:** `api`
- **Target:** `Maaya-136239732.ap-south-1.elb.amazonaws.com`

### 6. Build and Push Docker Image

```bash
cd apps/api
./deploy.sh
```

This builds and pushes the Docker image, then updates the ECS service.

---

## Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster poultryco-cluster \
  --services poultryco-api \
  --region ap-south-1

# View logs
aws logs tail /ecs/poultryco-api --follow --region ap-south-1

# Test API (after DNS is configured)
curl https://api.poultryco.net/v1/health
```

---

## Resource Summary

**Using Existing:**
- Load Balancer: `Maaya`
- VPC: `vpc-eb4f6783`
- Subnets: `subnet-bee8bed6`, `subnet-f359debf`, `subnet-45e72e3e`
- Security Group: `sg-022cc0dcf25d29ff5`

**Will Be Created:**
- Target Group: `poultryco-api-tg`
- ECS Cluster: `poultryco-cluster`
- ECS Service: `poultryco-api`
- CloudWatch Logs: `/ecs/poultryco-api`

---

## Troubleshooting

### "Role not found" Error
- Run `./create-iam-roles.sh` first

### "Service creation failed"
- Check security group allows traffic from load balancer
- Verify subnets are in the same VPC
- Check IAM roles exist

### "Health check failing"
- Verify health check path: `/v1/health`
- Check container logs
- Verify port 3002 is correct

---

**Start with:** `./create-iam-roles.sh` then `./ecs-setup.sh`

