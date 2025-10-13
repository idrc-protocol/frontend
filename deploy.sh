#!/bin/bash

# IDRC Frontend Deployment Script
# This script automates the deployment process locally

set -e

echo "=========================================="
echo "🚀 IDRC Frontend Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check current status
echo -e "${YELLOW}[1/6]${NC} 📊 Checking current status..."
if pm2 describe idrc-frontend > /dev/null 2>&1; then
    echo "✓ PM2 process found"
    pm2 describe idrc-frontend | grep -E "(status|uptime|restarts)" | head -3
else
    echo "⚠️  PM2 process not found (will be created)"
fi
echo ""

# Step 2: Pull latest changes
echo -e "${YELLOW}[2/6]${NC} 📥 Pulling latest changes from Git..."
BEFORE_COMMIT=$(git rev-parse HEAD)
git fetch origin
git pull origin main

AFTER_COMMIT=$(git rev-parse HEAD)
if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
    echo -e "${GREEN}✓${NC} Already up to date"
else
    echo -e "${GREEN}✓${NC} Updated from ${BEFORE_COMMIT:0:7} to ${AFTER_COMMIT:0:7}"
    git log --oneline --no-merges $BEFORE_COMMIT..$AFTER_COMMIT | head -5
fi
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[3/6]${NC} 📦 Installing dependencies..."
pnpm install --frozen-lockfile
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 4: Build application
echo -e "${YELLOW}[4/6]${NC} 🔨 Building application..."
pnpm build
echo -e "${GREEN}✓${NC} Build completed"
echo ""

# Step 5: Restart/Start PM2
echo -e "${YELLOW}[5/6]${NC} 🔄 Updating PM2 process..."
if pm2 describe idrc-frontend > /dev/null 2>&1; then
    echo "Reloading existing PM2 process..."
    pm2 reload idrc-frontend --update-env
    echo -e "${GREEN}✓${NC} PM2 process reloaded"
else
    echo "Starting new PM2 process..."
    pm2 start pnpm --name "idrc-frontend" -- start
    echo -e "${GREEN}✓${NC} PM2 process started"
fi

# Save PM2 configuration
pm2 save --force
echo -e "${GREEN}✓${NC} PM2 configuration saved"
echo ""

# Step 6: Verify deployment
echo -e "${YELLOW}[6/6]${NC} ✅ Verifying deployment..."
sleep 3

PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="idrc-frontend") | .pm2_env.status' 2>/dev/null || echo "unknown")

if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "📊 Application Status:"
    pm2 show idrc-frontend | grep -E "(status|uptime|restarts|memory|cpu)" | head -6
    echo ""
    echo "🌐 Application should be available shortly"
else
    echo -e "${RED}❌ Deployment failed - Status: $PM2_STATUS${NC}"
    echo ""
    echo "📋 Recent logs:"
    pm2 logs idrc-frontend --lines 20 --nostream
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete${NC}"
echo "=========================================="
echo ""
echo "💡 Useful commands:"
echo "  - View logs: pm2 logs idrc-frontend"
echo "  - Check status: pm2 status"
echo "  - Restart: pm2 restart idrc-frontend"
echo "  - Monitor: pm2 monit"
