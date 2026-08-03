#!/bin/bash
set -e

# ==========================================
# 🚀 NOVA STUDY - One-Click Deployment Script
# ==========================================

echo "🔒 Setting permissions for database files..."
chmod 666 server_db_*.json 2>/dev/null || true

echo "🔄 1/5 Fetching latest code from GitHub..."
git pull origin main

echo "📦 2/5 Installing dependencies..."
npm install

echo "🛠️ 3/5 Building production bundle..."
npm run build

echo "🌐 Checking Nginx configuration for client_max_body_size..."
if grep -q "client_max_body_size" /etc/nginx/nginx.conf /etc/nginx/sites-enabled/* 2>/dev/null; then
    echo "Nginx client_max_body_size is set."
else
    echo "Notice: Ensure Nginx client_max_body_size 100M; is configured in /etc/nginx/nginx.conf or site config."
fi

echo "⚙️ 4/5 Starting Backend Database API Server..."
npx pm2 restart novastudy-backend || npx pm2 start server.js --name novastudy-backend
npx pm2 save

echo "✨ 5/5 Refreshing Nginx web server..."
sudo systemctl reload nginx || true

echo "✅ SUCCESS! NOVA STUDY is live at http://novastudy.kr"

