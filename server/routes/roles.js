const express = require('express');
const router = express.Router();
const { Role, Permission, User } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['id', 'ASC']]
    });
    res.json(roles);
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    res.json(role);
  } catch (error) {
    console.error('获取角色详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('system:role:create'), async (req, res) => {
  try {
    const { roleCode, roleName, roleType, description, permissionIds } = req.body;

    const existingRole = await Role.findOne({ where: { role_code: roleCode } });
    if (existingRole) {
      return res.status(400).json({ message: '角色代码已存在' });
    }

    const role = await Role.create({
      role_code: roleCode,
      role_name: roleName,
      role_type: roleType,
      description
    });

    if (permissionIds && permissionIds.length > 0) {
      await role.setPermissions(permissionIds);
    }

    res.status(201).json({ message: '创建成功', roleId: role.id });
  } catch (error) {
    console.error('创建角色失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('system:role:edit'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    const { roleName, description, status, permissionIds } = req.body;

    if (roleName) role.role_name = roleName;
    if (description) role.description = description;
    if (status !== undefined) role.status = status;

    await role.save();

    if (permissionIds) {
      await role.setPermissions(permissionIds);
    }

    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新角色失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('system:role:delete'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    const userCount = await User.count({
      include: [{
        model: Role,
        as: 'roles',
        where: { id: role.id }
      }]
    });

    if (userCount > 0) {
      return res.status(400).json({ message: '该角色下仍有用户，无法删除' });
    }

    await role.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除角色失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
