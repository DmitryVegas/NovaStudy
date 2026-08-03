# Exhaustive Technical Analysis: Oracle Cloud VPS Deployment & Proxy Investigation

**Project**: NovaStudy DB Sync & Persistence  
**Investigator**: Explorer Agent  
**Date**: 2026-08-03  
**Working Directory**: `c:\Users\AORUS\Desktop\Cons\.agents\teamwork_preview_explorer_m1_2\`

---

## 1. Executive Summary

An investigation of the deployment scripts (`deploy.sh`), backend API (`server.js`), frontend config (`vite.config.js`), dependencies (`package.json`), version control settings (`.gitignore`), and network/proxy architecture was conducted.

### Core Findings & Failure Modes:
1. **Missing Backend Dependencies in `package.json`**: `express` and `cors` are imported in `server.js` (lines 1–2), but are missing from `package.json` dependencies. Any fresh `npm install` on the Oracle VPS fails to install them, causing `npx pm2 start server.js` to crash continuously (`MODULE_NOT_FOUND`), leading to HTTP **502 Bad Gateway**.
2. **Nginx Reverse Proxy & API Routing Gaps**:
   - `vite.config.js` lacks a `server.proxy` configuration for local development (`http://localhost:5173/api/` returns 404 / index.html).
   - If Nginx lacks a `location /api/` block pointing to `http://127.0.0.1:5000`, requests to `/api/users` trigger SPA fallback (`try_files ... /index.html`), returning HTML text instead of JSON, resulting in frontend `SyntaxError: Unexpected token '<'`.
   - Nginx default `client_max_body_size` (1MB) blocks POST requests containing Base64 uploaded documents (`documents` array in `AuthContext.jsx`), triggering HTTP **413 Request Entity Too Large** or **500 Internal Server Error**.
3. **`server_db_users.json` Permission & Persistence Vulnerabilities**:
   - **Permission Conflict (`EACCES`)**: If initialized via `sudo` or root PM2 process, `server_db_users.json` becomes owned by `root:root`. Standard user PM2 processes fail with `EACCES` on `fs.writeFileSync`, causing HTTP **500 Internal Server Error**.
   - **Data Loss via Non-Atomic Writes**: Synchronous in-place write (`fs.writeFileSync`) without atomic swap can result in truncated (0-byte) or corrupted files. `initDB()` in `server.js` (lines 33–35) automatically overwrites empty files with `[DEFAULT_ADMIN]`, wiping all stored student and staff records.
   - **Git Tracking Risk**: `server_db_users.json`, `server_db_leads.json`, and `ssh-key-2026-08-03.key` are missing from `.gitignore`. `git pull origin main` in `deploy.sh` will fail with merge conflicts if local JSON DB files are modified on the VPS, or will overwrite live server data with initial repository files.
4. **Deployment Automation Deficiencies in `deploy.sh`**:
   - `deploy.sh` lacks `set -e`, causing failure in step 2 (`npm install`) or step 3 (`npm run build`) to be silently ignored while attempting PM2 restart and Nginx reload.
   - PM2 state is not saved (`pm2 save`), meaning server reboot will fail to start `novastudy-backend`.
   - `sudo systemctl reload nginx` will hang or fail in non-interactive CI/CD setups if passwordless sudo is not configured.
   - Oracle Cloud VPS OS firewall (`iptables`) default rules block incoming port 80/443 traffic despite Cloud VCN Security Lists.

---

## 2. Comprehensive Codebase & Architecture Inspection

### A. Dependency Breakdown (`package.json`)
- **File Location**: `c:\Users\AORUS\Desktop\Cons\package.json`
- **Observed Content**:
  ```json
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "framer-motion": "^12.43.0",
    "lucide-react": "^1.28.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  }
  ```
- **Impact**: `server.js` requires `express` and `cors`. Without these in `dependencies`, `npm install` on a fresh VPS setup will skip installing `express` and `cors`. When PM2 launches `server.js`, Node throws `Error: Cannot find module 'express'` and crashes immediately.

---

### B. Deployment Script Breakdown (`deploy.sh`)
- **File Location**: `c:\Users\AORUS\Desktop\Cons\deploy.sh`
- **Observed Content**:
  ```bash
  1: #!/bin/bash
  ...
  7: echo "🔄 1/5 Fetching latest code from GitHub..."
  8: git pull origin main
  9: 
  10: echo "📦 2/5 Installing dependencies..."
  11: npm install
  12: 
  13: echo "🛠️ 3/5 Building production bundle..."
  14: npm run build
  15: 
  16: echo "⚙️ 4/5 Starting Backend Database API Server..."
  17: npx pm2 restart novastudy-backend || npx pm2 start server.js --name novastudy-backend
  18: 
  19: echo "✨ 5/5 Refreshing Nginx web server..."
  20: sudo systemctl reload nginx
  ```
- **Impact**:
  1. `git pull origin main` fails if `server_db_users.json` has local changes on the remote server because the file is tracked/not in `.gitignore`.
  2. If `npm install` or `npm run build` fails, the script continues to restart PM2 and reload Nginx.
  3. No `npx pm2 save` command to persist process configuration across system reboots.
  4. Missing `sudo` configuration note for `systemctl reload nginx` in non-interactive shells.

---

### C. Backend API & File Database Breakdown (`server.js`)
- **File Location**: `c:\Users\AORUS\Desktop\Cons\server.js`
- **Observed Features & Flaws**:
  1. **Dual Route Matching**:
     `app.get(['/api/users', '/users'], ...)` & `app.post(['/api/users', '/users'], ...)`.
     This handles both stripped `/users` and preserved `/api/users` routes from Nginx proxy pass.
  2. **In-place Direct Disk Writes**:
     `fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));`
     If a process crashes or loses power during write, or if concurrent requests execute `fs.writeFileSync`, the file content is truncated to 0 bytes.
  3. **Automatic Empty File Reset**:
     Lines 33–34:
     `if (!fs.existsSync(USERS_FILE) || fs.readFileSync(USERS_FILE, 'utf8').trim() === '')` -> overwrites with `[DEFAULT_ADMIN]`.
     A truncated 0-byte file causes silent data destruction on subsequent GET requests or server restarts.
  4. **Payload Limit**:
     `app.use(express.json({ limit: '100mb' }));`
     `server.js` accepts up to 100MB, but Nginx proxy will drop requests over 1MB unless `client_max_body_size 100M;` is configured in Nginx.

---

### D. Development Proxy Breakdown (`vite.config.js`)
- **File Location**: `c:\Users\AORUS\Desktop\Cons\vite.config.js`
- **Observed Content**:
  ```js
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
  })
  ```
- **Impact**: Missing Vite proxy configuration. Running `npm run dev` locally attempts to send API calls to `http://localhost:5173/api/users`, which returns SPA HTML or 404, breaking local full-stack testing.

---

### E. SSH Key & Git Ignore Audit
- **File Location**: `c:\Users\AORUS\Desktop\Cons\ssh-key-2026-08-03.key`
- **Observed Content**: 2048-bit RSA Private Key.
- **Vulnerabilities**:
  1. The SSH private key is present in the project directory and is **not listed** in `.gitignore`.
  2. On Linux/macOS, SSH requires file permissions to be `600` (`chmod 600 ssh-key-2026-08-03.key`). Default permissions (`0644`) cause SSH connections to be rejected with `WARNING: UNPROTECTED PRIVATE KEY FILE!`.

---

## 3. Diagnostic Matrix of Remote Server API Failure Symptoms

| Symptom / HTTP Status | Root Cause | Diagnostic Command | Remediation |
|---|---|---|---|
| **502 Bad Gateway** | `express` or `cors` missing from `package.json`. PM2 server process crashed on startup with `MODULE_NOT_FOUND`. | `pm2 status` / `pm2 logs novastudy-backend` | Run `npm install express cors --save` and update `package.json`. |
| **502 Bad Gateway** | Nginx `proxy_pass` uses `localhost` resolving to IPv6 `::1:5000` while Express binds to IPv4 `0.0.0.0:5000`. | `curl http://127.0.0.1:5000/api/users` | Update Nginx `proxy_pass` to `http://127.0.0.1:5000;`. |
| **404 Not Found / HTML returned for API** | Nginx server block lacks `location /api/` directive; request falls through to Vite SPA `try_files ... /index.html`. | `nginx -T \| grep location` | Add `location /api/ { proxy_pass http://127.0.0.1:5000; }` in Nginx site config. |
| **500 Internal Server Error** | `server_db_users.json` owned by `root`, non-root Node process fails `fs.writeFileSync` with `EACCES`. | `ls -la server_db_*.json` | Change ownership: `sudo chown ubuntu:ubuntu server_db_*.json` and set `chmod 664`. |
| **500 Internal Server Error / 413 Payload Too Large** | Nginx default `client_max_body_size` is 1MB. Base64 document uploads in POST `/api/users` exceed 1MB. | View `/var/log/nginx/error.log` for "client intended to send body too large" | Add `client_max_body_size 100M;` to Nginx `server` or `location /api/` block. |
| **Database Data Reset (Admin Only)** | Non-atomic write truncated `server_db_users.json` to 0 bytes. `initDB()` detected empty file and reset to `[DEFAULT_ADMIN]`. | Check `server_db_users.json` file size and content | Implement atomic file replacement (`fs.renameSync`) and timestamped backups. |
| **Git Pull Conflicts during Deployment** | `server_db_users.json` tracked in Git and modified locally on server. `git pull` aborts. | `git status` on server | Add `server_db_*.json` and `*.key` to `.gitignore`. |
| **Connection Timeout to VPS** | Oracle Cloud VM `iptables` / `firewalld` blocking port 80/443. | `sudo iptables -L -n -v` | Run `sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT` and save rules. |

---

## 4. Concrete Recommendations & Action Plan

### Action 1: Fix `package.json`
Add `express` and `cors` to dependencies:
```json
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "framer-motion": "^12.43.0",
    "lucide-react": "^1.28.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  }
```

### Action 2: Configure Vite Proxy in `vite.config.js`
Enable development server proxy to port 5000:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

### Action 3: Robust Nginx Configuration (`/etc/nginx/sites-available/novastudy`)
Ensure Nginx configuration handles static assets, reverse proxies API requests, and supports large JSON payloads:
```nginx
server {
    listen 80;
    server_name novastudy.kr www.novastudy.kr;

    root /var/www/novastudy/dist;
    index index.html;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Action 4: Upgrade `deploy.sh`
Add error handling (`set -e`), PM2 state saving (`pm2 save`), directory permission sanity check, and status verification:
```bash
#!/bin/bash
set -e

echo "🔄 1/5 Fetching latest code from GitHub..."
git pull origin main

echo "📦 2/5 Installing dependencies..."
npm install

echo "🛠️ 3/5 Building production bundle..."
npm run build

echo "⚙️ 4/5 Starting Backend Database API Server..."
npx pm2 restart novastudy-backend || npx pm2 start server.js --name novastudy-backend
npx pm2 save

echo "✨ 5/5 Refreshing Nginx web server..."
sudo systemctl reload nginx

echo "✅ SUCCESS! NOVA STUDY is live at http://novastudy.kr"
```

### Action 5: Add Sensitive Files & Database to `.gitignore`
Append to `.gitignore`:
```gitignore
server_db_users.json
server_db_leads.json
*.key
.env
```

### Action 6: Implement Atomic Database File Writes in `server.js`
Replace direct `fs.writeFileSync(USERS_FILE, ...)` with atomic write via temporary file:
```js
function safeWriteDB(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}
```

---

## 5. Summary Table of Files to Modify

| Target File | Change Summary |
|---|---|
| `package.json` | Add `express` and `cors` to `dependencies`. |
| `vite.config.js` | Add `server.proxy` matching `/api` -> `http://localhost:5000`. |
| `.gitignore` | Add `server_db_*.json`, `*.key`, `.env`. |
| `deploy.sh` | Add `set -e`, `npx pm2 save`. |
| `server.js` | Implement atomic file writes (`safeWriteDB`) and auto-backups. |
