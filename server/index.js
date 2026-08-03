require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${statusColor}[${res.statusCode}]\x1b[0m ${req.method} ${req.path} - ${duration}ms`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const safe = { ...req.body };
      if (safe.password) safe.password = '***hidden***';
      console.log('  Body:', JSON.stringify(safe));
    }
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/files', require('./routes/files'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Client Portal API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\x1b[36m╔════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║   Client Portal API Running    ║\x1b[0m');
  console.log(`\x1b[36m║   http://localhost:${PORT}         ║\x1b[0m`);
  console.log('\x1b[36m╚════════════════════════════════╝\x1b[0m');
});