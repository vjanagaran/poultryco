# Ubuntu 24.04 LTS Deployment Notes

## Configuration Updated

All deployment scripts have been updated for **Ubuntu 24.04 LTS**:

### Key Changes:
- ✅ **User**: `ubuntu` (not `ec2-user`)
- ✅ **Package Manager**: `apt` (not `yum`)
- ✅ **Paths**: `/home/ubuntu/poultryco` (Ubuntu standard)
- ✅ **Chromium**: `chromium-browser` package (Ubuntu standard)
- ✅ **Node.js**: Installed via NodeSource Debian repository
- ✅ **PM2**: Global npm installation

## Verified

✅ SSH connection works: `ubuntu@15.206.247.73`
✅ Ubuntu 24.04.3 LTS confirmed
✅ All paths updated to Ubuntu standards

## Deployment

Run the deployment script:
```bash
./deploy-ec2.sh
```

The script will:
1. Connect via SSH (ubuntu user)
2. Install Node.js 20.x via NodeSource
3. Install PM2 globally
4. Install Chromium browser
5. Configure /dev/shm to 512MB
6. Deploy all applications
7. Start with PM2

## Ubuntu-Specific Notes

### Chromium Installation
- Package: `chromium-browser`
- Path: `/usr/bin/chromium-browser`
- Alternative: May also be at `/snap/bin/chromium` (snap package)

### Shared Memory
- Configured via `/etc/fstab`
- Size: 512MB (critical for WhatsApp)
- Mount point: `/dev/shm`

### PM2 Startup
- User: `ubuntu`
- Home: `/home/ubuntu`
- Service: `pm2-ubuntu.service`

## After Deployment

Check services:
```bash
ssh -i /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem ubuntu@15.206.247.73 'pm2 status'
```

View logs:
```bash
ssh -i /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem ubuntu@15.206.247.73 'pm2 logs'
```

