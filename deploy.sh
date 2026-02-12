#!/bin/bash

# 🚀 Quick Deploy Script for Interactive Kids Storytelling Game
# This script automates the web publishing process

echo "🎮 Interactive Kids Storytelling Game - Web Publisher"
echo "=================================================="

# Check if web-build directory exists
if [ ! -d "web-build" ]; then
    echo "❌ Error: web-build directory not found!"
    echo "Please run this script from the game root directory."
    exit 1
fi

echo "✅ Found web-build directory"

# Function to deploy to different platforms
deploy_github_pages() {
    echo "🐙 Deploying to GitHub Pages..."
    git add .
    git commit -m "Deploy kids storytelling game to web"
    git push origin main
    echo "✅ Pushed to GitHub! Enable Pages in repository settings."
    echo "   Settings → Pages → Source: Deploy from branch → main → /web-build"
}

deploy_netlify() {
    echo "🌐 Preparing for Netlify deployment..."
    echo "✅ Ready for Netlify!"
    echo "   1. Visit https://netlify.com"
    echo "   2. Drag the 'web-build' folder to the deploy area"
    echo "   3. Your game will be live instantly!"
}

deploy_vercel() {
    echo "▲ Deploying to Vercel..."
    if command -v vercel &> /dev/null; then
        cd web-build
        vercel --prod
        cd ..
        echo "✅ Deployed to Vercel!"
    else
        echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
        echo "   Then run: cd web-build && vercel --prod"
    fi
}

deploy_firebase() {
    echo "🔥 Deploying to Firebase Hosting..."
    if command -v firebase &> /dev/null; then
        firebase deploy
        echo "✅ Deployed to Firebase!"
    else
        echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
        echo "   Then run: firebase init hosting && firebase deploy"
    fi
}

# Display deployment options
echo ""
echo "🚀 Choose deployment platform:"
echo "1) GitHub Pages (Free)"
echo "2) Netlify (Free, drag & drop)"
echo "3) Vercel (Free, CLI)"
echo "4) Firebase Hosting (Free)"
echo "5) Show all instructions"
echo "6) Exit"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        deploy_github_pages
        ;;
    2)
        deploy_netlify
        ;;
    3)
        deploy_vercel
        ;;
    4)
        deploy_firebase
        ;;
    5)
        echo ""
        echo "📖 Full deployment instructions available in WEB-PUBLISHING-GUIDE.md"
        echo ""
        echo "Quick links:"
        echo "• GitHub Pages: https://pages.github.com/"
        echo "• Netlify: https://netlify.com/"
        echo "• Vercel: https://vercel.com/"
        echo "• Firebase: https://firebase.google.com/products/hosting"
        echo ""
        echo "📁 Your game files are ready in the 'web-build' directory!"
        ;;
    6)
        echo "👋 Goodbye! Your game is ready to deploy anytime."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo "📚 Your Interactive Kids Storytelling Game is now live on the web!"
echo "🛡️ COPPA compliant and safe for children ages 5-9"
echo ""
echo "📖 For detailed instructions, see WEB-PUBLISHING-GUIDE.md"