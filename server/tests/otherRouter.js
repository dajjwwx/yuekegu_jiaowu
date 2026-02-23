const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret';

function createNoticesRouter() {
  const router = express.Router();
  let mockNotices = [
    { id: '1', title: '开学通知', content: '请各位同学于9月1日到校报到', notice_type: 1, is_urgent: 0, publish_by: '1', status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => res.json({ list: mockNotices, total: mockNotices.length }));
  router.get('/:id', auth, (req, res) => {
    const n = mockNotices.find(x => x.id === req.params.id);
    return n ? res.json(n) : res.status(404).json({ message: '通知不存在' });
  });
  router.post('/', auth, (req, res) => {
    const n = { id: String(idCounter++), ...req.body, publish_by: req.user.userId, status: 1, created_at: new Date(), updated_at: new Date() };
    mockNotices.push(n);
    res.status(201).json({ message: '创建成功', noticeId: n.id });
  });
  router.put('/:id', auth, (req, res) => {
    const i = mockNotices.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '通知不存在' });
    Object.assign(mockNotices[i], req.body);
    res.json({ message: '更新成功' });
  });
  router.delete('/:id', auth, (req, res) => {
    const i = mockNotices.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '通知不存在' });
    mockNotices.splice(i, 1);
    res.json({ message: '删除成功' });
  });
  return router;
}

function createEnrollmentsRouter() {
  const router = express.Router();
  let mockEnrollments = [
    { id: '1', enroll_no: 'E2024001', name: '王五', gender: 1, birth_date: '2013-01-01', phone: '13900139000', guardian_name: '王小明', enroll_year: 2024, status: 0, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => res.json({ list: mockEnrollments, total: mockEnrollments.length }));
  router.post('/', auth, (req, res) => {
    const e = { id: String(idCounter++), enroll_no: `E${Date.now()}`, ...req.body, status: 0, created_at: new Date(), updated_at: new Date() };
    mockEnrollments.push(e);
    res.status(201).json({ message: '创建成功', enrollmentId: e.id });
  });
  router.put('/:id/status', auth, (req, res) => {
    const i = mockEnrollments.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '报名不存在' });
    mockEnrollments[i].status = req.body.status;
    res.json({ message: '更新成功' });
  });
  return router;
}

function createFinanceRouter() {
  const router = express.Router();
  let mockFinance = [
    { id: '1', student_id: '1', charge_item_id: '1', amount: 5000, payment_method: 1, status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => {
    let list = [...mockFinance];
    if (req.query.studentId) list = list.filter(f => f.student_id === req.query.studentId);
    res.json({ list, total: list.length });
  });
  router.post('/', auth, (req, res) => {
    const f = { id: String(idCounter++), ...req.body, status: 0, created_at: new Date(), updated_at: new Date() };
    mockFinance.push(f);
    res.status(201).json({ message: '创建成功', financeId: f.id });
  });
  return router;
}

function createAnalysisRouter() {
  const router = express.Router();
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/dashboard', auth, (req, res) => {
    res.json({
      studentCount: 100,
      teacherCount: 20,
      classCount: 10,
      examCount: 5,
      attendanceRate: 95.5
    });
  });
  
  router.get('/scores', auth, (req, res) => {
    res.json({
      averageScore: 82.5,
      passRate: 90,
      excellentRate: 30,
      scores: []
    });
  });
  
  return router;
}

module.exports = { createNoticesRouter, createEnrollmentsRouter, createFinanceRouter, createAnalysisRouter, JWT_SECRET };
