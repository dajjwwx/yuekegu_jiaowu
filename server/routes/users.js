const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Role, Student, Teacher } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, username, userType, status } = req.query;
    const where = {};

    if (username) where.username = { [require('sequelize').Op.like]: `%${username}%` };
    if (userType) where.user_type = userType;
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    let profile = null;
    if (user.user_type === 'student') {
      profile = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.user_type === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id } });
    }

    const roles = await user.getRoles();

    res.json({ user, roles, profile });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('system:user:create'), async (req, res) => {
  try {
    const { username, password, realName, userType, phone, email, roleIds } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      real_name: realName,
      user_type: userType,
      phone,
      email
    });

    if (roleIds && roleIds.length > 0) {
      await user.setRoles(roleIds);
    }

    res.status(201).json({ message: '创建成功', userId: user.id });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const { realName, phone, email, status, roleIds } = req.body;

    if (realName) user.real_name = realName;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (status !== undefined) user.status = status;

    await user.save();

    if (roleIds) {
      await user.setRoles(roleIds);
    }

    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id/password', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const { oldPassword, newPassword } = req.body;

    if (req.user.user_type !== 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: '没有权限修改他人密码' });
    }

    if (req.user.user_type !== 'admin') {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: '原密码错误' });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('system:user:delete'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (user.user_type === 'admin') {
      return res.status(400).json({ message: '不能删除管理员账号' });
    }

    user.status = 0;
    await user.save();

    res.json({ message: '禁用成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
