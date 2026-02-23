const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createExamsRouter, createScoresRouter, createSchedulesRouter, createAttendanceRouter, JWT_SECRET } = require('./educationRouter');

describe('考试成绩课表考勤模块测试', () => {
  let app, token;
  
  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/exams', createExamsRouter());
    app.use('/api/scores', createScoresRouter());
    app.use('/api/schedules', createSchedulesRouter());
    app.use('/api/attendance', createAttendanceRouter());
    token = jwt.sign({ userId: '1', username: 'admin', userType: 'admin' }, JWT_SECRET);
  });
  
  describe('考试管理', () => {
    it('GET /api/exams - 获取考试列表', async () => {
      const res = await request(app).get('/api/exams').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/exams - 创建考试', async () => {
      const res = await request(app).post('/api/exams').set('Authorization', `Bearer ${token}`)
        .send({ exam_name: '期末考试', exam_type: 2, academic_year: 2024, semester: 1, start_date: '2024-06-15', end_date: '2024-06-25' });
      expect(res.status).toBe(201);
    });
  });
  
  describe('成绩管理', () => {
    it('GET /api/scores - 获取成绩列表', async () => {
      const res = await request(app).get('/api/scores').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('GET /api/scores?examId=1 - 按考试筛选', async () => {
      const res = await request(app).get('/api/scores?examId=1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/scores - 录入成绩', async () => {
      const res = await request(app).post('/api/scores').set('Authorization', `Bearer ${token}`)
        .send({ student_id: '2', exam_id: '1', course_id: '1', score: 90 });
      expect(res.status).toBe(201);
    });
  });
  
  describe('课表管理', () => {
    it('GET /api/schedules - 获取课表列表', async () => {
      const res = await request(app).get('/api/schedules').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('GET /api/schedules?classId=1 - 按班级筛选', async () => {
      const res = await request(app).get('/api/schedules?classId=1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/schedules - 创建课表', async () => {
      const res = await request(app).post('/api/schedules').set('Authorization', `Bearer ${token}`)
        .send({ class_id: '1', course_id: '2', teacher_id: '1', weekday: 2, lesson_no: 1, academic_year: 2024, semester: 1 });
      expect(res.status).toBe(201);
    });
  });
  
  describe('考勤管理', () => {
    it('GET /api/attendance - 获取考勤列表', async () => {
      const res = await request(app).get('/api/attendance').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
    
    it('POST /api/attendance - 记录考勤', async () => {
      const res = await request(app).post('/api/attendance').set('Authorization', `Bearer ${token}`)
        .send({ student_id: '1', course_id: '1', attendance_date: '2024-03-02', attendance_type: 1, recorded_by: '1' });
      expect(res.status).toBe(201);
    });
  });
  
  describe('未授权访问', () => {
    it('无token应返回401', async () => {
      const res = await request(app).get('/api/exams');
      expect(res.status).toBe(401);
    });
  });
});
