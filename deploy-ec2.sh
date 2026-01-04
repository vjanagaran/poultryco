#!/bin/bash

# PoultryCo EC2 Deployment Script
# Deploys web, admin, and API applications to EC2 instance via SSH

set -e

# Configuration
EC2_HOST="15.206.247.73"
EC2_USER="ubuntu"
SSH_KEY="/Users/vjanagaran/Drive/AWS/Certificates/maaya.pem"
APP_DIR="/home/ubuntu/poultryco"
REPO_URL="https://github.com/vjanagaran/poultryco.git"  # Update with your repo URL

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting EC2 Deployment${NC}"
echo "📍 EC2 Instance: ${EC2_HOST}"
echo "🔑 SSH Key: ${SSH_KEY}"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key not found at: ${SSH_KEY}${NC}"
    exit 1
fi

# Set correct permissions for SSH key
chmod 400 "$SSH_KEY"

# SSH connection string
SSH_CMD="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST}"

echo -e "${YELLOW}📦 Step 1: Checking EC2 instance connectivity...${NC}"
if ! $SSH_CMD "echo 'Connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to EC2 instance. Please check:${NC}"
    echo "   - Instance is running"
    echo "   - Security group allows SSH (port 22) from your IP"
    echo "   - SSH key path is correct"
    exit 1
fi
echo -e "${GREEN}✅ Connected to EC2 instance${NC}"

echo ""
echo -e "${YELLOW}📦 Step 2: Setting up EC2 instance (Node.js, PM2, Chromium)...${NC}"
$SSH_CMD << 'ENDSSH'
set -e

# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node.js version: $(node --version)"

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi
echo "PM2 version: $(pm2 --version)"

# Install Chromium and dependencies
if ! command -v chromium-browser &> /dev/null; then
    echo "Installing Chromium..."
    sudo apt-get install -y chromium-browser chromium-chromedriver
fi
echo "Chromium installed: $(chromium-browser --version | head -1)"

# Configure /dev/shm (shared memory) to 512MB
echo "Configuring /dev/shm to 512MB..."
sudo mount -o remount,size=512M /dev/shm
if ! grep -q "tmpfs /dev/shm" /etc/fstab; then
    echo "tmpfs /dev/shm tmpfs defaults,size=512m 0 0" | sudo tee -a /etc/fstab > /dev/null
fi

# Install build tools and dependencies
sudo apt-get install -y build-essential git curl wget

# Create application directory
mkdir -p ~/poultryco
cd ~/poultryco

echo "✅ EC2 setup complete"
ENDSSH

echo -e "${GREEN}✅ EC2 instance setup complete${NC}"

echo ""
echo -e "${YELLOW}📦 Step 3: Building applications locally...${NC}"
cd "$(dirname "$0")"

# Build all apps (using turbo if available, otherwise individually)
echo "Building applications..."
if command -v turbo &> /dev/null; then
    npm run build
else
    # Build web app
    echo "Building web app..."
    cd apps/web
    npm ci
    npm run build
    cd ../..
    
    # Build admin app
    echo "Building admin app..."
    cd apps/admin
    npm ci
    npm run build
    cd ../..
    
    # Build API app
    echo "Building API app..."
    cd apps/api
    npm ci
    npm run build
    cd ../..
fi

echo -e "${GREEN}✅ Applications built${NC}"

echo ""
echo -e "${YELLOW}📦 Step 4: Copying files to EC2...${NC}"

# Create a tarball of the application
echo "Creating deployment package..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.env.local' \
    -czf /tmp/poultryco-deploy.tar.gz .

# Copy to EC2
echo "Uploading to EC2..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no /tmp/poultryco-deploy.tar.gz ${EC2_USER}@${EC2_HOST}:~/poultryco-deploy.tar.gz

# Extract on EC2
$SSH_CMD << 'ENDSSH'
cd ~/poultryco
tar -xzf ~/poultryco-deploy.tar.gz
rm ~/poultryco-deploy.tar.gz
echo "✅ Files extracted"
ENDSSH

echo -e "${GREEN}✅ Files copied to EC2${NC}"

echo ""
echo -e "${YELLOW}📦 Step 5: Installing dependencies on EC2...${NC}"
$SSH_CMD << 'ENDSSH'
cd ~/poultryco
npm ci
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..
echo "✅ Dependencies installed"
ENDSSH

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo -e "${YELLOW}📦 Step 6: Setting up PM2 ecosystem and environment...${NC}"

# Copy PM2 ecosystem file
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no ecosystem.config.js ${EC2_USER}@${EC2_HOST}:~/poultryco/ecosystem.config.js

# Copy environment setup script
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no setup-ec2-env.sh ${EC2_USER}@${EC2_HOST}:~/poultryco/setup-ec2-env.sh

# Run environment setup
$SSH_CMD << 'ENDSSH'
cd ~/poultryco
chmod +x setup-ec2-env.sh
./setup-ec2-env.sh
echo "✅ Environment configured"
ENDSSH

echo -e "${GREEN}✅ PM2 ecosystem configured${NC}"

echo ""
echo -e "${YELLOW}📦 Step 7: Starting applications with PM2...${NC}"
$SSH_CMD << 'ENDSSH'
cd ~/poultryco

# Stop existing PM2 processes if any
pm2 delete all 2>/dev/null || true

# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u ubuntu --hp /home/ubuntu | sudo bash || true

echo "✅ Applications started"
ENDSSH

echo -e "${GREEN}✅ Applications started with PM2${NC}"

echo ""
echo -e "${GREEN}✅✅✅ Deployment Complete!${NC}"
echo ""
echo "📊 Check application status:"
echo "   ssh -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} 'pm2 status'"
echo ""
echo "📝 View logs:"
echo "   ssh -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} 'pm2 logs'"
echo ""
echo "🔄 Restart applications:"
echo "   ssh -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} 'pm2 restart all'"
echo ""
echo "🔍 Check specific service:"
echo "   ssh -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} 'pm2 logs poultryco-api'"
echo ""
echo "🌐 Services should be available at:"
echo "   - Web: http://${EC2_HOST}:3000"
echo "   - Admin: http://${EC2_HOST}:3001"
echo "   - API: http://${EC2_HOST}:3002"
echo ""
echo "⚠️  Next steps:"
echo "   1. Update ALB target groups to point to ${EC2_HOST}"
echo "   2. Configure security groups to allow traffic from ALB"
echo "   3. Test WhatsApp initialization"
echo "   4. Monitor PM2 logs for errors"

