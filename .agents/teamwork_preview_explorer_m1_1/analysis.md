# Technical Analysis: Backend REST API Persistence & DB Sync Vulnerabilities

## Executive Summary
This document provides a comprehensive investigation of the backend REST API persistence mechanism in NovaStudy (`server.js`) and its interaction with `server_db_users.json` and `AuthContext.jsx`. The investigation identified several root causes leading to database persistence failures, silent data loss, write race conditions, and event loop blocking.

---

## 1. System Architecture Overview

- **Backend Entry Point**: `server.js` (Express.js on port 5000 or `process.env.PORT`).
- **Database Files**:
  - `server_db_users.json` (Stores user profiles, roles, authentication credentials, and inline base64 documents).
  - `server_db_leads.json` (Stores consultation lead submissions).
- **Frontend Sync Engine**: `src/context/AuthContext.jsx` (React Context managing authentication state, localStorage fallback `nova_study_users_v2`, and automatic sync with backend API).
- **Deployment**: `deploy.sh` launches `server.js` using PM2 (`novastudy-backend`) and reloads Nginx.

---

## 2. Analysis of Endpoints & File Operations

### A. `GET /api/users` & `GET /users` (`server.js:46-57`)
```javascript
app.get(['/api/users', '/users'], (req, res) => {
  try {
    initDB();
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(data || '[]');
    console.log(`[API GET] Returning ${users.length} users to client.`);
    res.json(users);
  } catch (err) {
    console.error("[API GET ERROR]", err);
    res.json([DEFAULT_ADMIN]);
  }
});
```
- **Execution Flow**:
  1. Invokes `initDB()` to ensure file existence.
  2. Reads file synchronously using `fs.readFileSync(USERS_FILE, 'utf8')`.
  3. Parses JSON string to array.
  4. Returns JSON array with HTTP 200 status.
- **Critical Vulnerability**: In the `catch` block (lines 53-56), any read/parse error returns HTTP 200 with `[DEFAULT_ADMIN]`. If `server_db_users.json` is being written to at that exact moment, `readFileSync` reads empty or partial bytes, throwing `SyntaxError`. Instead of returning an HTTP 500 error, `server.js` returns `[DEFAULT_ADMIN]`, misleading the frontend into thinking only 1 user exists.

### B. `POST /api/users` & `POST /users` (`server.js:60-74`)
```javascript
app.post(['/api/users', '/users'], (req, res) => {
  try {
    const users = req.body;
    if (Array.isArray(users) && users.length > 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log(`[API POST SUCCESS] Saved ${users.length} users to disk.`);
      res.json({ success: true, count: users.length });
    } else {
      res.status(400).json({ error: 'Invalid users array' });
    }
  } catch (err) {
    console.error("[API POST ERROR]", err);
    res.status(500).json({ error: 'Failed to save users database' });
  }
});
```
- **Execution Flow**:
  1. Receives JSON array in request body (`req.body`).
  2. Validates array non-emptiness (`Array.isArray(users) && users.length > 0`).
  3. Synchronously overwrites file using `fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))`.
- **Critical Vulnerability**: `fs.writeFileSync` truncates the file immediately before writing. This operation is non-atomic. If concurrent read requests or server process restarts occur during write, file truncation causes read failures or corruption.

### C. `POST /api/users/create` & `POST /users/create` (`server.js:77-95`)
- Endpoint for single user creation. Unshifts user and writes full array back using `fs.writeFileSync`.
- **Note**: Frontend `AuthContext.jsx` currently bypasses this single-user creation endpoint and performs bulk array posts via `POST /api/users`.

### D. Client-Side Login & Persistence (`AuthContext.jsx:20-152`)
- `loadUsersFromAPI()` fetches `GET /api/users?t=${Date.now()}` with `cache: 'no-store'`.
- `login()` calls `loadUsersFromAPI()` first to fetch real-time user database before validating credentials.
- `saveUsers()` sends full `updatedUsers` array via `POST /api/users`.

---

## 3. Root Cause Investigation Matrix

| # | Bug / Vulnerability | Concrete Location | Root Cause Explanation | Impact |
|---|---------------------|-------------------|------------------------|--------|
| 1 | **Non-Atomic Disk File Writes** | `server.js:64, 88, 117` | `fs.writeFileSync` truncates file content before writing bytes. No atomic replace (`temp file + renameSync`) or atomic lock is used. | Concurrent reads return truncated/empty file, causing JSON parse failure. |
| 2 | **Silent Data Destruction Fallback** | `server.js:55` | `catch` block in `GET /api/users` returns `res.json([DEFAULT_ADMIN])` with HTTP 200 on error. | Frontend receives single admin user, merges with local state, and syncs back (`POST /api/users`), permanently wiping all non-admin users from server DB. |
| 3 | **Event Loop Blocking via Base64 Inlining** | `server.js:14`, `AuthContext.jsx:228-232` | Express limit is `100mb`. Documents are stored as Base64 strings inside `server_db_users.json`. `fs.writeFileSync` with large JSON blocks Node.js event loop synchronously. | High latency, request timeouts, and wider window for race conditions during document uploads. |
| 4 | **Lack of Dev Proxy / Route Alignment** | `vite.config.js:5-7`, `deploy.sh:20` | `vite.config.js` lacks proxy settings for `/api`. Nginx configuration must proxy `/api` requests to `http://127.0.0.1:5000`. | Without Nginx proxy or Vite proxy, `/api/users` returns 404 or index.html, breaking server DB sync. |
| 5 | **File Permission & Missing Directory Errors** | `server.js:17-18, 31-42` | `USERS_FILE` uses root relative path `__dirname`. If PM2/node process lacks write permissions in project root, `fs.writeFileSync` fails with `EACCES`. | DB initialization fails silently or throws unhandled 500 errors on POST. |
| 6 | **Unvalidated Data Schema Overwrite** | `server.js:63` | `POST /api/users` only checks `Array.isArray(users) && users.length > 0`. It does not validate required user properties (`id`, `username`, `role`). | Malformed payload from client can overwrite database with corrupt user objects. |

---

## 4. Logical Cascade of Data Loss (Race Condition Example)

1. **User A** uploads a large PDF document (5MB Base64 string). `AuthContext.jsx` calls `saveUsers()`, executing `POST /api/users`.
2. **`server.js`** receives request and executes `fs.writeFileSync(USERS_FILE, ...)` (takes ~50ms to write 5MB string synchronously).
3. **User B** clicks Login or opens website during those 50ms. `AuthContext.jsx` fires `GET /api/users?t=...`.
4. **`server.js`** handles `GET /api/users` and executes `fs.readFileSync(USERS_FILE)`. Because the file is currently truncated by `writeFileSync`, `readFileSync` gets an incomplete JSON string.
5. **`JSON.parse`** in `server.js:50` fails with `SyntaxError`.
6. **`catch` block** in `server.js:55` catches the error and executes `res.json([DEFAULT_ADMIN])` with **HTTP 200 OK**.
7. **User B's client** receives `[DEFAULT_ADMIN]`. If User B's local storage is clean, `mergedUsers` becomes `[DEFAULT_ADMIN]`.
8. **User B's client** executes `loadUsersFromAPI()` line 75: `if (mergedUsers.length > 1)` (or if User B creates/updates user), calling `POST /api/users` with only `DEFAULT_ADMIN` or corrupted array.
9. **`server_db_users.json`** is overwritten on disk. **All user accounts and document records are permanently lost.**

---

## 5. Recommended Remediation & Patch Strategy

1. **Implement Atomic File Writing**:
   - Write to a temporary file (`server_db_users.json.tmp`) first, then use atomic file replacement: `fs.renameSync(tempFile, targetFile)`.
2. **Proper Error HTTP Status Codes**:
   - In `GET /api/users` catch block, return `res.status(500).json({ error: 'Failed to read users database' })` instead of returning `[DEFAULT_ADMIN]` with HTTP 200.
3. **In-Memory Caching & Lock Mechanism**:
   - Maintain an in-memory cache of users in Node.js server to avoid reading disk on every single GET request.
   - Use asynchronous file writes (`fs.promises.writeFile`) with a write mutex / promise lock.
4. **Vite Proxy Configuration**:
   - Add proxy settings in `vite.config.js` pointing `/api` to `http://localhost:5000`.
5. **Schema & Admin Protection**:
   - Ensure `DEFAULT_ADMIN` is always preserved in `server.js` before saving array to disk.
