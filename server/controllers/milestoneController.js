const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.getMilestones = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date',
      [req.params.projectId]
    );
    for (const m of rows) {
      const [tasks] = await pool.execute(
        'SELECT t.*, u.name AS assigned_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.milestone_id = ?',
        [m.id]
      );
      m.tasks = tasks;
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMilestone = async (req, res) => {
  try {
    const { title, due_date } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO milestones (project_id, title, due_date) VALUES (?, ?, ?)',
      [req.params.projectId, title, due_date || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Milestone created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const { title, due_date, status } = req.body;
    await pool.execute(
      'UPDATE milestones SET title = ?, due_date = ?, status = ? WHERE id = ?',
      [title, due_date || null, status, req.params.id]
    );

    // Notify client when milestone completed
    if (status === 'completed') {
      const [rows] = await pool.execute(
        `SELECT u.email, u.name, p.title AS project_title FROM milestones m
         JOIN projects p ON m.project_id = p.id
         JOIN users u ON p.client_id = u.id WHERE m.id = ?`,
        [req.params.id]
      );
      if (rows.length) {
        await sendEmail(
          rows[0].email,
          `Milestone Completed – ${rows[0].project_title}`,
          `Hi ${rows[0].name},\n\nA milestone has been marked as completed on your project "${rows[0].project_title}".\n\nLog in to your portal to view the latest progress.\n\nBest regards,\nProject Team`
        );
      }
    }

    res.json({ message: 'Milestone updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    await pool.execute('DELETE FROM milestones WHERE id = ?', [req.params.id]);
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
