const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Student, Teacher } = require('../models');
const { auth, JWT_SECRET } = require('../middlewares/auth');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({ where: { username } });

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

    const roles = await user.getRoles();
    const roleCodes = roles.map(r => r.role_code);

    const token = jwt.sign(
      { userId: user.id, username: user.username, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    user.last_login_at = new Date();
    user.last_login_ip = req.ip;
    await user.save();

    let profile = null;
    if (user.user_type === 'student') {
      profile = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.user_type === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id } });
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.real_name,
        userType: user.user_type,
        avatar: user.avatar,
        roles: roleCodes,
        profile: profile ? {
          id: profile.id,
          name: profile.name,
          studentNo: profile.student_no,
          teacherNo: profile.teacher_no
        } : null
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/info', auth, async (req, res) => {
  try {
    const user = req.user;
    const roles = await user.getRoles({
      include: [{
        model: Role,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    const roleCodes = roles.map(r => r.role_code);
    const permissions = [];
    roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(p => {
          if (!permissions.includes(p.permission_code)) {
            permissions.push(p.permission_code);
          }
        });
      }
    });

    let profile = null;
    if (user.user_type === 'student') {
      profile = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.user_type === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id } });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        realName: user.real_name,
        userType: user.user_type,
        avatar: user.avatar,
        phone: user.phone,
        email: user.email,
        roles: roleCodes,
        permissions: permissions,
        profile: profile ? {
          id: profile.id,
          name: profile.name,
          studentNo: profile.student_no,
          teacherNo: profile.teacher_no
        } : null
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, realName, userType } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
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

router.post('/logout', auth, (req, res) => {
  res.json({ message: '退出登录成功' });
});

module.exports = router;
