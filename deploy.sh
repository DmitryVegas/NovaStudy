#!/bin/bash

# ==========================================
# 🚀 NOVA STUDY - One-Click Deployment Script
# ==========================================

echo "🔄 1/4 Fetching latest code from GitHub..."
git pull origin main

echo "📦 2/4 Installing dependencies..."
npm install

echo "🛠️ 3/4 Building production bundle..."
npm run build

echo "✨ 4/4 Refreshing Nginx web server..."
sudo systemctl reload nginx

echo "✅ SUCCESS! NOVA STUDY is live at https://novastudy.kr"
