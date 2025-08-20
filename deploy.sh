#!/bin/bash

# Customer Requirement Tracker Deployment Script
echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
else
    echo "📁 Git repository already exists"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository as remote origin:"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    echo ""
    echo "📋 Then follow these steps:"
    echo "1. Go to render.com and sign up/login"
    echo "2. Click 'New +' and select 'Blueprint'"
    echo "3. Connect your GitHub repository"
    echo "4. Render will automatically deploy using render.yaml"
else
    echo "🔗 Remote origin found"
    echo "📤 Pushing latest changes..."
    git add .
    git commit -m "Update for deployment"
    git push origin main
    echo "✅ Changes pushed to GitHub"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to render.com dashboard"
    echo "2. Your app should be deploying automatically"
    echo "3. Check the deployment logs for any issues"
fi

echo ""
echo "🎯 Deployment setup complete!"
echo "📖 See README.md for detailed deployment instructions"
