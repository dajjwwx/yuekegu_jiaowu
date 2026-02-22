const express = require('express');
const router = express.Router();
const { Grade, Teacher } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { academicYear, section, status } = req.query;
    const where = {};

    if (academicYear) where.academic_year = academicYear;
    if (section) where.section = section;
    if (status) where.status = status;

    const grades = await Grade.findAll({
      where,
      order: [['grade_level', 'ASC']]
    });

    res.json(grades);
  } catch (error) {
    console.error('获取年级列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: '年级不存在' });
    }

    res.json(grade);
  } catch (error) {
    console.error('获取年级详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('grade:create'), async (req, res) => {
  try {
    const { gradeName, gradeLevel, section, academicYear, gradeLeaderId } = req.body;

    const existing = await Grade.findOne({
      where: { grade_level: gradeLevel, academic_year: academicYear }
    });
    if (existing) {
      return res.status(400).json({ message: '该年级已存在' });
    }

    const grade = await Grade.create({
      grade_name: gradeName,
      grade_level: gradeLevel,
      section,
      academic_year: academicYear,
      grade_leader_id: gradeLeaderId
    });

    res.status(201).json({ message: '创建成功', gradeId: grade.id });
  } catch (error) {
    console.error('创建年级失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('grade:edit'), async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: '年级不存在' });
    }

    const { gradeName, gradeLeaderId, status } = req.body;

    if (gradeName) grade.grade_name = gradeName;
    if (gradeLeaderId !== undefined) grade.grade_leader_id = gradeLeaderId;
    if (status !== undefined) grade.status = status;

    await grade.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新年级失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('grade:delete'), async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: '年级不存在' });
    }

    await grade.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除年级失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
