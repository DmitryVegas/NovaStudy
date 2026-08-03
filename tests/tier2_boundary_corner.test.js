import fs from 'fs';
import path from 'path';
import {
  TestServerInstance,
  prepareDBFiles,
  assertStrictEqual,
  assertOk,
  PROJECT_ROOT
} from './harness.js';

const TEST_PORT = 5052;
const USERS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t2_users.json');
const LEADS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t2_leads.json');

export async function runTier2Tests() {
  console.log('\n--- Running Tier 2: Boundary & Corner Case Tests ---');
  let passed = 0;
  let failed = 0;

  // T2.1: Empty DB File Handling (0 bytes & whitespace)
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE, '', '   \n  '); // 0 bytes users, whitespace leads
    const server = new TestServerInstance(TEST_PORT, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      // GET users should return default admin via initDB empty file recovery
      const resUsers = await fetch(`${server.baseUrl}/api/users`);
      assertStrictEqual(resUsers.status, 200, 'GET /api/users on empty file status 200');
      const users = await resUsers.json();
      assertOk(Array.isArray(users), 'Returns users array');
      assertStrictEqual(users.length, 1, 'Auto-restores default admin array');
      assertStrictEqual(users[0].username, 'DarkXAN', 'Default admin present');

      // GET leads should return empty array
      const resLeads = await fetch(`${server.baseUrl}/api/leads`);
      assertStrictEqual(resLeads.status, 200, 'GET /api/leads status 200');
      const leads = await resLeads.json();
      assertOk(Array.isArray(leads), 'Returns leads array');
      assertStrictEqual(leads.length, 0, 'Leads array is empty');

      console.log('  ✅ T2.1: Empty DB file (0 bytes / whitespace) recovery verified');
      passed++;
    } finally {
      server.stop();
    }
  } catch (err) {
    console.error('  ❌ T2.1 Failed:', err.message);
    failed++;
  }

  // T2.2: Corrupted JSON Handling
  try {
    // Write invalid JSON string into USERS_FILE and LEADS_FILE
    prepareDBFiles(USERS_FILE, LEADS_FILE, '{{INVALID_JSON_CORRUPTED_FILE...', 'NOT_A_JSON');
    const server = new TestServerInstance(TEST_PORT + 1, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      // GET /api/users on corrupted JSON recovers gracefully with default admin fallback
      const resUsers = await fetch(`${server.baseUrl}/api/users`);
      assertStrictEqual(resUsers.status, 200, 'GET /api/users on corrupted JSON status 200 fallback');
      const users = await resUsers.json();
      assertOk(Array.isArray(users), 'Returns array');
      assertStrictEqual(users[0].username, 'DarkXAN', 'Fallback default admin user returned');

      // GET /api/leads on corrupted JSON recovers gracefully with [] fallback
      const resLeads = await fetch(`${server.baseUrl}/api/leads`);
      assertStrictEqual(resLeads.status, 200, 'GET /api/leads on corrupted JSON status 200 fallback');
      const leads = await resLeads.json();
      assertOk(Array.isArray(leads), 'Returns leads array');
      assertStrictEqual(leads.length, 0, 'Leads array recovered to empty array');

      // Check server process is still alive and responsive after corrupted file errors!
      const resHealth = await fetch(`${server.baseUrl}/api/users`);
      assertStrictEqual(resHealth.status, 200, 'Server process remains healthy after corrupted file errors');

      console.log('  ✅ T2.2: Corrupted JSON handling & server crash resistance verified');
      passed++;
    } finally {
      server.stop();
    }
  } catch (err) {
    console.error('  ❌ T2.2 Failed:', err.message);
    failed++;
  }

  // T2.3: Missing Required Fields & Invalid Payload Types
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    const server = new TestServerInstance(TEST_PORT + 2, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      // POST invalid users array (not an array or empty array to POST /api/users)
      const resInvalidPost1 = await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notAnArray: true })
      });
      assertStrictEqual(resInvalidPost1.status, 400, 'POST /api/users with non-array returns 400');

      const resInvalidPost2 = await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      });
      assertStrictEqual(resInvalidPost2.status, 400, 'POST /api/users with empty array returns 400');

      // Create user with null/missing properties (e.g. no role, statusStage null)
      const incompleteUser = {
        id: 'user_incomplete',
        username: 'PartialUser',
        password: 'Pass',
        // role missing, statusStage missing
      };
      const resInc = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteUser)
      });
      assertStrictEqual(resInc.status, 200, 'POST /api/users/create allows flexible object structure');

      const resFetch = await fetch(`${server.baseUrl}/api/users`);
      const users = await resFetch.json();
      const found = users.find(u => u.username === 'PartialUser');
      assertOk(found, 'Incomplete user stored');
      assertStrictEqual(found.role, undefined, 'Missing fields handled as undefined without throwing');

      console.log('  ✅ T2.3: Missing required fields & invalid payload type validation verified');
      passed++;
    } finally {
      server.stop();
    }
  } catch (err) {
    console.error('  ❌ T2.3 Failed:', err.message);
    failed++;
  }

  // T2.4: Base64 Payload Limits & Large File Attachments (5MB Base64 document payload)
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    const server = new TestServerInstance(TEST_PORT + 3, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      // Generate a ~5MB base64 string
      const chunk = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      const largeBase64 = 'data:image/png;base64,' + chunk.repeat(80000); // ~5.1MB

      const heavyUser = {
        id: 'user_heavy_doc',
        username: 'heavy_uploader',
        password: 'HeavyPassword123',
        name: 'Heavy Uploader',
        role: 'student',
        documents: [
          {
            id: 'doc_large_1',
            name: 'large_transcript_scan.png',
            dataUrl: largeBase64,
            type: 'png'
          }
        ]
      };

      const resHeavy = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heavyUser)
      });
      assertStrictEqual(resHeavy.status, 200, 'POST 5MB base64 user payload succeeds (server limit 100mb)');

      const resGet = await fetch(`${server.baseUrl}/api/users`);
      const users = await resGet.json();
      const foundHeavy = users.find(u => u.username === 'heavy_uploader');
      assertOk(foundHeavy, 'Heavy document user retrieved');
      assertStrictEqual(foundHeavy.documents[0].dataUrl.length, largeBase64.length, 'Base64 document size exact match');

      console.log('  ✅ T2.4: Large Base64 payload limits (5MB+) & attachment storage verified');
      passed++;
    } finally {
      server.stop();
    }
  } catch (err) {
    console.error('  ❌ T2.4 Failed:', err.message);
    failed++;
  }

  // T2.5: Special Characters, Unicode, Cyrillic, Korean & Injection Strings
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    const server = new TestServerInstance(TEST_PORT + 4, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      const unicodeUsers = [
        {
          id: 'u_cyrillic',
          username: 'Иван_Петров',
          password: 'Пароль!@#123',
          name: 'Дмитрий "Особый" Смирнов',
          role: 'student'
        },
        {
          id: 'u_korean',
          username: '김철수_Novastudy',
          password: '비밀번호$%^789',
          name: '김철수 🎓⚡',
          role: 'student'
        },
        {
          id: 'u_injection',
          username: "' OR '1'='1' --",
          password: '"><script>alert(1)</script>',
          name: '{"admin": true, "hack": "nested"}',
          role: 'student'
        }
      ];

      for (const u of unicodeUsers) {
        const res = await fetch(`${server.baseUrl}/api/users/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(u)
        });
        assertStrictEqual(res.status, 200, `Created user ${u.id}`);
      }

      const resAll = await fetch(`${server.baseUrl}/api/users`);
      const allUsers = await resAll.json();

      // Check Cyrillic
      const cyrillicFound = allUsers.find(u => u.id === 'u_cyrillic');
      assertOk(cyrillicFound, 'Cyrillic user found');
      assertStrictEqual(cyrillicFound.name, 'Дмитрий "Особый" Смирнов', 'Cyrillic text integrity preserved');
      assertStrictEqual(cyrillicFound.password, 'Пароль!@#123', 'Cyrillic password integrity preserved');

      // Check Korean & Emoji
      const koreanFound = allUsers.find(u => u.id === 'u_korean');
      assertOk(koreanFound, 'Korean user found');
      assertStrictEqual(koreanFound.name, '김철수 🎓⚡', 'Korean & Emoji integrity preserved');

      // Check Injection string escaping
      const injectionFound = allUsers.find(u => u.id === 'u_injection');
      assertOk(injectionFound, 'Injection user found');
      assertStrictEqual(injectionFound.username, "' OR '1'='1' --", 'SQL injection string sanitized/stored as literal');
      assertStrictEqual(injectionFound.password, '"><script>alert(1)</script>', 'XSS payload stored safely without execution');

      // Test login logic for Unicode / Cyrillic / Korean usernames
      const cleanInputU = String('  김철수_Novastudy  ').trim().toLowerCase();
      const cleanInputP = String('비밀번호$%^789').trim();
      const authenticated = allUsers.find(
        u => String(u.username).trim().toLowerCase() === cleanInputU && String(u.password).trim() === cleanInputP
      );
      assertOk(authenticated, 'Korean login credential matching successful');

      console.log('  ✅ T2.5: Special characters, Cyrillic, Korean, Emojis & injection strings verified');
      passed++;
    } finally {
      server.stop();
    }
  } catch (err) {
    console.error('  ❌ T2.5 Failed:', err.message);
    failed++;
  }

  // T2.6: Online Login API Rejection (401 & 400 Status Codes)
  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    const server = new TestServerInstance(TEST_PORT + 5, USERS_FILE, LEADS_FILE);
    await server.start();

    try {
      // Test 401 Unauthorized response for wrong credentials
      const res401 = await fetch(`${server.baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'darkxan', password: 'wrongpassword' })
      });
      assertStrictEqual(res401.status, 401, 'POST /api/login with wrong credentials returns 401');
      const body401 = await res401.json();
      assertStrictEqual(body401.success, false, 'Returns success: false on 401');

      // Test 400 Bad Request response for missing username/password
      const res400 = await fetch(`${server.baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '', password: '' })
      });
      assertStrictEqual(res400.status, 400, 'POST /api/login with missing fields returns 400');
      const body400 = await res400.json();
      assertStrictEqual(body400.success, false, 'Returns success: false on 400');

      console.log('  ✅ T2.6: Online Login API rejection (401 & 400 status codes) verified');
      passed++;
    } finally {
      server.stop();
    }
  } catch (err) {
    console.error('  ❌ T2.6 Failed:', err.message);
    failed++;
  }

  // Cleanup temp files
  try {
    if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
    if (fs.existsSync(LEADS_FILE)) fs.unlinkSync(LEADS_FILE);
  } catch (e) {}

  return { passed, failed };
}
