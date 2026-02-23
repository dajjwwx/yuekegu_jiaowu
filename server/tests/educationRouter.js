const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret';

function createExamsRouter() {
  const router = express.Router();
  let mockExams = [
    { id: '1', exam_name: '期中考试', exam_type: 1, academic_year: 2024, semester: 1, start_date: '2024-04-15', end_date: '2024-04-20', total_score: 100, pass_score: 60, is_published: 0, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => res.json({ list: mockExams, total: mockExams.length }));
  router.get('/:id', auth, (req, res) => {
    const e = mockExams.find(x => x.id === req.params.id);
    return e ? res.json(e) : res.status(404).json({ message: '考试不存在' });
  });
  router.post('/', auth, (req, res) => {
    const e = { id: String(idCounter++), ...req.body, is_published: 0, created_at: new Date(), updated_at: new Date() };
    mockExams.push(e);
    res.status(201).json({ message: '创建成功', examId: e.id });
  });
  router.put('/:id', auth, (req, res) => {
    const i = mockExams.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '考试不存在' });
    Object.assign(mockExams[i], req.body);
    res.json({ message: '更新成功' });
  });
  router.delete('/:id', auth, (req, res) => {
    const i = mockExams.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '考试不存在' });
    mockExams.splice(i, 1);
    res.json({ message: '删除成功' });
  });
  return router;
}

function createScoresRouter() {
  const router = express.Router();
  let mockScores = [
    { id: '1', student_id: '1', exam_id: '1', course_id: '1', score: 85, score_type: 1, status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => {
    let list = [...mockScores];
    if (req.query.examId) list = list.filter(s => s.exam_id === req.query.examId);
    if (req.query.studentId) list = list.filter(s => s.student_id === req.query.studentId);
    res.json({ list, total: list.length });
  });
  router.post('/', auth, (req, res) => {
    const s = { id: String(idCounter++), ...req.body, status: 1, created_at: new Date(), updated_at: new Date() };
    mockScores.push(s);
    res.status(201).json({ message: '创建成功', scoreId: s.id });
  });
  return router;
}

function createSchedulesRouter() {
  const router = express.Router();
  let mockSchedules = [
    { id: '1', class_id: '1', course_id: '1', teacher_id: '1', weekday: 1, lesson_no: 1, day_section: '1', room_no: '101', academic_year: 2024, semester: 1, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => {
    let list = [...mockSchedules];
    if (req.query.classId) list = list.filter(s => s.class_id === req.query.classId);
    if (req.query.weekday) list = list.filter(s => s.weekday === parseInt(req.query.weekday));
    res.json({ list, total: list.length });
  });
  router.post('/', auth, (req, res) => {
    const s = { id: String(idCounter++), ...req.body, created_at: new Date(), updated_at: new Date() };
    mockSchedules.push(s);
    res.status(201).json({ message: '创建成功', scheduleId: s.id });
  });
  router.delete('/:id', auth, (req, res) => {
    const i = mockSchedules.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '课表不存在' });
    mockSchedules.splice(i, 1);
    res.json({ message: '删除成功' });
  });
  return router;
}

function createAttendanceRouter() {
  const router = express.Router();
  let mockAttendance = [
    { id: '1', student_id: '1', course_id: '1', attendance_date: '2024-03-01', attendance_type: 1, status: 1, recorded_by: '1', created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => {
    let list = [...mockAttendance];
    if (req.query.studentId) list = list.filter(a => a.student_id === req.query.studentId);
    if (req.query.date) list = list.filter(a => a.attendance_date === req.query.date);
    res.json({ list, total: list.length });
  });
  router.post('/', auth, (req, res) => {
    const a = { id: String(idCounter++), ...req.body, status: 1, created_at: new Date(), updated_at: new Date() };
    mockAttendance.push(a);
    res.status(201).json({ message: '创建成功', attendanceId: a.id });
  });
  return router;
}

module.exports = { createExamsRouter, createScoresRouter, createSchedulesRouter, createAttendanceRouter, JWT_SECRET };
