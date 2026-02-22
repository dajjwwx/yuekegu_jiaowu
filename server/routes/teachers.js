const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Teacher, User, Grade } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, teacherNo, department, status } = req.query;
    const where = {};

    if (name) where.name = { [require('sequelize').Op.like]: `%${name}%` };
    if (teacherNo) where.teacher_no = { [require('sequelize').Op.like]: `%${teacherNo}%` };
    if (department) where.department = { [require('sequelize').Op.like]: `%${department}%` };
    if (status) where.status = status;

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      include: [
        { model: Grade, as: 'gradeLeader', attributes: ['id', 'grade_name'] }
      ],
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
    console.error('获取教师列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        { model: Grade, as: 'gradeLeader' },
        { model: User, as: 'user', attributes: ['id', 'username', 'phone', 'email'] }
      ]
    });

    if (!teacher) {
      return res.status(404).json({ message: '教师不存在' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('获取教师详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('teacher:create'), async (req, res) => {
  try {
    const { teacherNo, name, gender, birthDate, idCard, phone, email, department, position, title, employmentType, hireDate, education, degree, major, graduationSchool, qualificationNo, username, password } = req.body;

    const existing = await Teacher.findOne({ where: { teacher_no: teacherNo } });
    if (existing) {
      return res.status(400).json({ message: '工号已存在' });
    }

    let userId = null;
    if (username && password) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        password: hashedPassword,
        real_name: name,
        user_type: 'teacher',
        phone,
        email
      });
      userId = user.id;
    }

    const teacher = await Teacher.create({
      user_id: userId,
      teacher_no: teacherNo,
      name,
      gender,
      birth_date: birthDate,
      id_card: idCard,
      phone,
      email,
      department,
      position,
      title,
      employment_type: employmentType,
      hire_date: hireDate,
      education,
      degree,
      major,
      graduation_school: graduationSchool,
      qualification_no: qualificationNo
    });

    res.status(201).json({ message: '创建成功', teacherId: teacher.id });
  } catch (error) {
    console.error('创建教师失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('teacher:edit'), async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: '教师不存在' });
    }

    const allowedFields = ['name', 'gender', 'birth_date', 'id_card', 'phone', 'email', 'nation', 'political_status', 'photo', 'department', 'position', 'title', 'employment_type', 'hire_date', 'education', 'degree', 'major', 'graduation_school', 'qualification_no', 'status', 'remark'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    await teacher.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新教师失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('teacher:delete'), async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: '教师不存在' });
    }

    teacher.status = 0;
    await teacher.save();

    res.json({ message: '禁用成功' });
  } catch (error) {
    console.error('删除教师失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
