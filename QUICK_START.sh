#!/bin/bash

# 🚀 MELCHO PRODUCTION DEPLOYMENT QUICK START
# Run these commands in order

echo "🔍 Melcho Production Deployment Setup"
echo "======================================"
echo ""

# Step 1: Push to GitHub
echo "Step 1: Pushing code to GitHub..."
cd d:/New\ folder/melcho

git checkout main 2>/dev/null
git add . 
git commit -m "fix: cors, auth guards, protected routes, product seed, node20 ci" 2>/dev/null || echo "No changes to commit"
git push origin main

echo "✅ Code pushed!"
echo ""
echo "Go to: https://github.com/Subbarao2005/claude"
echo "Verify: Check that all files are in main branch"
echo ""

# Step 2: Configure Render
echo "Step 2: Configure Render Environment Variables"
echo "=============================================="
echo "Go to: https://render.com"
echo "1. Click on melcho-api service"
echo "2. Settings → Environment"
echo "3. Add these variables:"
echo ""
echo "   NODE_ENV = production"
echo "   PORT = 5000"
echo "   MONGO_URI = mongodb+srv://[your_connection_string]"
echo "   JWT_SECRET = [random_32+_char_string]"
echo "   RAZORPAY_KEY_ID = rzp_test_xxxxx"
echo "   RAZORPAY_KEY_SECRET = [your_secret]"
echo "   ALLOWED_ORIGINS = https://claude-eg03xzppt-subbarao-s-projects.vercel.app"
echo ""
echo "4. Click 'Save Changes'"
echo "5. Wait for auto-redeploy (~2-3 minutes)"
echo ""
read -p "Press Enter when Render redeploy is complete..."
echo ""

# Step 3: Configure GitHub Secrets
echo "Step 3: Configure GitHub Secrets"
echo "================================"
echo "Go to: https://github.com/Subbarao2005/claude"
echo "Settings → Secrets and variables → Actions"
echo ""
echo "Add these secrets:"
echo "  - RENDER_DEPLOY_HOOK (from Render dashboard)"
echo "  - API_URL (https://melcho-api.onrender.com)"
echo "  - APP_URL (https://claude-eg03xzppt-subbarao-s-projects.vercel.app)"
echo "  - VERCEL_TOKEN (from vercel.com/account/tokens)"
echo "  - VERCEL_ORG_ID (from Vercel project settings)"
echo "  - VERCEL_PROJECT_ID (from Vercel project settings)"
echo "  - ADMIN_EMAIL (admin@melcho.com)"
echo "  - ADMIN_PASSWORD (your_admin_password)"
echo ""
read -p "Press Enter when GitHub Secrets are configured..."
echo ""

# Step 4: Seed Products
echo "Step 4: Seeding Products to Database"
echo "===================================="
echo ""
cd d:/New\ folder/melcho/server
echo "Run this command:"
echo "MONGO_URI=\"mongodb+srv://user:pass@cluster.mongodb.net/melcho\" npm run seed:products"
echo ""
read -p "Paste your MONGO_URI (or press Enter to skip): " mongo_uri

if [ ! -z "$mongo_uri" ]; then
  MONGO_URI="$mongo_uri" npm run seed:products
  echo "✅ Products seeded!"
fi
echo ""

# Step 5: Verify Production
echo "Step 5: Verify Production Deployment"
echo "===================================="
cd d:/New\ folder/melcho/tests
echo ""
echo "Running production verification..."
echo ""
node verify-production.js

echo ""
echo "======================================"
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Monitor GitHub Actions: https://github.com/Subbarao2005/claude/actions"
echo "2. Every push to main will auto-deploy & test"
echo "3. Check Render logs: https://render.com"
echo "4. Check Vercel deployments: https://vercel.com/dashboard"
echo ""
