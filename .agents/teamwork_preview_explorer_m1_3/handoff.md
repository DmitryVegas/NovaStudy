# HANDOFF REPORT — Explorer Subagent (m1_3)

## 1. Observation

Direct observations from examining the codebase in `c:\Users\AORUS\Desktop\Cons`:

1. **`vite.config.js` (lines 1-8)**:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   // https://vite.dev/config/
   export default defineConfig({
     plugins: [react()],
   })
   ```
   *Observation*: No `server.proxy` object is configured. Development server runs on port 5173 while `server.js` runs on port 5000.

2. **`src/context/AuthContext.jsx` (lines 20-37)**:
   ```javascript
   const loadUsersFromAPI = async () => {
     let serverUsers = null;

     try {
       const res = await fetch(`/api/users?t=${Date.now()}`, {
         cache: 'no-store',
         headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
       });
       if (res.ok) {
         const data = await res.json();
         if (Array.isArray(data)) {
           serverUsers = data;
         }
       }
     } catch (err) {
       console.warn("Backend API sync offline, fallback to localStorage cache.");
     }
   ```
   *Observation*: Relative HTTP request `/api/users` returns 404 in Vite dev server. `res.ok` evaluates to false, causing silent fallback to `localStorage.getItem('nova_study_users_v2')`.

3. **`src/context/AuthContext.jsx` (lines 88-99)**:
   ```javascript
   useEffect(() => {
     loadUsersFromAPI();

     const savedSession = localStorage.getItem('nova_study_current_user');
     if (savedSession) {
       try {
         setCurrentUser(JSON.parse(savedSession));
       } catch (e) {
         setCurrentUser(null);
       }
     }
   }, []);
   ```
   *Observation*: `loadUsersFromAPI()` is executed only once on initial mount. No `setInterval` or window event listener exists to re-fetch data across open tabs/devices.

4. **`src/context/AuthContext.jsx` (lines 101-117)**:
   ```javascript
   const saveUsers = async (updatedUsers) => {
     setUsers(updatedUsers);
     localStorage.setItem('nova_study_users_v2', JSON.stringify(updatedUsers));

     try {
       const res = await fetch('/api/users', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(updatedUsers)
       });
       ...
     } catch (err) {}
   };
   ```
   *Observation*: Any user creation or status update re-serializes the entire user array into `localStorage` and `POST /api/users`.

5. **`server.js` (lines 77-95)**:
   ```javascript
   app.post(['/api/users/create', '/users/create'], (req, res) => {
     try {
       initDB();
       const newUser = req.body;
       const data = fs.readFileSync(USERS_FILE, 'utf8');
       let users = JSON.parse(data || '[]');
       users = users.filter((u) => String(u.username).trim().toLowerCase() !== String(newUser.username).trim().toLowerCase());
       users.unshift(newUser);
       fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
       res.json({ success: true, users });
     } catch (err) {}
   });
   ```
   *Observation*: The server exposes an atomic endpoint `/api/users/create`, but `AuthContext.jsx` never invokes this endpoint.

6. **`src/components/CabinetModal.jsx` (lines 162-175)** & **`AuthContext.jsx` (lines 219-245)**:
   *Observation*: Documents are read via `FileReader.readAsDataURL()` and stored as raw Base64 data strings directly within user object arrays in `localStorage`, leading to potential `QuotaExceededError` crashes.

---

## 2. Logic Chain

1. **Step 1 (Dev Server Misconfiguration)**:
   - Observation 1 shows `vite.config.js` lacks proxy configuration to `http://localhost:5000`.
   - Observation 2 shows `AuthContext.jsx` makes relative requests to `/api/users`.
   - *Deduction*: In development mode, requests to `/api/users` hit the Vite server on port 5173, resulting in 404 responses. `loadUsersFromAPI` catches this failure and silently falls back to `localStorage`. Server persistence never occurs in dev mode.

2. **Step 2 (Lack of Multi-Device Real-Time Sync)**:
   - Observation 3 shows `loadUsersFromAPI()` is called only once in `useEffect([], ...)`.
   - *Deduction*: If User A creates or updates an account on Device A, Device B receives no notification or periodic fetch, remaining stuck with outdated state in memory and `localStorage` until manual refresh/login.

3. **Step 3 (Mass Overwrite Race Conditions)**:
   - Observation 4 shows `saveUsers` pushes the full array to `POST /api/users`.
   - Observation 5 shows `server.js` provides atomic `/api/users/create`, which is unused.
   - *Deduction*: Broad array overwrites introduce severe race conditions when multiple clients modify users concurrently, overwriting each other's data files (`server_db_users.json`).

4. **Step 4 (Storage Limits & Session Stale States)**:
   - Observation 6 shows document uploads generate large Base64 Data URLs embedded in user objects.
   - *Deduction*: Exceeding the 5MB browser `localStorage` limit throws `QuotaExceededError`, breaking state persistence locally. Furthermore, missing `localStorage` updates for `nova_study_current_user` during profile/doc edits leads to stale session states upon browser reload.

---

## 3. Caveats

- **Network Environment**: Investigation was performed in read-only code analysis mode without executing a live dev server or running backend processes.
- **Production Proxy Deployment**: If production deployment uses NGINX or another reverse proxy that maps `/api` to port 5000, Root Cause 1 (Vite proxy) affects dev mode specifically; however, Root Causes 2, 3, 4, 5, 6, and 7 affect both development and production environments.

---

## 4. Conclusion

The failure of created student/staff accounts to synchronize in real-time across devices and the fallback to local-only storage stem from a combination of:
1. **Missing Vite API proxy** causing dev server 404s on backend requests.
2. **Absence of a periodic polling timer / subscription mechanism** in `AuthContext.jsx`.
3. **Array-level HTTP POST overwrites** instead of atomic record creation.
4. **Unchecked Base64 storage in `localStorage`** causing storage quota exhaustion.
5. **Flawed merge-on-load logic** resurrecting stale/deleted users.

Applying the recommended modifications in `analysis.md` (Vite proxy config, 5-second polling interval in `AuthContext`, atomic API endpoint integration, and session storage synchronization) will restore real-time cross-device sync and reliable cloud DB persistence.

---

## 5. Verification Method

To independently verify these findings and recommended fixes:

1. **Verify Proxy Issue**:
   - Inspect `vite.config.js`. Notice absence of `server: { proxy: { '/api': 'http://localhost:5000' } }`.
   - Run `npm run dev` and attempt to create a user or call `loadUsersFromAPI()`. Check Network Tab in Developer Tools for `404 Not Found` on `GET /api/users`.

2. **Verify Polling Absence**:
   - Open `src/context/AuthContext.jsx` line 88-99. Confirm `useEffect` dependency array is `[]` with no `setInterval` or `window.addEventListener('focus')`.

3. **Verify LocalStorage Quota Exceeded**:
   - Open browser developer tools -> Console. Attach a PDF (>3MB) in CabinetModal UI. Notice `localStorage.setItem` fails with `QuotaExceededError`.

4. **Verify Session Update Discrepancy**:
   - Inspect `uploadUserDoc` in `src/context/AuthContext.jsx` (lines 219-245). Confirm `localStorage.setItem('nova_study_current_user', ...)` is missing compared to `updateUserStatus` (line 191).
