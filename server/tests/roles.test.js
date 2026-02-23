const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createRolesRouter, createPermissionsRouter, JWT_SECRET } = require('./rolesRouter');

describe('角色权限模块测试', () => {
  let app;
  let token;
  
  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/roles', createRolesRouter());
    app.use('/api/permissions', createPermissionsRouter());
    token = jwt.sign({ userId: '1', username: 'admin', userType: 'admin' }, JWT_SECRET);
  });
  
  describe('角色管理 - GET /api/roles', () => {
    it('should get role list', async () => {
      const response = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/roles');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('角色管理 - GET /api/roles/:id', () => {
    it('should get role detail', async () => {
      const response = await request(app)
        .get('/api/roles/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('role_code');
    });
    
    it('should return 404 for non-existent role', async () => {
      const response = await request(app)
        .get('/api/roles/999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('角色不存在');
    });
  });
  
  describe('角色管理 - POST /api/roles', () => {
    it('should create a new role', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roleCode: 'manager',
          roleName: '班主任',
          roleType: 'teacher',
          description: '班主任角色'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', '创建成功');
    });
    
    it('should return 400 if role code exists', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roleCode: 'admin',
          roleName: '管理员',
          roleType: 'system'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('角色代码已存在');
    });
  });
  
  describe('角色管理 - PUT /api/roles/:id', () => {
    it('should update role', async () => {
      const response = await request(app)
        .put('/api/roles/2')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roleName: '更新后的教师',
          description: '更新描述'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('更新成功');
    });
    
    it('should return 404 for non-existent role', async () => {
      const response = await request(app)
        .put('/api/roles/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ roleName: '测试' });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('角色不存在');
    });
  });
  
  describe('角色管理 - DELETE /api/roles/:id', () => {
    it('should delete role', async () => {
      const response = await request(app)
        .delete('/api/roles/3')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('删除成功');
    });
    
    it('should return 404 for non-existent role', async () => {
      const response = await request(app)
        .delete('/api/roles/999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('角色不存在');
    });
  });
  
  describe('权限管理 - GET /api/permissions', () => {
    it('should get permission list', async () => {
      const response = await request(app)
        .get('/api/permissions')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/permissions');
      
      expect(response.status).toBe(401);
    });
  });
});
