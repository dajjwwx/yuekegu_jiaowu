const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createGradesRouter, createClassesRouter, createCoursesRouter, JWT_SECRET } = require('./academicRouter');

describe('年级班级课程模块测试', () => {
  let app, token;
  
  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/grades', createGradesRouter());
    app.use('/api/classes', createClassesRouter());
    app.use('/api/courses', createCoursesRouter());
    token = jwt.sign({ userId: '1', username: 'admin', userType: 'admin' }, JWT_SECRET);
  });
  
  describe('年级管理', () => {
    it('GET /api/grades - 获取年级列表', async () => {
      const res = await request(app).get('/api/grades').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    
    it('GET /api/grades/:id - 获取年级详情', async () => {
      const res = await request(app).get('/api/grades/1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('grade_name');
    });
    
    it('POST /api/grades - 创建年级', async () => {
      const res = await request(app).post('/api/grades').set('Authorization', `Bearer ${token}`)
        .send({ gradeName: '三年级', gradeLevel: 3, academicYear: 2024 });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('创建成功');
    });
    
    it('PUT /api/grades/:id - 更新年级', async () => {
      const res = await request(app).put('/api/grades/1').set('Authorization', `Bearer ${token}`)
        .send({ gradeName: '一年级(更新)' });
      expect(res.status).toBe(200);
    });
    
    it('DELETE /api/grades/:id - 删除年级', async () => {
      const res = await request(app).delete('/api/grades/2').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
  
  describe('班级管理', () => {
    it('GET /api/classes - 获取班级列表', async () => {
      const res = await request(app).get('/api/classes').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('list');
    });
    
    it('GET /api/classes?gradeId=1 - 按年级筛选', async () => {
      const res = await request(app).get('/api/classes?gradeId=1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/classes - 创建班级', async () => {
      const res = await request(app).post('/api/classes').set('Authorization', `Bearer ${token}`)
        .send({ className: '一年级二班', gradeId: '1', roomNo: '102' });
      expect(res.status).toBe(201);
    });
  });
  
  describe('课程管理', () => {
    it('GET /api/courses - 获取课程列表', async () => {
      const res = await request(app).get('/api/courses').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('GET /api/courses/:id - 获取课程详情', async () => {
      const res = await request(app).get('/api/courses/1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/courses - 创建课程', async () => {
      const res = await request(app).post('/api/courses').set('Authorization', `Bearer ${token}`)
        .send({ courseCode: 'ENGLISH', courseName: '英语', subject: '英语', credit: 4 });
      expect(res.status).toBe(201);
    });
    
    it('PUT /api/courses/:id - 更新课程', async () => {
      const res = await request(app).put('/api/courses/1').set('Authorization', `Bearer ${token}`)
        .send({ courseName: '语文(更新)' });
      expect(res.status).toBe(200);
    });
  });
  
  describe('未授权访问', () => {
    it('无token应返回401', async () => {
      const res = await request(app).get('/api/grades');
      expect(res.status).toBe(401);
    });
  });
});
