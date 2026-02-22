const express = require('express');
const router = express.Router();
const { AttendanceRecord, Student, Course, LeaveRequest } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');
const { Op } = require('sequelize');

router.get('/', auth, async (req, res) => {
  try {
    const { studentId, classId, attendanceDate, attendanceType, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    const where = {};

    if (studentId) where.student_id = studentId;
    if (attendanceDate) where.attendance_date = attendanceDate;
    if (attendanceType) where.attendance_type = attendanceType;

    if (startDate && endDate) {
      where.attendance_date = { [Op.between]: [startDate, endDate] };
    }

    if (classId) {
      const students = await Student.findAll({
        where: { class_id: classId },
        attributes: ['id']
      });
      where.student_id = { [Op.in]: students.map(s => s.id) };
    }

    const { count, rows } = await AttendanceRecord.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['attendance_date', 'DESC'], ['student_id', 'ASC']]
    });

    res.json({ list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取考勤记录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('attendance:input'), async (req, res) => {
  try {
    const { studentId, courseId, attendanceDate, attendanceType, attendanceTime, remark } = req.body;

    const [record, created] = await AttendanceRecord.findOrCreate({
      where: {
        student_id: studentId,
        course_id: courseId,
        attendance_date: attendanceDate
      },
      defaults: {
        attendance_type: attendanceType,
        attendance_time: attendanceTime,
        remark,
        recorded_by: req.userId
      }
    });

    if (!created) {
      record.attendance_type = attendanceType;
      record.attendance_time = attendanceTime;
      record.remark = remark;
      await record.save();
    }

    res.json({ message: created ? '创建成功' : '更新成功', recordId: record.id });
  } catch (error) {
    console.error('创建考勤记录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/batch', auth, checkPermission('attendance:input'), async (req, res) => {
  try {
    const { classId, courseId, attendanceDate, attendanceType, studentIds, remark } = req.body;

    const students = studentIds || await Student.findAll({
      where: { class_id: classId },
      attributes: ['id']
    }).then(s => s.map(s => s.id));

    const results = { success: 0, failed: 0 };

    for (const studentId of students) {
      try {
        await AttendanceRecord.findOrCreate({
          where: {
            student_id: studentId,
            course_id: courseId,
            attendance_date: attendanceDate
          },
          defaults: {
            attendance_type: attendanceType,
            remark,
            recorded_by: req.userId
          }
        });
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }

    res.json(results);
  } catch (error) {
    console.error('批量考勤失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const record = await AttendanceRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: '考勤记录不存在' });
    }

    const { attendanceType, attendanceTime, remark, status } = req.body;

    if (attendanceType !== undefined) record.attendance_type = attendanceType;
    if (attendanceTime !== undefined) record.attendance_time = attendanceTime;
    if (remark !== undefined) record.remark = remark;
    if (status !== undefined) record.status = status;

    await record.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新考勤记录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/statistics', auth, async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    let studentIds = null;
    if (classId) {
      studentIds = await Student.findAll({
        where: { class_id: classId },
        attributes: ['id']
      }).then(s => s.map(s => s.id));
    }

    const where = {};
    if (studentIds) where.student_id = { [Op.in]: studentIds };
    if (startDate && endDate) {
      where.attendance_date = { [Op.between]: [startDate, endDate] };
    }

    const stats = await AttendanceRecord.findAll({
      where,
      attributes: [
        'attendance_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['attendance_type'],
      raw: true
    });

    const result = {
      present: 0,
      late: 0,
      leaveEarly: 0,
      absent: 0,
      leave: 0
    };

    stats.forEach(s => {
      if (s.attendance_type === 1) result.present = parseInt(s.count);
      if (s.attendance_type === 2) result.late = parseInt(s.count);
      if (s.attendance_type === 3) result.leaveEarly = parseInt(s.count);
      if (s.attendance_type === 4) result.absent = parseInt(s.count);
      if (s.attendance_type === 5) result.leave = parseInt(s.count);
    });

    res.json(result);
  } catch (error) {
    console.error('获取考勤统计失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
