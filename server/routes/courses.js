const express = require('express');
const router = express.Router();
const { Course } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { section, courseType, subject, status } = req.query;
    const where = {};

    if (section) where.section = section;
    if (courseType) where.course_type = courseType;
    if (subject) where.subject = { [require('sequelize').Op.like]: `%${subject}%` };
    if (status) where.status = status;

    const courses = await Course.findAll({
      where,
      order: [['subject', 'ASC'], ['course_name', 'ASC']]
    });

    res.json(courses);
  } catch (error) {
    console.error('获取课程列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/subjects', auth, async (req, res) => {
  try {
    const subjects = await Course.findAll({
      attributes: ['subject'],
      group: ['subject'],
      where: { status: 1 }
    });
    res.json(subjects.map(s => s.subject));
  } catch (error) {
    console.error('获取学科列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }
    res.json(course);
  } catch (error) {
    console.error('获取课程详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('course:create'), async (req, res) => {
  try {
    const { courseCode, courseName, courseType, subject, section, gradeLevels, credit, hours, isExamCourse, description } = req.body;

    const existing = await Course.findOne({ where: { course_code: courseCode } });
    if (existing) {
      return res.status(400).json({ message: '课程代码已存在' });
    }

    const course = await Course.create({
      course_code: courseCode,
      course_name: courseName,
      course_type: courseType || 1,
      subject,
      section,
      grade_levels: gradeLevels,
      credit,
      hours,
      is_exam_course: isExamCourse ?? 1,
      description
    });

    res.status(201).json({ message: '创建成功', courseId: course.id });
  } catch (error) {
    console.error('创建课程失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('course:edit'), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }

    const allowedFields = ['course_name', 'course_type', 'subject', 'section', 'grade_levels', 'credit', 'hours', 'is_exam_course', 'description', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新课程失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('course:delete'), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }

    await course.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除课程失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
