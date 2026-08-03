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

const TEST_PORT = 5058;
const USERS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t3_users.json');
const LEADS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t3_leads.json');

export async function runTier3Tests() {
  console.log('\n--- Running Tier 3: Cross-Feature Combination Tests ---');
  let server = null;
  let passed = 0;
  let failed = 0;

  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    server = new TestServerInstance(TEST_PORT, USERS_FILE, LEADS_FILE);
    await server.start();

    // T3.1: Concurrent User Creation (Race conditions & write serialization test)
    try {
      const CONCURRENT_COUNT = 20;
      const promises = [];

      for (let i = 0; i < CONCURRENT_COUNT; i++) {
        const newUser = {
          id: `user_concurrent_${i}`,
          username: `concurrent_user_${i}`,
          password: `SecretPass_${i}`,
          name: `Concurrent Student ${i}`,
          role: 'student',
          statusStage: i % 8
        };
        promises.push(
          fetch(`${server.baseUrl}/api/users/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
          })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res, idx) => {
        assertStrictEqual(res.status, 200, `Concurrent creation HTTP request #${idx} status 200`);
      });

      // Verify server DB state after concurrent burst
      const resAll = await fetch(`${server.baseUrl}/api/users`);
      const usersList = await resAll.json();
      // Total users: 1 default admin + 20 concurrent users = 21
      assertStrictEqual(usersList.length, CONCURRENT_COUNT + 1, 'Server holds exactly 21 users after concurrent creation');

      // Verify disk file validity
      const diskRaw = fs.readFileSync(USERS_FILE, 'utf8');
      const parsedDisk = JSON.parse(diskRaw);
      assertStrictEqual(parsedDisk.length, CONCURRENT_COUNT + 1, 'Disk JSON holds all concurrent users without corruption');

      console.log(`  ✅ T3.1: Concurrent user creation (${CONCURRENT_COUNT} parallel requests) verified`);
      passed++;
    } catch (err) {
      console.error('  ❌ T3.1 Failed:', err.message);
      failed++;
    }

    // T3.2: Real-time Status Updates Across Devices
    try {
      // Device A (Manager) updates user_concurrent_5: statusStage = 6, feePaid = true, statusNote = 'Visa Approved'
      const resGet = await fetch(`${server.baseUrl}/api/users`);
      let users = await resGet.json();

      const targetId = 'user_concurrent_5';
      const updatedUsers = users.map(u => {
        if (u.id === targetId) {
          return {
            ...u,
            statusStage: 6,
            feePaid: true,
            statusNote: 'Visa Approved',
            statusUpdatedAt: '2026-08-03 14:00:00'
          };
        }
        return u;
      });

      // Device A saves updated array to server
      const resSave = await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers)
      });
      assertStrictEqual(resSave.status, 200, 'Device A POST /api/users update status 200');

      // Device B (Student) polls /api/users
      const resDevB = await fetch(`${server.baseUrl}/api/users?t=${Date.now()}`);
      assertStrictEqual(resDevB.status, 200, 'Device B GET /api/users status 200');
      const devBUsers = await resDevB.json();

      const studentOnDevB = devBUsers.find(u => u.id === targetId);
      assertOk(studentOnDevB, 'Device B found updated student');
      assertStrictEqual(studentOnDevB.statusStage, 6, 'Device B sees updated statusStage 6');
      assertStrictEqual(studentOnDevB.feePaid, true, 'Device B sees updated feePaid true');
      assertStrictEqual(studentOnDevB.statusNote, 'Visa Approved', 'Device B sees updated statusNote');

      console.log('  ✅ T3.2: Real-time multi-device status updates & cross-device sync verified');
      passed++;
    } catch (err) {
      console.error('  ❌ T3.2 Failed:', err.message);
      failed++;
    }

    // T3.3: Admin Cabinet Operations + Auth Context State Sync
    try {
      // Step 1: Bulk status stage update (Admin Cabinet feature)
      const resAll = await fetch(`${server.baseUrl}/api/users`);
      let currentList = await resAll.json();

      const bulkTargetIds = ['user_concurrent_1', 'user_concurrent_2', 'user_concurrent_3'];
      const bulkUpdatedList = currentList.map(u => {
        if (bulkTargetIds.includes(u.id)) {
          return { ...u, statusStage: 7, feePaid: true };
        }
        return u;
      });

      await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkUpdatedList)
      });

      // Step 2: Delete a user
      const afterDeleteList = bulkUpdatedList.filter(u => u.id !== 'user_concurrent_4');
      await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(afterDeleteList)
      });

      // Step 3: Fetch fresh state and simulate client AuthContext merge
      const resFresh = await fetch(`${server.baseUrl}/api/users`);
      const serverUsers = await resFresh.json();

      // Client local storage might have a cached user or admin default
      const defaultAdmin = { id: 'admin_darkxan', username: 'DarkXAN', password: 'as246800', role: 'admin' };
      const localUsers = [defaultAdmin];

      const merged = simulateClientMerge(serverUsers, localUsers, defaultAdmin);

      // Assert bulk update reflected
      bulkTargetIds.forEach(id => {
        const u = merged.find(x => x.id === id);
        assertOk(u, `User ${id} exists in merged state`);
        assertStrictEqual(u.statusStage, 7, `User ${id} updated to stage 7`);
        assertStrictEqual(u.feePaid, true, `User ${id} feePaid is true`);
      });

      // Assert deleted user removed
      assertStrictEqual(merged.some(u => u.id === 'user_concurrent_4'), false, 'Deleted user absent from state');

      console.log('  ✅ T3.3: Admin cabinet bulk operations, user deletion & AuthContext sync verified');
      passed++;
    } catch (err) {
      console.error('  ❌ T3.3 Failed:', err.message);
      failed++;
    }

  } finally {
    if (server) server.stop();
    try {
      if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
      if (fs.existsSync(LEADS_FILE)) fs.unlinkSync(LEADS_FILE);
    } catch (e) {}
  }

  return { passed, failed };
}
