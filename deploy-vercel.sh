#!/bin/bash

# PoultryCo - Quick Deploy to Vercel
# This script helps deploy both web and admin apps to Vercel

set -e

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                          ║"
echo "║          🚀 PoultryCo - Vercel Deployment Script                        ║"
echo "║                                                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo ""
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
    echo ""
fi

# Function to deploy an app
deploy_app() {
    local app_name=$1
    local app_path=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Deploying ${app_name}..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    cd "${app_path}"
    
    # Check if .env.local exists
    if [ ! -f .env.local ]; then
        echo "⚠️  WARNING: .env.local not found in ${app_path}"
        echo "You'll need to add environment variables in Vercel dashboard"
        echo ""
    fi
    
    # Test build locally first
    echo "🔨 Testing build locally..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        echo ""
        
        # Deploy to Vercel
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        
        echo ""
        echo "✅ ${app_name} deployed successfully!"
        echo ""
    else
        echo "❌ Build failed for ${app_name}"
        echo "Please fix errors before deploying"
        exit 1
    fi
    
    cd - > /dev/null
}

# Main menu
echo "Select deployment option:"
echo ""
echo "1) Deploy Web App only"
echo "2) Deploy Admin App only"
echo "3) Deploy both (Web + Admin)"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_app "Web App" "apps/web"
        ;;
    2)
        deploy_app "Admin App" "apps/admin"
        ;;
    3)
        deploy_app "Web App" "apps/web"
        deploy_app "Admin App" "apps/admin"
        ;;
    4)
        echo "👋 Deployment cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                          ║"
echo "║          🎉 DEPLOYMENT COMPLETE!                                        ║"
echo "║                                                                          ║"
echo "║  Next steps:                                                            ║"
echo "║  1. Add environment variables in Vercel dashboard                       ║"
echo "║  2. Configure custom domains                                            ║"
echo "║  3. Test your live applications                                         ║"
echo "║  4. Submit sitemap to Google Search Console                             ║"
echo "║                                                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

