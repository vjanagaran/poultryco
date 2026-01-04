# EC2 Deployment Guide

Complete guide for deploying PoultryCo applications to EC2 using PM2.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Application Deployment](#application-deployment)
4. [Environment Configuration](#environment-configuration)
5. [PM2 Management](#pm2-management)
6. [Load Balancer Configuration](#load-balancer-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

- **EC2 Instance**: t3.xlarge (4 vCPU, 16GB RAM) recommended
- **OS**: Ubuntu 24.04 LTS
- **SSH Access**: Key file with correct permissions
- **AWS CLI**: Configured (for optional AWS services)

### Current Configuration
- **Instance ID**: `i-0fe2fe8b26041a4f9`
- **Public IP**: `15.206.247.73`
- **User**: `ubuntu`
- **SSH Key**: `/Users/vjanagaran/Drive/AWS/Certificates/maaya.pem`

---

## Initial Setup

### 1. Connect to EC2 Instance

```bash
ssh -i /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem ubuntu@15.206.247.73
```

**Note**: If SSH fails, verify:
- Key permissions: `chmod 400 /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem`
- Security group allows SSH (port 22) from your IP
- Key pair matches instance in AWS Console

### 2. Install System Dependencies

```bash
# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Chromium and dependencies
sudo apt-get install -y chromium-browser chromium-chromedriver

# Install build tools
sudo apt-get install -y build-essential git curl wget unzip

# Configure /dev/shm (shared memory) to 512MB (critical for WhatsApp)
sudo mount -o remount,size=512M /dev/shm
if ! grep -q "tmpfs /dev/shm" /etc/fstab; then
    echo "tmpfs /dev/shm tmpfs defaults,size=512m 0 0" | sudo tee -a /etc/fstab
fi

# Verify installations
node --version  # Should be v20.x
npm --version
pm2 --version
chromium-browser --version
```

### 3. Clone Repository

```bash
cd ~
git clone https://github.com/vjanagaran/poultryco.git
cd poultryco
git checkout dev  # or your target branch
```

---

## Application Deployment

### 1. Install Dependencies

```bash
cd ~/poultryco

# Install root dependencies
npm ci

# Install workspace dependencies
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..
```

### 2. Build Applications

```bash
cd ~/poultryco

# Build all applications
npm run build

# Or build individually if needed:
# cd apps/web && npm run build && cd ../..
# cd apps/admin && npm run build && cd ../..
# cd apps/api && npm run build && cd ../..
```

**Note**: If mobile app build fails (missing `react-native-web`), it's not critical for EC2 deployment.

### 3. Configure Environment Variables

Create `.env` file in `apps/api/` directory:

```bash
cd ~/poultryco/apps/api
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# JWT Secrets
JWT_SECRET=your-jwt-secret-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=poultryco-cdn

# SES Configuration
SES_SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SES_SMTP_USERNAME=your-smtp-username
SES_SMTP_PASSWORD=your-smtp-password
SES_SENDER_EMAIL=noreply@poultryco.net

# Application
NODE_ENV=production
PORT=3002
API_PREFIX=/v1
CORS_ORIGIN=https://poultryco.net,https://www.poultryco.net,https://admin.poultryco.net
ADMIN_URL=https://admin.poultryco.net

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

**Important**: 
- URL-encode special characters in `DATABASE_URL` password (e.g., `#` becomes `%23`)
- The `.env` file is gitignored - keep it secure

### 4. Start Applications with PM2

```bash
cd ~/poultryco

# Copy PM2 ecosystem config (if not already present)
# ecosystem.config.js should be in root directory

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true

# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Copy and run the command it outputs (usually starts with 'sudo')
```

### 5. Verify Services

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Check specific service
pm2 logs poultryco-api
pm2 logs poultryco-web
pm2 logs poultryco-admin

# Test services locally
curl http://localhost:3002/v1/health  # API
curl http://localhost:3000            # Web
curl http://localhost:3001           # Admin

# Check if ports are listening
sudo netstat -tulpn | grep -E '3000|3001|3002'
```

---

## Environment Configuration

### Admin App Environment

Create `.env.production` in `apps/admin/`:

```env
NEXT_PUBLIC_API_URL=https://api.poultryco.net/v1
NODE_ENV=production
```

### Web App Environment

Create `.env.production` in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=https://api.poultryco.net/v1
NODE_ENV=production
```

---

## PM2 Management

### Common Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs
pm2 logs poultryco-api --lines 50

# Restart all
pm2 restart all

# Restart specific app
pm2 restart poultryco-api

# Stop all
pm2 stop all

# Delete all
pm2 delete all

# Monitor in real-time
pm2 monit

# View process info
pm2 info poultryco-api

# Reload environment variables
pm2 restart all --update-env
```

### PM2 Configuration

The `ecosystem.config.js` file manages all three applications:
- **poultryco-web**: Port 3000
- **poultryco-admin**: Port 3001
- **poultryco-api**: Port 3002

Configuration includes:
- Auto-restart on failure
- Log file locations
- Memory limits
- Environment variables

---

## Load Balancer Configuration

### Target Groups

Update AWS ALB target groups to point to EC2 instance:

1. **Web Target Group** (`poultryco-web-tg`):
   - Port: 3000
   - Health check: `/` or `/login` (returns 200)
   - Health check codes: 200-399

2. **Admin Target Group** (`poultryco-admin-tg`):
   - Port: 3001
   - Health check: `/login` (returns 200)
   - Health check codes: 200-399

3. **API Target Group** (`poultryco-api-tg`):
   - Port: 3002
   - Health check: `/v1/health`
   - Health check codes: 200

**Target Type**: IP (use EC2 private IP)

### Security Group Rules

Ensure EC2 security group allows:
- **Inbound**: Ports 3000, 3001, 3002 from ALB security group
- **Inbound**: Port 22 (SSH) from your IP
- **Outbound**: All (for RDS, S3, SES, etc.)

### ALB Listener Rules

Configure listener rules to route:
- `poultryco.net` / `www.poultryco.net` → Web target group
- `admin.poultryco.net` → Admin target group
- `api.poultryco.net` → API target group

---

## Troubleshooting

### Applications Not Starting

**Check PM2 logs:**
```bash
pm2 logs --lines 100
pm2 logs poultryco-api --lines 50
```

**Check build outputs:**
```bash
ls -la apps/web/.next      # Should exist
ls -la apps/admin/.next   # Should exist
ls -la apps/api/dist      # Should exist
```

**If missing, rebuild:**
```bash
cd ~/poultryco
npm run build
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :3002

# Kill process if needed
sudo kill -9 <PID>
```

### Database Connection Errors

**Check DATABASE_URL:**
```bash
cd ~/poultryco/apps/api
cat .env | grep DATABASE_URL
```

**Verify password encoding:**
- Special characters (especially `#`) must be URL-encoded
- Example: `MaayaSoft#2308` → `MaayaSoft%232308`

**Test connection:**
```bash
# From API directory
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Chromium Not Found

```bash
# Check Chromium location
which chromium-browser
ls -la /usr/bin/chromium*

# If not found, install:
sudo apt-get install -y chromium-browser

# Verify environment variable
echo $PUPPETEER_EXECUTABLE_PATH  # Should be /usr/bin/chromium-browser
```

### Shared Memory Issues

```bash
# Check /dev/shm size
df -h /dev/shm  # Should show 512M

# Remount if needed
sudo mount -o remount,size=512M /dev/shm

# Verify fstab entry
cat /etc/fstab | grep /dev/shm
```

### Environment Variables Not Loading

**For API:**
```bash
# Check .env file exists
ls -la apps/api/.env

# Restart with environment update
pm2 restart poultryco-api --update-env
```

**For Next.js apps:**
- Ensure `.env.production` exists in `apps/web/` and `apps/admin/`
- Restart PM2: `pm2 restart poultryco-web poultryco-admin`

### WhatsApp Session Issues

```bash
# Check session directory
ls -la apps/api/whatsapp-sessions/

# Verify permissions
chmod -R 755 apps/api/whatsapp-sessions/

# Check disk space
df -h
```

### Full Reset (Last Resort)

```bash
cd ~/poultryco

# Stop PM2
pm2 delete all

# Clean build artifacts
rm -rf apps/web/.next
rm -rf apps/admin/.next
rm -rf apps/api/dist

# Reinstall dependencies
rm -rf node_modules apps/*/node_modules
npm ci
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..

# Rebuild
npm run build

# Restart PM2
pm2 start ecosystem.config.js
pm2 save
```

---

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Process list with details
pm2 list

# Process info
pm2 info poultryco-api

# Memory usage
pm2 status
```

### Log Management

```bash
# View all logs
pm2 logs --lines 100

# View specific app logs
pm2 logs poultryco-api --lines 50

# Log files location
ls -la ~/poultryco/logs/
```

### Health Checks

```bash
# API health
curl http://localhost:3002/v1/health

# Web (should return HTML)
curl -I http://localhost:3000

# Admin (should return HTML)
curl -I http://localhost:3001
```

### Backup

**WhatsApp Sessions:**
```bash
cd ~/poultryco
tar -czf whatsapp-sessions-backup-$(date +%Y%m%d).tar.gz apps/api/whatsapp-sessions/
```

**PM2 Configuration:**
- Automatically saved at: `~/.pm2/dump.pm2`
- Backup: `cp ~/.pm2/dump.pm2 ~/pm2-backup-$(date +%Y%m%d).pm2`

### Updates & Deployments

**Standard deployment process:**

```bash
# 1. Pull latest code
cd ~/poultryco
git pull origin dev

# 2. Install dependencies (if package.json changed)
npm ci
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..

# 3. Build applications
npm run build

# 4. Restart PM2 with updated environment
pm2 restart all --update-env

# 5. Check status
pm2 status
pm2 logs --lines 20
```

---

## Quick Reference

### SSH Connection
```bash
ssh -i /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem ubuntu@15.206.247.73
```

### PM2 Quick Commands
```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart all
pm2 restart poultryco-api --update-env  # Restart with env update
```

### Service URLs
- **Web**: https://poultryco.net
- **Admin**: https://admin.poultryco.net
- **API**: https://api.poultryco.net/v1

### Important Paths
- **Application**: `/home/ubuntu/poultryco`
- **PM2 Config**: `/home/ubuntu/poultryco/ecosystem.config.js`
- **API .env**: `/home/ubuntu/poultryco/apps/api/.env`
- **Logs**: `/home/ubuntu/poultryco/logs/`
- **WhatsApp Sessions**: `/home/ubuntu/poultryco/apps/api/whatsapp-sessions/`

---

## Support

For issues not covered in this guide:
1. Check PM2 logs: `pm2 logs --lines 100`
2. Check application logs in `~/poultryco/logs/`
3. Verify environment variables are set correctly
4. Ensure all services are built and dependencies installed

---

**Last Updated**: 2026-01-04  
**Deployment Method**: EC2 + PM2  
**OS**: Ubuntu 24.04 LTS

