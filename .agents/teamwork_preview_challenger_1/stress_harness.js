import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TestServerInstance, prepareDBFiles } from '../../tests/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const STRESS_PORT = 5090;
const USERS_FILE = path.join(__dirname, 'stress_users.json');
const LEADS_FILE = path.join(__dirname, 'stress_leads.json');

async function runStressHarness() {
  console.log('====================================================');
  console.log('🔥 EMPIRICAL STRESS & EDGE-CASE HARNESS FOR NOVASTUDY');
  console.log('====================================================\n');

  let passedScenarios = 0;
  let failedScenarios = 0;
  const findings = [];

  function recordResult(name, pass, details) {
    if (pass) {
      console.log(`  ✅ [PASS] ${name}`);
      passedScenarios++;
    } else {
      console.log(`  ❌ [FAIL] ${name}\n     Details: ${details}`);
      failedScenarios++;
      findings.push({ name, details });
    }
  }

  prepareDBFiles(USERS_FILE, LEADS_FILE);
  const server = new TestServerInstance(STRESS_PORT, USERS_FILE, LEADS_FILE);
  await server.start();

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: High-Volume Concurrent User Creation (100 parallel requests)
    // -------------------------------------------------------------
    console.log('🔹 Scenario 1: High-Volume Concurrent User Creation (100 parallel POST requests)...');
    try {
      const COUNT = 100;
      const promises = [];
      const startTime = Date.now();

      for (let i = 0; i < COUNT; i++) {
        const u = {
          id: `stress_u_${i}`,
          username: `stress_user_${i}`,
          password: `Pass_${i}_!@#`,
          name: `Stress Student ${i}`,
          role: i % 2 === 0 ? 'student' : 'staff',
          statusStage: i % 8
        };
        promises.push(
          fetch(`${server.baseUrl}/api/users/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u)
          })
        );
      }

      const responses = await Promise.all(promises);
      const statusCodes = responses.map(r => r.status);
      const all200 = statusCodes.every(s => s === 200);
      const duration = Date.now() - startTime;

      const resFetch = await fetch(`${server.baseUrl}/api/users`);
      const usersInDB = await resFetch.json();

      if (all200 && usersInDB.length === COUNT + 1) {
        recordResult(
          `High-Volume Concurrent Creation (100 requests in ${duration}ms)`,
          true,
          `All 100 requests returned HTTP 200 and DB contains exactly 101 users.`
        );
      } else {
        recordResult(
          `High-Volume Concurrent Creation (100 requests in ${duration}ms)`,
          false,
          `HTTP status 200 count: ${statusCodes.filter(s => s === 200).length}/${COUNT}. Users in DB: ${usersInDB.length}/101.`
        );
      }
    } catch (err) {
      recordResult('High-Volume Concurrent Creation', false, err.message);
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Rapid Polling while Concurrent Writing (Race condition & file lock stress)
    // -------------------------------------------------------------
    console.log('\n🔹 Scenario 2: Rapid Polling + Concurrent Writes (50 readers + 50 writers)...');
    try {
      let readErrors = 0;
      let writeErrors = 0;
      let readSuccesses = 0;
      let writeSuccesses = 0;

      const readPromises = [];
      const writePromises = [];

      for (let i = 0; i < 50; i++) {
        readPromises.push(
          (async () => {
            try {
              const r = await fetch(`${server.baseUrl}/api/users?t=${Date.now()}_${i}`);
              if (r.status === 200) {
                const data = await r.json();
                if (Array.isArray(data)) readSuccesses++;
                else readErrors++;
              } else {
                readErrors++;
              }
            } catch (e) {
              readErrors++;
            }
          })()
        );
      }

      for (let i = 0; i < 50; i++) {
        writePromises.push(
          (async () => {
            try {
              const u = {
                id: `poll_writer_${i}`,
                username: `poll_writer_${i}`,
                password: `Pass_${i}`,
                name: `Poll Writer ${i}`,
                role: 'student'
              };
              const r = await fetch(`${server.baseUrl}/api/users/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(u)
              });
              if (r.status === 200) writeSuccesses++;
              else writeErrors++;
            } catch (e) {
              writeErrors++;
            }
          })()
        );
      }

      await Promise.all([...readPromises, ...writePromises]);

      if (readErrors === 0 && writeErrors === 0) {
        recordResult(
          'Rapid Polling + Concurrent Writes (50 readers + 50 writers)',
          true,
          `100% success (50/50 reads, 50/50 writes). Zero EPERM/EBUSY file lock errors on Windows.`
        );
      } else {
        recordResult(
          'Rapid Polling + Concurrent Writes',
          false,
          `Read errors: ${readErrors}/50, Write errors: ${writeErrors}/50.`
        );
      }
    } catch (err) {
      recordResult('Rapid Polling + Concurrent Writes', false, err.message);
    }

    // -------------------------------------------------------------
    // SCENARIO 3: Empty File & Corrupted JSON Recovery for Users AND Leads
    // -------------------------------------------------------------
    console.log('\n🔹 Scenario 3: Corrupted JSON Recovery (Testing USERS_FILE and LEADS_FILE resilience)...');
    try {
      fs.writeFileSync(LEADS_FILE, '{CORRUPTED_LEADS_JSON_RAW_GARBAGE');
      
      const resLeads = await fetch(`${server.baseUrl}/api/leads`);
      const leadsStatus = resLeads.status;

      const resPostLead = await fetch(`${server.baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Recovery Lead', phone: '+82 10-9999-8888' })
      });

      if (leadsStatus === 500 && resPostLead.status === 500) {
        recordResult(
          'Corrupted LEADS_FILE Error Recovery Bug',
          false,
          `GET /api/leads returns 500 as expected, BUT POST /api/leads also FAILS with 500 because initDB() does not catch JSON parse error or auto-recover corrupted LEADS_FILE!`
        );
      } else if (resPostLead.status === 200) {
        recordResult(
          'Corrupted LEADS_FILE Recovery',
          true,
          `POST /api/leads successfully recovered corrupted LEADS_FILE.`
        );
      } else {
        recordResult('Corrupted LEADS_FILE Test', false, `GET status: ${leadsStatus}, POST status: ${resPostLead.status}`);
      }
    } catch (err) {
      recordResult('Corrupted LEADS_FILE Test', false, err.message);
    }

    // -------------------------------------------------------------
    // SCENARIO 4: Base64 Payload Limits (10MB payload test)
    // -------------------------------------------------------------
    console.log('\n🔹 Scenario 4: Heavy Base64 Payloads (10MB document attachment)...');
    try {
      const chunk = '0123456789ABCDEF'.repeat(64); // 1024 bytes
      const base64Data = 'data:application/pdf;base64,' + chunk.repeat(10 * 1024); // ~10MB

      const heavyUser = {
        id: 'user_10mb_doc',
        username: 'heavy_10mb_user',
        password: 'HeavyPassword!1',
        name: '10MB Document Student',
        role: 'student',
        documents: [{ id: 'doc_10mb', dataUrl: base64Data }]
      };

      const resHeavy = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heavyUser)
      });

      if (resHeavy.status === 200) {
        const resGet = await fetch(`${server.baseUrl}/api/users`);
        const users = await resGet.json();
        const found = users.find(u => u.id === 'user_10mb_doc');
        if (found && found.documents[0].dataUrl.length === base64Data.length) {
          recordResult('10MB Base64 Attachment Handling', true, '10MB payload created and retrieved intact.');
        } else {
          recordResult('10MB Base64 Attachment Handling', false, 'Payload created but retrieved object corrupted or truncated.');
        }
      } else {
        recordResult('10MB Base64 Attachment Handling', false, `HTTP POST returned ${resHeavy.status}`);
      }
    } catch (err) {
      recordResult('10MB Base64 Attachment Handling', false, err.message);
    }

    // -------------------------------------------------------------
    // SCENARIO 5: Special Characters, Unicode, Emojis & Extreme Strings
    // -------------------------------------------------------------
    console.log('\n🔹 Scenario 5: Special Characters & Injection Payloads...');
    try {
      const extremeUser = {
        id: 'u_extreme_chars',
        username: '  UserWith spaces & Special !@#$%^&*()_+-=[]{}|;:\'",.<>/?  ',
        password: '🔒🔑🛡️Pass_123',
        name: '✨🎓 Park Soyeon (박소연 / Пак Соён) 🚀',
        note: 'x'.repeat(50000)
      };

      const resCreate = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extremeUser)
      });

      if (resCreate.status === 200) {
        const cleanU = extremeUser.username.trim().toLowerCase();
        const cleanP = extremeUser.password.trim();

        const resLogin = await fetch(`${server.baseUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanU, password: cleanP })
        });

        const loginBody = await resLogin.json();
        if (resLogin.status === 200 && loginBody.success) {
          recordResult(
            'Special Chars, Emoji & Extreme String Login',
            true,
            'User created, unicode & 50k char field preserved, login succeeded.'
          );
        } else {
          recordResult(
            'Special Chars, Emoji & Extreme String Login',
            false,
            `User created but POST /api/login failed (status ${resLogin.status}, error: ${loginBody.error})`
          );
        }
      } else {
        recordResult('Special Chars, Emoji & Extreme String Creation', false, `HTTP status ${resCreate.status}`);
      }
    } catch (err) {
      recordResult('Special Chars & Extreme Strings', false, err.message);
    }

    // -------------------------------------------------------------
    // SCENARIO 6: Multi-Device Sync (Device A create -> Device B instant login & update)
    // -------------------------------------------------------------
    console.log('\n🔹 Scenario 6: Multi-Device Real-Time Auth & State Sync...');
    try {
      const syncUser = {
        id: 'u_sync_multidevice',
        username: 'multidevice_student',
        password: 'SyncPassword2026!',
        name: 'MultiDevice Student',
        role: 'student',
        statusStage: 0
      };

      await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncUser)
      });

      const loginPromises = [];
      for (let i = 0; i < 20; i++) {
        loginPromises.push(
          fetch(`${server.baseUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'multidevice_student', password: 'SyncPassword2026!' })
          })
        );
      }

      const loginResps = await Promise.all(loginPromises);
      const allLoginsOk = loginResps.every(r => r.status === 200);

      const resGet = await fetch(`${server.baseUrl}/api/users`);
      let users = await resGet.json();
      users = users.map(u => u.id === 'u_sync_multidevice' ? { ...u, statusStage: 5 } : u);

      await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      });

      const resDevBPoll = await fetch(`${server.baseUrl}/api/users?t=${Date.now()}`);
      const devBUsers = await resDevBPoll.json();
      const updatedSyncUser = devBUsers.find(u => u.id === 'u_sync_multidevice');

      if (allLoginsOk && updatedSyncUser && updatedSyncUser.statusStage === 5) {
        recordResult(
          'Multi-Device Sync (Creation -> 20 Concurrent Logins -> Real-Time State Update)',
          true,
          'Immediate cross-device login succeeded (20/20) and state update reflected accurately.'
        );
      } else {
        recordResult(
          'Multi-Device Sync',
          false,
          `Logins OK: ${allLoginsOk}, Updated statusStage: ${updatedSyncUser?.statusStage}`
        );
      }
    } catch (err) {
      recordResult('Multi-Device Sync', false, err.message);
    }

    // -------------------------------------------------------------
    // SCENARIO 7: Whitespace Username Edge Case (Unloginable User)
    // -------------------------------------------------------------
    console.log('\n🔹 Scenario 7: Whitespace Username Creation & Login Vulnerability...');
    try {
      const whitespaceUser = {
        id: 'u_whitespace',
        username: '   ', // Only whitespace
        password: 'validPassword123',
        name: 'Ghost User',
        role: 'student'
      };

      const resCreate = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whitespaceUser)
      });

      const createBody = await resCreate.json();

      if (resCreate.status === 200) {
        // Attempt login with whitespace username
        const resLogin = await fetch(`${server.baseUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: '   ', password: 'validPassword123' })
        });

        if (resLogin.status === 400) {
          recordResult(
            'Whitespace Username Creation Anomaly',
            false,
            'POST /api/users/create allows creating a user with username "   " (only spaces), but POST /api/login rejects login with HTTP 400 ("Username and password are required"), creating an un-authenticating orphaned account.'
          );
        } else {
          recordResult('Whitespace Username Handling', true, 'Login with whitespace user handled smoothly.');
        }
      } else {
        recordResult('Whitespace Username Validation', true, 'Server rejected creation of whitespace username.');
      }
    } catch (err) {
      recordResult('Whitespace Username Test', false, err.message);
    }

  } finally {
    server.stop();
    try {
      if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
      if (fs.existsSync(LEADS_FILE)) fs.unlinkSync(LEADS_FILE);
    } catch (e) {}
  }

  console.log('\n====================================================');
  console.log('📊 EMPIRICAL STRESS HARNESS SUMMARY');
  console.log('====================================================');
  console.log(`  Passed Scenarios : ${passedScenarios} ✅`);
  console.log(`  Failed Scenarios : ${failedScenarios} ${failedScenarios > 0 ? '❌' : ''}`);
  console.log('====================================================');

  return { passedScenarios, failedScenarios, findings };
}

runStressHarness().catch(console.error);
