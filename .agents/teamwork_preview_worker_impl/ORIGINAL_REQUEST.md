## 2026-08-03T12:14:16Z
Implement the backend DB persistence fix (R1) and real-time auth sync fix (R2).

Reference Findings:
- Explorer reports in `.agents/teamwork_preview_explorer_m1_2/handoff.md` and `.agents/teamwork_preview_explorer_m1_3/handoff.md`.

Concrete Steps to Implement:
1. Update `package.json`:
   - Add `"express": "^4.18.2"` and `"cors": "^2.8.5"` to `dependencies`.
2. Update `.gitignore`:
   - Add `server_db_*.json` and `ssh-key-*.key` to avoid git tracking conflicts or credential leaks.
3. Update `vite.config.js`:
   - Add `server: { proxy: { '/api': 'http://localhost:5000' } }`.
4. Update `server.js`:
   - Fix `USERS_FILE` persistence: implement atomic JSON file writes (`write to temp file then atomic rename sync`) to prevent 0-byte file truncation on crash/interruption.
   - Prevent automatic reset of `server_db_users.json` to default admin if non-empty valid JSON exists.
   - Ensure `/api/users`, `/api/users/create`, and `/api/login` endpoints correctly read/write `server_db_users.json`, set CORS headers, and return explicit JSON status codes.
5. Update `deploy.sh`:
   - Add `set -e`, permission fixes (`chmod 666 server_db_*.json` if exists), Nginx `client_max_body_size 100M;` configuration check, and `pm2 save`.
6. Update `src/context/AuthContext.jsx`:
   - Fix `loadUsersFromAPI()` to fetch from `/api/users` with timestamp cache-buster (`?t=${Date.now()}`).
   - Add periodic polling interval (5 seconds) and `window.addEventListener('focus', loadUsersFromAPI)` so tabs and cross-device clients get live updates.
   - Update `login()` to query live server API without caching delays or local-only fallbacks when online.
   - Update user creation and status update functions to use atomic API endpoints (`/api/users/create` or `/api/users`) and properly update state and `localStorage.setItem('nova_study_current_user', ...)`.
   - Wrap `localStorage.setItem` in try/catch to handle Base64 document quota limits gracefully.
7. Verify build and run tests:
   - Run `npm run build` or test commands to verify no syntax errors or build failures occur.
8. Document all changes in `c:\Users\AORUS\Desktop\Cons\.agents\teamwork_preview_worker_impl\handoff.md` and send a completion message back.
