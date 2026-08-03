# NovaStudy DB Sync & Persistence E2E Test Infrastructure

## Overview

This document describes the design, architecture, process lifecycle management, and 4-tier testing methodology of the opaque-box End-to-End (E2E) test suite for the **NovaStudy DB Sync & Persistence** module.

The test suite validates the REST API endpoints, database disk persistence (`server_db_users.json`, `server_db_leads.json`), client-server synchronization logic (`AuthContext.jsx`), concurrent write safety, edge cases, crash resistance, and real-world offline recovery scenarios without modifying application business logic.

---

## 🏗 Test Infrastructure Architecture

```
                               ┌────────────────────────────────────────┐
                               │             npm test /                 │
                               │        node tests/run-e2e.js           │
                               └───────────────────┬────────────────────┘
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                           ┌──────────────────┐        ┌──────────────────┐
                           │ tests/harness.js │        │ Assertion &      │
                           │ Process Manager  │        │ Reporter Module  │
                           └────────┬─────────┘        └──────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┬───────────────────────────────┐
    ▼                               ▼                               ▼                               ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ Tier 1: Feature       │ │ Tier 2: Boundary &    │ │ Tier 3: Cross-Feature │ │ Tier 4: Real-World    │
│ Coverage              │ │ Corner Cases          │ │ Combinations          │ │ Scenarios             │
└───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘
            │                         │                         │                         │
            ▼                         ▼                         ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             Isolated Child Process (Express Server)                              │
│                    PORT: 5051-5064, USERS_FILE: temp_tx_users.json                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Components

1. **Master Test Runner (`tests/run-e2e.js`)**
   - Discovers and executes test suites across all 4 tiers (or a targeted tier via `--tier=N`).
   - Collects execution metrics (passed, failed, duration).
   - Generates formatted terminal reports with colored indicators.
   - Enforces zero-failure exit code policy (`exit(0)` on success, `exit(1)` on failure).

2. **Test Harness & Process Lifecycle (`tests/harness.js`)**
   - **Isolated Port Allocation**: Each tier operates on dedicated high-range TCP ports (`5051`, `5052-5056`, `5058`, `5064-5066`) to avoid port conflicts.
   - **Isolated DB Sandbox**: Spawns server instances pointing to temporary disk files (`temp_t1_users.json`, `temp_t2_leads.json`) via `USERS_FILE` and `LEADS_FILE` environment variables.
   - **Graceful & Forceful Cleanup**: Manages process spawn/kill cycles with platform-agnostic process termination (`taskkill` on Windows, `SIGKILL` on Unix/Linux) to prevent orphaned processes or handles.
   - **Assertion Utilities**: `assertStrictEqual`, `assertDeepEqual`, `assertOk`, `assertIncludes`, `assertThrowsAsync`.
   - **Client Sync Simulator**: `simulateClientMerge()` accurately mirrors the frontend `AuthContext` smart auto-merging between client `localStorage` and server database arrays.

---

## 🎯 4-Tier Testing Methodology

### Tier 1: Feature Coverage (`tests/tier1_feature_coverage.test.js`)
- **T1.1 Server Initialization & Default Admin Retrieval**: Verifies dynamic DB initialization upon GET `/api/users`, auto-populating `DarkXAN` (admin) when DB files are fresh.
- **T1.2 Student & Staff Profile Creation**: Validates creation of student and staff users with complex fields (`statusStage` [0-7], `feePaid`, `documents` array, `phone`, `role`).
- **T1.3 DB Disk Persistence**: Verifies that user creations and lead submissions writing to disk are persisted in valid JSON format.
- **T1.4 Login Authentication Logic**: Validates username trimming, case-insensitivity matching, exact password verification, and rejection of invalid credentials.

### Tier 2: Boundary & Corner Cases (`tests/tier2_boundary_corner.test.js`)
- **T2.1 Empty DB File Handling**: Tests zero-byte or whitespace-only files (`temp_users.json`), confirming auto-restoration of default admin without errors.
- **T2.2 Corrupted JSON Handling & Crash Resistance**: Injects syntax errors into DB JSON files (`{{INVALID_JSON...`) and verifies graceful 200/500 responses and self-healing DB recovery without server crash.
- **T2.3 Missing Required Fields & Flexible Objects**: Verifies server handles omitted, null, or empty fields without runtime exceptions.
- **T2.4 Base64 Payload Limits**: Tests 5MB+ base64 document upload payloads (passport scans/transcripts) up to the 100MB server limit.
- **T2.5 Special Characters & Injection Resistance**: Verifies handling of Cyrillic characters (`Иван_Петров`), Korean text (`김철수`), Emojis (`🎓⚡`), quotes, backslashes, and XSS/SQL injection patterns (`' OR 1=1`, `<script>`).

### Tier 3: Cross-Feature Combinations (`tests/tier3_cross_feature.test.js`)
- **T3.1 Concurrent User Creation**: Fires 20 simultaneous parallel HTTP `POST /api/users/create` requests to verify atomic file writing without race conditions, file corruption, or lost updates.
- **T3.2 Real-Time Multi-Device Status Updates**: Device A updates student `statusStage` and `feePaid`, Device B queries API and instantly receives updated state.
- **T3.3 Admin Cabinet Operations & Auth Sync**: Executes bulk status updates, user deletions, and validates state consistency across client-side `AuthContext` sync.

### Tier 4: Real-World Scenarios (`tests/tier4_real_world.test.js`)
- **T4.1 Cross-Device Registration & Immediate Login**: Device A creates a student profile via REST API; Device B logs in immediately using the new credentials.
- **T4.2 Network Drop, Offline Fallback & Recovery**: Simulates server outage during client operations, verifies offline caching in `localStorage`, restarts server, and validates non-destructive auto-merge recovery back to server DB.
- **T4.3 Server Restart Data Persistence**: Creates multiple staff, student accounts, and leads; abruptly stops and restarts the server process; verifies 100% data integrity from disk.

---

## 🛠 Execution & Verification

Run the entire suite:
```bash
npm test
# or
node tests/run-e2e.js
```

Run a specific tier:
```bash
node tests/run-e2e.js --tier=1
node tests/run-e2e.js --tier=2
node tests/run-e2e.js --tier=3
node tests/run-e2e.js --tier=4
```
