const express = require('express');
const router = express.Router();
const { Class, Grade, Teacher, Student } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');
const { Op } = require('sequelize');

router.get('/', auth, async (req, res) => {
  try {
    const { gradeId, academicYear, semester, status } = req.query;
    const where = {};

    if (gradeId) where.grade_id = gradeId;
    if (academicYear) where.academic_year = academicYear;
    if (semester) where.semester = semester;
    if (status) where.status = status;

    const classes = await Class.findAll({
      where,
      order: [['grade_id', 'ASC'], ['class_name', 'ASC']]
    });

    res.json(classes);
  } catch (error) {
    console.error('获取班级列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const classInfo = await Class.findByPk(req.params.id, {
      include: [
        { model: Grade, as: 'grade' },
        { model: Teacher, as: 'teacher' }
      ]
    });

    if (!classInfo) {
      return res.status(404).json({ message: '班级不存在' });
    }

    const studentCount = await Student.count({
      where: { class_id: classInfo.id, academic_status: 1 }
    });

    res.json({ ...classInfo.toJSON(), studentCount });
  } catch (error) {
    console.error('获取班级详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('class:create'), async (req, res) => {
  try {
    const { className, gradeId, classType, roomNo, teacherId, academicYear, semester, maxStudents } = req.body;

    const classInfo = await Class.create({
      class_name: className,
      grade_id: gradeId,
      class_type: classType,
      room_no: roomNo,
      teacher_id: teacherId,
      academic_year: academicYear,
      semester: semester,
      max_students: maxStudents || 50
    });

    res.status(201).json({ message: '创建成功', classId: classInfo.id });
  } catch (error) {
    console.error('创建班级失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('class:edit'), async (req, res) => {
  try {
    const classInfo = await Class.findByPk(req.params.id);
    if (!classInfo) {
      return res.status(404).json({ message: '班级不存在' });
    }

    const allowedFields = ['class_name', 'class_type', 'room_no', 'teacher_id', 'max_students', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        classInfo[field] = req.body[field];
      }
    });

    await classInfo.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新班级失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('class:delete'), async (req, res) => {
  try {
    const classInfo = await Class.findByPk(req.params.id);
    if (!classInfo) {
      return res.status(404).json({ message: '班级不存在' });
    }

    const studentCount = await Student.count({
      where: { class_id: classInfo.id, academic_status: 1 }
    });

    if (studentCount > 0) {
      return res.status(400).json({ message: '该班级还有在校学生，无法删除' });
    }

    await classInfo.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除班级失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
