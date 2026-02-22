const express = require('express');
const router = express.Router();
const { Score, Student, Exam, Course, Class, Grade } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');
const { Op } = require('sequelize');

router.get('/', auth, async (req, res) => {
  try {
    const { examId, courseId, classId, studentId, status } = req.query;
    const where = {};

    if (examId) where.exam_id = examId;
    if (courseId) where.course_id = courseId;
    if (studentId) where.student_id = studentId;
    if (status) where.status = status;

    const include = [
      { model: Student, as: 'student', attributes: ['id', 'name', 'student_no'] },
      { model: Exam, as: 'exam', attributes: ['id', 'exam_name', 'exam_type'] },
      { model: Course, as: 'course', attributes: ['id', 'course_name', 'subject'] }
    ];

    if (classId) {
      const students = await Student.findAll({
        where: { class_id: classId },
        attributes: ['id']
      });
      where.student_id = { [Op.in]: students.map(s => s.id) };
    }

    const scores = await Score.findAll({
      where,
      include,
      order: [['student_id', 'ASC']]
    });

    res.json(scores);
  } catch (error) {
    console.error('获取成绩列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const scores = await Score.findAll({
      where: { student_id: req.params.studentId },
      include: [
        { model: Exam, as: 'exam', attributes: ['id', 'exam_name', 'exam_type', 'academic_year', 'semester'] },
        { model: Course, as: 'course', attributes: ['id', 'course_name', 'subject'] }
      ],
      order: [[{ model: Exam, as: 'exam' }, 'start_date', 'DESC']]
    });

    res.json(scores);
  } catch (error) {
    console.error('获取学生成绩失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/batch', auth, checkPermission('score:input'), async (req, res) => {
  try {
    const { examId, courseId, scores } = req.body;

    const results = { success: 0, failed: 0, errors: [] };

    for (const s of scores) {
      try {
        const [score, created] = await Score.findOrCreate({
          where: {
            student_id: s.studentId,
            exam_id: examId,
            course_id: courseId
          },
          defaults: {
            score: s.score,
            score_type: s.scoreType || 1,
            input_by: req.userId,
            input_time: new Date(),
            status: 1
          }
        });

        if (!created) {
          score.score = s.score;
          score.score_type = s.scoreType || 1;
          score.input_by = req.userId;
          score.input_time = new Date();
          await score.save();
        }

        results.success++;
      } catch (e) {
        results.failed++;
        results.errors.push({ studentId: s.studentId, message: e.message });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('批量录入成绩失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('score:edit'), async (req, res) => {
  try {
    const score = await Score.findByPk(req.params.id);
    if (!score) {
      return res.status(404).json({ message: '成绩不存在' });
    }

    const { score: newScore, scoreType, remark } = req.body;

    if (newScore !== undefined) score.score = newScore;
    if (scoreType !== undefined) score.score_type = scoreType;
    if (remark !== undefined) score.remark = remark;

    await score.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新成绩失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/:id/approve', auth, checkPermission('score:approve'), async (req, res) => {
  try {
    const score = await Score.findByPk(req.params.id);
    if (!score) {
      return res.status(404).json({ message: '成绩不存在' });
    }

    score.status = 1;
    score.approved_by = req.userId;
    score.approved_time = new Date();
    await score.save();

    res.json({ message: '审核成功' });
  } catch (error) {
    console.error('审核成绩失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('score:delete'), async (req, res) => {
  try {
    const score = await Score.findByPk(req.params.id);
    if (!score) {
      return res.status(404).json({ message: '成绩不存在' });
    }

    await score.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除成绩失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
