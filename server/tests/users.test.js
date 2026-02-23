const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createUsersRouter, JWT_SECRET } = require('./usersRouter');

describe('用户管理模块测试', () => {
  let app;
  let token;
  
  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/users', createUsersRouter());
    token = jwt.sign({ userId: '1', username: 'admin', userType: 'admin' }, JWT_SECRET);
  });
  
  describe('GET /api/users', () => {
    it('should get user list', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.list)).toBe(true);
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users');
      
      expect(response.status).toBe(401);
    });
    
    it('should filter by username', async () => {
      const response = await request(app)
        .get('/api/users?username=admin')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.list.length).toBeGreaterThan(0);
    });
    
    it('should filter by userType', async () => {
      const response = await request(app)
        .get('/api/users?userType=teacher')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      response.body.list.forEach(user => {
        expect(user.user_type).toBe('teacher');
      });
    });
    
    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&pageSize=2')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.list.length).toBeLessThanOrEqual(2);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(2);
    });
  });
  
  describe('GET /api/users/:id', () => {
    it('should get user detail', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username');
    });
    
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('用户不存在');
    });
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newuser',
          password: 'password123',
          realName: '新用户',
          userType: 'teacher',
          phone: '13900139000',
          email: 'new@school.com'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', '创建成功');
      expect(response.body).toHaveProperty('userId');
    });
    
    it('should return 400 if username exists', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'admin',
          password: 'password123',
          realName: '管理员',
          userType: 'admin'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('用户名已存在');
    });
  });
  
  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const response = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${token}`)
        .send({
          realName: '更新后的老师',
          phone: '13900139001'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('更新成功');
    });
    
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ realName: '测试' });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('用户不存在');
    });
  });
  
  describe('PUT /api/users/:id/password', () => {
    it('should change password', async () => {
      const response = await request(app)
        .put('/api/users/2/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'newpassword123' });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('密码修改成功');
    });
  });
  
  describe('DELETE /api/users/:id', () => {
    it('should disable user', async () => {
      const response = await request(app)
        .delete('/api/users/2')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('禁用成功');
    });
    
    it('should return 400 for admin user', async () => {
      const response = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('不能删除管理员账号');
    });
    
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('用户不存在');
    });
  });
});
