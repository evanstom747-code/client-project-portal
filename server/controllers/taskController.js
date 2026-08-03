const pool = require('../config/db');

exports.createTask = async (req, res) => {
  try {
    const { title, assigned_to } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO tasks (milestone_id, title, assigned_to) VALUES (?, ?, ?)',
      [req.params.milestoneId, title, assigned_to || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Task created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, assigned_to, status } = req.body;
    await pool.execute(
      'UPDATE tasks SET title = ?, assigned_to = ?, status = ? WHERE id = ?',
      [title, assigned_to || null, status, req.params.id]
    );
    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Task status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
