#!/bin/bash

# ==========================================
# 🚀 NOVA STUDY - One-Click Deployment Script
# ==========================================

echo "🔄 1/5 Fetching latest code from GitHub..."
git pull origin main

echo "📦 2/5 Installing dependencies..."
npm install

echo "🛠️ 3/5 Building production bundle..."
npm run build

echo "⚙️ 4/5 Starting Backend Database API Server..."
npx pm2 restart novastudy-backend || npx pm2 start server.js --name novastudy-backend

echo "✨ 5/5 Refreshing Nginx web server..."
sudo systemctl reload nginx

echo "✅ SUCCESS! NOVA STUDY is live at http://novastudy.kr"
