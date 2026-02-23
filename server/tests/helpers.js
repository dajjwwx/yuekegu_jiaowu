const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { db } = require('./mockData');

const JWT_SECRET = 'test-secret-key';

function createApp(routes) {
  const app = express();
  app.use(express.json());
  
  app.use('/api/auth', routes.auth || (() => {}));
  app.use('/api/users', routes.users || (() => {}));
  app.use('/api/roles', routes.roles || (() => {}));
  app.use('/api/permissions', routes.permissions || (() => {}));
  app.use('/api/students', routes.students || (() => {}));
  app.use('/api/teachers', routes.teachers || (() => {}));
  app.use('/api/grades', routes.grades || (() => {}));
  app.use('/api/classes', routes.classes || (() => {}));
  app.use('/api/courses', routes.courses || (() => {}));
  app.use('/api/exams', routes.exams || (() => {}));
  app.use('/api/scores', routes.scores || (() => {}));
  app.use('/api/schedules', routes.schedules || (() => {}));
  app.use('/api/attendance', routes.attendance || (() => {}));
  app.use('/api/notices', routes.notices || (() => {}));
  app.use('/api/enrollments', routes.enrollments || (() => {}));
  app.use('/api/finance', routes.finance || (() => {}));
  app.use('/api/analysis', routes.analysis || (() => {}));
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  return app;
}

function generateToken(user = { id: '1', username: 'admin', role_id: '1' }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function resetDatabase() {
  db.reset();
}

module.exports = {
  createApp,
  generateToken,
  hashPassword,
  resetDatabase,
  db,
  JWT_SECRET
};
