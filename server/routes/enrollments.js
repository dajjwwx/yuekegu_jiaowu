const express = require('express');
const router = express.Router();
const { Enrollment } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, enrollYear, status } = req.query;
    const where = {};
    if (name) where.name = { [require('sequelize').Op.like]: `%${name}%` };
    if (enrollYear) where.enroll_year = enrollYear;
    if (status) where.status = status;

    const { count, rows } = await Enrollment.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });
    res.json({ list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: '报名记录不存在' });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, gender, birthDate, idCard, phone, guardianName, guardianPhone, address, origin, graduationSchool, enrollType, enrollYear, firstChoice, score, interviewScore } = req.body;
    const enrollNo = 'EN' + Date.now() + Math.floor(Math.random() * 1000);
    const enrollment = await Enrollment.create({ enrollNo, name, gender, birthDate, idCard, phone, guardianName, guardianPhone, address, origin, graduationSchool, enrollType: enrollType || 1, enrollYear: enrollYear || new Date().getFullYear(), firstChoice, score, interviewScore, totalScore: score && interviewScore ? score + interviewScore : null });
    res.status(201).json({ message: '报名成功', enrollmentId: enrollment.id });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: '报名记录不存在' });
    const allowed = ['name', 'phone', 'status', 'enrollTime', 'reportTime', 'remark'];
    allowed.forEach(f => { if (req.body[f] !== undefined) enrollment[f] = req.body[f] });
    await enrollment.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
