const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret';

function createUsersRouter() {
  const router = express.Router();
  
  let mockUsers = [];
  let userIdCounter = 1;
  
  const defaultUsers = [
    { id: '1', username: 'admin', password: bcrypt.hashSync('admin123', 10), user_type: 'admin', real_name: '管理员', phone: '13800138000', email: 'admin@school.com', status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '2', username: 'teacher1', password: bcrypt.hashSync('teacher123', 10), user_type: 'teacher', real_name: '李老师', phone: '13800138001', email: 'li@school.com', status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '3', username: 'student1', password: bcrypt.hashSync('student123', 10), user_type: 'student', real_name: '张三', phone: '13800138002', email: 'zhang@school.com', status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  mockUsers = [...defaultUsers];
  userIdCounter = 4;
  
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
  
  const checkPermission = (permission) => {
    return (req, res, next) => {
      next();
    };
  };
  
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const { page = 1, pageSize = 10, username, userType, status } = req.query;
      let filtered = [...mockUsers];
      
      if (username) {
        filtered = filtered.filter(u => u.username.includes(username));
      }
      if (userType) {
        filtered = filtered.filter(u => u.user_type === userType);
      }
      if (status) {
        filtered = filtered.filter(u => u.status === parseInt(status));
      }
      
      const total = filtered.length;
      const start = (parseInt(page) - 1) * parseInt(pageSize);
      const list = filtered.slice(start, start + parseInt(pageSize)).map(u => {
        const { password, ...user } = u;
        return user;
      });
      
      res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const user = mockUsers.find(u => u.id === req.params.id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      const { password, ...userInfo } = user;
      res.json({ user: userInfo, roles: [], profile: null });
    } catch (error) {
      console.error('获取用户详情失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.post('/', authMiddleware, checkPermission('system:user:create'), async (req, res) => {
    try {
      const { username, password, realName, userType, phone, email } = req.body;
      
      const existingUser = mockUsers.find(u => u.username === username);
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: String(userIdCounter++),
        username,
        password: hashedPassword,
        real_name: realName,
        user_type: userType || 'teacher',
        phone,
        email,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockUsers.push(user);
      
      res.status(201).json({ message: '创建成功', userId: user.id });
    } catch (error) {
      console.error('创建用户失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const userIndex = mockUsers.findIndex(u => u.id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      const { realName, phone, email, status } = req.body;
      
      if (realName) mockUsers[userIndex].real_name = realName;
      if (phone) mockUsers[userIndex].phone = phone;
      if (email) mockUsers[userIndex].email = email;
      if (status !== undefined) mockUsers[userIndex].status = status;
      mockUsers[userIndex].updated_at = new Date();
      
      res.json({ message: '更新成功' });
    } catch (error) {
      console.error('更新用户失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.put('/:id/password', authMiddleware, async (req, res) => {
    try {
      const userIndex = mockUsers.findIndex(u => u.id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      const { newPassword } = req.body;
      
      mockUsers[userIndex].password = await bcrypt.hash(newPassword, 10);
      mockUsers[userIndex].updated_at = new Date();
      
      res.json({ message: '密码修改成功' });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.delete('/:id', authMiddleware, checkPermission('system:user:delete'), async (req, res) => {
    try {
      const userIndex = mockUsers.findIndex(u => u.id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      if (mockUsers[userIndex].user_type === 'admin') {
        return res.status(400).json({ message: '不能删除管理员账号' });
      }
      
      mockUsers[userIndex].status = 0;
      
      res.json({ message: '禁用成功' });
    } catch (error) {
      console.error('删除用户失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  return router;
}

module.exports = {
  createUsersRouter,
  JWT_SECRET
};
