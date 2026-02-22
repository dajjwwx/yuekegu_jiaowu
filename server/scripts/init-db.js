const { sequelize, User, Role, Permission, Student, Teacher, Grade, Class, Course, SystemConfig } = require('../models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    await sequelize.sync({ force: true });
    console.log('✓ 数据库表已创建');
    
    // 创建管理员账号
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      real_name: '系统管理员',
      user_type: 'admin',
      status: 1
    });
    console.log('✓ 管理员账号已创建');
    
    // 创建角色
    const roles = await Role.bulkCreate([
      { role_code: 'admin', role_name: '系统管理员', role_type: 'system', description: '系统最高权限' },
      { role_code: 'edu_director', role_name: '教务主任', role_type: 'management', description: '教务管理' },
      { role_code: 'teacher', role_name: '教师', role_type: 'teacher', description: '任课教师' }
    ]);
    console.log('✓ 角色已创建');
    
    await admin.addRole(roles[0]);
    
    // 创建权限
    const permissions = await Permission.bulkCreate([
      { permission_code: 'system:user', permission_name: '用户管理', module: 'system' },
      { permission_code: 'system:role', permission_name: '角色管理', module: 'system' },
      { permission_code: 'student:view', permission_name: '查看学生', module: 'student' },
      { permission_code: 'student:create', permission_name: '新增学生', module: 'student' },
      { permission_code: 'student:edit', permission_name: '编辑学生', module: 'student' },
      { permission_code: 'teacher:view', permission_name: '查看教师', module: 'teacher' },
      { permission_code: 'grade:view', permission_name: '查看年级', module: 'grade' },
      { permission_code: 'grade:create', permission_name: '创建年级', module: 'grade' },
      { permission_code: 'class:view', permission_name: '查看班级', module: 'class' },
      { permission_code: 'class:create', permission_name: '创建班级', module: 'class' },
      { permission_code: 'course:view', permission_name: '查看课程', module: 'course' },
      { permission_code: 'exam:view', permission_name: '查看考试', module: 'exam' },
      { permission_code: 'exam:create', permission_name: '创建考试', module: 'exam' },
      { permission_code: 'score:view', permission_name: '查看成绩', module: 'score' },
      { permission_code: 'score:input', permission_name: '录入成绩', module: 'score' },
      { permission_code: 'schedule:view', permission_name: '查看课表', module: 'schedule' },
      { permission_code: 'schedule:create', permission_name: '编排课表', module: 'schedule' },
      { permission_code: 'attendance:view', permission_name: '查看考勤', module: 'attendance' },
      { permission_code: 'attendance:input', permission_name: '录入考勤', module: 'attendance' },
      { permission_code: 'notice:view', permission_name: '查看通知', module: 'notice' },
      { permission_code: 'notice:create', permission_name: '发布通知', module: 'notice' }
    ]);
    console.log('✓ 权限已创建');
    
    await roles[0].addPermissions(permissions);
    
    // 系统配置
    await SystemConfig.bulkCreate([
      { config_key: 'school_name', config_value: '某某中学', config_type: 'basic' },
      { config_key: 'academic_year', config_value: '2025', config_type: 'academic' }
    ]);
    
    // 创建示例数据
    const currentYear = new Date().getFullYear();
    
    const grades = await Grade.bulkCreate([
      { grade_name: '高一', grade_level: 4, section: 2, academic_year: currentYear, status: 1 },
      { grade_name: '高二', grade_level: 5, section: 2, academic_year: currentYear, status: 1 },
      { grade_name: '高三', grade_level: 6, section: 2, academic_year: currentYear, status: 1 },
      { grade_name: '初一', grade_level: 1, section: 1, academic_year: currentYear, status: 1 }
    ]);
    
    const teacher = await Teacher.create({
      teacher_no: 'T001',
      name: '张老师',
      gender: 1,
      phone: '13800138000',
      department: '教务处',
      status: 1
    });
    
    const classes = await Class.bulkCreate([
      { class_name: '高一(1)班', grade_id: grades[0].id, teacher_id: teacher.id, room_no: '101', academic_year: currentYear, semester: 1, status: 1 },
      { class_name: '高一(2)班', grade_id: grades[0].id, room_no: '102', academic_year: currentYear, semester: 1, status: 1 },
      { class_name: '初一(1)班', grade_id: grades[3].id, teacher_id: teacher.id, room_no: '301', academic_year: currentYear, semester: 1, status: 1 }
    ]);
    
    const courses = await Course.bulkCreate([
      { course_code: 'CN', course_name: '语文', subject: '语文', section: 3, course_type: 1, is_exam_course: 1, status: 1 },
      { course_code: 'MT', course_name: '数学', subject: '数学', section: 3, course_type: 1, is_exam_course: 1, status: 1 },
      { course_code: 'EN', course_name: '英语', subject: '英语', section: 3, course_type: 1, is_exam_course: 1, status: 1 },
      { course_code: 'PH', course_name: '物理', subject: '物理', section: 2, course_type: 1, is_exam_course: 1, status: 1 },
      { course_code: 'CH', course_name: '化学', subject: '化学', section: 2, course_type: 1, is_exam_course: 1, status: 1 }
    ]);
    
    await Student.create({
      student_no: '2025001',
      name: '王小明',
      gender: 1,
      birth_date: '2010-05-15',
      grade_id: grades[0].id,
      class_id: classes[0].id,
      enrollment_year: currentYear,
      student_type: 2,
      guardian_name: '王大明',
      guardian_phone: '13900139000'
    });
    
    console.log('✓ 示例数据已创建');
    console.log('\n初始化完成！\n');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
