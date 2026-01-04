# EC2 Deployment Guide

## Quick Start

### Prerequisites
- EC2 instance running (t3.xlarge recommended)
- SSH key with correct permissions
- AWS CLI configured (for Secrets Manager access)

### Deployment Steps

1. **Run the deployment script:**
   ```bash
   ./deploy-ec2.sh
   ```

2. **The script will:**
   - Connect to EC2 instance
   - Install Node.js, PM2, Chromium
   - Configure /dev/shm to 512MB
   - Build applications locally
   - Copy files to EC2
   - Install dependencies
   - Set up environment variables
   - Start applications with PM2

## Manual Steps (if script fails)

### 1. Connect to EC2
```bash
ssh -i /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem ec2-user@15.206.247.73
```

### 2. Install Dependencies
```bash
# Update system
sudo yum update -y

# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Chromium
sudo amazon-linux-extras install epel -y
sudo yum install -y chromium

# Configure /dev/shm
sudo mount -o remount,size=512M /dev/shm
echo "tmpfs /dev/shm tmpfs defaults,size=512m 0 0" | sudo tee -a /etc/fstab
```

### 3. Deploy Application
```bash
# Clone or copy repository
cd ~
mkdir -p poultryco
cd poultryco

# Copy files from local machine
# (Use scp or git clone)

# Install dependencies
npm ci
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..

# Build applications
npm run build
# Or individually:
# cd apps/web && npm run build && cd ../..
# cd apps/admin && npm run build && cd ../..
# cd apps/api && npm run build && cd ../..
```

### 4. Configure Environment
```bash
# Run setup script
chmod +x setup-ec2-env.sh
./setup-ec2-env.sh

# Or manually create .env file in apps/api/
```

### 5. Start with PM2
```bash
# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u ec2-user --hp /home/ec2-user
# Copy and run the command it outputs
```

## PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs
pm2 logs poultryco-api
pm2 logs poultryco-web
pm2 logs poultryco-admin

# Restart all
pm2 restart all

# Restart specific app
pm2 restart poultryco-api

# Stop all
pm2 stop all

# Delete all
pm2 delete all

# Monitor
pm2 monit
```

## ALB Configuration

### Update Target Groups

1. **Web Target Group** (port 3000):
   - Add EC2 instance: `15.206.247.73:3000`
   - Health check: `HTTP:3000/`

2. **Admin Target Group** (port 3001):
   - Add EC2 instance: `15.206.247.73:3001`
   - Health check: `HTTP:3001/`

3. **API Target Group** (port 3002):
   - Add EC2 instance: `15.206.247.73:3002`
   - Health check: `HTTP:3002/v1/health`

### Security Group Rules

Ensure EC2 security group allows:
- **Inbound**: Ports 3000, 3001, 3002 from ALB security group
- **Inbound**: Port 22 (SSH) from your IP
- **Outbound**: All (for RDS, S3, SES, Secrets Manager)

## Troubleshooting

### Application not starting
```bash
# Check PM2 logs
pm2 logs

# Check if ports are in use
sudo netstat -tulpn | grep -E '3000|3001|3002'

# Check system resources
free -h
df -h
```

### Chromium not found
```bash
# Verify Chromium installation
which chromium-browser
/usr/bin/chromium-browser --version

# If not found, install:
sudo yum install -y chromium
```

### Shared memory issues
```bash
# Check /dev/shm size
df -h /dev/shm

# Remount if needed
sudo mount -o remount,size=512M /dev/shm
```

### Environment variables not loading
```bash
# Check .env file exists
ls -la apps/api/.env

# Verify secrets are accessible
aws secretsmanager get-secret-value --secret-id poultryco/database-url --region ap-south-1
```

### WhatsApp sessions not persisting
```bash
# Check session directory
ls -la apps/api/whatsapp-sessions/

# Verify permissions
chmod 755 apps/api/whatsapp-sessions/
```

## Monitoring

### CloudWatch Logs
```bash
# Install CloudWatch agent (optional)
sudo yum install -y amazon-cloudwatch-agent

# Configure to send PM2 logs to CloudWatch
```

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Process list
pm2 list

# Process info
pm2 info poultryco-api
```

## Backup

### WhatsApp Sessions
```bash
# Backup session directory
tar -czf whatsapp-sessions-backup-$(date +%Y%m%d).tar.gz apps/api/whatsapp-sessions/
```

### PM2 Configuration
```bash
# PM2 automatically saves configuration
# Located at: ~/.pm2/dump.pm2
```

## Rollback

If you need to rollback to ECS:

1. Stop PM2 processes: `pm2 stop all`
2. Update ALB target groups back to ECS tasks
3. Restart ECS services

## Next Steps After Deployment

1. ✅ Test web application: `https://poultryco.net`
2. ✅ Test admin panel: `https://admin.poultryco.net`
3. ✅ Test API: `https://api.poultryco.net/v1/health`
4. ✅ Test WhatsApp initialization
5. ✅ Monitor PM2 logs for errors
6. ✅ Verify no "Frame detached" errors
7. ✅ Check session persistence

