import fs from 'fs';
import path from 'path';
import {
  TestServerInstance,
  prepareDBFiles,
  assertStrictEqual,
  assertOk,
  simulateClientMerge,
  PROJECT_ROOT
} from './harness.js';

const TEST_PORT = 5064;
const USERS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t4_users.json');
const LEADS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t4_leads.json');

export async function runTier4Tests() {
  console.log('\n--- Running Tier 4: Real-World Scenario Tests ---');
  let passed = 0;
  let failed = 0;

  // T4.1: Cross-Device Profile Creation & Immediate Login
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    const server = new TestServerInstance(TEST_PORT, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      // Device A (Admin / Staff) creates a new student account
      const newStudentCredentials = {
        id: 'user_realworld_01',
        username: '  NewEnrollment2026  ',
        password: 'SecurePass999!',
        name: 'Soyeon Park',
        role: 'student',
        phone: '+82 10-5555-4444',
        statusStage: 1,
        feePaid: false
      };

      const resCreate = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentCredentials)
      });
      assertStrictEqual(resCreate.status, 200, 'Device A POST /api/users/create status 200');

      // Device B (Student on mobile phone) immediately attempts login: login("newenrollment2026", "SecurePass999!")
      // Step 1: Device B fetches fresh DB from server
      const resDevB = await fetch(`${server.baseUrl}/api/users?t=${Date.now()}`);
      const freshDevBUsers = await resDevB.json();

      // Step 2: Device B matches credentials
      const cleanU = 'newenrollment2026';
      const cleanP = 'SecurePass999!';

      const loggedInUser = freshDevBUsers.find(
        u => String(u.username).trim().toLowerCase() === cleanU && String(u.password).trim() === cleanP
      );

      assertOk(loggedInUser, 'Device B successfully authenticates immediately');
      assertStrictEqual(loggedInUser.id, 'user_realworld_01', 'Device B authenticated correct user object');
      assertStrictEqual(loggedInUser.name, 'Soyeon Park', 'Device B user name match');

      console.log('  ✅ T4.1: Cross-Device Registration -> Immediate Login scenario verified');
      passed++;
    } finally {
      server.stop();
    }
  } catch (err) {
    console.error('  ❌ T4.1 Failed:', err.message);
    failed++;
  }

  // T4.2: Network Drop & Offline Fallback Recovery (Client Offline Operations + Auto-Merge on Reconnect)
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    let server = new TestServerInstance(TEST_PORT + 1, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      // Step 1: Populate server with initial user
      const initialUser = {
        id: 'u_online_1',
        username: 'OnlineStudent',
        password: 'pass1',
        name: 'Online Student',
        role: 'student'
      };
      await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialUser)
      });

      // Fetch current server state
      const res1 = await fetch(`${server.baseUrl}/api/users`);
      const serverStateBeforeDrop = await res1.json();

      // Step 2: Network Drop! (Server goes down)
      server.stop();

      // Client attempts to call API during network outage -> fails
      let fetchFailed = false;
      try {
        await fetch(`http://localhost:${TEST_PORT + 1}/api/users`, { signal: AbortSignal.timeout(500) });
      } catch (e) {
        fetchFailed = true;
      }
      assertOk(fetchFailed, 'Client detected network drop / API offline');

      // Client creates an offline user locally in LocalStorage
      const localOfflineUser = {
        id: 'u_offline_2',
        username: 'OfflineStudent',
        password: 'pass2',
        name: 'Offline Created Student',
        role: 'student'
      };
      const cachedLocalUsers = [...serverStateBeforeDrop, localOfflineUser];

      // Step 3: Network Recovery! (Server restarts)
      server = new TestServerInstance(TEST_PORT + 1, USERS_FILE, LEADS_FILE);
      await server.start();

      // Client reconnects: calls loadUsersFromAPI() -> fetches server users, merges with cachedLocalUsers
      const resRecovered = await fetch(`${server.baseUrl}/api/users`);
      const recoveredServerUsers = await resRecovered.json();

      const defaultAdmin = { id: 'admin_darkxan', username: 'DarkXAN', password: 'as246800', role: 'admin' };
      const mergedState = simulateClientMerge(recoveredServerUsers, cachedLocalUsers, defaultAdmin);

      assertOk(mergedState.some(u => u.username === 'OnlineStudent'), 'Pre-drop online user intact');
      assertOk(mergedState.some(u => u.username === 'OfflineStudent'), 'Offline created user merged into state');

      // Sync merged state back to server
      const resSync = await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedState)
      });
      assertStrictEqual(resSync.status, 200, 'Synced merged offline changes to server DB');

      // Verify server DB after sync
      const resFinal = await fetch(`${server.baseUrl}/api/users`);
      const finalServerUsers = await resFinal.json();
      assertOk(finalServerUsers.some(u => u.username === 'OfflineStudent'), 'Server DB now contains offline user');

      console.log('  ✅ T4.2: Network drop, offline fallback & non-destructive auto-merge recovery verified');
      passed++;
    } finally {
      if (server) server.stop();
    }
  } catch (err) {
    console.error('  ❌ T4.2 Failed:', err.message);
    failed++;
  }

  // T4.3: Server Crash & Restart Data Persistence
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    let server = new TestServerInstance(TEST_PORT + 2, USERS_FILE, LEADS_FILE);
    await server.start();

    const createdUserIds = [];

    try {
      // Step 1: Create 5 users and 2 leads
      for (let i = 1; i <= 5; i++) {
        const u = {
          id: `u_persist_${i}`,
          username: `PersistUser_${i}`,
          password: `Secret_${i}`,
          name: `Persistent User ${i}`,
          role: i === 1 ? 'staff' : 'student',
          statusStage: i
        };
        createdUserIds.push(u.id);
        await fetch(`${server.baseUrl}/api/users/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(u)
        });
      }

      await fetch(`${server.baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Lead 1', phone: '+82 10-1111-2222' })
      });
      await fetch(`${server.baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Lead 2', phone: '+82 10-3333-4444' })
      });

      // Step 2: Abrupt Server Restart (kill process immediately, restart on same port and DB paths)
      server.stop();

      // Wait 300ms to ensure process termination
      await new Promise(r => setTimeout(r, 300));

      // Restart server
      server = new TestServerInstance(TEST_PORT + 2, USERS_FILE, LEADS_FILE);
      await server.start();

      // Step 3: Query server DB after restart
      const resUsersAfterRestart = await fetch(`${server.baseUrl}/api/users`);
      assertStrictEqual(resUsersAfterRestart.status, 200, 'GET /api/users after restart status 200');
      const usersAfterRestart = await resUsersAfterRestart.json();

      // Verify all created users exist
      assertStrictEqual(usersAfterRestart.length, 6, 'Contains 6 users (admin + 5 created users)');
      createdUserIds.forEach(id => {
        assertOk(usersAfterRestart.some(u => u.id === id), `User ${id} preserved across server restart`);
      });

      // Query leads after restart
      const resLeadsAfterRestart = await fetch(`${server.baseUrl}/api/leads`);
      assertStrictEqual(resLeadsAfterRestart.status, 200, 'GET /api/leads after restart status 200');
      const leadsAfterRestart = await resLeadsAfterRestart.json();
      assertStrictEqual(leadsAfterRestart.length, 2, 'Contains 2 leads preserved across server restart');

      console.log('  ✅ T4.3: Server crash & restart persistence across restarts verified');
      passed++;
    } finally {
      if (server) server.stop();
    }
  } catch (err) {
    console.error('  ❌ T4.3 Failed:', err.message);
    failed++;
  }

  // Cleanup temp files
  try {
    if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
    if (fs.existsSync(LEADS_FILE)) fs.unlinkSync(LEADS_FILE);
  } catch (e) {}

  return { passed, failed };
}
