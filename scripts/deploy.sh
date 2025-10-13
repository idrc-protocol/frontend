#!/bin/bash

set -e

echo "[INFO] Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}[ERROR] package.json not found. Please run from project root.${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}[INFO] Pulling latest changes from git...${NC}"
git fetch origin
git pull origin main

# Install dependencies
echo -e "${YELLOW}[INFO] Installing dependencies...${NC}"
pnpm install --frozen-lockfile

# Build application
echo -e "${YELLOW}[INFO] Building application...${NC}"
pnpm build

# Restart PM2
echo -e "${YELLOW}[INFO] Restarting PM2 application...${NC}"
pm2 restart idrc-frontend
pm2 save

# Verify deployment
echo -e "${YELLOW}[INFO] Verifying deployment...${NC}"
sleep 3

if pm2 list | grep -q "idrc-frontend.*online"; then
    echo -e "${GREEN}[SUCCESS] Deployment completed successfully${NC}"
else
    echo -e "${RED}[ERROR] Deployment failed - application not online${NC}"
    exit 1
fi
