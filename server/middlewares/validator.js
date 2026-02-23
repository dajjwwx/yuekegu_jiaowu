const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '参数验证失败',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
}

const userValidation = {
  login: [
    require('express-validator').body('username').notEmpty().withMessage('用户名不能为空'),
    require('express-validator').body('password').notEmpty().withMessage('密码不能为空')
  ],
  createUser: [
    require('express-validator').body('username').notEmpty().withMessage('用户名不能为空'),
    require('express-validator').body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    require('express-validator').body('realName').notEmpty().withMessage('真实姓名不能为空'),
    require('express-validator').body('userType').isIn(['admin', 'teacher', 'student', 'parent']).withMessage('用户类型不合法')
  ],
  updateUser: [
    require('express-validator').body('realName').optional().notEmpty().withMessage('真实姓名不能为空'),
    require('express-validator').body('email').optional().isEmail().withMessage('邮箱格式不合法')
  ]
};

const studentValidation = {
  create: [
    require('express-validator').body('studentNo').notEmpty().withMessage('学号不能为空'),
    require('express-validator').body('name').notEmpty().withMessage('姓名不能为空'),
    require('express-validator').body('gender').isInt({ min: 1, max: 2 }).withMessage('性别不合法'),
    require('express-validator').body('birthDate').isDate().withMessage('出生日期格式不合法'),
    require('express-validator').body('gradeId').notEmpty().withMessage('年级不能为空')
  ],
  update: [
    require('express-validator').body('name').optional().notEmpty().withMessage('姓名不能为空')
  ]
};

const teacherValidation = {
  create: [
    require('express-validator').body('teacherNo').notEmpty().withMessage('工号不能为空'),
    require('express-validator').body('name').notEmpty().withMessage('姓名不能为空'),
    require('express-validator').body('gender').isInt({ min: 1, max: 2 }).withMessage('性别不合法'),
    require('express-validator').body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不合法')
  ]
};

const gradeValidation = {
  create: [
    require('express-validator').body('gradeName').notEmpty().withMessage('年级名称不能为空'),
    require('express-validator').body('gradeLevel').isInt({ min: 1, max: 6 }).withMessage('年级级别不合法'),
    require('express-validator').body('academicYear').isInt({ min: 2000, max: 2100 }).withMessage('学年不合法')
  ]
};

const classValidation = {
  create: [
    require('express-validator').body('className').notEmpty().withMessage('班级名称不能为空'),
    require('express-validator').body('gradeId').notEmpty().withMessage('所属年级不能为空')
  ]
};

const courseValidation = {
  create: [
    require('express-validator').body('courseCode').notEmpty().withMessage('课程代码不能为空'),
    require('express-validator').body('courseName').notEmpty().withMessage('课程名称不能为空'),
    require('express-validator').body('subject').notEmpty().withMessage('学科不能为空')
  ]
};

const examValidation = {
  create: [
    require('express-validator').body('examName').notEmpty().withMessage('考试名称不能为空'),
    require('express-validator').body('examType').isInt({ min: 1 }).withMessage('考试类型不合法'),
    require('express-validator').body('academicYear').isInt({ min: 2000 }).withMessage('学年不合法'),
    require('express-validator').body('semester').isInt({ min: 1, max: 2 }).withMessage('学期不合法'),
    require('express-validator').body('startDate').isDate().withMessage('开始日期不合法'),
    require('express-validator').body('endDate').isDate().withMessage('结束日期不合法')
  ]
};

const scoreValidation = {
  create: [
    require('express-validator').body('studentId').notEmpty().withMessage('学生ID不能为空'),
    require('express-validator').body('examId').notEmpty().withMessage('考试ID不能为空'),
    require('express-validator').body('courseId').notEmpty().withMessage('课程ID不能为空'),
    require('express-validator').body('score').isFloat({ min: 0, max: 150 }).withMessage('成绩不合法')
  ]
};

const noticeValidation = {
  create: [
    require('express-validator').body('title').notEmpty().withMessage('标题不能为空'),
    require('express-validator').body('content').notEmpty().withMessage('内容不能为空')
  ]
};

module.exports = {
  validate,
  userValidation,
  studentValidation,
  teacherValidation,
  gradeValidation,
  classValidation,
  courseValidation,
  examValidation,
  scoreValidation,
  noticeValidation
};
