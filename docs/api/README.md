# PoultryCo API Documentation

This directory contains all documentation for the PoultryCo API.

## 📁 Directory Structure

```
docs/api/
├── README.md                    # This file - API overview
├── deployment/                  # Deployment documentation
│   ├── DEPLOYMENT_GUIDE.md     # Complete deployment guide
│   ├── DEPLOYMENT_COMPLETE.md  # Deployment status
│   ├── QUICK_DEPLOY.md         # Quick deployment reference
│   ├── QUICK_START.md          # Quick start guide
│   └── README_DEPLOYMENT.md    # Deployment README
├── guides/                      # Setup and configuration guides
│   └── (guides removed - using EC2 deployment)
└── [Other API docs]             # Migration, endpoints, etc.
```

## 🚀 Quick Links

### For Developers
- **[API Overview](../api/README.md)** - API features and tech stack
- **[EC2 Deployment Guide](../deployment/EC2_DEPLOYMENT_GUIDE.md)** - Complete EC2 deployment guide

### For DevOps
- **[EC2 Deployment Guide](../deployment/EC2_DEPLOYMENT_GUIDE.md)** - Full EC2 deployment instructions

## 📚 Documentation Files

### Deployment
- **EC2 Deployment Guide** (`../deployment/EC2_DEPLOYMENT_GUIDE.md`) - Complete EC2 deployment guide

## 🔗 Related Documentation

- **API Source Code:** `apps/api/`
- **PM2 Configuration:** `ecosystem.config.js`
- **Start Script:** `apps/api/start.sh`

## 📝 Status

**Current Status:** ✅ **DEPLOYED AND LIVE**

- **API Endpoint:** `https://api.poultryco.net/v1`
- **Health Check:** `https://api.poultryco.net/v1/health`
- **Deployment Date:** 2025-12-29

---

**Last Updated:** 2025-12-29
