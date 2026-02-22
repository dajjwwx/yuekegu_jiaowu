const jwt = require('jsonwebtoken');
const { User, Permission } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'educational-admin-secret-key';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user || user.status !== 1) {
      return res.status(401).json({ message: '用户不存在或已禁用' });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '登录已过期' });
    }
    return res.status(401).json({ message: '无效的令牌' });
  }
};

const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (user.user_type === 'admin') {
        return next();
      }

      const roles = await user.getRoles({
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }]
      });

      const hasPermission = roles.some(role => 
        role.permissions && role.permissions.some(p => p.permission_code === permissionCode)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: '没有权限执行此操作' });
      }

      next();
    } catch (error) {
      console.error('权限检查失败:', error);
      return res.status(500).json({ message: '服务器错误' });
    }
  };
};

module.exports = { auth, checkPermission, JWT_SECRET };
