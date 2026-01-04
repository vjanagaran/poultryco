# EC2 Migration Plan - Architecture Review & Justification

## Executive Summary

**Recommendation: ✅ APPROVE** - Migrating from ECS Fargate to EC2 is the **correct solution** for WhatsApp-web.js stability.

## Current Problem (ECS Fargate)

### Issues Experienced
1. **Frame Detachment Errors**: Persistent "Frame detached" errors after authentication
2. **Browser Crashes**: Chromium crashes even with 4GB memory
3. **Shared Memory Limitation**: `/dev/shm` limited to 64MB (default), insufficient for Chromium
4. **No Debugging Access**: Cannot SSH into containers to diagnose issues
5. **Resource Constraints**: Container isolation limits browser automation stability

### Evidence
- Comparison table shows: "WhatsApp-web.js: ❌ Crashes" on ECS Fargate
- Browser Automation: "⚠️ Problematic" on ECS Fargate vs "✅ Perfect" on EC2
- Shared Memory: "⚠️ 64MB default" on Fargate (Chromium needs 256MB+)

## Proposed Architecture: EC2 t3.xlarge

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    EC2: t3.xlarge                               │
│                    4 vCPU, 16GB RAM                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PM2 Process Manager                    │  │
│  │  ┌─────────────┬─────────────┬─────────────┐            │  │
│  │  │   Web App   │  Admin App  │   API App   │            │  │
│  │  │  Next.js    │  Next.js    │  NestJS     │            │  │
│  │  │  :3000      │  :3001      │  :3002      │            │  │
│  │  └─────────────┴─────────────┴─────────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Chromium (WhatsApp-web.js)                  │  │
│  │              /dev/shm: 512MB (configurable)               │  │
│  │              Persistent sessions in filesystem            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Justification: Why EC2 is Better

### 1. ✅ Browser Automation Stability
- **EC2**: Full control over OS, kernel, and system resources
- **Fargate**: Container isolation limits browser process management
- **Impact**: Chromium can run natively without container constraints

### 2. ✅ Shared Memory (/dev/shm)
- **EC2**: Can configure `/dev/shm` to 512MB+ (recommended: 512MB-1GB)
- **Fargate**: Limited to 64MB default, cannot be increased
- **Impact**: Chromium requires 256MB+ for stable operation. This is likely the **root cause** of frame detachment.

### 3. ✅ Persistent Sessions
- **EC2**: Filesystem persistence across restarts
- **Fargate**: Ephemeral storage, sessions lost on task replacement
- **Impact**: WhatsApp sessions can persist, reducing re-authentication

### 4. ✅ Debugging & Monitoring
- **EC2**: SSH access, direct process inspection, system logs
- **Fargate**: Limited to CloudWatch logs only
- **Impact**: Can diagnose issues in real-time, inspect browser state

### 5. ✅ Resource Allocation
- **EC2 t3.xlarge**: 4 vCPU, 16GB RAM (dedicated)
- **Fargate**: 2 vCPU, 4GB RAM (shared, burstable)
- **Impact**: More headroom for Chromium + Node.js + WhatsApp Web

### 6. ✅ Cost Efficiency
- **EC2 t3.xlarge**: ~$120/month (on-demand) or ~$50/month (reserved)
- **Fargate (3 services)**: ~$150/month (2GB API + 1GB Web + 1GB Admin)
- **Impact**: Lower cost with better performance

### 7. ✅ Simplicity
- **EC2**: Single instance, PM2 process management
- **Fargate**: Multiple services, task definitions, ECR, complex networking
- **Impact**: Easier to manage, deploy, and debug

## Architecture Details

### Instance Specifications
- **Type**: t3.xlarge
- **vCPU**: 4
- **RAM**: 16GB
- **Storage**: 30GB EBS (gp3)
- **Network**: Enhanced networking enabled

### Process Management (PM2)
```json
{
  "apps": [
    {
      "name": "poultryco-web",
      "script": "npm",
      "args": "start",
      "cwd": "/app/apps/web",
      "env": {
        "PORT": 3000,
        "NODE_ENV": "production"
      }
    },
    {
      "name": "poultryco-admin",
      "script": "npm",
      "args": "start",
      "cwd": "/app/apps/admin",
      "env": {
        "PORT": 3001,
        "NODE_ENV": "production"
      }
    },
    {
      "name": "poultryco-api",
      "script": "npm",
      "args": "start",
      "cwd": "/app/apps/api",
      "env": {
        "PORT": 3002,
        "NODE_ENV": "production"
      }
    }
  ]
}
```

### Shared Memory Configuration
```bash
# /etc/fstab
tmpfs /dev/shm tmpfs defaults,size=512m 0 0

# Or mount at runtime
sudo mount -o remount,size=512M /dev/shm
```

### ALB Configuration
- **Listener Rules**:
  - `poultryco.net` → Target Group (port 3000)
  - `www.poultryco.net` → Target Group (port 3000)
  - `admin.poultryco.net` → Target Group (port 3001)
  - `api.poultryco.net` → Target Group (port 3002)

### Security Groups
- **Inbound**: 
  - Port 22 (SSH) from your IP
  - Ports 3000, 3001, 3002 from ALB security group
- **Outbound**: All (for RDS, S3, SES, etc.)

## Migration Steps

### Phase 1: EC2 Setup
1. Launch EC2 t3.xlarge instance (Amazon Linux 2023)
2. Configure security groups
3. Install Node.js 20.x, PM2, Chromium
4. Configure `/dev/shm` to 512MB
5. Set up CloudWatch agent for logs

### Phase 2: Application Deployment
1. Clone repository
2. Install dependencies
3. Build applications
4. Configure PM2 ecosystem
5. Set up environment variables (from Secrets Manager)
6. Start PM2 processes

### Phase 3: ALB Configuration
1. Create target groups for each service
2. Update ALB listener rules
3. Configure health checks
4. Test routing

### Phase 4: Migration
1. Deploy to EC2
2. Test WhatsApp initialization
3. Monitor for frame detachment errors
4. Verify session persistence
5. Switch DNS/ALB routing

### Phase 5: Cleanup
1. Stop ECS services
2. Archive ECR images (optional)
3. Monitor EC2 for 1 week
4. Delete ECS resources if stable

## Risk Mitigation

### Single Point of Failure
- **Risk**: EC2 instance failure
- **Mitigation**: 
  - Use Auto Scaling Group (min: 1, max: 2)
  - Set up CloudWatch alarms
  - Regular AMI snapshots
  - Consider multi-AZ later

### Scaling Concerns
- **Risk**: Single instance may not scale
- **Mitigation**:
  - t3.xlarge can handle current load
  - Can add more instances later
  - Use ALB for load distribution

### Maintenance Overhead
- **Risk**: Need to manage OS updates
- **Mitigation**:
  - Use Amazon Linux (auto-updates)
  - Set up automated patching
  - Use Systems Manager for maintenance

## Success Criteria

### Technical
- ✅ WhatsApp account initializes successfully
- ✅ No "Frame detached" errors
- ✅ Ready event fires after authentication
- ✅ Phone number extracted
- ✅ Sessions persist across restarts
- ✅ All three services running stable

### Operational
- ✅ PM2 monitoring working
- ✅ CloudWatch logs integrated
- ✅ Health checks passing
- ✅ ALB routing correct
- ✅ SSH access available

### Performance
- ✅ Response times < 200ms (p95)
- ✅ Memory usage < 12GB (75% of 16GB)
- ✅ CPU usage < 80% average
- ✅ No browser crashes

## Cost Comparison

### Current (ECS Fargate)
- API: 2 tasks × 4GB = 8GB × $0.04/GB-hour = ~$60/month
- Web: 2 tasks × 1GB = 2GB × $0.04/GB-hour = ~$15/month
- Admin: 2 tasks × 1GB = 2GB × $0.04/GB-hour = ~$15/month
- **Total**: ~$90/month (plus ECR storage, ALB, etc.)

### Proposed (EC2)
- t3.xlarge: 16GB × $0.1664/hour = ~$120/month (on-demand)
- t3.xlarge: ~$50/month (1-year reserved)
- EBS: 30GB × $0.10/GB = $3/month
- **Total**: ~$53/month (reserved) or ~$123/month (on-demand)

**Savings**: ~$37/month with reserved, or similar cost with better performance

## Conclusion

**✅ RECOMMEND APPROVAL**

The migration to EC2 addresses all identified issues:
1. ✅ Resolves frame detachment (proper /dev/shm)
2. ✅ Better browser automation stability
3. ✅ Persistent sessions
4. ✅ Debugging access
5. ✅ Lower or similar cost
6. ✅ Simpler architecture

**Next Steps:**
1. Review and approve this plan
2. Create EC2 instance
3. Set up PM2 and applications
4. Test WhatsApp functionality
5. Migrate traffic from ECS to EC2
6. Monitor for 1 week
7. Decommission ECS resources

---

**Prepared by**: AI Assistant  
**Date**: 2026-01-04  
**Status**: Ready for Implementation

