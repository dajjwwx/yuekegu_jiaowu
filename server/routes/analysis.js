const express = require('express');
const router = express.Router();
const { Score, Student, Exam, Course, Class, Grade } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');
const { Op } = require('sequelize');

router.get('/summary', auth, async (req, res) => {
  try {
    const { examId, classId, courseId } = req.query;
    const where = {};
    if (examId) where.exam_id = examId;
    if (classId) {
      const students = await Student.findAll({ where: { class_id: classId }, attributes: ['id'] });
      where.student_id = { [Op.in]: students.map(s => s.id) };
    }
    if (courseId) where.course_id = courseId;

    const scores = await Score.findAll({ where });
    
    if (scores.length === 0) {
      return res.json({ message: '暂无成绩数据', data: null });
    }

    const scoreValues = scores.map(s => parseFloat(s.score));
    const total = scoreValues.reduce((a, b) => a + b, 0);
    const avg = total / scoreValues.length;
    const max = Math.max(...scoreValues);
    const min = Math.min(...scoreValues);
    
    const sorted = [...scoreValues].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
      : sorted[Math.floor(sorted.length / 2)];

    const excellent = scoreValues.filter(s => s >= 90).length;
    const good = scoreValues.filter(s => s >= 80 && s < 90).length;
    const medium = scoreValues.filter(s => s >= 70 && s < 80).length;
    const pass = scoreValues.filter(s => s >= 60 && s < 70).length;
    const fail = scoreValues.filter(s => s < 60).length;

    res.json({
      total: scores.length,
      average: avg.toFixed(2),
      max: max,
      min: min,
      median: median.toFixed(2),
      standardDeviation: calculateStdDev(scoreValues).toFixed(2),
      distribution: { excellent, good, medium, pass, fail },
      rates: {
        excellentRate: ((excellent / scores.length) * 100).toFixed(1),
        goodRate: ((good / scores.length) * 100).toFixed(1),
        passRate: (((pass + good + excellent + medium) / scores.length) * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('成绩汇总失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/rank', auth, async (req, res) => {
  try {
    const { examId, classId, courseId, studentId } = req.query;
    const where = {};
    if (examId) where.exam_id = examId;
    if (courseId) where.course_id = courseId;

    let students = [];
    if (classId) {
      students = await Student.findAll({ where: { class_id: classId }, attributes: ['id', 'name', 'student_no'] });
    } else if (studentId) {
      const student = await Student.findByPk(studentId);
      students = student ? [student] : [];
    }

    const results = await Promise.all(students.map(async (student) => {
      const scores = await Score.findAll({
        where: { student_id: student.id, ...where },
        include: [{ model: Course, as: 'course', attributes: ['course_name'] }]
      });
      
      const totalScore = scores.reduce((sum, s) => sum + parseFloat(s.score), 0);
      const avgScore = scores.length > 0 ? (totalScore / scores.length).toFixed(1) : 0;
      
      return {
        studentId: student.id,
        studentName: student.name,
        studentNo: student.student_no,
        totalScore: totalScore.toFixed(1),
        avgScore,
        subjectCount: scores.length
      };
    }));

    results.sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore));

    results.forEach((r, i) => r.rank = i + 1);

    if (studentId) {
      const myRank = results.find(r => r.studentId == studentId);
      return res.json({ myRank, rankings: results.slice(0, 10) });
    }

    res.json(results);
  } catch (error) {
    console.error('排名分析失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/trend', auth, async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    if (!studentId) return res.status(400).json({ message: '需要学生ID' });

    const where = { student_id: studentId };
    if (courseId) where.course_id = courseId;

    const scores = await Score.findAll({
      where,
      include: [
        { model: Exam, as: 'exam', attributes: ['id', 'exam_name', 'exam_type', 'academic_year', 'semester', 'start_date'] },
        { model: Course, as: 'course', attributes: ['id', 'course_name'] }
      ],
      order: [[{ model: Exam, as: 'exam' }, 'start_date', 'ASC']]
    });

    const trend = scores.map(s => ({
      examId: s.exam_id,
      examName: s.exam.exam_name,
      examType: s.exam.exam_type,
      courseName: s.course.course_name,
      score: parseFloat(s.score),
      date: s.exam.start_date
    }));

    const summary = analyzeTrend(trend.map(t => t.score));

    res.json({ trend, summary });
  } catch (error) {
    console.error('趋势分析失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/compare', auth, async (req, res) => {
  try {
    const { studentId1, studentId2, examId } = req.query;
    if (!studentId1 || !studentId2 || !examId) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    const scores1 = await Score.findAll({
      where: { student_id: studentId1, exam_id: examId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'course_name'] }]
    });

    const scores2 = await Score.findAll({
      where: { student_id: studentId2, exam_id: examId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'course_name'] }]
    });

    const compare = scores1.map(s1 => {
      const s2 = scores2.find(s => s.course_id === s1.course_id);
      return {
        courseName: s1.course.course_name,
        score1: parseFloat(s1.score),
        score2: s2 ? parseFloat(s2.score) : null,
        diff: s2 ? (parseFloat(s1.score) - parseFloat(s2.score)).toFixed(1) : null
      };
    });

    const avg1 = scores1.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores1.length;
    const avg2 = scores2.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores2.length;

    res.json({ compare, average: { student1: avg1.toFixed(1), student2: avg2.toFixed(1), diff: (avg1 - avg2).toFixed(1) } });
  } catch (error) {
    console.error('对比分析失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/ai-analysis', auth, async (req, res) => {
  try {
    const { examId, classId, courseId } = req.query;
    const where = {};
    if (examId) where.exam_id = examId;
    if (classId) {
      const students = await Student.findAll({ where: { class_id: classId }, attributes: ['id'] });
      where.student_id = { [Op.in]: students.map(s => s.id) };
    }
    if (courseId) where.course_id = courseId;

    const scores = await Score.findAll({
      where,
      include: [
        { model: Student, as: 'student', attributes: ['id', 'name', 'class_id'] },
        { model: Course, as: 'course', attributes: ['id', 'course_name'] }
      ]
    });

    if (scores.length === 0) {
      return res.json({ message: '暂无成绩数据', analysis: null });
    }

    const analysis = generateAIAnalysis(scores);
    res.json(analysis);
  } catch (error) {
    console.error('AI分析失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

function calculateStdDev(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
}

function analyzeTrend(scores) {
  if (scores.length < 2) return { trend: 'stable', description: '数据不足，无法分析趋势' };
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  
  if (diff > 5) return { trend: 'rising', description: '成绩呈上升趋势，继续保持' };
  if (diff < -5) return { trend: 'declining', description: '成绩有所下滑，建议加强辅导' };
  return { trend: 'stable', description: '成绩保持稳定' };
}

function generateAIAnalysis(scores) {
  const scoreValues = scores.map(s => parseFloat(s.score));
  const total = scoreValues.reduce((a, b) => a + b, 0);
  const avg = total / scoreValues.length;
  const passCount = scoreValues.filter(s => s >= 60).length;
  const passRate = (passCount / scores.length) * 100;

  const byCourse = {};
  scores.forEach(s => {
    const courseName = s.course.course_name;
    if (!byCourse[courseName]) byCourse[courseName] = [];
    byCourse[courseName].push(parseFloat(s.score));
  });

  const courseAnalysis = Object.entries(byCourse).map(([course, vals]) => {
    const courseAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { course, average: courseAvg.toFixed(1), status: courseAvg >= 60 ? '良好' : '需关注' };
  }).sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

  const weakCourses = courseAnalysis.filter(c => parseFloat(c.average) < 60);
  const strongCourses = courseAnalysis.slice(0, 3);

  const recommendations = [];
  if (passRate < 60) {
    recommendations.push('整体及格率偏低，建议开展补差辅导');
  }
  if (weakCourses.length > 0) {
    recommendations.push(`需要重点关注科目：${weakCourses.map(c => c.course).join('、')}`);
  }
  if (passRate >= 90) {
    recommendations.push('整体表现优异，可以适当增加拓展内容');
  }

  const analysis = {
    overview: {
      totalStudents: scores.length,
      averageScore: avg.toFixed(1),
      passRate: passRate.toFixed(1) + '%',
      topScore: Math.max(...scoreValues),
      lowestScore: Math.min(...scoreValues)
    },
    courseAnalysis,
    weakCourses: weakCourses.map(c => c.course),
    strongCourses: strongCourses.map(c => c.course),
    recommendations,
    aiInsight: generateInsight(avg, passRate, courseAnalysis),
    teaching: generateTeachingAdvice(weakCourses, passRate)
  };

  return analysis;
}

function generateInsight(avg, passRate, courseAnalysis) {
  const insights = [];
  
  if (avg >= 85) {
    insights.push('该班级整体成绩优秀，学习氛围良好');
  } else if (avg >= 70) {
    insights.push('该班级整体成绩中等，有较大提升空间');
  } else {
    insights.push('该班级整体成绩偏低，需要重点关注');
  }

  if (passRate >= 90) {
    insights.push('及格率很高，说明基础知识掌握较好');
  } else if (passRate >= 70) {
    insights.push('及格率一般，部分学生存在学习困难');
  } else {
    insights.push('及格率偏低，需要加强基础教学和个别辅导');
  }

  const topCourse = courseAnalysis[0];
  const lowCourse = courseAnalysis[courseAnalysis.length - 1];
  if (topCourse && lowCourse && topCourse.course !== lowCourse.course) {
    insights.push(`${topCourse.course}表现最好，${lowCourse.course}需要加强`);
  }

  return insights;
}

function generateTeachingAdvice(weakCourses, passRate) {
  const advice = [];

  if (passRate < 60) {
    advice.push('建议放缓教学进度，加强基础知识的讲解');
    advice.push('增加随堂练习，及时巩固所学内容');
    advice.push('针对后进生开展一对一辅导');
  } else if (passRate < 80) {
    advice.push('继续保持现有教学节奏');
    advice.push('对薄弱科目进行专项训练');
    advice.push('鼓励学生互帮互助');
  } else {
    advice.push('可以适当增加难度，拓展知识面');
    advice.push('培养学生自主学习能力');
    advice.push('鼓励学生参加学科竞赛');
  }

  weakCourses.forEach(c => {
    advice.push(`建议增加${c.course}的练习量和互动环节`);
  });

  return advice;
}

module.exports = router;
