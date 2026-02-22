const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_type: {
    type: DataTypes.ENUM('admin', 'teacher', 'student', 'parent'),
    defaultValue: 'teacher'
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  last_login_at: {
    type: DataTypes.DATE
  },
  last_login_ip: {
    type: DataTypes.STRING(45)
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true
});

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  role_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  role_type: {
    type: DataTypes.ENUM('system', 'management', 'teacher', 'student', 'parent'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'roles',
  timestamps: true
});

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  permission_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  permission_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'permissions',
  timestamps: true
});

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  student_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  id_card: {
    type: DataTypes.STRING(18)
  },
  academic_status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  grade_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  class_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  enrollment_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enrollment_type: {
    type: DataTypes.STRING(20)
  },
  origin: {
    type: DataTypes.STRING(100)
  },
  nation: {
    type: DataTypes.STRING(20)
  },
  political_status: {
    type: DataTypes.STRING(20)
  },
  photo: {
    type: DataTypes.STRING(255)
  },
  guardian_name: {
    type: DataTypes.STRING(50)
  },
  guardian_relation: {
    type: DataTypes.STRING(20)
  },
  guardian_phone: {
    type: DataTypes.STRING(20)
  },
  guardian_id_card: {
    type: DataTypes.STRING(18)
  },
  address: {
    type: DataTypes.STRING(255)
  },
  student_status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  student_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  graduation_school: {
    type: DataTypes.STRING(100)
  },
  graduation_no: {
    type: DataTypes.STRING(50)
  },
  remark: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'students',
  timestamps: true,
  paranoid: true
});

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  teacher_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  birth_date: {
    type: DataTypes.DATEONLY
  },
  id_card: {
    type: DataTypes.STRING(18)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  nation: {
    type: DataTypes.STRING(20)
  },
  political_status: {
    type: DataTypes.STRING(20)
  },
  photo: {
    type: DataTypes.STRING(255)
  },
  department: {
    type: DataTypes.STRING(50)
  },
  position: {
    type: DataTypes.STRING(50)
  },
  title: {
    type: DataTypes.STRING(50)
  },
  employment_type: {
    type: DataTypes.STRING(20)
  },
  hire_date: {
    type: DataTypes.DATEONLY
  },
  education: {
    type: DataTypes.STRING(20)
  },
  degree: {
    type: DataTypes.STRING(20)
  },
  major: {
    type: DataTypes.STRING(50)
  },
  graduation_school: {
    type: DataTypes.STRING(100)
  },
  qualification_no: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  remark: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'teachers',
  timestamps: true,
  paranoid: true
});

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  grade_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  grade_level: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  section: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  grade_leader_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'grades',
  timestamps: true
});

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  class_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  grade_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  class_type: {
    type: DataTypes.STRING(20)
  },
  room_no: {
    type: DataTypes.STRING(20)
  },
  teacher_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  student_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  max_students: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'classes',
  timestamps: true
});

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  course_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  course_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  course_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  section: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  grade_levels: {
    type: DataTypes.STRING(50)
  },
  credit: {
    type: DataTypes.DECIMAL(3, 1)
  },
  hours: {
    type: DataTypes.INTEGER
  },
  is_exam_course: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  description: {
    type: DataTypes.STRING(500)
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'courses',
  timestamps: true
});

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  exam_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  exam_type: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  grade_ids: {
    type: DataTypes.STRING(100)
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_score: {
    type: DataTypes.DECIMAL(5, 1),
    defaultValue: 100
  },
  pass_score: {
    type: DataTypes.DECIMAL(5, 1),
    defaultValue: 60
  },
  is_published: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  publish_time: {
    type: DataTypes.DATE
  },
  creator_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  remark: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'exams',
  timestamps: true
});

const Score = sequelize.define('Score', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  exam_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  course_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  score: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: false
  },
  score_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  is补考: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  rank: {
    type: DataTypes.INTEGER
  },
  class_rank: {
    type: DataTypes.INTEGER
  },
  grade_rank: {
    type: DataTypes.INTEGER
  },
  input_by: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  input_time: {
    type: DataTypes.DATE
  },
  approved_by: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  approved_time: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  remark: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'scores',
  timestamps: true
});

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  class_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  course_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  teacher_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  weekday: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  lesson_no: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  day_section: {
    type: DataTypes.STRING(10)
  },
  room_no: {
    type: DataTypes.STRING(20)
  },
  week_range: {
    type: DataTypes.STRING(50)
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  is_week_odd: {
    type: DataTypes.TINYINT
  }
}, {
  tableName: 'schedules',
  timestamps: true
});

const AttendanceRecord = sequelize.define('AttendanceRecord', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  course_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  attendance_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  attendance_type: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  attendance_time: {
    type: DataTypes.TIME
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  remark: {
    type: DataTypes.STRING(255)
  },
  recorded_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'attendance_records',
  timestamps: true
});

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notice_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  target_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  target_ids: {
    type: DataTypes.STRING(500)
  },
  is_urgent: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  publish_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  publish_time: {
    type: DataTypes.DATE
  },
  expire_time: {
    type: DataTypes.DATE
  },
  read_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'notices',
  timestamps: true
});

const SystemConfig = sequelize.define('SystemConfig', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  config_key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  config_value: {
    type: DataTypes.TEXT
  },
  config_type: {
    type: DataTypes.STRING(20)
  },
  config_desc: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'system_configs',
  timestamps: true
});

const OperationLog = sequelize.define('OperationLog', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  username: {
    type: DataTypes.STRING(50)
  },
  real_name: {
    type: DataTypes.STRING(50)
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  method: {
    type: DataTypes.STRING(10)
  },
  path: {
    type: DataTypes.STRING(200)
  },
  params: {
    type: DataTypes.TEXT
  },
  result: {
    type: DataTypes.TEXT
  },
  ip: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.STRING(500)
  },
  status: {
    type: DataTypes.TINYINT
  },
  error_msg: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'operation_logs',
  timestamps: true,
  updatedAt: false
});

User.belongsToMany(Role, { through: 'user_roles', as: 'roles' });
Role.belongsToMany(User, { through: 'user_roles', as: 'users' });

Role.belongsToMany(Permission, { through: 'role_permissions', as: 'permissions' });
Permission.belongsToMany(Role, { through: 'role_permissions', as: 'roles' });

Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Student.belongsTo(Grade, { foreignKey: 'grade_id', as: 'grade' });
Student.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Teacher.belongsTo(Grade, { foreignKey: 'grade_leader_id', as: 'gradeLeader' });

Grade.hasMany(Class, { foreignKey: 'grade_id', as: 'classes' });
Grade.hasMany(Student, { foreignKey: 'grade_id', as: 'students' });
Grade.belongsTo(Teacher, { foreignKey: 'grade_leader_id', as: 'gradeLeader' });

Class.belongsTo(Grade, { foreignKey: 'grade_id', as: 'grade' });
Class.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
Class.hasMany(Student, { foreignKey: 'class_id', as: 'students' });

Student.hasMany(Score, { foreignKey: 'student_id', as: 'scores' });
Exam.hasMany(Score, { foreignKey: 'exam_id', as: 'scores' });
Course.hasMany(Score, { foreignKey: 'course_id', as: 'scores' });

Student.hasMany(AttendanceRecord, { foreignKey: 'student_id', as: 'attendanceRecords' });

const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  enroll_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  gender: { type: DataTypes.TINYINT, allowNull: false },
  birth_date: { type: DataTypes.DATEONLY, allowNull: false },
  id_card: { type: DataTypes.STRING(18) },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  guardian_name: { type: DataTypes.STRING(50), allowNull: false },
  guardian_phone: { type: DataTypes.STRING(20), allowNull: false },
  address: { type: DataTypes.STRING(255) },
  origin: { type: DataTypes.STRING(100) },
  graduation_school: { type: DataTypes.STRING(100) },
  enroll_type: { type: DataTypes.TINYINT, defaultValue: 1 },
  enroll_year: { type: DataTypes.INTEGER, allowNull: false },
  first_choice: { type: DataTypes.TINYINT },
  score: { type: DataTypes.DECIMAL(5, 1) },
  interview_score: { type: DataTypes.DECIMAL(5, 1) },
  total_score: { type: DataTypes.DECIMAL(5, 1) },
  status: { type: DataTypes.TINYINT, defaultValue: 0 },
  enroll_time: { type: DataTypes.DATE },
  report_time: { type: DataTypes.DATE },
  remark: { type: DataTypes.STRING(500) }
}, { tableName: 'enrollments', timestamps: true });

const ChargeItem = sequelize.define('ChargeItem', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  item_name: { type: DataTypes.STRING(100), allowNull: false },
  item_type: { type: DataTypes.TINYINT, allowNull: false },
  charge_standard: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  charge_unit: { type: DataTypes.STRING(20) },
  applicable_grades: { type: DataTypes.STRING(100) },
  academic_year: { type: DataTypes.INTEGER, allowNull: false },
  semester: { type: DataTypes.TINYINT },
  deadline: { type: DataTypes.DATEONLY },
  is_required: { type: DataTypes.TINYINT, defaultValue: 1 },
  status: { type: DataTypes.TINYINT, defaultValue: 1 },
  remark: { type: DataTypes.STRING(500) }
}, { tableName: 'charge_items', timestamps: true });

const PaymentRecord = sequelize.define('PaymentRecord', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  charge_item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_method: { type: DataTypes.TINYINT },
  payment_time: { type: DataTypes.DATE },
  payment_no: { type: DataTypes.STRING(50) },
  operator_id: { type: DataTypes.BIGINT.UNSIGNED },
  status: { type: DataTypes.TINYINT, defaultValue: 0 },
  remark: { type: DataTypes.STRING(255) }
}, { tableName: 'payment_records', timestamps: true });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  Student,
  Teacher,
  Grade,
  Class,
  Course,
  Exam,
  Score,
  Schedule,
  AttendanceRecord,
  Notice,
  SystemConfig,
  OperationLog,
  Enrollment,
  ChargeItem,
  PaymentRecord
};
