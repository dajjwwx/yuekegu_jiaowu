const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createNoticesRouter, createEnrollmentsRouter, createFinanceRouter, createAnalysisRouter, JWT_SECRET } = require('./otherRouter');

describe('通知招生财务分析模块测试', () => {
  let app, token;
  
  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/notices', createNoticesRouter());
    app.use('/api/enrollments', createEnrollmentsRouter());
    app.use('/api/finance', createFinanceRouter());
    app.use('/api/analysis', createAnalysisRouter());
    token = jwt.sign({ userId: '1', username: 'admin', userType: 'admin' }, JWT_SECRET);
  });
  
  describe('通知管理', () => {
    it('GET /api/notices - 获取通知列表', async () => {
      const res = await request(app).get('/api/notices').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/notices - 创建通知', async () => {
      const res = await request(app).post('/api/notices').set('Authorization', `Bearer ${token}`)
        .send({ title: '考试安排', content: '本周五进行期中考试', notice_type: 1 });
      expect(res.status).toBe(201);
    });
    
    it('PUT /api/notices/:id - 更新通知', async () => {
      const res = await request(app).put('/api/notices/1').set('Authorization', `Bearer ${token}`)
        .send({ title: '开学通知(更新)' });
      expect(res.status).toBe(200);
    });
  });
  
  describe('招生管理', () => {
    it('GET /api/enrollments - 获取报名列表', async () => {
      const res = await request(app).get('/api/enrollments').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/enrollments - 创建报名', async () => {
      const res = await request(app).post('/api/enrollments').set('Authorization', `Bearer ${token}`)
        .send({ name: '赵六', gender: 1, birth_date: '2013-05-01', phone: '13900139001', guardian_name: '赵大明' });
      expect(res.status).toBe(201);
    });
  });
  
  describe('财务管理', () => {
    it('GET /api/finance - 获取财务列表', async () => {
      const res = await request(app).get('/api/finance').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('GET /api/finance?studentId=1 - 按学生筛选', async () => {
      const res = await request(app).get('/api/finance?studentId=1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/finance - 创建财务记录', async () => {
      const res = await request(app).post('/api/finance').set('Authorization', `Bearer ${token}`)
        .send({ student_id: '1', charge_item_id: '1', amount: 3000, payment_method: 1 });
      expect(res.status).toBe(201);
    });
  });
  
  describe('数据分析', () => {
    it('GET /api/analysis/dashboard - 获取仪表盘数据', async () => {
      const res = await request(app).get('/api/analysis/dashboard').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('studentCount');
    });
    
    it('GET /api/analysis/scores - 获取成绩分析', async () => {
      const res = await request(app).get('/api/analysis/scores').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('averageScore');
    });
  });
  
  describe('未授权访问', () => {
    it('无token应返回401', async () => {
      const res = await request(app).get('/api/notices');
      expect(res.status).toBe(401);
    });
  });
});
