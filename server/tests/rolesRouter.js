const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret';

function createRolesRouter() {
  const router = express.Router();
  
  let mockRoles = [];
  let roleIdCounter = 1;
  
  const defaultRoles = [
    { id: '1', role_code: 'admin', role_name: '管理员', role_type: 'system', description: '系统管理员', status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '2', role_code: 'teacher', role_name: '教师', role_type: 'teacher', description: '普通教师', status: 1, created_at: new Date(), updated_at: new Date() },
    { id: '3', role_code: 'student', role_name: '学生', role_type: 'student', description: '学生', status: 1, created_at: new Date(), updated_at: new Date() }
  ];
  mockRoles = [...defaultRoles];
  roleIdCounter = 4;
  
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
      res.json(mockRoles);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const role = mockRoles.find(r => r.id === req.params.id);
      if (!role) {
        return res.status(404).json({ message: '角色不存在' });
      }
      res.json({ ...role, permissions: [] });
    } catch (error) {
      console.error('获取角色详情失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.post('/', authMiddleware, checkPermission('system:role:create'), async (req, res) => {
    try {
      const { roleCode, roleName, roleType, description } = req.body;
      
      const existingRole = mockRoles.find(r => r.role_code === roleCode);
      if (existingRole) {
        return res.status(400).json({ message: '角色代码已存在' });
      }
      
      const role = {
        id: String(roleIdCounter++),
        role_code: roleCode,
        role_name: roleName,
        role_type: roleType || 'teacher',
        description,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockRoles.push(role);
      
      res.status(201).json({ message: '创建成功', roleId: role.id });
    } catch (error) {
      console.error('创建角色失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.put('/:id', authMiddleware, checkPermission('system:role:edit'), async (req, res) => {
    try {
      const roleIndex = mockRoles.findIndex(r => r.id === req.params.id);
      if (roleIndex === -1) {
        return res.status(404).json({ message: '角色不存在' });
      }
      
      const { roleName, description, status } = req.body;
      
      if (roleName) mockRoles[roleIndex].role_name = roleName;
      if (description) mockRoles[roleIndex].description = description;
      if (status !== undefined) mockRoles[roleIndex].status = status;
      mockRoles[roleIndex].updated_at = new Date();
      
      res.json({ message: '更新成功' });
    } catch (error) {
      console.error('更新角色失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  router.delete('/:id', authMiddleware, checkPermission('system:role:delete'), async (req, res) => {
    try {
      const roleIndex = mockRoles.findIndex(r => r.id === req.params.id);
      if (roleIndex === -1) {
        return res.status(404).json({ message: '角色不存在' });
      }
      
      mockRoles.splice(roleIndex, 1);
      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('删除角色失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  return router;
}

function createPermissionsRouter() {
  const router = express.Router();
  
  let mockPermissions = [];
  let permIdCounter = 1;
  
  const defaultPermissions = [
    { id: '1', permission_code: 'user:manage', permission_name: '用户管理', module: 'system', description: '用户管理权限' },
    { id: '2', permission_code: 'student:manage', permission_name: '学生管理', module: 'student', description: '学生管理权限' },
    { id: '3', permission_code: 'teacher:manage', permission_name: '教师管理', module: 'teacher', description: '教师管理权限' }
  ];
  mockPermissions = [...defaultPermissions];
  permIdCounter = 4;
  
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
      res.json(mockPermissions);
    } catch (error) {
      console.error('获取权限列表失败:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
  
  return router;
}

module.exports = {
  createRolesRouter,
  createPermissionsRouter,
  JWT_SECRET
};
