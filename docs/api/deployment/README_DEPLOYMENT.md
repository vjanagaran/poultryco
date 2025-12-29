# 🚀 PoultryCo API - AWS ECS Deployment

## Quick Start

### 1. Initial Setup (One-time)

```bash
cd apps/api
./ecs-setup.sh
```

### 2. Configure Secrets

Create all required secrets in AWS Secrets Manager (see `DEPLOYMENT_GUIDE.md`).

### 3. Deploy

```bash
cd apps/api
./deploy.sh
```

## Configuration

- **ECR:** `511358949452.dkr.ecr.ap-south-1.amazonaws.com/poultryco/api`
- **Region:** `ap-south-1` (Mumbai)
- **Domain:** `api.poultryco.net`
- **Port:** `3002`
- **API Prefix:** `v1` (URL: `https://api.poultryco.net/v1`)

## Files

- `Dockerfile` - Docker image configuration (✅ Fixed port to 3002)
- `task-definition.json` - ECS task definition
- `deploy.sh` - Deployment script
- `ecs-setup.sh` - Infrastructure setup script
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - Quick checklist

## Next Steps

1. **Set up AWS Access Keys:**
   - Read `AWS_ACCESS_KEYS_SETUP.md` (IMPORTANT: Don't use root keys!)
   - Create IAM user with required permissions
   - Get access keys and run `aws configure`

2. **Find existing resources** (if any):
   ```bash
   cd apps/api
   ./find-existing-resources.sh
   ```

3. Review `DEPLOYMENT_GUIDE.md` for complete setup
4. Create AWS Secrets Manager secrets
5. Create or use existing Application Load Balancer
6. Create ECS service
7. Configure DNS for `api.poultryco.net` (in your DNS provider)
8. Deploy using `./deploy.sh`

