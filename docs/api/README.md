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
│   ├── BUILD_AND_DEPLOY.md     # Build and deployment steps
│   ├── CREATE_SECRETS_GUIDE.md # AWS Secrets Manager setup
│   └── DOCKER_SETUP.md         # Docker installation guide
└── [Other API docs]             # Migration, endpoints, etc.
```

## 🚀 Quick Links

### For Developers
- **[API Overview](../api/README.md)** - API features and tech stack
- **[Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)** - Complete AWS ECS deployment
- **[Quick Start](./deployment/QUICK_START.md)** - Get started quickly

### For DevOps
- **[Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)** - Full deployment instructions
- **[Secrets Setup](./guides/CREATE_SECRETS_GUIDE.md)** - AWS Secrets Manager configuration
- **[Docker Setup](./guides/DOCKER_SETUP.md)** - Docker installation
- **[Build & Deploy](./guides/BUILD_AND_DEPLOY.md)** - Build and deployment process

## 📚 Documentation Files

### Deployment
- **DEPLOYMENT_GUIDE.md** - Comprehensive guide for deploying to AWS ECS Fargate
- **DEPLOYMENT_COMPLETE.md** - Current deployment status and verification
- **QUICK_DEPLOY.md** - Quick deployment checklist
- **QUICK_START.md** - Quick reference for common tasks
- **README_DEPLOYMENT.md** - Deployment overview

### Guides
- **BUILD_AND_DEPLOY.md** - Step-by-step build and deployment instructions
- **CREATE_SECRETS_GUIDE.md** - How to set up AWS Secrets Manager secrets
- **DOCKER_SETUP.md** - Docker Desktop installation and setup

## 🔗 Related Documentation

- **API Source Code:** `apps/api/`
- **Deployment Scripts:** `apps/api/*.sh`
- **Task Definition:** `apps/api/task-definition.json`
- **Dockerfile:** `apps/api/Dockerfile`

## 📝 Status

**Current Status:** ✅ **DEPLOYED AND LIVE**

- **API Endpoint:** `https://api.poultryco.net/v1`
- **Health Check:** `https://api.poultryco.net/v1/health`
- **Deployment Date:** 2025-12-29

---

**Last Updated:** 2025-12-29
