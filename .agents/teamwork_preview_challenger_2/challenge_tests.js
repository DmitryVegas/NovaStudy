import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

console.log("=================================================");
console.log("🔥 CHALLENGER 2 EMPIRICAL STRESS & EDGE-CASE SUITE (EXPANDED)");
console.log("=================================================");

let totalPassed = 0;
let totalFailed = 0;

class ChallengeServer {
  constructor(port, usersFile, leadsFile) {
    this.port = port;
    this.usersFile = usersFile;
    this.leadsFile = leadsFile;
    this.process = null;
    this.baseUrl = `http://localhost:${port}`;
  }

  async start() {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        PORT: String(this.port),
        USERS_FILE: this.usersFile,
        LEADS_FILE: this.leadsFile
      };
      const serverScript = path.join(PROJECT_ROOT, 'server.js');
      this.process = spawn('node', [serverScript], { env, stdio: ['pipe', 'pipe', 'pipe'] });
      let output = '';

      this.process.stdout.on('data', (d) => {
        output += d.toString();
        if (output.includes(`NovaStudy API Server running on port ${this.port}`)) {
          resolve(this);
        }
      });
      this.process.stderr.on('data', (d) => { output += d.toString(); });
      this.process.on('error', reject);
      setTimeout(() => reject(new Error(`Server timeout. Output: ${output}`)), 5000);
    });
  }

  stop() {
    if (this.process) {
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /pid ${this.process.pid} /T /F`, { stdio: 'ignore' });
        } else {
          this.process.kill('SIGKILL');
        }
      } catch (e) {}
      this.process = null;
    }
  }
}

// ----------------------------------------------------------------------------
// TEST 1: Corrupted USERS_FILE Destructive Data Wipe Vulnerability in initDB()
// ----------------------------------------------------------------------------
async function testCorruptedDataWipeVulnerability() {
  console.log("\n[TEST 1] Testing Corrupted DB Data Wipe Vulnerability in initDB()");
  const tempUsersFile = path.join(__dirname, 'temp_corrupt_users.json');
  const tempLeadsFile = path.join(__dirname, 'temp_corrupt_leads.json');

  const usersData = Array.from({ length: 50 }, (_, i) => ({
    id: `user_valuable_${i}`,
    username: `valuable_student_${i}`,
    password: `pass_${i}`,
    name: `Valuable Student ${i}`,
    role: 'student'
  }));
  let jsonString = JSON.stringify(usersData, null, 2);
  const corruptedJsonString = jsonString.substring(0, jsonString.length - 10);
  fs.writeFileSync(tempUsersFile, corruptedJsonString, 'utf8');
  fs.writeFileSync(tempLeadsFile, '[]', 'utf8');

  const server = new ChallengeServer(5091, tempUsersFile, tempLeadsFile);
  await server.start();

  try {
    const res = await fetch(`${server.baseUrl}/api/users`);
    const users = await res.json();

    const diskAfter = fs.readFileSync(tempUsersFile, 'utf8');
    const parsedAfter = JSON.parse(diskAfter);

    console.log(`  - Original file contained 50 users (syntax corrupted)`);
    console.log(`  - File on disk after server access contains: ${parsedAfter.length} user(s) (${parsedAfter[0]?.username})`);

    if (parsedAfter.length === 1 && parsedAfter[0]?.username === 'DarkXAN') {
      console.log("  ⚠️ CONFIRMED VULNERABILITY: initDB() destructively WIPED all 50 student records on disk and replaced with default admin when JSON was corrupted!");
      totalFailed++;
    } else {
      console.log("  ✅ Data was preserved or backed up safely.");
      totalPassed++;
    }
  } finally {
    server.stop();
    if (fs.existsSync(tempUsersFile)) fs.unlinkSync(tempUsersFile);
    if (fs.existsSync(tempLeadsFile)) fs.unlinkSync(tempLeadsFile);
  }
}

// ----------------------------------------------------------------------------
// TEST 2: Local Fallback Obscures Live Server API Failures (Network Active)
// ----------------------------------------------------------------------------
async function testFallbackObscuresLiveAPIFailures() {
  console.log("\n[TEST 2] Testing if Local Fallback Obscures Live Server API Failures (Network Active)");
  const tempUsersFile = path.join(__dirname, 'temp_fallback_users.json');
  const tempLeadsFile = path.join(__dirname, 'temp_fallback_leads.json');

  const serverUsers = [
    { id: 'admin_darkxan', username: 'DarkXAN', password: 'as246800', role: 'admin' },
    { id: 'u1', username: 'revoked_user', password: 'NEW_SERVER_PASSWORD_123', role: 'student' }
  ];
  fs.writeFileSync(tempUsersFile, JSON.stringify(serverUsers, null, 2));
  fs.writeFileSync(tempLeadsFile, '[]', 'utf8');

  const server = new ChallengeServer(5092, tempUsersFile, tempLeadsFile);
  await server.start();

  try {
    const cachedLocalUsers = [
      { id: 'admin_darkxan', username: 'DarkXAN', password: 'as246800', role: 'admin' },
      { id: 'u1', username: 'revoked_user', password: 'OLD_CACHE_PASSWORD', role: 'student' }
    ];

    const inputUsername = 'revoked_user';
    const inputPassword = 'OLD_CACHE_PASSWORD';

    const apiRes = await fetch(`${server.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: inputUsername, password: inputPassword })
    });

    console.log(`  - Live Server API status for invalid password: ${apiRes.status}`);
    const apiData = await apiRes.json();
    console.log(`  - Live Server API response: ${JSON.stringify(apiData)}`);

    let clientResult = null;
    if (apiRes.ok && apiData.success && apiData.user) {
      clientResult = { success: true, user: apiData.user };
    } else {
      console.log(`  - Client res.ok was false (${apiRes.status}). AuthContext falls through to local cache...`);
      const foundInCache = cachedLocalUsers.find(
        u => u.username.toLowerCase() === inputUsername.toLowerCase() && u.password === inputPassword
      );
      if (foundInCache) {
        clientResult = { success: true, user: foundInCache, viaFallback: true };
      } else {
        clientResult = { success: false, error: 'Invalid credentials' };
      }
    }

    console.log(`  - Client login() returned: ${JSON.stringify(clientResult)}`);

    if (clientResult.success && clientResult.viaFallback) {
      console.log("  ⚠️ CONFIRMED BUG: Client login() logged user in via local fallback EVEN WHEN LIVE SERVER API RETURNED 401 (Invalid Credentials)!");
      totalFailed++;
    } else {
      console.log("  ✅ Client properly respected 401 server response.");
      totalPassed++;
    }
  } finally {
    server.stop();
    if (fs.existsSync(tempUsersFile)) fs.unlinkSync(tempUsersFile);
    if (fs.existsSync(tempLeadsFile)) fs.unlinkSync(tempLeadsFile);
  }
}

// ----------------------------------------------------------------------------
// TEST 3: Zombie User Resurrection Flaw in loadUsersFromAPI() Auto-Merge
// ----------------------------------------------------------------------------
async function testZombieUserResurrectionFlaw() {
  console.log("\n[TEST 3] Testing Zombie User Resurrection Flaw in loadUsersFromAPI() Auto-Merge");
  const tempUsersFile = path.join(__dirname, 'temp_zombie_users.json');
  const tempLeadsFile = path.join(__dirname, 'temp_zombie_leads.json');

  const initialUsers = [
    { id: 'admin_darkxan', username: 'DarkXAN', password: 'as246800', role: 'admin' },
    { id: 'user_bob', username: 'student_bob', password: 'pass', role: 'student' },
    { id: 'user_alice', username: 'student_alice', password: 'pass', role: 'student' }
  ];
  fs.writeFileSync(tempUsersFile, JSON.stringify(initialUsers, null, 2));
  fs.writeFileSync(tempLeadsFile, '[]', 'utf8');

  const server = new ChallengeServer(5093, tempUsersFile, tempLeadsFile);
  await server.start();

  try {
    console.log("  - Admin deletes 'student_bob' from server DB...");
    const remainingServerUsers = [
      { id: 'admin_darkxan', username: 'DarkXAN', password: 'as246800', role: 'admin' },
      { id: 'user_alice', username: 'student_alice', password: 'pass', role: 'student' }
    ];
    await fetch(`${server.baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(remainingServerUsers)
    });

    let checkRes = await fetch(`${server.baseUrl}/api/users`);
    let checkList = await checkRes.json();
    console.log(`  - Server user count after deletion: ${checkList.length} (contains bob? ${checkList.some(u=>u.username==='student_bob')})`);

    const clientBLocalUsers = [...initialUsers];

    console.log("  - Client B (with stale LocalStorage) calls loadUsersFromAPI()...");
    const res = await fetch(`${server.baseUrl}/api/users`);
    const serverUsers = await res.json();

    const map = new Map();
    serverUsers.forEach((u) => map.set(String(u.username).trim().toLowerCase(), u));
    clientBLocalUsers.forEach((u) => {
      const key = String(u.username).trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, u);
      }
    });
    const mergedUsers = Array.from(map.values());

    console.log(`  - Merged user count on Client B: ${mergedUsers.length} (contains bob? ${mergedUsers.some(u=>u.username==='student_bob')})`);

    if (serverUsers && mergedUsers.length > serverUsers.length) {
      console.log("  - AuthContext auto-posts mergedUsers BACK to server!");
      await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedUsers)
      });
    }

    checkRes = await fetch(`${server.baseUrl}/api/users`);
    checkList = await checkRes.json();
    const bobResurrected = checkList.some(u => u.username === 'student_bob');
    console.log(`  - Server user count after Client B sync: ${checkList.length} (contains bob? ${bobResurrected})`);

    if (bobResurrected) {
      console.log("  ⚠️ CONFIRMED BUG: Deleted user 'student_bob' was RESURRECTED on server by Client B's auto-merge logic!");
      totalFailed++;
    } else {
      console.log("  ✅ User remained deleted.");
      totalPassed++;
    }
  } finally {
    server.stop();
    if (fs.existsSync(tempUsersFile)) fs.unlinkSync(tempUsersFile);
    if (fs.existsSync(tempLeadsFile)) fs.unlinkSync(tempLeadsFile);
  }
}

// ----------------------------------------------------------------------------
// TEST 4: Windows File Locking Race Condition during atomicWriteJSONSync
// ----------------------------------------------------------------------------
async function testWindowsFileLockingRace() {
  console.log("\n[TEST 4] Testing Windows File Locking Race Condition in atomicWriteJSONSync()");
  const tempFile = path.join(__dirname, 'temp_lock_test.json');
  fs.writeFileSync(tempFile, JSON.stringify({ count: 0 }), 'utf8');

  function atomicWriteJSONSync(filePath, data) {
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2)}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  }

  let lockErrors = 0;
  // Simulate concurrent open read handles while write rename happens
  for (let i = 0; i < 20; i++) {
    try {
      const fd = fs.openSync(tempFile, 'r');
      try {
        atomicWriteJSONSync(tempFile, { count: i });
      } finally {
        fs.closeSync(fd);
      }
    } catch (err) {
      lockErrors++;
      console.log(`  - Windows Lock Error captured: ${err.code} (${err.message})`);
    }
  }

  console.log(`  - Total Windows file lock errors during write-rename while open: ${lockErrors}`);
  if (lockErrors > 0) {
    console.log("  ⚠️ CONFIRMED LIMITATION: Windows file locking (EBUSY/EPERM) throws during fs.renameSync if file handle is held open!");
    totalFailed++;
  } else {
    console.log("  ✅ Atomic writes handled open descriptors without error.");
    totalPassed++;
  }

  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
}

// ----------------------------------------------------------------------------
// TEST 5: Cross-Tab Storage Event Listener Absence
// ----------------------------------------------------------------------------
async function testCrossTabSyncEventListener() {
  console.log("\n[TEST 5] Testing Cross-Tab Real-time Storage Event Listener");
  const authContextCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'context', 'AuthContext.jsx'), 'utf8');

  const hasStorageEventListener = authContextCode.includes("addEventListener('storage'") || authContextCode.includes('addEventListener("storage"');
  console.log(`  - AuthContext.jsx implements window.addEventListener('storage'): ${hasStorageEventListener}`);

  if (!hasStorageEventListener) {
    console.log("  ⚠️ CONFIRMED FINDING: AuthContext does NOT listen to browser 'storage' event for instant cross-tab sync! Cross-tab updates depend solely on 5s polling timer.");
    totalFailed++;
  } else {
    console.log("  ✅ Storage event listener is present.");
    totalPassed++;
  }
}

// ----------------------------------------------------------------------------
// MAIN RUNNER
// ----------------------------------------------------------------------------
async function runAll() {
  await testCorruptedDataWipeVulnerability();
  await testFallbackObscuresLiveAPIFailures();
  await testZombieUserResurrectionFlaw();
  await testWindowsFileLockingRace();
  await testCrossTabSyncEventListener();

  console.log("\n=================================================");
  console.log(`📊 EMPIRICAL STRESS TEST RESULTS (FINAL)`);
  console.log(`   Passed Checkpoints  : ${totalPassed}`);
  console.log(`   Confirmed Failure Modes / Flaws Found : ${totalFailed}`);
  console.log("=================================================");
}

runAll().catch(console.error);
