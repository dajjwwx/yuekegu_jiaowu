const express = require('express');
const router = express.Router();
const { Student, User, Grade, Class } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, studentNo, gradeId, classId, academicStatus, studentType } = req.query;
    const where = {};

    if (name) where.name = { [require('sequelize').Op.like]: `%${name}%` };
    if (studentNo) where.student_no = { [require('sequelize').Op.like]: `%${studentNo}%` };
    if (gradeId) where.grade_id = gradeId;
    if (classId) where.class_id = classId;
    if (academicStatus) where.academic_status = academicStatus;
    if (studentType) where.student_type = studentType;

    const { count, rows } = await Student.findAndCountAll({
      where,
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
    console.error('获取学生列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: Grade, as: 'grade' },
        { model: Class, as: 'class' },
        { model: User, as: 'user', attributes: ['id', 'username', 'phone', 'email'] }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: '学生不存在' });
    }

    res.json(student);
  } catch (error) {
    console.error('获取学生详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('student:create'), async (req, res) => {
  try {
    const { studentNo, name, gender, birthDate, idCard, gradeId, classId, enrollmentYear, enrollmentType, origin, nation, politicalStatus, guardianName, guardianRelation, guardianPhone, guardianIdCard, address, studentType, username, password } = req.body;

    const existing = await Student.findOne({ where: { student_no: studentNo } });
    if (existing) {
      return res.status(400).json({ message: '学号已存在' });
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
        user_type: 'student'
      });
      userId = user.id;
    }

    const student = await Student.create({
      user_id: userId,
      student_no: studentNo,
      name,
      gender,
      birth_date: birthDate,
      id_card: idCard,
      grade_id: gradeId,
      class_id: classId,
      enrollment_year: enrollmentYear,
      enrollment_type: enrollmentType,
      origin,
      nation,
      political_status: politicalStatus,
      guardian_name: guardianName,
      guardian_relation: guardianRelation,
      guardian_phone: guardianPhone,
      guardian_id_card: guardianIdCard,
      address,
      student_type: studentType || 1
    });

    res.status(201).json({ message: '创建成功', studentId: student.id });
  } catch (error) {
    console.error('创建学生失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('student:edit'), async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: '学生不存在' });
    }

    const allowedFields = ['name', 'gender', 'birth_date', 'id_card', 'grade_id', 'class_id', 'enrollment_type', 'origin', 'nation', 'political_status', 'photo', 'guardian_name', 'guardian_relation', 'guardian_phone', 'guardian_id_card', 'address', 'student_type', 'academic_status', 'remark'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新学生失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('student:delete'), async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: '学生不存在' });
    }

    await student.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除学生失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/import', auth, checkPermission('student:import'), async (req, res) => {
  try {
    const { students } = req.body;
    const results = { success: 0, failed: 0, errors: [] };

    for (const s of students) {
      try {
        const existing = await Student.findOne({ where: { student_no: s.studentNo } });
        if (existing) {
          results.failed++;
          results.errors.push({ studentNo: s.studentNo, message: '学号已存在' });
          continue;
        }

        await Student.create({
          student_no: s.studentNo,
          name: s.name,
          gender: s.gender || 1,
          birth_date: s.birthDate,
          id_card: s.idCard,
          grade_id: s.gradeId,
          class_id: s.classId,
          enrollment_year: s.enrollmentYear,
          enrollment_type: s.enrollmentType,
          origin: s.origin,
          nation: s.nation,
          student_type: s.studentType || 1
        });
        results.success++;
      } catch (e) {
        results.failed++;
        results.errors.push({ studentNo: s.studentNo, message: e.message });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('导入学生失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
