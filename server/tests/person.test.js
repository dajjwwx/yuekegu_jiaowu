const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createStudentsRouter, createTeachersRouter, JWT_SECRET } = require('./personRouter');

describe('学生教师管理模块测试', () => {
  let app;
  let token;
  
  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/students', createStudentsRouter());
    app.use('/api/teachers', createTeachersRouter());
    token = jwt.sign({ userId: '1', username: 'admin', userType: 'admin' }, JWT_SECRET);
  });
  
  describe('学生管理 - GET /api/students', () => {
    it('should get student list', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
      expect(response.body).toHaveProperty('total');
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/students');
      
      expect(response.status).toBe(401);
    });
    
    it('should filter by name', async () => {
      const response = await request(app)
        .get('/api/students?name=张')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      response.body.list.forEach(s => {
        expect(s.name).toContain('张');
      });
    });
    
    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/students?page=1&pageSize=1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.list.length).toBeLessThanOrEqual(1);
    });
  });
  
  describe('学生管理 - GET /api/students/:id', () => {
    it('should get student detail', async () => {
      const response = await request(app)
        .get('/api/students/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('student_no');
    });
    
    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('学生管理 - POST /api/students', () => {
    it('should create a new student', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentNo: '2024003',
          name: '王五',
          gender: 1,
          birthDate: '2010-03-03',
          gradeId: '1',
          classId: '1',
          enrollmentYear: 2024
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('创建成功');
    });
    
    it('should return 400 if studentNo exists', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentNo: '2024001',
          name: '张三',
          gradeId: '1'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('学号已存在');
    });
  });
  
  describe('学生管理 - PUT /api/students/:id', () => {
    it('should update student', async () => {
      const response = await request(app)
        .put('/api/students/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '张三更新' });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('更新成功');
    });
  });
  
  describe('学生管理 - DELETE /api/students/:id', () => {
    it('should delete student', async () => {
      const response = await request(app)
        .delete('/api/students/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('删除成功');
    });
  });
  
  describe('教师管理 - GET /api/teachers', () => {
    it('should get teacher list', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
    });
    
    it('should filter by department', async () => {
      const response = await request(app)
        .get('/api/teachers?department=数学系')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('教师管理 - GET /api/teachers/:id', () => {
    it('should get teacher detail', async () => {
      const response = await request(app)
        .get('/api/teachers/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('teacher_no');
    });
  });
  
  describe('教师管理 - POST /api/teachers', () => {
    it('should create a new teacher', async () => {
      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          teacherNo: 'T003',
          name: '赵老师',
          department: '英语系',
          title: '教师'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('创建成功');
    });
  });
  
  describe('教师管理 - PUT /api/teachers/:id', () => {
    it('should update teacher', async () => {
      const response = await request(app)
        .put('/api/teachers/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '李老师更新' });
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('教师管理 - DELETE /api/teachers/:id', () => {
    it('should delete teacher', async () => {
      const response = await request(app)
        .delete('/api/teachers/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
    });
  });
});
