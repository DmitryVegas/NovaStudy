# NovaStudy DB Sync & Persistence — Project Plan

## Objective
Ensure database persistence (`server_db_users.json`) on Oracle Cloud VPS works reliably for account creation (`POST /api/users`), and real-time authentication in `AuthContext.jsx` queries the live server API without caching delays or local fallbacks when online, allowing login from any device or browser worldwide.

## Project Structure & Architecture
- **Backend API**: `server.js` (Express REST server managing `server_db_users.json` persistence)
- **Deployment/Proxy Script**: `deploy.sh` & Nginx configuration on Oracle VPS
- **Frontend Auth**: `src/context/AuthContext.jsx` (handles user creation, state, and `login()`)

## Dual-Track Execution Strategy

### Track 1: E2E Testing Track
- **Goal**: Create comprehensive, requirement-driven opaque-box E2E test suite covering feature tests, edge/boundary cases, cross-feature combinations, and real-world scenarios.
- **Output**: `TEST_INFRA.md` & `TEST_READY.md`.

### Track 2: Implementation Track
- **Milestone 1: Deep Codebase Exploration & Root Cause Analysis**
  - Dispatch 3 parallel Explorers to investigate `server.js`, `deploy.sh`, Nginx configs, and `AuthContext.jsx`.
- **Milestone 2: Database Persistence & Backend API Fix (R1)**
  - Implement robust file persistence, atomic write/lock handling, error logging, CORS/Nginx proxy compatibility in `server.js` and `deploy.sh`.
- **Milestone 3: Real-Time Authentication & Sync Fix (R2)**
  - Update `AuthContext.jsx` `login()` and signup logic to query live server API directly when online without caching delays or stale local fallbacks.
- **Milestone 4: Verification, Review, Challenger Stress Testing & Forensic Audit**
  - Independent review by 2 Reviewers.
  - Empirical verification and edge case testing by 2 Challengers.
  - Integrity audit by Forensic Auditor (`teamwork_preview_auditor`).
- **Milestone 5: Final Acceptance & E2E Validation**
  - Run full E2E test suite. Verify multi-device user creation & immediate login functionality across devices.

## Acceptance Criteria Checklist
- [ ] Creating a new student or staff profile in the Admin Cabinet writes directly to `server_db_users.json` on Oracle VPS.
- [ ] A user created on device A can immediately log in on device B (mobile or external PC) without errors.
- [ ] Forensic Auditor verdict is CLEAN (no hardcoding, dummy logic, or facade implementations).
- [ ] Build & tests pass 100%.

## Succession & Fault Tolerance Strategy
- Track spawn count (threshold: 16).
- Heartbeat cron running every 10 minutes.
- Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate ladder.
