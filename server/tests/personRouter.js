const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'test-jwt-secret';

function createStudentsRouter() {
  const router = express.Router();
  
  let mockStudents = [];
  let studentIdCounter = 1;
  
  const defaultStudents = [
    { id: '1', student_no: '2024001', name: '张三', gender: 1, birth_date: '2010-01-01', grade_id: '1', class_id: '1', enrollment_year: 2024, enrollment_type: 'normal', academic_status: 1, student_status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '2', student_no: '2024002', name: '李四', gender: 1, birth_date: '2010-02-02', grade_id: '1', class_id: '1', enrollment_year: 2024, enrollment_type: 'normal', academic_status: 1, student_status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  mockStudents = [...defaultStudents];
  studentIdCounter = 3;
  
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权' });
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.userId, username: decoded.username, user_type: decoded.userType };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'token无效' });
    }
  };
  
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const { page = 1, pageSize = 10, name, studentNo, gradeId, classId } = req.query;
      let filtered = [...mockStudents];
      
      if (name) filtered = filtered.filter(s => s.name.includes(name));
      if (studentNo) filtered = filtered.filter(s => s.student_no.includes(studentNo));
      if (gradeId) filtered = filtered.filter(s => s.grade_id === gradeId);
      if (classId) filtered = filtered.filter(s => s.class_id === classId);
      
      const total = filtered.length;
      const start = (parseInt(page) - 1) * parseInt(pageSize);
      const list = filtered.slice(start, start + parseInt(pageSize));
      
      res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
      console.error('获取学生列表失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const student = mockStudents.find(s => s.id === req.params.id);
      if (!student) {
        return res.status(404).json({ message: '学生不存在' });
      }
      res.json(student);
    } catch (error) {
      console.error('获取学生详情失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { studentNo, name, gender, birthDate, gradeId, classId, enrollmentYear } = req.body;
      
      const existing = mockStudents.find(s => s.student_no === studentNo);
      if (existing) {
        return res.status(400).json({ message: '学号已存在' });
      }
      
      const student = {
        id: String(studentIdCounter++),
        student_no: studentNo,
        name,
        gender: gender || 1,
        birth_date: birthDate,
        grade_id: gradeId,
        class_id: classId,
        enrollment_year: enrollmentYear || 2024,
        enrollment_type: 'normal',
        academic_status: 1,
        student_status: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockStudents.push(student);
      
      res.status(201).json({ message: '创建成功', studentId: student.id });
    } catch (error) {
      console.error('创建学生失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const studentIndex = mockStudents.findIndex(s => s.id === req.params.id);
      if (studentIndex === -1) {
        return res.status(404).json({ message: '学生不存在' });
      }
      
      const { name, gender, birthDate, gradeId, classId } = req.body;
      if (name) mockStudents[studentIndex].name = name;
      if (gender) mockStudents[studentIndex].gender = gender;
      if (birthDate) mockStudents[studentIndex].birth_date = birthDate;
      if (gradeId) mockStudents[studentIndex].grade_id = gradeId;
      if (classId) mockStudents[studentIndex].class_id = classId;
      mockStudents[studentIndex].updated_at = new Date();
      
      res.json({ message: '更新成功' });
    } catch (error) {
      console.error('更新学生失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const studentIndex = mockStudents.findIndex(s => s.id === req.params.id);
      if (studentIndex === -1) {
        return res.status(404).json({ message: '学生不存在' });
      }
      
      mockStudents.splice(studentIndex, 1);
      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('删除学生失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  return router;
}

function createTeachersRouter() {
  const router = express.Router();
  
  let mockTeachers = [];
  let teacherIdCounter = 1;
  
  const defaultTeachers = [
    { id: '1', teacher_no: 'T001', name: '李老师', gender: 1, birth_date: '1985-01-01', phone: '13800138000', email: 'li@school.com', department: '数学系', position: '教师', title: '高级教师', status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '2', teacher_no: 'T002', name: '王老师', gender: 1, birth_date: '1986-02-02', phone: '13800138001', email: 'wang@school.com', department: '语文系', position: '教师', title: '一级教师', status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  mockTeachers = [...defaultTeachers];
  teacherIdCounter = 3;
  
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权' });
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.userId, username: decoded.username, user_type: decoded.userType };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'token无效' });
    }
  };
  
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const { page = 1, pageSize = 10, name, teacherNo, department } = req.query;
      let filtered = [...mockTeachers];
      
      if (name) filtered = filtered.filter(t => t.name.includes(name));
      if (teacherNo) filtered = filtered.filter(t => t.teacher_no.includes(teacherNo));
      if (department) filtered = filtered.filter(t => t.department === department);
      
      const total = filtered.length;
      const start = (parseInt(page) - 1) * parseInt(pageSize);
      const list = filtered.slice(start, start + parseInt(pageSize));
      
      res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
      console.error('获取教师列表失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const teacher = mockTeachers.find(t => t.id === req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: '教师不存在' });
      }
      res.json(teacher);
    } catch (error) {
      console.error('获取教师详情失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { teacherNo, name, gender, birthDate, phone, email, department, title } = req.body;
      
      const existing = mockTeachers.find(t => t.teacher_no === teacherNo);
      if (existing) {
        return res.status(400).json({ message: '工号已存在' });
      }
      
      const teacher = {
        id: String(teacherIdCounter++),
        teacher_no: teacherNo,
        name,
        gender: gender || 1,
        birth_date: birthDate,
        phone,
        email,
        department,
        title: title || '教师',
        position: '教师',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockTeachers.push(teacher);
      
      res.status(201).json({ message: '创建成功', teacherId: teacher.id });
    } catch (error) {
      console.error('创建教师失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const teacherIndex = mockTeachers.findIndex(t => t.id === req.params.id);
      if (teacherIndex === -1) {
        return res.status(404).json({ message: '教师不存在' });
      }
      
      const { name, gender, phone, email, department, title } = req.body;
      if (name) mockTeachers[teacherIndex].name = name;
      if (gender) mockTeachers[teacherIndex].gender = gender;
      if (phone) mockTeachers[teacherIndex].phone = phone;
      if (email) mockTeachers[teacherIndex].email = email;
      if (department) mockTeachers[teacherIndex].department = department;
      if (title) mockTeachers[teacherIndex].title = title;
      mockTeachers[teacherIndex].updated_at = new Date();
      
      res.json({ message: '更新成功' });
    } catch (error) {
      console.error('更新教师失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const teacherIndex = mockTeachers.findIndex(t => t.id === req.params.id);
      if (teacherIndex === -1) {
        return res.status(404).json({ message: '教师不存在' });
      }
      
      mockTeachers.splice(teacherIndex, 1);
      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('删除教师失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  return router;
}

module.exports = {
  createStudentsRouter,
  createTeachersRouter,
  JWT_SECRET
};
