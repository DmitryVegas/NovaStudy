# Explorer Subagent (M1_1) Handoff Report: Backend REST API Persistence Analysis

## 1. Observation

### Key Code & File Inspection Findings:
1. **`server.js` (lines 17-18, 30-42)**:
   - File paths: `USERS_FILE = path.join(__dirname, 'server_db_users.json')`
   - `initDB()` synchronously reads and initializes `server_db_users.json` with `[DEFAULT_ADMIN]` if file missing or empty.
2. **`server.js` (lines 46-57)** - `GET /api/users` & `GET /users`:
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
   - **Verbatim Error Path**: Catch block catches file read or `JSON.parse` exception and returns HTTP 200 with `[DEFAULT_ADMIN]`.
3. **`server.js` (lines 60-74)** - `POST /api/users` & `POST /users`:
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
   - Uses non-atomic `fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))`.
4. **`src/context/AuthContext.jsx` (lines 20-86, 101-117)**:
   - `loadUsersFromAPI` queries `GET /api/users?t=${Date.now()}` with `cache: 'no-store'`.
   - On response, merges `serverUsers` and `localUsers` by username.
   - If `serverUsers` returns `[DEFAULT_ADMIN]` during a backend read failure, frontend merges `DEFAULT_ADMIN` with local cache. If local cache is empty or wiped, frontend overwrites backend via `POST /api/users` with `[DEFAULT_ADMIN]`, permanently erasing data.
5. **Base64 Documents Inlining (`AuthContext.jsx:228-232`)**:
   - Documents are stored as Base64 strings inside user objects (`u.documents[].dataUrl`), increasing payload size to 10-100MB and causing synchronous `fs.writeFileSync` to block the Node.js event loop.
6. **`vite.config.js` (lines 1-8)**:
   - No `server.proxy` configured for `/api` endpoint routing in development mode.
7. **`deploy.sh` (lines 16-20)**:
   - Uses `pm2 restart novastudy-backend` on port 5000 and reloads Nginx. If Nginx `/api` reverse proxy directive is missing, requests return static HTML 404.

---

## 2. Logic Chain

1. **Premise**: `server.js` uses synchronous `fs.writeFileSync` directly on `server_db_users.json` when servicing `POST /api/users`.
2. **Step 1 (File Truncation)**: Node.js `fs.writeFileSync` opens the file in write mode, truncating existing contents to 0 bytes before writing new data.
3. **Step 2 (Concurrent Read Interception)**: If a `GET /api/users` request occurs while `fs.writeFileSync` is executing, `fs.readFileSync` reads 0 bytes or an incomplete JSON string.
4. **Step 3 (JSON Parse Failure)**: `JSON.parse('')` or `JSON.parse('{incomplete...}')` throws `SyntaxError`.
5. **Step 4 (False 200 Fallback)**: The `catch` block in `server.js:55` catches the error and executes `res.json([DEFAULT_ADMIN])` with HTTP 200 OK status.
6. **Step 5 (Frontend Cache Corruption & Overwrite)**: `AuthContext.jsx` receives HTTP 200 OK with `[DEFAULT_ADMIN]`. If local storage has no cached users (or gets merged), client considers `[DEFAULT_ADMIN]` as the canonical server state.
7. **Step 6 (Data Erasure)**: `AuthContext.jsx` executes subsequent `saveUsers()` or auto-sync, issuing `POST /api/users` with `[DEFAULT_ADMIN]`, overwriting the database file on disk and destroying all registered users.
8. **Conclusion**: Synchronous non-atomic file writing coupled with the HTTP 200 error fallback in `GET /api/users` is the root cause of database persistence failures and silent user data loss.

---

## 3. Caveats

- Production Nginx configuration file (`/etc/nginx/sites-available/...`) was not directly inspected as it resides on the deployment server host environment; however `deploy.sh` and `vite.config.js` confirm the reliance on Nginx reverse proxying.
- Node.js runtime process write permissions depend on execution user in production (`deploy.sh` uses `pm2`).

---

## 4. Conclusion

Backend REST API persistence in `server.js` suffers from 3 critical architectural defects:
1. **Non-atomic synchronous file writing** (`fs.writeFileSync`) creating write/read race conditions.
2. **Dangerous HTTP 200 error fallback** in `GET /api/users` returning `[DEFAULT_ADMIN]`, triggering client-side database wiping.
3. **Event loop blocking & disk I/O bottlenecks** caused by storing large Base64 files directly in `server_db_users.json`.

---

## 5. Verification Method

### How to Independently Verify Findings:

1. **Inspect Code Files**:
   - View `c:\Users\AORUS\Desktop\Cons\server.js` lines 46-74 to verify `fs.writeFileSync` and `catch (err) { res.json([DEFAULT_ADMIN]); }`.
   - View `c:\Users\AORUS\Desktop\Cons\src\context\AuthContext.jsx` lines 20-86 to verify automatic sync and merge logic.

2. **Simulate Concurrent Write/Read Race Condition**:
   - Run `node server.js` in terminal.
   - Send `POST /api/users` with a large payload (e.g. 10MB JSON).
   - Simultaneously issue multiple fast `GET /api/users` requests.
   - Observe `[API GET ERROR]` in console and note that HTTP response is `200 OK` returning `[DEFAULT_ADMIN]`.

3. **Verify Invalidations**:
   - The issue is invalidated if atomic file replace (`fs.renameSync`) is implemented and `GET /api/users` returns HTTP 500 status on read error.
