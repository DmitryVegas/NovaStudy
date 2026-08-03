#!/bin/bash
set -e

# ==========================================
# 🚀 NOVA STUDY - One-Click Deployment Script
# ==========================================

echo "🔒 1/6 Granting full file ownership to ubuntu user..."
sudo chown -R ubuntu:ubuntu ~/NovaStudy
sudo chmod -R 755 ~/NovaStudy

echo "🔄 2/6 Resetting & Fetching latest code from GitHub..."
git reset --hard origin/main
git pull origin main

echo "📦 3/6 Installing dependencies..."
npm install

echo "🛠️ 4/6 Building production bundle..."
npm run build

echo "⚙️ 5/6 Starting Backend Database API Server..."
npx pm2 restart novastudy-backend || npx pm2 start server.js --name novastudy-backend
npx pm2 save

echo "✨ 6/6 Refreshing Nginx web server..."
sudo systemctl reload nginx

echo "✅ SUCCESS! NOVA STUDY is live at https://novastudy.kr"
