# Project: NovaStudy DB Sync & Persistence

## Architecture
- Backend REST API: Express server in `server.js` running on Oracle Cloud VPS.
- Database: `server_db_users.json` persistent JSON store on server.
- Proxy / Deployment: `deploy.sh`, Nginx configuration.
- Frontend Auth: React Context in `src/context/AuthContext.jsx`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Analysis | Codebase investigation & root cause analysis | None | DONE |
| 2 | E2E Test Suite Creation | Opaque-box E2E test infra & test cases (Tiers 1-4) | M1 | DONE |
| 3 | Backend DB Persistence (R1) | `server.js`, `package.json`, `deploy.sh` REST API fix | M1 | DONE |
| 4 | Real-time Frontend Auth (R2) | `AuthContext.jsx` API integration & polling | M3 | DONE |
| 5 | Review, Testing & Forensic Audit | Reviewers, Challengers, Forensic Auditor verification | M2, M4 | DONE |
| 6 | Final Acceptance | E2E Test Validation & Sentinel reporting | M5 | DONE |

## Interface Contracts
### Frontend (`AuthContext.jsx`) ↔ Backend REST API (`server.js`)
- `POST /api/users`: Creates user account. Body: user payload. Responds with created user record or JSON error.
- `GET /api/users` / `POST /api/login`: Validates user authentication against live `server_db_users.json`.

## Code Layout
- Root: `server.js`, `deploy.sh`, `package.json`, `vite.config.js`
- Frontend source: `src/` (e.g. `src/context/AuthContext.jsx`, `src/components/`, `src/pages/`)
- Public / Data: `public/`, server db files
