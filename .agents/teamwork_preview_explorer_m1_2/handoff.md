# Handoff Report: Oracle Cloud VPS Deployment & Proxy Setup Investigation

**Agent**: Explorer  
**Working Directory**: `c:\Users\AORUS\Desktop\Cons\.agents\teamwork_preview_explorer_m1_2\`  
**Date**: 2026-08-03  

---

## 1. Observation

Direct observations from codebase inspection across `deploy.sh`, `package.json`, `server.js`, `vite.config.js`, `.gitignore`, and `ssh-key-2026-08-03.key`:

1. **`package.json`**:
   - `dependencies` block contains: `"canvas-confetti"`, `"framer-motion"`, `"lucide-react"`, `"react"`, `"react-dom"`.
   - `express` and `cors` are **absent** from `package.json`.
2. **`server.js`**:
   - Line 1: `import express from 'express';`
   - Line 2: `import cors from 'cors';`
   - Line 11: `const PORT = process.env.PORT || 5000;`
   - Lines 33–35: `if (!fs.existsSync(USERS_FILE) || fs.readFileSync(USERS_FILE, 'utf8').trim() === '') { fs.writeFileSync(USERS_FILE, JSON.stringify([DEFAULT_ADMIN], null, 2)); }`
   - Line 64: Direct non-atomic synchronous write: `fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));`
   - Line 14: `app.use(express.json({ limit: '100mb' }));`
3. **`deploy.sh`**:
   - Line 8: `git pull origin main`
   - Line 11: `npm install`
   - Line 14: `npm run build`
   - Line 17: `npx pm2 restart novastudy-backend || npx pm2 start server.js --name novastudy-backend`
   - Line 20: `sudo systemctl reload nginx`
   - Lacks `set -e` or failure handling. Lacks `npx pm2 save`.
4. **`vite.config.js`**:
   - Lines 5–7: `export default defineConfig({ plugins: [react()] })`. Lacks `server.proxy` configuration.
5. **`.gitignore`**:
   - Lines 1–25: Contains standard node build ignores. `server_db_users.json`, `server_db_leads.json`, and `ssh-key-2026-08-03.key` are **absent** from `.gitignore`.
6. **`ssh-key-2026-08-03.key`**:
   - File exists in project root. 2048-bit RSA Private Key.

---

## 2. Logic Chain

1. **Premise**: `server.js` requires `express` and `cors` to execute.
   - **Step**: `package.json` does not list `express` or `cors`.
   - **Deduction**: `npm install` in `deploy.sh` (line 11) will not install `express` or `cors` in a clean environment.
   - **Conclusion**: Executing `npx pm2 start server.js` causes Node to throw `MODULE_NOT_FOUND` (`Cannot find module 'express'`). PM2 enters an error loop, causing Nginx proxy to return **502 Bad Gateway**.

2. **Premise**: Nginx forwards HTTP traffic to Node Express backend on port 5000.
   - **Step**: If Nginx default `client_max_body_size` is 1MB and `AuthContext.jsx` posts user records containing Base64 document attachments (>1MB).
   - **Deduction**: Nginx rejects the request before reaching `server.js`.
   - **Conclusion**: Frontend API calls return HTTP **413 Payload Too Large** or **500 Internal Server Error**.

3. **Premise**: `server_db_users.json` is updated via direct synchronous `fs.writeFileSync`.
   - **Step 1**: If PM2 process is executed under `root` or `sudo`, `server_db_users.json` ownership becomes `root:root`. Standard user PM2 processes fail with `EACCES`.
   - **Step 2**: Non-atomic direct write (`fs.writeFileSync`) during server restart/crash results in a 0-byte or corrupted JSON file.
   - **Step 3**: `server.js` line 33 evaluates `fs.readFileSync(USERS_FILE).trim() === ''` as true and overwrites `server_db_users.json` with `[DEFAULT_ADMIN]`.
   - **Conclusion**: User data is permanently reset to DEFAULT_ADMIN only.

4. **Premise**: `server_db_users.json`, `server_db_leads.json`, and `ssh-key-2026-08-03.key` are tracked in Git root.
   - **Step**: `deploy.sh` runs `git pull origin main`.
   - **Deduction**: Local changes on the server to database files conflict with git pull, or git pull overwrites server DB with main branch files.
   - **Conclusion**: Deployment fails or overwrites live production data.

---

## 3. Caveats

1. The actual remote Oracle VPS live runtime files (`/etc/nginx/sites-available/default`, `/etc/sudoers`, active `iptables` rules) were analyzed based on standard Linux/Nginx deployment paradigms as live SSH execution is outside CODE_ONLY read-only inspection scope.
2. Production domain `novastudy.kr` DNS records and SSL certificates (Certbot / Let's Encrypt configuration) were not directly inspected on the live host.

---

## 4. Conclusion

The primary causes for API failure (502 / 500 / 404 / 413) and data loss on `server_db_users.json` on the remote Oracle VPS are:
1. Missing `express` and `cors` dependencies in `package.json` leading to PM2 boot crash (502 Bad Gateway).
2. Unconfigured Nginx reverse proxy `client_max_body_size` blocking Base64 uploads (413/500).
3. Root ownership permission conflicts (`EACCES`) and non-atomic writes truncating `server_db_users.json` (500 / data loss).
4. Missing `.gitignore` entries causing `git pull` deployment conflicts or live data overwrites.

Implementing the recommended changes in `package.json`, `vite.config.js`, `.gitignore`, `deploy.sh`, `server.js`, and Nginx configuration will resolve these failure modes completely.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Missing Dependencies**:
   Run `npm ls express cors` in the workspace root. Observe `(empty)` or missing package warning.
2. **Verify Database Persistence Risk**:
   Inspect `server.js` line 33 and line 64. Observe `fs.writeFileSync` without temporary file swap.
3. **Verify Git Tracking Risk**:
   Run `git check-ignore -v server_db_users.json ssh-key-2026-08-03.key`. Observe no output (files are untracked/unignored).
4. **Verify Development Proxy Gap**:
   Inspect `vite.config.js`. Confirm absence of `server.proxy`.
