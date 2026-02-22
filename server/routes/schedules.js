const express = require('express');
const router = express.Router();
const { Schedule, Class, Course, Teacher } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { classId, teacherId, academicYear, semester } = req.query;
    const where = {};
    if (classId) where.class_id = classId;
    if (teacherId) where.teacher_id = teacherId;
    if (academicYear) where.academic_year = academicYear;
    if (semester) where.semester = semester;
    const schedules = await Schedule.findAll({ where, order: [['weekday', 'ASC'], ['lesson_no', 'ASC']] });
    res.json(schedules);
  } catch (error) {
    console.error('获取课表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/class/:classId', auth, async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    const where = { class_id: req.params.classId };
    if (academicYear) where.academic_year = academicYear;
    if (semester) where.semester = semester;
    const schedules = await Schedule.findAll({ where, order: [['weekday', 'ASC'], ['lesson_no', 'ASC']] });
    const scheduleMap = {};
    schedules.forEach(s => { const key = `${s.weekday}-${s.lesson_no}`; scheduleMap[key] = s; });
    res.json(scheduleMap);
  } catch (error) {
    console.error('获取班级课表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    const where = { teacher_id: req.params.teacherId };
    if (academicYear) where.academic_year = academicYear;
    if (semester) where.semester = semester;
    const schedules = await Schedule.findAll({ where, order: [['weekday', 'ASC'], ['lesson_no', 'ASC']] });
    res.json(schedules);
  } catch (error) {
    console.error('获取教师课表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('schedule:create'), async (req, res) => {
  try {
    const { classId, courseId, teacherId, weekday, lessonNo, daySection, roomNo, weekRange, academicYear, semester, isWeekOdd } = req.body;
    const existing = await Schedule.findOne({ where: { class_id: classId, weekday, lesson_no: lessonNo, academic_year: academicYear, semester } });
    if (existing) await existing.destroy();
    const schedule = await Schedule.create({ class_id: classId, course_id: courseId, teacher_id: teacherId, weekday, lesson_no: lessonNo, day_section: daySection, room_no: roomNo, week_range: weekRange, academic_year: academicYear, semester, is_week_odd: isWeekOdd });
    res.status(201).json({ message: '创建成功', scheduleId: schedule.id });
  } catch (error) {
    console.error('创建课表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/batch', auth, checkPermission('schedule:create'), async (req, res) => {
  try {
    const { schedules } = req.body;
    const results = { success: 0, failed: 0, errors: [] };
    for (const s of schedules) {
      try {
        const existing = await Schedule.findOne({ where: { class_id: s.classId, weekday: s.weekday, lesson_no: s.lessonNo, academic_year: s.academicYear, semester: s.semester } });
        if (existing) await existing.destroy();
        await Schedule.create({ class_id: s.classId, course_id: s.courseId, teacher_id: s.teacherId, weekday: s.weekday, lesson_no: s.lessonNo, day_section: s.daySection, room_no: s.roomNo, week_range: s.weekRange, academic_year: s.academicYear, semester: s.semester, is_week_odd: s.isWeekOdd });
        results.success++;
      } catch (e) { results.failed++; results.errors.push({ data: s, message: e.message }); }
    }
    res.json(results);
  } catch (error) {
    console.error('批量创建课表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('schedule:edit'), async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ message: '课表不存在' });
    const allowed = ['course_id', 'teacher_id', 'weekday', 'lesson_no', 'day_section', 'room_no', 'week_range', 'is_week_odd'];
    allowed.forEach(f => { const snakeField = f.replace(/([A-Z])/g, '_$1').toLowerCase(); if (req.body[f] !== undefined) schedule[snakeField] = req.body[f]; });
    await schedule.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新课表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('schedule:delete'), async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ message: '课表不存在' });
    await schedule.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除课表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
