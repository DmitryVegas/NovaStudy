import fs from 'fs';
import path from 'path';
import {
  TestServerInstance,
  prepareDBFiles,
  assertStrictEqual,
  assertOk,
  assertIncludes,
  PROJECT_ROOT
} from './harness.js';

const TEST_PORT = 5051;
const USERS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t1_users.json');
const LEADS_FILE = path.join(PROJECT_ROOT, 'tests', 'temp_t1_leads.json');

export async function runTier1Tests() {
  console.log('\n--- Running Tier 1: Feature Coverage Tests ---');
  let server = null;
  let passed = 0;
  let failed = 0;

  try {
    prepareDBFiles(USERS_FILE, LEADS_FILE);
    server = new TestServerInstance(TEST_PORT, USERS_FILE, LEADS_FILE);
    await server.start();

    // T1.1: Server Initialization & Default Admin Retrieval
    try {
      const res = await fetch(`${server.baseUrl}/api/users`);
      assertStrictEqual(res.status, 200, 'GET /api/users status 200');
      const users = await res.json();
      assertOk(Array.isArray(users), 'Users response is array');
      assertStrictEqual(users.length, 1, 'Contains default admin');
      assertStrictEqual(users[0].username, 'DarkXAN', 'Default admin username match');
      assertStrictEqual(users[0].role, 'admin', 'Default admin role match');
      console.log('  ✅ T1.1: Server auto-initialization & Default Admin verified');
      passed++;
    } catch (err) {
      console.error('  ❌ T1.1 Failed:', err.message);
      failed++;
    }

    // T1.2: Student & Staff User Creation (/api/users/create)
    try {
      const studentUser = {
        id: 'user_student_101',
        username: '  StudentAlex  ',
        password: 'PassWord123!',
        name: 'Alex Rivera',
        role: 'student',
        phone: '+82 10-1234-5678',
        statusStage: 2,
        feePaid: true,
        documents: [
          { id: 'doc_1', name: 'passport.pdf', dataUrl: 'data:application/pdf;base64,JVBERi0xLjc...', type: 'pdf' }
        ],
        createdAt: '2026-08-03'
      };

      const staffUser = {
        id: 'user_staff_201',
        username: 'ManagerElena',
        password: 'StaffSecret456',
        name: 'Elena Rostova',
        role: 'staff',
        phone: '+82 10-8765-4321',
        createdAt: '2026-08-03'
      };

      // Create student
      const resStudent = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentUser)
      });
      assertStrictEqual(resStudent.status, 200, 'POST /api/users/create status 200');
      const resStudentJson = await resStudent.json();
      assertOk(resStudentJson.success, 'Student creation success');

      // Create staff
      const resStaff = await fetch(`${server.baseUrl}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffUser)
      });
      assertStrictEqual(resStaff.status, 200, 'POST /api/users/create staff status 200');

      // Fetch all users
      const resAll = await fetch(`${server.baseUrl}/api/users`);
      const allUsers = await resAll.json();
      assertStrictEqual(allUsers.length, 3, 'Total users count is 3 (admin + student + staff)');

      // Verify Student data
      const foundStudent = allUsers.find(u => u.id === 'user_student_101');
      assertOk(foundStudent, 'Found created student');
      assertStrictEqual(foundStudent.name, 'Alex Rivera', 'Student name match');
      assertStrictEqual(foundStudent.role, 'student', 'Student role match');
      assertStrictEqual(foundStudent.statusStage, 2, 'Student statusStage match');
      assertStrictEqual(foundStudent.feePaid, true, 'Student feePaid match');
      assertStrictEqual(foundStudent.documents.length, 1, 'Student documents length match');

      // Verify Staff data
      const foundStaff = allUsers.find(u => u.id === 'user_staff_201');
      assertOk(foundStaff, 'Found created staff');
      assertStrictEqual(foundStaff.role, 'staff', 'Staff role match');

      console.log('  ✅ T1.2: Student & Staff user creation & profile fields verified');
      passed++;
    } catch (err) {
      console.error('  ❌ T1.2 Failed:', err.message);
      failed++;
    }

    // T1.3: DB Disk Persistence
    try {
      const diskContent = fs.readFileSync(USERS_FILE, 'utf8');
      assertOk(diskContent.trim().length > 0, 'Users file on disk is non-empty');
      const parsedDisk = JSON.parse(diskContent);
      assertOk(Array.isArray(parsedDisk), 'Disk file contains JSON array');
      assertStrictEqual(parsedDisk.length, 3, 'Disk file contains 3 users');
      assertOk(parsedDisk.some(u => u.username === '  StudentAlex  '), 'Disk file contains StudentAlex');

      // Also test Lead creation & persistence
      const leadObj = {
        name: 'John Doe',
        phone: '+82 10-9999-8888',
        program: 'Computer Science',
        university: 'Seoul National University'
      };
      const resLead = await fetch(`${server.baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadObj)
      });
      assertStrictEqual(resLead.status, 200, 'POST /api/leads status 200');

      const leadsDiskContent = fs.readFileSync(LEADS_FILE, 'utf8');
      const parsedLeads = JSON.parse(leadsDiskContent);
      assertStrictEqual(parsedLeads.length, 1, 'Leads disk file contains 1 lead');
      assertStrictEqual(parsedLeads[0].name, 'John Doe', 'Lead name on disk match');

      console.log('  ✅ T1.3: DB Disk persistence for users & leads verified');
      passed++;
    } catch (err) {
      console.error('  ❌ T1.3 Failed:', err.message);
      failed++;
    }

    // T1.4: Login Authentication Logic
    try {
      const resAll = await fetch(`${server.baseUrl}/api/users`);
      const usersList = await resAll.json();

      // Auth logic simulation matching AuthContext.jsx:
      // Username is trimmed and lowercased, password is trimmed exactly
      const authenticate = (usernameInput, passwordInput) => {
        const cleanU = String(usernameInput).trim().toLowerCase();
        const cleanP = String(passwordInput).trim();
        return usersList.find(
          u => String(u.username).trim().toLowerCase() === cleanU && String(u.password).trim() === cleanP
        );
      };

      // Test valid logins
      assertOk(authenticate('darkxan', 'as246800'), 'Admin login with lowercase darkxan');
      assertOk(authenticate('  DARKXAN  ', 'as246800'), 'Admin login with uppercase & spaces');
      assertOk(authenticate('studentalex', 'PassWord123!'), 'Student login case-insensitive username');
      assertOk(authenticate('ManagerElena', 'StaffSecret456'), 'Staff login valid');

      // Test invalid logins
      assertStrictEqual(authenticate('studentalex', 'wrongpass'), undefined, 'Invalid password fails');
      assertStrictEqual(authenticate('nonexistentuser', 'PassWord123!'), undefined, 'Nonexistent user fails');
      assertStrictEqual(authenticate('studentalex', 'password123!'), undefined, 'Password is case-sensitive');

      console.log('  ✅ T1.4: Login authentication logic & credential rules verified');
      passed++;
    } catch (err) {
      console.error('  ❌ T1.4 Failed:', err.message);
      failed++;
    }

  } finally {
    if (server) server.stop();
    // cleanup
    try {
      if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
      if (fs.existsSync(LEADS_FILE)) fs.unlinkSync(LEADS_FILE);
    } catch (e) {}
  }

  return { passed, failed };
}
