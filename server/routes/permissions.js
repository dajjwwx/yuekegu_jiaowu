const express = require('express');
const router = express.Router();
const { Permission } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { module } = req.query;
    const where = {};
    if (module) where.module = module;

    const permissions = await Permission.findAll({
      where,
      order: [['module', 'ASC'], ['id', 'ASC']]
    });
    res.json(permissions);
  } catch (error) {
    console.error('获取权限列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/modules', auth, async (req, res) => {
  try {
    const modules = await Permission.findAll({
      attributes: ['module'],
      group: ['module']
    });
    res.json(modules.map(m => m.module));
  } catch (error) {
    console.error('获取模块列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('system:permission:create'), async (req, res) => {
  try {
    const { permissionCode, permissionName, module, description } = req.body;

    const existing = await Permission.findOne({ where: { permission_code: permissionCode } });
    if (existing) {
      return res.status(400).json({ message: '权限代码已存在' });
    }

    const permission = await Permission.create({
      permission_code: permissionCode,
      permission_name: permissionName,
      module,
      description
    });

    res.status(201).json({ message: '创建成功', permissionId: permission.id });
  } catch (error) {
    console.error('创建权限失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('system:permission:delete'), async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: '权限不存在' });
    }

    await permission.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除权限失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
