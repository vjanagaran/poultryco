# Docker Setup for Deployment

## Problem

When running `./deploy.sh`, you get:
```
./deploy.sh: line 27: docker: command not found
```

This means Docker is not installed or not in your PATH.

---

## Solution: Install Docker

### macOS (Recommended: Docker Desktop)

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download Docker Desktop for Mac (Apple Silicon or Intel)
   - Install the `.dmg` file

2. **Start Docker Desktop:**
   - Open Docker Desktop from Applications
   - Wait for it to start (whale icon in menu bar)
   - Verify: `docker --version` should work

3. **Alternative: Homebrew**
   ```bash
   brew install --cask docker
   ```

### Linux

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (to run without sudo)
sudo usermod -aG docker $USER
# Log out and back in for group change to take effect
```

### Verify Installation

```bash
docker --version
docker ps
```

You should see Docker version and an empty container list.

---

## After Installing Docker

1. **Start Docker Desktop** (if on macOS)
2. **Verify Docker is running:**
   ```bash
   docker ps
   ```
   Should not show an error

3. **Run deployment:**
   ```bash
   cd apps/api
   ./deploy.sh
   ```

---

## Troubleshooting

### "Cannot connect to Docker daemon"
- Docker Desktop is not running (macOS/Windows)
- Docker service is not started (Linux): `sudo systemctl start docker`

### "Permission denied"
- On Linux, add user to docker group: `sudo usermod -aG docker $USER`
- Or run with sudo: `sudo docker ...` (not recommended)

### Docker Desktop won't start
- Check system requirements
- Ensure virtualization is enabled in BIOS (for older systems)
- Check Docker Desktop logs

---

## Next Steps

Once Docker is installed and running:

1. **Build and push image:**
   ```bash
   cd apps/api
   ./deploy.sh
   ```

2. **Monitor deployment:**
   ```bash
   aws ecs describe-services \
     --cluster poultryco-cluster \
     --services poultryco-api \
     --region ap-south-1
   ```

3. **Test API:**
   ```bash
   curl https://api.poultryco.net/v1/health
   ```

