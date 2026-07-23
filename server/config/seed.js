require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  try {
    const hash = async (pw) => bcrypt.hash(pw, 10);

    // Users
    const [adminRes] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      ['Admin User', 'admin@portal.com', await hash('admin123'), 'admin']
    );
    const [staffRes] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      ['Jane Staff', 'staff@portal.com', await hash('staff123'), 'staff']
    );
    const [clientRes] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      ['Acme Corp', 'client@portal.com', await hash('client123'), 'client']
    );

    const adminId = adminRes.insertId;
    const staffId = staffRes.insertId;
    const clientId = clientRes.insertId;

    // Project
    const [projRes] = await pool.execute(
      'INSERT INTO projects (title, description, client_id, created_by, deadline, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['Website Redesign', 'Complete overhaul of the Acme Corp website including new branding, responsive design, and CMS integration.', clientId, adminId, '2025-03-31', 'active']
    );
    const projectId = projRes.insertId;

    // Assign staff to project
    await pool.execute('INSERT INTO project_staff (project_id, user_id) VALUES (?, ?)', [projectId, staffId]);

    // Milestones
    const [m1] = await pool.execute(
      'INSERT INTO milestones (project_id, title, due_date, status) VALUES (?, ?, ?, ?)',
      [projectId, 'Discovery & Planning', '2025-01-15', 'completed']
    );
    const [m2] = await pool.execute(
      'INSERT INTO milestones (project_id, title, due_date, status) VALUES (?, ?, ?, ?)',
      [projectId, 'Design & Prototyping', '2025-02-15', 'in_progress']
    );
    const [m3] = await pool.execute(
      'INSERT INTO milestones (project_id, title, due_date, status) VALUES (?, ?, ?, ?)',
      [projectId, 'Development & Testing', '2025-03-15', 'pending']
    );

    // Tasks for Milestone 1
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m1.insertId, 'Stakeholder interviews', staffId, 'completed']);
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m1.insertId, 'Requirements documentation', staffId, 'completed']);
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m1.insertId, 'Technical architecture plan', adminId, 'completed']);

    // Tasks for Milestone 2
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m2.insertId, 'Wireframes', staffId, 'completed']);
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m2.insertId, 'UI Design mockups', staffId, 'in_progress']);
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m2.insertId, 'Client design review', staffId, 'todo']);

    // Tasks for Milestone 3
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m3.insertId, 'Frontend development', staffId, 'todo']);
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m3.insertId, 'Backend integration', staffId, 'todo']);
    await pool.execute('INSERT INTO tasks (milestone_id, title, assigned_to, status) VALUES (?, ?, ?, ?)', [m3.insertId, 'QA Testing', staffId, 'todo']);

    console.log('✅ Database seeded successfully!');
    console.log('----------------------------');
    console.log('Admin:  admin@portal.com  / admin123');
    console.log('Staff:  staff@portal.com  / staff123');
    console.log('Client: client@portal.com / client123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
