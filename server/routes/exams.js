const express = require('express');
const router = express.Router();
const { Exam, Grade } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { academicYear, semester, examType, isPublished } = req.query;
    const where = {};

    if (academicYear) where.academic_year = academicYear;
    if (semester) where.semester = semester;
    if (examType) where.exam_type = examType;
    if (isPublished !== undefined) where.is_published = isPublished;

    const exams = await Exam.findAll({
      where,
      order: [['start_date', 'DESC']]
    });

    res.json(exams);
  } catch (error) {
    console.error('获取考试列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: '考试不存在' });
    }
    res.json(exam);
  } catch (error) {
    console.error('获取考试详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('exam:create'), async (req, res) => {
  try {
    const { examName, examType, academicYear, semester, gradeIds, startDate, endDate, totalScore, passScore, remark } = req.body;

    const exam = await Exam.create({
      exam_name: examName,
      exam_type: examType,
      academic_year: academicYear,
      semester,
      grade_ids: gradeIds,
      start_date: startDate,
      end_date: endDate,
      total_score: totalScore || 100,
      pass_score: passScore || 60,
      remark,
      creator_id: req.userId
    });

    res.status(201).json({ message: '创建成功', examId: exam.id });
  } catch (error) {
    console.error('创建考试失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('exam:edit'), async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: '考试不存在' });
    }

    const allowedFields = ['exam_name', 'exam_type', 'grade_ids', 'start_date', 'end_date', 'total_score', 'pass_score', 'remark'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        exam[field] = req.body[field];
      }
    });

    await exam.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新考试失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/:id/publish', auth, checkPermission('exam:publish'), async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: '考试不存在' });
    }

    exam.is_published = 1;
    exam.publish_time = new Date();
    await exam.save();

    res.json({ message: '发布成功' });
  } catch (error) {
    console.error('发布考试失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('exam:delete'), async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: '考试不存在' });
    }

    await exam.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除考试失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
