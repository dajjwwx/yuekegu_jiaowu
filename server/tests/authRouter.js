const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret';

function createAuthRouter() {
  const router = express.Router();
  
  const mockUsers = [];
  const defaultUser = {
    id: '1',
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    user_type: 'admin',
    real_name: '管理员',
    email: 'admin@school.com',
    phone: '13800138000',
    avatar: '',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  };
  mockUsers.push(defaultUser);
  
  const models = {
    User: {
      findOne: jest.fn(async ({ where }) => {
        if (where.id) return mockUsers.find(u => u.id === where.id) || null;
        if (where.username) return mockUsers.find(u => u.username === where.username) || null;
        return null;
      }),
      create: jest.fn(async (data) => {
        const user = { id: String(mockUsers.length + 1), ...data, created_at: new Date(), updated_at: new Date() };
        mockUsers.push(user);
        return user;
      })
    }
  };
  
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
      }
      
      const user = await models.User.findOne({ where: { username } });
      
      if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      if (user.status !== 1) {
        return res.status(401).json({ message: '账号已被禁用' });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      const token = jwt.sign(
        { userId: user.id, username: user.username, userType: user.user_type },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      user.last_login_at = new Date();
      user.last_login_ip = req.ip;
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.real_name,
          userType: user.user_type,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.get('/info', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权' });
    }
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = mockUsers.find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: '用户不存在' });
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          realName: user.real_name,
          userType: user.user_type,
          avatar: user.avatar
        }
      });
    } catch (error) {
      return res.status(401).json({ message: 'token无效' });
    }
  });
  
  router.post('/register', async (req, res) => {
    try {
      const { username, password, realName, userType } = req.body;
      
      const existingUser = await models.User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await models.User.create({
        username,
        password: hashedPassword,
        real_name: realName,
        user_type: userType || 'teacher'
      });
      
      res.status(201).json({ message: '注册成功', userId: user.id });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  return router;
}

module.exports = {
  createAuthRouter,
  JWT_SECRET
};
