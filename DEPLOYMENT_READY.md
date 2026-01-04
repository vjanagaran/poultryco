# EC2 Deployment - Ready to Deploy

## Files Created

✅ **deploy-ec2.sh** - Main deployment script
✅ **ecosystem.config.js** - PM2 configuration
✅ **setup-ec2-env.sh** - Environment setup script
✅ **EC2_DEPLOYMENT_GUIDE.md** - Complete deployment guide
✅ **EC2_SSH_SETUP.md** - SSH troubleshooting guide

## Current Status

⚠️ **SSH Connection Issue**: The SSH key may not match the EC2 instance.

### Quick Fix Steps

1. **Verify Key Pair in AWS Console:**
   - Go to EC2 → Instances → Select `i-0fe2fe8b26041a4f9`
   - Check "Key pair name" field
   - If it's NOT "maaya", update the key path in `deploy-ec2.sh`

2. **Test SSH Manually:**
   ```bash
   ssh -i /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem ec2-user@15.206.247.73
   ```

3. **If SSH Works**, run deployment:
   ```bash
   ./deploy-ec2.sh
   ```

## Deployment Script Overview

The `deploy-ec2.sh` script will:

1. ✅ Connect to EC2 instance
2. ✅ Install Node.js 20.x, PM2, Chromium
3. ✅ Configure /dev/shm to 512MB (critical for WhatsApp)
4. ✅ Build applications locally
5. ✅ Copy files to EC2
6. ✅ Install dependencies
7. ✅ Set up environment variables from AWS Secrets Manager
8. ✅ Start applications with PM2

## What Gets Deployed

- **Web App** (port 3000): `apps/web`
- **Admin App** (port 3001): `apps/admin`
- **API App** (port 3002): `apps/api` with WhatsApp support

## After Deployment

1. **Update ALB Target Groups:**
   - Web: `15.206.247.73:3000`
   - Admin: `15.206.247.73:3001`
   - API: `15.206.247.73:3002`

2. **Update Security Group:**
   - Allow ports 3000, 3001, 3002 from ALB security group

3. **Test WhatsApp:**
   - Initialize account
   - Verify no "Frame detached" errors
   - Check session persistence

## Next Steps

1. Fix SSH connection (verify key pair)
2. Run `./deploy-ec2.sh`
3. Monitor deployment progress
4. Update ALB configuration
5. Test applications

---

**Ready when SSH connection is verified!** 🚀

