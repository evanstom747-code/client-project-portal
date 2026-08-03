const pool = require('../config/db');
const path = require('path');
const { sendEmail } = require('../utils/email');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { projectId } = req.params;

    await pool.execute(
      'INSERT INTO files (project_id, filename, filepath, uploaded_by) VALUES (?, ?, ?, ?)',
      [projectId, req.file.originalname, req.file.filename, req.user.id]
    );

    // Notify client
    const [rows] = await pool.execute(
      'SELECT u.email, u.name, p.title FROM projects p JOIN users u ON p.client_id = u.id WHERE p.id = ?',
      [projectId]
    );
    if (rows.length) {
      await sendEmail(
        rows[0].email,
        `New File Uploaded – ${rows[0].title}`,
        `Hi ${rows[0].name},\n\nA new file "${req.file.originalname}" has been uploaded to your project "${rows[0].title}".\n\nLog in to your portal to download it.\n\nBest regards,\nProject Team`
      );
    }

    res.status(201).json({ message: 'File uploaded successfully', filename: req.file.originalname });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT f.*, u.name AS uploaded_by_name FROM files f JOIN users u ON f.uploaded_by = u.id WHERE f.project_id = ? ORDER BY f.upload_date DESC',
      [req.params.projectId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'File not found' });

    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', rows[0].filepath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.execute('DELETE FROM files WHERE id = ?', [req.params.id]);
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
