#!/bin/bash

echo "🚀 Finance SaaS Deployment Helper"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
fi

echo "Step 1: Commit your changes"
git add .
git commit -m "Prepare for deployment"

echo ""
echo "Step 2: Create GitHub repository"
echo "👉 Go to: https://github.com/new"
echo "   - Repository name: finance-saas"
echo "   - Make it Public or Private"
echo "   - Do NOT initialize with README (we already have one)"
echo "   - Click 'Create repository'"
echo ""
read -p "Press Enter after creating GitHub repository..."

echo ""
echo "Step 3: Enter your GitHub repository URL"
echo "Example: https://github.com/yourusername/finance-saas.git"
read -p "GitHub URL: " GITHUB_URL

echo ""
echo "Connecting to GitHub..."
git remote add origin "$GITHUB_URL"
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "=================================="
echo "NEXT STEPS:"
echo "=================================="
echo ""
echo "1️⃣  Deploy Backend to Render:"
echo "   👉 https://render.com"
echo "   - Sign up with GitHub"
echo "   - New Web Service"
echo "   - Select your repository"
echo "   - Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "2️⃣  Deploy Frontend to Netlify:"
echo "   👉 https://app.netlify.com"
echo "   - Sign up with GitHub"
echo "   - New site from Git"
echo "   - Select your repository"
echo "   - Base directory: client"
echo "   - Build command: npm run build"
echo "   - Publish directory: client/dist"
echo "   - Add VITE_API_URL environment variable"
echo ""
echo "📖 Full guide: See DEPLOYMENT_GUIDE.md"
echo ""

