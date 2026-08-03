import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '..');

// Simple assertion library
export function assertStrictEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Assertion failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message || `Assertion failed:\nExpected: ${expectedStr}\nGot:      ${actualStr}`);
  }
}

export function assertOk(value, message) {
  if (!value) {
    throw new Error(message || `Assertion failed: expected truthy value, got ${value}`);
  }
}

export function assertIncludes(arrayOrString, item, message) {
  if (typeof arrayOrString === 'string') {
    if (!arrayOrString.includes(item)) {
      throw new Error(message || `Expected string to include "${item}", got "${arrayOrString}"`);
    }
  } else if (Array.isArray(arrayOrString)) {
    if (!arrayOrString.includes(item)) {
      throw new Error(message || `Expected array to include item, but it was missing.`);
    }
  } else {
    throw new Error("assertIncludes expected array or string");
  }
}

export async function assertThrowsAsync(fn, expectedErrorMessageSubstring, message) {
  let threw = false;
  try {
    await fn();
  } catch (err) {
    threw = true;
    if (expectedErrorMessageSubstring && !err.message.includes(expectedErrorMessageSubstring)) {
      throw new Error(message || `Expected error containing "${expectedErrorMessageSubstring}", got "${err.message}"`);
    }
  }
  if (!threw) {
    throw new Error(message || `Expected function to throw, but it succeeded.`);
  }
}

// Server lifecycle manager
export class TestServerInstance {
  constructor(port, usersFilePath, leadsFilePath) {
    this.port = port;
    this.usersFilePath = usersFilePath;
    this.leadsFilePath = leadsFilePath;
    this.process = null;
    this.baseUrl = `http://localhost:${port}`;
  }

  async start() {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        PORT: String(this.port),
        USERS_FILE: this.usersFilePath,
        LEADS_FILE: this.leadsFilePath
      };

      const serverScript = path.join(PROJECT_ROOT, 'server.js');
      this.process = spawn('node', [serverScript], { env, stdio: ['pipe', 'pipe', 'pipe'] });

      let started = false;
      let outputLogs = '';

      this.process.stdout.on('data', (data) => {
        outputLogs += data.toString();
        if (!started && outputLogs.includes(`NovaStudy API Server running on port ${this.port}`)) {
          started = true;
          resolve(this);
        }
      });

      this.process.stderr.on('data', (data) => {
        outputLogs += data.toString();
      });

      this.process.on('error', (err) => {
        if (!started) reject(err);
      });

      this.process.on('exit', (code) => {
        if (!started) {
          reject(new Error(`Server process exited early with code ${code}. Logs: ${outputLogs}`));
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!started) {
          this.stop();
          reject(new Error(`Server start timed out after 5000ms. Logs: ${outputLogs}`));
        }
      }, 5000);
    });
  }

  stop() {
    if (this.process) {
      const pid = this.process.pid;
      try {
        if (this.process.stdout) this.process.stdout.destroy();
        if (this.process.stderr) this.process.stderr.destroy();
        if (process.platform === 'win32') {
          execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
        } else {
          this.process.kill('SIGKILL');
        }
      } catch (e) {}
      this.process = null;
    }
  }
}

// Helper to wipe & set initial DB state
export function prepareDBFiles(usersFile, leadsFile, initialUsers = null, initialLeads = null) {
  if (fs.existsSync(usersFile)) {
    fs.unlinkSync(usersFile);
  }
  if (fs.existsSync(leadsFile)) {
    fs.unlinkSync(leadsFile);
  }

  if (initialUsers !== null) {
    fs.writeFileSync(usersFile, typeof initialUsers === 'string' ? initialUsers : JSON.stringify(initialUsers, null, 2));
  }
  if (initialLeads !== null) {
    fs.writeFileSync(leadsFile, typeof initialLeads === 'string' ? initialLeads : JSON.stringify(initialLeads, null, 2));
  }
}

// Helper to simulate Client AuthContext Smart Auto-Merge
export function simulateClientMerge(serverUsers, localUsers, defaultAdmin) {
  let mergedUsers = serverUsers || localUsers;

  if (serverUsers && localUsers) {
    const map = new Map();
    serverUsers.forEach((u) => map.set(String(u.username).trim().toLowerCase(), u));
    localUsers.forEach((u) => {
      const key = String(u.username).trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, u);
      }
    });
    mergedUsers = Array.from(map.values());
  }

  const hasAdmin = mergedUsers.some((u) => String(u.username).trim().toLowerCase() === 'darkxan');
  if (!hasAdmin && defaultAdmin) {
    mergedUsers = [defaultAdmin, ...mergedUsers];
  }

  return mergedUsers;
}
