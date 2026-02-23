const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz',
    email: 'admin@school.com',
    role_id: '1',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockRoles = [
  {
    id: '1',
    name: '管理员',
    code: 'admin',
    description: '系统管理员',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockPermissions = [
  { id: '1', name: '用户管理', code: 'user:manage', description: '用户管理权限' },
  { id: '2', name: '学生管理', code: 'student:manage', description: '学生管理权限' },
  { id: '3', name: '教师管理', code: 'teacher:manage', description: '教师管理权限' }
];

const mockStudents = [
  {
    id: '1',
    student_no: '2024001',
    name: '张三',
    gender: '男',
    birth_date: '2010-01-01',
    grade_id: '1',
    class_id: '1',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockTeachers = [
  {
    id: '1',
    teacher_no: 'T001',
    name: '李老师',
    gender: '女',
    phone: '13800138000',
    email: 'li@school.com',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockGrades = [
  {
    id: '1',
    name: '一年级',
    year: 2024,
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockClasses = [
  {
    id: '1',
    name: '一年级一班',
    grade_id: '1',
    teacher_id: '1',
    student_count: 30,
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockCourses = [
  {
    id: '1',
    name: '语文',
    code: 'CHINESE',
    credit: 4,
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockExams = [
  {
    id: '1',
    name: '期中考试',
    grade_id: '1',
    semester: '2024-1',
    exam_date: '2024-04-15',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockScores = [
  {
    id: '1',
    student_id: '1',
    exam_id: '1',
    course_id: '1',
    score: 85,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockSchedules = [
  {
    id: '1',
    grade_id: '1',
    class_id: '1',
    course_id: '1',
    teacher_id: '1',
    weekday: 1,
    start_time: '08:00',
    end_time: '08:45',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockAttendance = [
  {
    id: '1',
    student_id: '1',
    date: '2024-03-01',
    status: 'present',
    remark: '',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockNotices = [
  {
    id: '1',
    title: '开学通知',
    content: '请各位同学于9月1日到校报到',
    author: 'admin',
    status: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockEnrollments = [
  {
    id: '1',
    student_name: '王五',
    gender: '男',
    birth_date: '2013-01-01',
    parent_name: '王小明',
    phone: '13900139000',
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockFinance = [
  {
    id: '1',
    student_id: '1',
    type: 'tuition',
    amount: 5000,
    status: 'paid',
    payment_date: '2024-01-01',
    created_at: new Date(),
    updated_at: new Date()
  }
];

let userIdCounter = 2;
let roleIdCounter = 2;
let studentIdCounter = 2;
let teacherIdCounter = 2;
let gradeIdCounter = 2;
let classIdCounter = 2;
let courseIdCounter = 2;
let examIdCounter = 2;
let scoreIdCounter = 2;
let scheduleIdCounter = 2;
let attendanceIdCounter = 2;
let noticeIdCounter = 2;
let enrollmentIdCounter = 2;
let financeIdCounter = 2;

const db = {
  users: [...mockUsers],
  roles: [...mockRoles],
  permissions: [...mockPermissions],
  students: [...mockStudents],
  teachers: [...mockTeachers],
  grades: [...mockGrades],
  classes: [...mockClasses],
  courses: [...mockCourses],
  exams: [...mockExams],
  scores: [...mockScores],
  schedules: [...mockSchedules],
  attendance: [...mockAttendance],
  notices: [...mockNotices],
  enrollments: [...mockEnrollments],
  finance: [...mockFinance],
  
  reset() {
    this.users = JSON.parse(JSON.stringify(mockUsers));
    this.roles = JSON.parse(JSON.stringify(mockRoles));
    this.permissions = JSON.parse(JSON.stringify(mockPermissions));
    this.students = JSON.parse(JSON.stringify(mockStudents));
    this.teachers = JSON.parse(JSON.stringify(mockTeachers));
    this.grades = JSON.parse(JSON.stringify(mockGrades));
    this.classes = JSON.parse(JSON.stringify(mockClasses));
    this.courses = JSON.parse(JSON.stringify(mockCourses));
    this.exams = JSON.parse(JSON.stringify(mockExams));
    this.scores = JSON.parse(JSON.stringify(mockScores));
    this.schedules = JSON.parse(JSON.stringify(mockSchedules));
    this.attendance = JSON.parse(JSON.stringify(mockAttendance));
    this.notices = JSON.parse(JSON.stringify(mockNotices));
    this.enrollments = JSON.parse(JSON.stringify(mockEnrollments));
    this.finance = JSON.parse(JSON.stringify(mockFinance));
  },
  
  generateId(table) {
    const counters = {
      users: () => String(userIdCounter++),
      roles: () => String(roleIdCounter++),
      students: () => String(studentIdCounter++),
      teachers: () => String(teacherIdCounter++),
      grades: () => String(gradeIdCounter++),
      classes: () => String(classIdCounter++),
      courses: () => String(courseIdCounter++),
      exams: () => String(examIdCounter++),
      scores: () => String(scoreIdCounter++),
      schedules: () => String(scheduleIdCounter++),
      attendance: () => String(attendanceIdCounter++),
      notices: () => String(noticeIdCounter++),
      enrollments: () => String(enrollmentIdCounter++),
      finance: () => String(financeIdCounter++)
    };
    return counters[table] ? counters[table]() : String(Date.now());
  }
};

module.exports = {
  db,
  mockUsers,
  mockRoles,
  mockPermissions,
  mockStudents,
  mockTeachers,
  mockGrades,
  mockClasses,
  mockCourses,
  mockExams,
  mockScores,
  mockSchedules,
  mockAttendance,
  mockNotices,
  mockEnrollments,
  mockFinance
};
