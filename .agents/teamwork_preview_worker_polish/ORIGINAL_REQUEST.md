## 2026-08-03T12:22:17Z
You are the Implementation Worker subagent for NovaStudy DB Sync & Persistence project polish task.

Working Directory: `c:\Users\AORUS\Desktop\Cons\.agents\teamwork_preview_worker_polish`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task.

Task: Apply two target quality improvements based on Challenger feedback.

1. Update `src/context/AuthContext.jsx`:
   - In `login(username, password)`:
     When network fetch to `/api/login` succeeds in making a request, inspect `res.status`. If `res.status === 401` or `res.status === 400` or `!res.ok`, return `false` directly (or return appropriate error) so live online API rejections do NOT fall through to offline `localStorage` fallback. Offline `localStorage` check should ONLY occur if `fetch` throws a network error (e.g. server offline / connection refused).

2. Update `server.js`:
   - In `initDB()`: Add JSON parse error recovery for `LEADS_FILE` similar to `USERS_FILE`. If `LEADS_FILE` exists but contains invalid/corrupted JSON or empty content, reset it to `[]` using `atomicWriteJSONSync(LEADS_FILE, [])` so `GET /api/leads` and `POST /api/leads` never crash with HTTP 500.

3. Verify:
   - Run `npm test` (`node tests/run-e2e.js`) and `npm run build` to confirm everything builds and passes 100%.

4. Document changes in `c:\Users\AORUS\Desktop\Cons\.agents\teamwork_preview_worker_polish\handoff.md` and send a message back.
