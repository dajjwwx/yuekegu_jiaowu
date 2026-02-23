const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret';

function createGradesRouter() {
  const router = express.Router();
  let mockGrades = [
    { id: '1', grade_name: '一年级', grade_level: 1, section: 1, academic_year: 2024, status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '2', grade_name: '二年级', grade_level: 2, section: 1, academic_year: 2024, status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 3;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => res.json(mockGrades));
  router.get('/:id', auth, (req, res) => {
    const g = mockGrades.find(x => x.id === req.params.id);
    return g ? res.json(g) : res.status(404).json({ message: '年级不存在' });
  });
  router.post('/', auth, (req, res) => {
    const { gradeName, gradeLevel, academicYear } = req.body;
    const g = { id: String(idCounter++), grade_name: gradeName, grade_level: gradeLevel, section: 1, academic_year: academicYear, status: 1, created_at: new Date(), updated_at: new Date() };
    mockGrades.push(g);
    res.status(201).json({ message: '创建成功', gradeId: g.id });
  });
  router.put('/:id', auth, (req, res) => {
    const i = mockGrades.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '年级不存在' });
    if (req.body.gradeName) mockGrades[i].grade_name = req.body.gradeName;
    res.json({ message: '更新成功' });
  });
  router.delete('/:id', auth, (req, res) => {
    const i = mockGrades.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '年级不存在' });
    mockGrades.splice(i, 1);
    res.json({ message: '删除成功' });
  });
  return router;
}

function createClassesRouter() {
  const router = express.Router();
  let mockClasses = [
    { id: '1', class_name: '一年级一班', grade_id: '1', class_type: 'normal', room_no: '101', teacher_id: '1', student_count: 30, academic_year: 2024, semester: 1, status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 2;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => {
    let list = [...mockClasses];
    if (req.query.gradeId) list = list.filter(c => c.grade_id === req.query.gradeId);
    res.json({ list, total: list.length });
  });
  router.get('/:id', auth, (req, res) => {
    const c = mockClasses.find(x => x.id === req.params.id);
    return c ? res.json(c) : res.status(404).json({ message: '班级不存在' });
  });
  router.post('/', auth, (req, res) => {
    const { className, gradeId, roomNo, teacherId } = req.body;
    const c = { id: String(idCounter++), class_name: className, grade_id: gradeId, room_no: roomNo, teacher_id: teacherId, student_count: 0, academic_year: 2024, semester: 1, status: 1, created_at: new Date(), updated_at: new Date() };
    mockClasses.push(c);
    res.status(201).json({ message: '创建成功', classId: c.id });
  });
  router.put('/:id', auth, (req, res) => {
    const i = mockClasses.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '班级不存在' });
    if (req.body.className) mockClasses[i].class_name = req.body.className;
    res.json({ message: '更新成功' });
  });
  router.delete('/:id', auth, (req, res) => {
    const i = mockClasses.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '班级不存在' });
    mockClasses.splice(i, 1);
    res.json({ message: '删除成功' });
  });
  return router;
}

function createCoursesRouter() {
  const router = express.Router();
  let mockCourses = [
    { id: '1', course_code: 'CHINESE', course_name: '语文', course_type: 1, subject: '语文', section: 1, credit: 4, hours: 128, is_exam_course: 1, status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '2', course_code: 'MATH', course_name: '数学', course_type: 1, subject: '数学', section: 1, credit: 4, hours: 128, is_exam_course: 1, status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  let idCounter = 3;
  
  const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: '未授权' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'token无效' }); }
  };
  
  router.get('/', auth, (req, res) => res.json({ list: mockCourses, total: mockCourses.length }));
  router.get('/:id', auth, (req, res) => {
    const c = mockCourses.find(x => x.id === req.params.id);
    return c ? res.json(c) : res.status(404).json({ message: '课程不存在' });
  });
  router.post('/', auth, (req, res) => {
    const { courseCode, courseName, subject, credit } = req.body;
    const c = { id: String(idCounter++), course_code: courseCode, course_name: courseName, course_type: 1, subject, section: 1, credit, hours: 64, is_exam_course: 1, status: 1, created_at: new Date(), updated_at: new Date() };
    mockCourses.push(c);
    res.status(201).json({ message: '创建成功', courseId: c.id });
  });
  router.put('/:id', auth, (req, res) => {
    const i = mockCourses.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '课程不存在' });
    if (req.body.courseName) mockCourses[i].course_name = req.body.courseName;
    res.json({ message: '更新成功' });
  });
  router.delete('/:id', auth, (req, res) => {
    const i = mockCourses.findIndex(x => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ message: '课程不存在' });
    mockCourses.splice(i, 1);
    res.json({ message: '删除成功' });
  });
  return router;
}

module.exports = { createGradesRouter, createClassesRouter, createCoursesRouter, JWT_SECRET };
