const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.getAllProjects = async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'client') {
      query = `
        SELECT p.*, u.name AS client_name, u2.name AS created_by_name,
          ROUND(
            COALESCE((SELECT COUNT(*) FROM tasks t JOIN milestones m ON t.milestone_id = m.id WHERE m.project_id = p.id AND t.status = 'completed'), 0) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM tasks t JOIN milestones m ON t.milestone_id = m.id WHERE m.project_id = p.id), 0), 0
          ) AS progress
        FROM projects p
        JOIN users u ON p.client_id = u.id
        JOIN users u2 ON p.created_by = u2.id
        WHERE p.client_id = ?
        ORDER BY p.created_at DESC`;
      params = [req.user.id];
    } else if (req.user.role === 'staff') {
      query = `
        SELECT DISTINCT p.*, u.name AS client_name, u2.name AS created_by_name,
          ROUND(
            COALESCE((SELECT COUNT(*) FROM tasks t JOIN milestones m ON t.milestone_id = m.id WHERE m.project_id = p.id AND t.status = 'completed'), 0) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM tasks t JOIN milestones m ON t.milestone_id = m.id WHERE m.project_id = p.id), 0), 0
          ) AS progress
        FROM projects p
        JOIN users u ON p.client_id = u.id
        JOIN users u2 ON p.created_by = u2.id
        LEFT JOIN project_staff ps ON p.id = ps.project_id
        WHERE ps.user_id = ?
        ORDER BY p.created_at DESC`;
      params = [req.user.id];
    } else {
      query = `
        SELECT p.*, u.name AS client_name, u2.name AS created_by_name,
          ROUND(
            COALESCE((SELECT COUNT(*) FROM tasks t JOIN milestones m ON t.milestone_id = m.id WHERE m.project_id = p.id AND t.status = 'completed'), 0) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM tasks t JOIN milestones m ON t.milestone_id = m.id WHERE m.project_id = p.id), 0), 0
          ) AS progress
        FROM projects p
        JOIN users u ON p.client_id = u.id
        JOIN users u2 ON p.created_by = u2.id
        ORDER BY p.created_at DESC`;
      params = [];
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const [projects] = await pool.execute(
      `SELECT p.*, u.name AS client_name, u2.name AS created_by_name FROM projects p
       JOIN users u ON p.client_id = u.id JOIN users u2 ON p.created_by = u2.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!projects.length) return res.status(404).json({ message: 'Project not found' });

    const project = projects[0];
    if (req.user.role === 'client' && project.client_id !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    const [milestones] = await pool.execute('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date', [req.params.id]);
    for (const m of milestones) {
      const [tasks] = await pool.execute(
        `SELECT t.*, u.name AS assigned_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.milestone_id = ?`,
        [m.id]
      );
      m.tasks = tasks;
    }

    const [staff] = await pool.execute(
      `SELECT u.id, u.name, u.email FROM project_staff ps JOIN users u ON ps.user_id = u.id WHERE ps.project_id = ?`,
      [req.params.id]
    );

    res.json({ ...project, milestones, staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, client_id, deadline, staff_ids = [] } = req.body;
    if (!title || !client_id) return res.status(400).json({ message: 'Title and client required' });

    // Create the project
    const [result] = await pool.execute(
      'INSERT INTO projects (title, description, client_id, created_by, deadline) VALUES (?, ?, ?, ?, ?)',
      [title, description, client_id, req.user.id, deadline || null]
    );
    const projectId = result.insertId;

    // Assign staff
    for (const uid of staff_ids) {
      await pool.execute('INSERT INTO project_staff (project_id, user_id) VALUES (?, ?)', [projectId, uid]);
    }

    // Send welcome email to client
    const [clientRows] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [client_id]
    );

    if (clientRows.length) {
      const client = clientRows[0];
      const deadlineText = deadline
        ? `The project deadline is set for ${new Date(deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.`
        : 'No deadline has been set yet.';

      await sendEmail(
        client.email,
        `New Project Started – ${title}`,
        `Hi ${client.name},\n\nWe are pleased to inform you that a new project has been created for you.\n\nProject: ${title}\n${description ? `Description: ${description}\n` : ''}${deadlineText}\n\nYou can log in to your client portal at any time to track the progress of this project, view milestones and download any uploaded deliverables.\n\nIf you have any questions, please do not hesitate to reach out to your project manager.\n\nBest regards,\nProject Team`
      );
    }

    res.status(201).json({ id: projectId, message: 'Project created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { title, description, deadline, status, staff_ids } = req.body;
    await pool.execute(
      'UPDATE projects SET title = ?, description = ?, deadline = ?, status = ? WHERE id = ?',
      [title, description, deadline || null, status, req.params.id]
    );

    if (staff_ids) {
      await pool.execute('DELETE FROM project_staff WHERE project_id = ?', [req.params.id]);
      for (const uid of staff_ids) {
        await pool.execute('INSERT INTO project_staff (project_id, user_id) VALUES (?, ?)', [req.params.id, uid]);
      }
    }

    res.json({ message: 'Project updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};