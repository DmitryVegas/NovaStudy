# Original User Request

## 2026-08-03T12:11:31Z

<USER_REQUEST>
# Teamwork Project Prompt — Draft

> Status: Step 1 — Eliciting project idea & fixing DB sync
> Goal: Fix database persistence so created accounts (students/staff) work across all devices

The goal is to fix the NovaStudy database persistence layer on Oracle Cloud VPS so created student and staff accounts immediately sync to the server DB and allow login from any device or browser worldwide.

Working directory: `c:\Users\AORUS\Desktop\Cons`

## Requirements

### R1. Database Persistence Fix
Fix the backend REST API (`server.js`) and Nginx proxy to ensure `POST /api/users` reliably updates `server_db_users.json` on Oracle Cloud VPS without silent network or permission errors.

### R2. Real-Time Account Authentication
Ensure `login()` in `AuthContext.jsx` queries the live server API without caching delays or local-only fallbacks when network connection is active.

## Acceptance Criteria

### Verification
- [ ] Creating a new student or staff profile in the Admin Cabinet writes directly to `server_db_users.json` on Oracle VPS.
- [ ] A user created on device A can immediately log in on device B (mobile or external PC) without errors.

</USER_REQUEST>
