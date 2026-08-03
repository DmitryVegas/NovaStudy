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
app.use(express.json({ limit: '50mb' }));

const USERS_FILE = path.join(__dirname, 'server_db_users.json');
const LEADS_FILE = path.join(__dirname, 'server_db_leads.json');

const DEFAULT_ADMIN = {
  id: 'admin_darkxan',
  username: 'DarkXAN',
  password: 'as246800',
  name: 'DarkXAN (Главный Администратор)',
  role: 'admin',
  phone: '+82 010-8179-2266',
  createdAt: new Date().toLocaleDateString()
};

// Ensure DB files exist
function initDB() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([DEFAULT_ADMIN], null, 2));
    }
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
    }
  } catch (err) {
    console.error("Error initializing DB files:", err);
  }
}
initDB();

// Read Users (Dynamic read on every single request)
app.get(['/api/users', '/users'], (req, res) => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      initDB();
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    console.log(`[API GET] Returning ${users.length} users to client.`);
    res.json(users);
  } catch (err) {
    console.error("[API GET ERROR]", err);
    res.status(500).json({ error: 'Failed to read users database' });
  }
});

// Save/Update Users (Dynamic write to disk on every single request)
app.post(['/api/users', '/users'], (req, res) => {
  try {
    const users = req.body;
    if (Array.isArray(users) && users.length > 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log(`[API POST SUCCESS] Saved ${users.length} users to disk.`);
      res.json({ success: true, count: users.length });
    } else {
      res.status(400).json({ error: 'Invalid users array' });
    }
  } catch (err) {
    console.error("[API POST ERROR]", err);
    res.status(500).json({ error: 'Failed to save users database' });
  }
});

// Read Leads
app.get(['/api/leads', '/leads'], (req, res) => {
  try {
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    const leads = JSON.parse(data);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read leads database' });
  }
});

// Save Lead
app.post(['/api/leads', '/leads'], (req, res) => {
  try {
    const newLead = req.body;
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    const leads = JSON.parse(data);
    leads.unshift(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 NovaStudy API Server running on port ${PORT}`);
});
