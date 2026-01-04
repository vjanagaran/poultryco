# EC2 Quick Deployment Guide

## Current Status
✅ Code pulled from git repository  
✅ All deployment files present  
📍 Location: `/home/ubuntu/poultryco`

## Deployment Steps

### 1. Install System Dependencies

```bash
# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Chromium
sudo apt-get install -y chromium-browser chromium-chromedriver

# Install build tools
sudo apt-get install -y build-essential git curl wget unzip

# Configure /dev/shm (shared memory) to 512MB
sudo mount -o remount,size=512M /dev/shm
if ! grep -q "tmpfs /dev/shm" /etc/fstab; then
    echo "tmpfs /dev/shm tmpfs defaults,size=512m 0 0" | sudo tee -a /etc/fstab
fi

# Verify installations
node --version
npm --version
pm2 --version
chromium-browser --version
```

### 2. Install Application Dependencies

```bash
cd ~/poultryco

# Install root dependencies
npm ci

# Install workspace dependencies
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..
```

### 3. Build Applications

```bash
cd ~/poultryco

# Build all applications
npm run build

# Or build individually if needed:
# cd apps/web && npm run build && cd ../..
# cd apps/admin && npm run build && cd ../..
# cd apps/api && npm run build && cd ../..
```

### 4. Set Up Environment Variables

```bash
cd ~/poultryco

# Make setup script executable
chmod +x setup-ec2-env.sh

# Run environment setup (fetches secrets from AWS Secrets Manager)
./setup-ec2-env.sh
```

**Note**: Ensure AWS CLI is configured with proper credentials to access Secrets Manager.

### 5. Start Applications with PM2

```bash
cd ~/poultryco

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

### 6. Verify Services

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Check specific service
pm2 logs poultryco-api
pm2 logs poultryco-web
pm2 logs poultryco-admin

# Check if services are listening
sudo netstat -tulpn | grep -E '3000|3001|3002'
```

### 7. Test Services Locally

```bash
# Test API health endpoint
curl http://localhost:3002/v1/health

# Test web (should return HTML)
curl http://localhost:3000

# Test admin (should return HTML)
curl http://localhost:3001
```

## Troubleshooting

### If PM2 startup command fails:
```bash
# Manually create systemd service
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### If Chromium not found:
```bash
# Check Chromium location
which chromium-browser
ls -la /usr/bin/chromium*

# If not found, install:
sudo apt-get install -y chromium-browser
```

### If environment variables not loading:
```bash
# Check .env file exists
ls -la apps/api/.env

# Verify AWS credentials
aws sts get-caller-identity

# Test Secrets Manager access
aws secretsmanager get-secret-value --secret-id poultryco/database-url --region ap-south-1
```

### If ports are already in use:
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :3002

# Kill process if needed
sudo kill -9 <PID>
```

## Next Steps

1. ✅ Verify all services are running: `pm2 status`
2. ✅ Check logs for errors: `pm2 logs`
3. ✅ Update ALB target groups to point to `15.206.247.73:3000/3001/3002`
4. ✅ Update security groups to allow traffic from ALB
5. ✅ Test WhatsApp initialization
6. ✅ Monitor for "Frame detached" errors (should be resolved!)

## Useful PM2 Commands

```bash
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
```

## Monitoring

```bash
# Real-time monitoring
pm2 monit

# View all logs
pm2 logs --lines 100

# View specific app logs
pm2 logs poultryco-api --lines 50
```

---

**Ready to deploy!** 🚀

