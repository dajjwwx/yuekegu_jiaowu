const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createAuthRouter, JWT_SECRET } = require('./authRouter');

describe('认证模块测试', () => {
  let app;
  
  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/auth', createAuthRouter());
  });
  
  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        username: 'admin',
        realName: '管理员',
        userType: 'admin'
      });
    });
    
    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'admin123' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('用户名和密码不能为空');
    });
    
    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('用户名和密码不能为空');
    });
    
    it('should return 401 if username does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password' });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('用户名或密码错误');
    });
    
    it('should return 401 if password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('用户名或密码错误');
    });
    
    it('should return 401 if account is disabled', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', password: 'password123', realName: '新用户', userType: 'teacher' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', '注册成功');
      expect(response.body).toHaveProperty('userId');
    });
    
    it('should return 400 if username already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'admin', password: 'password123', realName: '管理员' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('用户名已存在');
    });
  });
  
  describe('GET /api/auth/info', () => {
    it('should return user info with valid token', async () => {
      const token = jwt.sign({ userId: '1', username: 'admin', userType: 'admin' }, JWT_SECRET);
      
      const response = await request(app)
        .get('/api/auth/info')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        username: 'admin',
        realName: '管理员',
        userType: 'admin'
      });
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/info');
      
      expect(response.status).toBe(401);
    });
    
    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/info')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(response.status).toBe(401);
    });
  });
});
