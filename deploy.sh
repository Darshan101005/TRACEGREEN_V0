#!/bin/bash

# TraceGreen PWA Deployment Script

echo "🌱 TraceGreen PWA Deployment Helper"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building TraceGreen..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Ready to deploy! Run one of these commands:"
    echo ""
    echo "📱 Quick Deploy (Vercel):"
    echo "  vercel --prod"
    echo ""
    echo "🔧 Deploy with custom settings:"
    echo "  vercel deploy --prod"
    echo ""
    echo "🌐 After deployment, test PWA features:"
    echo "  1. Visit your deployed URL in Chrome"
    echo "  2. Look for 'Install TraceGreen' button"
    echo "  3. Test mobile responsiveness"
    echo "  4. Verify Carbon Progress box is fully visible"
    echo ""
    echo "💡 Pro tip: PWA install prompts work better on hosted sites!"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi
