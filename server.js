import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// ABSOLUTE STRICT PATH TO ORACLE CLOUD VPS DATABASE FILES
const USERS_FILE = process.env.USERS_FILE || '/home/ubuntu/NovaStudy/server_db_users.json';
const LEADS_FILE = process.env.LEADS_FILE || '/home/ubuntu/NovaStudy/server_db_leads.json';

console.log(`[SERVER DB STRICT PATHS] USERS_FILE=${USERS_FILE}, LEADS_FILE=${LEADS_FILE}`);

const DEFAULT_ADMIN = {
  id: 'admin_darkxan',
  username: 'DarkXAN',
  password: 'as246800',
  name: 'DarkXAN (Главный Администратор)',
  role: 'admin',
  phone: '+82 010-8179-2266',
  createdAt: new Date().toLocaleDateString()
};

// Atomic JSON file write helper to prevent 0-byte truncation on crash/interruption
function atomicWriteJSONSync(filePath, data) {
  try {
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2)}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (e) {
    // Direct fallback write if rename fails
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}

// Ensure DB files exist and preserve non-empty valid JSON without accidental reset
function initDB() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      atomicWriteJSONSync(USERS_FILE, [DEFAULT_ADMIN]);
    } else {
      const content = fs.readFileSync(USERS_FILE, 'utf8').trim();
      if (!content) {
        atomicWriteJSONSync(USERS_FILE, [DEFAULT_ADMIN]);
      } else {
        try {
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            atomicWriteJSONSync(USERS_FILE, [DEFAULT_ADMIN]);
          }
        } catch (e) {
          console.error("Corrupted USERS_FILE JSON, writing default admin", e);
          atomicWriteJSONSync(USERS_FILE, [DEFAULT_ADMIN]);
        }
      }
    }

    if (!fs.existsSync(LEADS_FILE)) {
      atomicWriteJSONSync(LEADS_FILE, []);
    } else {
      const content = fs.readFileSync(LEADS_FILE, 'utf8').trim();
      if (!content) {
        atomicWriteJSONSync(LEADS_FILE, []);
      } else {
        try {
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) {
            atomicWriteJSONSync(LEADS_FILE, []);
          }
        } catch (e) {
          console.error("Corrupted LEADS_FILE JSON, writing empty array", e);
          atomicWriteJSONSync(LEADS_FILE, []);
        }
      }
    }
  } catch (err) {
    console.error("Error initializing DB files:", err);
  }
}
initDB();

// Read Users (Dynamic read on every request)
app.get(['/api/users', '/users'], (req, res) => {
  try {
    initDB();
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(data || '[]');
    console.log(`[API GET] Returning ${users.length} users to client.`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users);
  } catch (err) {
    console.error("[API GET ERROR]", err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to read users database' });
  }
});

// Save/Update Users Array
app.post(['/api/users', '/users'], (req, res) => {
  try {
    const users = req.body;
    if (Array.isArray(users) && users.length > 0) {
      atomicWriteJSONSync(USERS_FILE, users);
      console.log(`[API POST SUCCESS] Saved ${users.length} users to disk at ${USERS_FILE}.`);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ success: true, count: users.length });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({ error: 'Invalid users array' });
    }
  } catch (err) {
    console.error("[API POST ERROR]", err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to save users database' });
  }
});

// Create Single User Endpoint
app.post(['/api/users/create', '/users/create'], (req, res) => {
  try {
    initDB();
    const newUser = req.body;
    if (!newUser || !newUser.username) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Username is required' });
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    let users = JSON.parse(data || '[]');

    // Remove existing user with same username if exists
    users = users.filter((u) => String(u.username).trim().toLowerCase() !== String(newUser.username).trim().toLowerCase());
    users.unshift(newUser);

    atomicWriteJSONSync(USERS_FILE, users);
    console.log(`[API CREATE USER SUCCESS] Added user ${newUser.username}. Total users: ${users.length}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("[API CREATE USER ERROR]", err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login Endpoint
app.post(['/api/login', '/login'], (req, res) => {
  try {
    initDB();
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(data || '[]');
    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    const found = users.find(
      (u) =>
        String(u.username).trim().toLowerCase() === cleanUsername &&
        String(u.password).trim() === cleanPassword
    );
    res.setHeader('Content-Type', 'application/json');
    if (found) {
      return res.status(200).json({ success: true, user: found });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error("[API LOGIN ERROR]", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Read Leads
app.get(['/api/leads', '/leads'], (req, res) => {
  try {
    initDB();
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    const leads = JSON.parse(data || '[]');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(leads);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to read leads database' });
  }
});

// Save Lead
app.post(['/api/leads', '/leads'], (req, res) => {
  try {
    const newLead = req.body;
    initDB();
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    const leads = JSON.parse(data || '[]');
    leads.unshift(newLead);
    atomicWriteJSONSync(LEADS_FILE, leads);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 NovaStudy API Server running on port ${PORT}`);
});
