# EC2 PM2 Troubleshooting Guide

## All Processes in "errored" State

If all PM2 processes show "errored" status, check the following:

### 1. Check PM2 Logs

```bash
# View all logs
pm2 logs --lines 100

# View specific app logs
pm2 logs poultryco-api --lines 50
pm2 logs poultryco-web --lines 50
pm2 logs poultryco-admin --lines 50

# View error logs
cat ~/poultryco/logs/api-error.log
cat ~/poultryco/logs/web-error.log
cat ~/poultryco/logs/admin-error.log
```

### 2. Verify Applications Are Built

```bash
# Check if build outputs exist
ls -la apps/web/.next
ls -la apps/admin/.next
ls -la apps/api/dist

# If missing, build them:
cd ~/poultryco
npm run build
```

### 3. Check Dependencies

```bash
# Verify node_modules exist
ls -la apps/web/node_modules
ls -la apps/admin/node_modules
ls -la apps/api/node_modules

# If missing, install:
cd ~/poultryco
npm ci
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..
```

### 4. Check Environment Variables

```bash
# Verify .env file exists for API
ls -la apps/api/.env

# Check if environment variables are set
cat apps/api/.env | head -10

# If missing, run setup:
./setup-ec2-env.sh
```

### 5. Check Port Availability

```bash
# Check if ports are in use
sudo netstat -tulpn | grep -E '3000|3001|3002'

# Or use ss
sudo ss -tulpn | grep -E '3000|3001|3002'
```

### 6. Common Issues & Fixes

#### Issue: "Cannot find module"
**Fix**: Install dependencies
```bash
cd ~/poultryco
npm ci
cd apps/web && npm ci && cd ../..
cd apps/admin && npm ci && cd ../..
cd apps/api && npm ci && cd ../..
```

#### Issue: ".next directory not found" or "dist directory not found"
**Fix**: Build applications
```bash
cd ~/poultryco
npm run build
```

#### Issue: "EADDRINUSE: address already in use"
**Fix**: Kill process using the port
```bash
# Find process
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :3002

# Kill process
sudo kill -9 <PID>
```

#### Issue: "Environment variables not found"
**Fix**: Run setup script
```bash
cd ~/poultryco
./setup-ec2-env.sh
```

#### Issue: "Permission denied"
**Fix**: Check file permissions
```bash
chmod +x apps/web/node_modules/.bin/next
chmod +x apps/admin/node_modules/.bin/next
chmod +x apps/api/node_modules/.bin/nest
```

### 7. Restart PM2 Processes

After fixing issues:

```bash
# Delete all processes
pm2 delete all

# Restart with ecosystem config
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs
```

### 8. Manual Testing

Test each app manually to identify issues:

```bash
# Test API
cd ~/poultryco/apps/api
node dist/main.js
# Should start on port 3002

# Test Web (in another terminal)
cd ~/poultryco/apps/web
npm start
# Should start on port 3000

# Test Admin (in another terminal)
cd ~/poultryco/apps/admin
npm start
# Should start on port 3001
```

### 9. Check Node.js Version

```bash
node --version
# Should be v20.x or higher

# If not, install Node.js 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 10. Full Reset

If nothing works, do a full reset:

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

## Quick Diagnostic Script

Run this to check everything:

```bash
cd ~/poultryco

echo "=== Checking Node.js ==="
node --version
npm --version

echo "=== Checking Build Outputs ==="
[ -d "apps/web/.next" ] && echo "✅ Web built" || echo "❌ Web not built"
[ -d "apps/admin/.next" ] && echo "✅ Admin built" || echo "❌ Admin not built"
[ -d "apps/api/dist" ] && echo "✅ API built" || echo "❌ API not built"

echo "=== Checking Dependencies ==="
[ -d "node_modules" ] && echo "✅ Root deps installed" || echo "❌ Root deps missing"
[ -d "apps/web/node_modules" ] && echo "✅ Web deps installed" || echo "❌ Web deps missing"
[ -d "apps/admin/node_modules" ] && echo "✅ Admin deps installed" || echo "❌ Admin deps missing"
[ -d "apps/api/node_modules" ] && echo "✅ API deps installed" || echo "❌ API deps missing"

echo "=== Checking Environment ==="
[ -f "apps/api/.env" ] && echo "✅ API .env exists" || echo "❌ API .env missing"

echo "=== Checking Ports ==="
sudo netstat -tulpn | grep -E '3000|3001|3002' || echo "✅ Ports available"
```

