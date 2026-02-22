# 高完中教务管理系统 - 数据库设计

## 一、数据库概述

### 1.1 设计原则

本系统数据库设计遵循以下原则。第一，遵循第三范式（3NF），消除数据冗余，确保数据的一致性和完整性。第二，表名使用小写字母和下划线，字段名采用驼峰命名法或下划线命名法，保持命名风格一致。第三，每个表必须有主键和创建时间、更新时间字段，便于数据管理和追踪。第四，外键关系清晰，建立必要的索引以提高查询性能。

### 1.2 命名规范

数据库使用utf8mb4字符集，支持表情符号和特殊字符。表名使用复数形式，如users、students、classes。字段名使用下划线命名法，如user_name、created_at。索引命名采用idx_表名_字段名的格式，如idx_users_username。

## 二、核心表结构

### 2.1 用户与权限相关表

#### 2.1.1 用户表（users）

用户表存储系统所有用户的基本信息，是系统认证和授权的基础。每个用户可以是多种角色的持有者，用户类型区分学生、教师、家长等不同群体。

```sql
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `user_type` ENUM('admin', 'teacher', 'student', 'parent') NOT NULL DEFAULT 'teacher' COMMENT '用户类型',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态：0禁用，1正常',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

#### 2.1.2 角色表（roles）

角色表定义系统的角色类型。高完中教务系统预设以下角色：系统管理员、教务主任、年级组长、班主任、任课教师、学生、家长。每个角色对应不同的功能权限集合。

```sql
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_code` VARCHAR(50) NOT NULL COMMENT '角色代码',
  `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `role_type` ENUM('system', 'management', 'teacher', 'student', 'parent') NOT NULL COMMENT '角色类型',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用，1正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 初始化角色数据
INSERT INTO `roles` (`role_code`, `role_name`, `role_type`, `description`) VALUES
('admin', '系统管理员', 'system', '系统最高权限管理员'),
('edu_director', '教务主任', 'management', '学校教务管理负责人'),
('grade_leader', '年级组长', 'management', '年级教务管理负责人'),
('class_teacher', '班主任', 'teacher', '班级管理负责人'),
('teacher', '任课教师', 'teacher', '普通任课教师'),
('student', '学生', 'student', '学生账号'),
('parent', '家长', 'parent', '家长账号');
```

#### 2.1.3 权限表（permissions）

权限表定义系统的细粒度操作权限。权限按照模块和操作进行划分，格式为“模块:操作”，如student:view、student:create、student:edit、student:delete。

```sql
CREATE TABLE `permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `permission_code` VARCHAR(100) NOT NULL COMMENT '权限代码',
  `permission_name` VARCHAR(50) NOT NULL COMMENT '权限名称',
  `module` VARCHAR(50) NOT NULL COMMENT '所属模块',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '权限描述',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permission_code` (`permission_code`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 初始化权限数据（部分）
INSERT INTO `permissions` (`permission_code`, `permission_name`, `module`, `description`) VALUES
-- 系统管理
('system:user', '用户管理', 'system', '管理系统用户'),
('system:role', '角色管理', 'system', '管理角色和权限'),
('system:log', '系统日志', 'system', '查看系统日志'),
-- 学生管理
('student:view', '查看学生', 'student', '查看学生信息'),
('student:create', '新增学生', 'student', '添加新生'),
('student:edit', '编辑学生', 'student', '修改学生信息'),
('student:delete', '删除学生', 'student', '删除学生记录'),
('student:import', '导入学生', 'student', '批量导入学生'),
('student:export', '导出学生', 'student', '导出学生数据'),
-- 成绩管理
('score:view', '查看成绩', 'score', '查看成绩数据'),
('score:input', '录入成绩', 'score', '录入学生成绩'),
('score:edit', '修改成绩', 'score', '修改成绩数据'),
('score:publish', '发布成绩', 'score', '发布成绩给学生查看'),
('score:analysis', '成绩分析', 'score', '查看成绩统计分析'),
-- 课表管理
('schedule:view', '查看课表', 'schedule', '查看课表安排'),
('schedule:create', '编排课表', 'schedule', '编排课程表'),
('schedule:adjust', '调整课表', 'schedule', '调整课表安排'),
-- 考勤管理
('attendance:view', '查看考勤', 'attendance', '查看考勤记录'),
('attendance:input', '录入考勤', 'attendance', '登记学生考勤'),
('attendance:approve', '审批考勤', 'attendance', '审批请假申请');
```

#### 2.1.4 用户角色关联表（user_roles）

用户角色关联表建立用户与角色的多对多关系。一个用户可以拥有多个角色，用户的所有权限是各角色权限的并集。

```sql
CREATE TABLE `user_roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';
```

#### 2.1.5 角色权限关联表（role_permissions）

角色权限关联表建立角色与权限的多对多关系。通过该表实现基于角色的访问控制（RBAC）。

```sql
CREATE TABLE `role_permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';
```

### 2.2 学生信息相关表

#### 2.2.1 学生表（students）

学生表存储学生的详细信息，包括基本资料、家庭信息、入学信息等。学生记录与用户账号关联，家长账号也与学生记录关联。

```sql
CREATE TABLE `students` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '学生ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户账号ID',
  `student_no` VARCHAR(50) NOT NULL COMMENT '学号',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `gender` TINYINT NOT NULL DEFAULT 1 COMMENT '性别：1男，2女',
  `birth_date` DATE NOT NULL COMMENT '出生日期',
  `id_card` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
  `academic_status` TINYINT NOT NULL DEFAULT 1 COMMENT '在读状态：1在读，2休学，3转学，4退学，5毕业',
  `grade_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属年级ID',
  `class_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属班级ID',
  `enrollment_year` INT NOT NULL COMMENT '入学年份',
  `enrollment_type` VARCHAR(20) DEFAULT NULL COMMENT '入学方式',
  `origin` VARCHAR(100) DEFAULT NULL COMMENT '籍贯',
  `nation` VARCHAR(20) DEFAULT NULL COMMENT '民族',
  `political_status` VARCHAR(20) DEFAULT NULL COMMENT '政治面貌',
  `photo` VARCHAR(255) DEFAULT NULL COMMENT '照片URL',
  -- 家庭信息
  `guardian_name` VARCHAR(50) DEFAULT NULL COMMENT '监护人姓名',
  `guardian_relation` VARCHAR(20) DEFAULT NULL COMMENT '与监护人关系',
  `guardian_phone` VARCHAR(20) DEFAULT NULL COMMENT '监护人电话',
  `guardian_id_card` VARCHAR(18) DEFAULT NULL COMMENT '监护人身份证',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '家庭住址',
  -- 学籍信息
  `student_status` TINYINT NOT NULL DEFAULT 1 COMMENT '学籍状态：1学籍正常，2学籍待审核，3学籍异常',
  `student_type` TINYINT NOT NULL DEFAULT 1 COMMENT '学生类型：1初中生，2高中生',
  `graduation_school` VARCHAR(100) DEFAULT NULL COMMENT '毕业学校',
  `graduation_no` VARCHAR(50) DEFAULT NULL COMMENT '毕业证书编号',
  -- 备注
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  -- 时间戳
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_no` (`student_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_grade_id` (`grade_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_academic_status` (`academic_status`),
  KEY `idx_enrollment_year` (`enrollment_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生表';
```

#### 2.2.2 家长关联表（student_parents）

家长关联表建立学生与家长的关联关系。一个学生可以关联多个家长，一个家长可以关联多个学生。

```sql
CREATE TABLE `student_parents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `parent_user_id` BIGINT UNSIGNED NOT NULL COMMENT '家长用户ID',
  `relation` VARCHAR(20) NOT NULL COMMENT '与学生关系：父亲、母亲、其他',
  `is_primary` TINYINT NOT NULL DEFAULT 0 COMMENT '是否主要联系人：0否，1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_parent` (`student_id`, `parent_user_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_parent_user_id` (`parent_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家长学生关联表';
```

### 2.3 教师信息相关表

#### 2.3.1 教师表（teachers）

教师表存储教职工的详细信息，包括基本资料、工作信息、资质信息等。每位教师对应一个用户账号。

```sql
CREATE TABLE `teachers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '教师ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户账号ID',
  `teacher_no` VARCHAR(50) NOT NULL COMMENT '工号',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `gender` TINYINT NOT NULL DEFAULT 1 COMMENT '性别：1男，2女',
  `birth_date` DATE DEFAULT NULL COMMENT '出生日期',
  `id_card` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `nation` VARCHAR(20) DEFAULT NULL COMMENT '民族',
  `political_status` VARCHAR(20) DEFAULT NULL COMMENT '政治面貌',
  `photo` VARCHAR(255) DEFAULT NULL COMMENT '照片URL',
  -- 工作信息
  `department` VARCHAR(50) DEFAULT NULL COMMENT '所属部门',
  `position` VARCHAR(50) DEFAULT NULL COMMENT '岗位',
  `title` VARCHAR(50) DEFAULT NULL COMMENT '职称',
  `employment_type` VARCHAR(20) DEFAULT NULL COMMENT '用工性质：正式、合同制',
  `hire_date` DATE DEFAULT NULL COMMENT '入职日期',
  -- 资质信息
  `education` VARCHAR(20) DEFAULT NULL COMMENT '学历',
  `degree` VARCHAR(20) DEFAULT NULL COMMENT '学位',
  `major` VARCHAR(50) DEFAULT NULL COMMENT '专业',
  `graduation_school` VARCHAR(100) DEFAULT NULL COMMENT '毕业院校',
  `qualification_no` VARCHAR(50) DEFAULT NULL COMMENT '教师资格证编号',
  -- 状态
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0离职，1在职',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  -- 时间戳
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teacher_no` (`teacher_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师表';
```

#### 2.3.2 教师任课表（teacher_courses）

教师任课表记录教师的授课信息，建立教师、课程、班级之间的关联关系。

```sql
CREATE TABLE `teacher_courses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `teacher_id` BIGINT UNSIGNED NOT NULL COMMENT '教师ID',
  `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
  `grade_id` BIGINT UNSIGNED NOT NULL COMMENT '年级ID',
  `class_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '班级ID（若为年级统一课程则为空）',
  `academic_year` INT NOT NULL COMMENT '学年',
  `semester` TINYINT NOT NULL COMMENT '学期：1上学期，2下学期',
  `is_head_teacher` TINYINT NOT NULL DEFAULT 0 COMMENT '是否班主任：0否，1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_grade_id` (`grade_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_academic_year_semester` (`academic_year`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师任课表';
```

### 2.4 组织架构相关表

#### 2.4.1 年级表（grades）

年级表存储学校的年级信息。高完中包含初一到高三共六个年级，需要区分初中和高中两个学段。

```sql
CREATE TABLE `grades` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '年级ID',
  `grade_name` VARCHAR(50) NOT NULL COMMENT '年级名称',
  `grade_level` TINYINT NOT NULL COMMENT '年级级别：1初一，2初二，3初三，4高一，5高二，6高三',
  `section` TINYINT NOT NULL COMMENT '学段：1初中，2高中',
  `academic_year` INT NOT NULL COMMENT '所属学年',
  `grade_leader_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '年级组长ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0已结束，1进行中',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_grade_level_year` (`grade_level`, `academic_year`),
  KEY `idx_section` (`section`),
  KEY `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='年级表';
```

#### 2.4.2 班级表（classes）

班级表存储班级的详细信息，包括班级类型、教室、班主任等信息。

```sql
CREATE TABLE `classes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '班级ID',
  `class_name` VARCHAR(50) NOT NULL COMMENT '班级名称',
  `grade_id` BIGINT UNSIGNED NOT NULL COMMENT '所属年级ID',
  `class_type` VARCHAR(20) DEFAULT NULL COMMENT '班级类型：普通、实验、重点、艺术、体育',
  `room_no` VARCHAR(20) DEFAULT NULL COMMENT '教室号',
  `teacher_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '班主任ID',
  `student_count` INT NOT NULL DEFAULT 0 COMMENT '学生人数',
  `max_students` INT NOT NULL DEFAULT 50 COMMENT '最大学生数',
  `academic_year` INT NOT NULL COMMENT '学年',
  `semester` TINYINT NOT NULL COMMENT '学期：1上学期，2下学期',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0已解散，1进行中',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_grade_id` (`grade_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_academic_year_semester` (`academic_year`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班级表';
```

### 2.5 课程相关表

#### 2.5.1 课程表（courses）

课程表存储学校开设的课程信息。课程区分必修课和选修课，不同学段有不同的课程体系。

```sql
CREATE TABLE `courses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '课程ID',
  `course_code` VARCHAR(50) NOT NULL COMMENT '课程代码',
  `course_name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `course_type` TINYINT NOT NULL DEFAULT 1 COMMENT '课程类型：1必修，2选修，3限定选修',
  `subject` VARCHAR(50) NOT NULL COMMENT '所属学科',
  `section` TINYINT NOT NULL COMMENT '适用学段：1初中，2高中，3初中高中',
  `grade_levels` VARCHAR(50) DEFAULT NULL COMMENT '适用年级，如"1,2,3"表示初一初二初三',
  `credit` DECIMAL(3,1) DEFAULT NULL COMMENT '学分',
  `hours` INT DEFAULT NULL COMMENT '总课时',
  `is_exam_course` TINYINT NOT NULL DEFAULT 1 COMMENT '是否考试科目：0否，1是',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '课程简介',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0停用，1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_code` (`course_code`),
  KEY `idx_section` (`section`),
  KEY `idx_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';
```

### 2.6 成绩相关表

#### 2.6.1 考试表（exams）

考试表存储各类考试的基本信息，包括期中期末考试、月考、模拟考等。

```sql
CREATE TABLE `exams` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '考试ID',
  `exam_name` VARCHAR(100) NOT NULL COMMENT '考试名称',
  `exam_type` TINYINT NOT NULL COMMENT '考试类型：1期中，2期末，3月考，4模拟，5调研',
  `academic_year` INT NOT NULL COMMENT '学年',
  `semester` TINYINT NOT NULL COMMENT '学期：1上学期，2下学期',
  `grade_ids` VARCHAR(100) DEFAULT NULL COMMENT '参考年级，逗号分隔',
  `start_date` DATE NOT NULL COMMENT '开始日期',
  `end_date` DATE NOT NULL COMMENT '结束日期',
  `total_score` DECIMAL(5,1) NOT NULL DEFAULT 100 COMMENT '总分',
  `pass_score` DECIMAL(5,1) NOT NULL DEFAULT 60 COMMENT '及格线',
  `is_published` TINYINT NOT NULL DEFAULT 0 COMMENT '是否发布：0未发布，1已发布',
  `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
  `creator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_academic_year_semester` (`academic_year`, `semester`),
  KEY `idx_exam_type` (`exam_type`),
  KEY `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考试表';
```

#### 2.6.2 成绩表（scores）

成绩表采用竖表结构存储学生成绩，每条记录包含学生ID、课程ID、考试ID、成绩分数等信息。

```sql
CREATE TABLE `scores` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '成绩ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `exam_id` BIGINT UNSIGNED NOT NULL COMMENT '考试ID',
  `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
  `score` DECIMAL(5,1) NOT NULL COMMENT '成绩分数',
  `score_type` TINYINT NOT NULL DEFAULT 1 COMMENT '成绩类型：1考试成绩，2平时成绩',
  `is补考` TINYINT NOT NULL DEFAULT 0 COMMENT '是否补考：0否，1是',
  `rank` INT DEFAULT NULL COMMENT '排名',
  `class_rank` INT DEFAULT NULL COMMENT '班级排名',
  `grade_rank` INT DEFAULT NULL COMMENT '年级排名',
  `input_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '录入人ID',
  `input_time` DATETIME DEFAULT NULL COMMENT '录入时间',
  `approved_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '审核人ID',
  `approved_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0待审核，1已审核，2已发布',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_exam_course` (`student_id`, `exam_id`, `course_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_exam_id` (`exam_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成绩表';
```

### 2.7 课表相关表

#### 2.7.1 课表表（schedules）

课表表存储班级课程表信息，记录每周每天每节课的课程安排。

```sql
CREATE TABLE `schedules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '课表ID',
  `class_id` BIGINT UNSIGNED NOT NULL COMMENT '班级ID',
  `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
  `teacher_id` BIGINT UNSIGNED NOT NULL COMMENT '教师ID',
  `weekday` TINYINT NOT NULL COMMENT '星期：1周一，2周二，3周三，4周四，5周五，6周六，7周日',
  `lesson_no` TINYINT NOT NULL COMMENT '第几节课',
  `day_section` VARCHAR(10) DEFAULT NULL COMMENT '时段：上午、下午、晚上',
  `room_no` VARCHAR(20) DEFAULT NULL COMMENT '教室',
  `week_range` VARCHAR(50) DEFAULT NULL COMMENT '上课周次，如"1-16"表示第1-16周',
  `academic_year` INT NOT NULL COMMENT '学年',
  `semester` TINYINT NOT NULL COMMENT '学期：1上学期，2下学期',
  `is_week_odd` TINYINT DEFAULT NULL COMMENT '单双周：0双周，1单周，null每周',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_weekday_lesson` (`weekday`, `lesson_no`),
  KEY `idx_academic_year_semester` (`academic_year`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课表表';
```

#### 2.7.2 课表调整表（schedule_adjustments）

课表调整表记录调课、换课、代课等课表变动信息。

```sql
CREATE TABLE `schedule_adjustments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '调整ID',
  `schedule_id` BIGINT UNSIGNED NOT NULL COMMENT '原课表ID',
  `adjust_type` TINYINT NOT NULL COMMENT '调整类型：1调课、2换课、3代课、4停课',
  `adjust_date` DATE NOT NULL COMMENT '调整日期',
  `adjust_lesson_no` TINYINT NOT NULL COMMENT '调整后第几节课',
  `adjust_course_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '调整后课程ID',
  `adjust_teacher_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '调整后教师ID',
  `adjust_room_no` VARCHAR(20) DEFAULT NULL COMMENT '调整后教室',
  `reason` VARCHAR(255) DEFAULT NULL COMMENT '调整原因',
  `apply_by` BIGINT UNSIGNED NOT NULL COMMENT '申请人ID',
  `approve_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '审批人ID',
  `approve_time` DATETIME DEFAULT NULL COMMENT '审批时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待审批，1已通过，2已拒绝',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_schedule_id` (`schedule_id`),
  KEY `idx_adjust_date` (`adjust_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课表调整表';
```

### 2.8 考勤相关表

#### 2.8.1 考勤记录表（attendance_records）

考勤记录表存储学生的日常考勤数据，包括出勤、请假、迟到、早退、旷课等情况。

```sql
CREATE TABLE `attendance_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '考勤ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `course_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '课程ID（课堂考勤时使用）',
  `attendance_date` DATE NOT NULL COMMENT '考勤日期',
  `attendance_type` TINYINT NOT NULL COMMENT '考勤类型：1出勤，2迟到，3早退，4旷课，5请假',
  `attendance_time` TIME DEFAULT NULL COMMENT '考勤时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0已销假，1正常',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `recorded_by` BIGINT UNSIGNED NOT NULL COMMENT '记录人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_date_course` (`student_id`, `attendance_date`, `course_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_attendance_date` (`attendance_date`),
  KEY `idx_attendance_type` (`attendance_type`),
  KEY `idx_recorded_by` (`recorded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤记录表';
```

#### 2.8.2 请假申请表（leave_requests）

请假申请表管理学生的请假申请，包含审批流程。

```sql
CREATE TABLE `leave_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '请假ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `leave_type` TINYINT NOT NULL COMMENT '请假类型：1事假，2病假，3其他',
  `reason` VARCHAR(500) NOT NULL COMMENT '请假原因',
  `start_date` DATE NOT NULL COMMENT '开始日期',
  `end_date` DATE NOT NULL COMMENT '结束日期',
  `total_days` DECIMAL(4,1) NOT NULL COMMENT '请假天数',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `attachments` VARCHAR(500) DEFAULT NULL COMMENT '附件URL，逗号分隔',
  `apply_by` BIGINT UNSIGNED NOT NULL COMMENT '申请人ID',
  `apply_time` DATETIME DEFAULT NULL COMMENT '申请时间',
  `approve_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '审批人ID',
  `approve_time` DATETIME DEFAULT NULL COMMENT '审批时间',
  `approve_remark` VARCHAR(255) DEFAULT NULL COMMENT '审批意见',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待审批，1已通过，2已拒绝',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请假申请表';
```

### 2.9 学籍相关表

#### 2.9.1 学籍异动表（academic_changes）

学籍异动表记录学生的学籍变动情况，包括休学、复学、转学、退学、留级等。

```sql
CREATE TABLE `academic_changes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '异动ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `change_type` TINYINT NOT NULL COMMENT '异动类型：1休学，2复学，3转学，4退学，5留级，6升级',
  `change_reason` VARCHAR(500) DEFAULT NULL COMMENT '异动原因',
  `change_date` DATE NOT NULL COMMENT '异动日期',
  `before_grade_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '异动前年级ID',
  `before_class_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '异动前班级ID',
  `after_grade_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '异动后年级ID',
  `after_class_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '异动后班级ID',
  `transfer_school` VARCHAR(100) DEFAULT NULL COMMENT '转学目标学校',
  `transfer_no` VARCHAR(50) DEFAULT NULL COMMENT '转学证号',
  `attachments` VARCHAR(500) DEFAULT NULL COMMENT '附件URL',
  `apply_by` BIGINT UNSIGNED NOT NULL COMMENT '申请人ID',
  `apply_time` DATETIME DEFAULT NULL COMMENT '申请时间',
  `approve_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '审批人ID',
  `approve_time` DATETIME DEFAULT NULL COMMENT '审批时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待审批，1已通过，2已拒绝',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_change_type` (`change_type`),
  KEY `idx_change_date` (`change_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学籍异动表';
```

### 2.10 家校互通相关表

#### 2.10.1 通知公告表（notices）

通知公告表存储学校发布的各类通知信息。

```sql
CREATE TABLE `notices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
  `content` TEXT NOT NULL COMMENT '通知内容',
  `notice_type` TINYINT NOT NULL DEFAULT 1 COMMENT '通知类型：1通知，2公告',
  `target_type` TINYINT NOT NULL DEFAULT 1 COMMENT '发布对象：1全体，2年级，3班级，4个人',
  `target_ids` VARCHAR(500) DEFAULT NULL COMMENT '目标对象ID，逗号分隔',
  `is_urgent` TINYINT NOT NULL DEFAULT 0 COMMENT '是否紧急：0否，1是',
  `publish_by` BIGINT UNSIGNED NOT NULL COMMENT '发布人ID',
  `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
  `read_count` INT NOT NULL DEFAULT 0 COMMENT '阅读次数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0草稿，1已发布，2已撤回',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_notice_type` (`notice_type`),
  KEY `idx_publish_by` (`publish_by`),
  KEY `idx_publish_time` (`publish_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知公告表';
```

#### 2.10.2 通知阅读记录表（notice_readers）

通知阅读记录表记录通知的已读状态。

```sql
CREATE TABLE `notice_readers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `notice_id` BIGINT UNSIGNED NOT NULL COMMENT '通知ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `read_time` DATETIME DEFAULT NULL COMMENT '阅读时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notice_user` (`notice_id`, `user_id`),
  KEY `idx_notice_id` (`notice_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知阅读记录表';
```

#### 2.10.3 消息表（messages）

消息表存储用户之间的私信消息。

```sql
CREATE TABLE `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `sender_id` BIGINT UNSIGNED NOT NULL COMMENT '发送者ID',
  `receiver_id` BIGINT UNSIGNED NOT NULL COMMENT '接收者ID',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0否，1是',
  `read_time` DATETIME DEFAULT NULL COMMENT '阅读时间',
  `sender_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '发送者是否删除',
  `receiver_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '接收者是否删除',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  PRIMARY KEY (`id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';
```

### 2.11 招生管理相关表

#### 2.11.1 招生报名表（enrollments）

招生报名表存储学生的报名信息。

```sql
CREATE TABLE `enrollments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '报名ID',
  `enroll_no` VARCHAR(50) NOT NULL COMMENT '报名号',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `gender` TINYINT NOT NULL COMMENT '性别：1男，2女',
  `birth_date` DATE NOT NULL COMMENT '出生日期',
  `id_card` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `guardian_name` VARCHAR(50) NOT NULL COMMENT '监护人姓名',
  `guardian_phone` VARCHAR(20) NOT NULL COMMENT '监护人电话',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '家庭住址',
  `origin` VARCHAR(100) DEFAULT NULL COMMENT '籍贯',
  `graduation_school` VARCHAR(100) DEFAULT NULL COMMENT '毕业学校',
  `enroll_type` TINYINT NOT NULL DEFAULT 1 COMMENT '报名类型：1初中入学，2高中入学',
  `enroll_year` INT NOT NULL COMMENT '报名年份',
  `first_choice` TINYINT DEFAULT NULL COMMENT '第一志愿：1统招，2定向',
  `score` DECIMAL(5,1) DEFAULT NULL COMMENT '中考成绩',
  `interview_score` DECIMAL(5,1) DEFAULT NULL COMMENT '面试成绩',
  `total_score` DECIMAL(5,1) DEFAULT NULL COMMENT '总分',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待审核，1已录取，2未录取，3已报到',
  `enroll_time` DATETIME DEFAULT NULL COMMENT '录取时间',
  `report_time` DATETIME DEFAULT NULL COMMENT '报到时间',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_enroll_no` (`enroll_no`),
  KEY `idx_id_card` (`id_card`),
  KEY `idx_phone` (`phone`),
  KEY `idx_enroll_year` (`enroll_year`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招生报名表';
```

### 2.12 财务管理相关表

#### 2.12.1 收费项目表（charge_items）

收费项目表定义学校的各类收费项目。

```sql
CREATE TABLE `charge_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `item_name` VARCHAR(100) NOT NULL COMMENT '项目名称',
  `item_type` TINYINT NOT NULL COMMENT '项目类型：1学费，2住宿费，3餐费，4代收费',
  `charge_standard` DECIMAL(10,2) NOT NULL COMMENT '收费标准',
  `charge_unit` VARCHAR(20) DEFAULT NULL COMMENT '计费单位：学期、学期',
  `applicable_grades` VARCHAR(100) DEFAULT NULL COMMENT '适用年级，逗号分隔',
  `academic_year` INT NOT NULL COMMENT '学年',
  `semester` TINYINT DEFAULT NULL COMMENT '学期：1上学期，2下学期',
  `deadline` DATE DEFAULT NULL COMMENT '缴费截止日期',
  `is_required` TINYINT NOT NULL DEFAULT 1 COMMENT '是否必须：0否，1是',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0停用，1启用',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_item_type` (`item_type`),
  KEY `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收费项目表';
```

#### 2.12.2 缴费记录表（payment_records）

缴费记录表记录学生的缴费情况。

```sql
CREATE TABLE `payment_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '缴费ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `charge_item_id` BIGINT UNSIGNED NOT NULL COMMENT '收费项目ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '缴费金额',
  `payment_method` TINYINT DEFAULT NULL COMMENT '缴费方式：1现金，2转账，3线上支付',
  `payment_time` DATETIME DEFAULT NULL COMMENT '缴费时间',
  `payment_no` VARCHAR(50) DEFAULT NULL COMMENT '缴费单号',
  `operator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作人ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0未缴费，1已缴费，2已退款',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_charge_item_id` (`charge_item_id`),
  KEY `idx_payment_time` (`payment_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='缴费记录表';
```

### 2.13 系统配置相关表

#### 2.13.1 系统配置表（system_configs）

系统配置表存储系统的各类配置参数。

```sql
CREATE TABLE `system_configs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(50) NOT NULL COMMENT '配置键',
  `config_value` TEXT DEFAULT NULL COMMENT '配置值',
  `config_type` VARCHAR(20) DEFAULT NULL COMMENT '配置类型',
  `config_desc` VARCHAR(100) DEFAULT NULL COMMENT '配置描述',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 初始化系统配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `config_desc`) VALUES
('school_name', '某某中学', 'basic', '学校名称'),
('school_code', '', 'basic', '学校代码'),
('academic_year', '2025', 'academic', '当前学年'),
('semester', '1', 'academic', '当前学期'),
('score_precision', '1', 'score', '成绩小数位数'),
('pass_score', '60', 'score', '及格分数'),
('class_max_students', '50', 'class', '班级最大人数'),
('admin_email', '', 'system', '管理员邮箱');
```

#### 2.13.2 操作日志表（operation_logs）

操作日志表记录用户的操作行为，用于审计和追溯。

```sql
CREATE TABLE `operation_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作用户ID',
  `username` VARCHAR(50) DEFAULT NULL COMMENT '操作用户名',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '操作人姓名',
  `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
  `action` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  `path` VARCHAR(200) DEFAULT NULL COMMENT '请求路径',
  `params` TEXT DEFAULT NULL COMMENT '请求参数',
  `result` TEXT DEFAULT NULL COMMENT '返回结果',
  `ip` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  `status` TINYINT DEFAULT NULL COMMENT '操作状态',
  `error_msg` VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
```

## 三、ER图设计

### 3.1 核心实体关系

系统核心实体关系如下。用户（users）与学生（students）为一对一关系，每个学生对应一个用户账号。用户与教师（teachers）同样为一对一关系。教师与用户账号的关联通过user_id字段实现。用户与家长也通过用户账号关联。

用户（users）与角色（roles）为多对多关系，通过user_roles关联表实现。角色（roles）与权限（permissions）为多对多关系，通过role_permissions关联表实现。这种基于角色的访问控制（RBAC）模型能够灵活管理系统权限。

学生（students）与班级（classes）为多对一关系，一个学生属于一个班级。班级（classes）与年级（grades）为多对一关系，一个年级包含多个班级。教师（teachers）与班级通过teacher_courses表建立多对多关系，一位教师可以教授多个班级。

学生（students）与成绩（scores）为多对一关系，一位学生有多条成绩记录。成绩（scores）与考试（exams）关联，考试与课程（courses）关联。学生与考勤记录（attendance_records）为多对一关系。

学生（students）与家长通过student_parents表建立多对多关系，一位学生可以关联多位家长，一位家长可以关联多位学生。通知公告（notices）与用户通过notice_readers表记录已读状态。

### 3.2 数据流向

数据流向遵循以下规律。管理端数据由管理员、教务主任、年级组长、班主任、任课教师录入，包括学生信息、成绩数据、考勤记录、课表安排等。系统自动处理数据计算，如成绩统计、排名计算、考勤汇总等。

数据呈现给学生端和家长端。学生可以查看个人信息、课表、成绩、考勤、通知等数据。家长可以查看子女的各类信息，接收通知，与教师沟通。

数据支持导出和打印，包括学生名册、成绩单、考勤报表等。系统日志记录所有操作行为，支持审计追溯。

## 四、索引设计

### 4.1 主键索引

每个表的主键id字段自动创建主键索引，确保记录的唯一性和快速定位。

### 4.2 唯一索引

唯一索引用于确保字段值的唯一性。users表的username字段创建唯一索引，避免用户名重复。students表的student_no字段创建唯一索引，确保学号唯一。teachers表的teacher_no字段创建唯一索引，确保工号唯一。

### 4.3 普通索引

普通索引用于加速查询。students表的grade_id、class_id、academic_status等字段创建索引，加速学生筛选查询。scores表的student_id、exam_id、course_id字段创建索引，加速成绩查询。attendance_records表的student_id、attendance_date字段创建索引，加速考勤查询。

### 4.4 复合索引

复合索引用于加速多字段查询。scores表创建（student_id、exam_id、course_id）的复合索引，加速单学生单考试单课程的成绩查询。schedules表创建（class_id、weekday、lesson_no）的复合索引，加速课表查询。operation_logs表创建（user_id、created_at）的复合索引，加速用户操作日志查询。

## 五、数据初始化

### 5.1 初始账号

系统初始化以下默认账号。系统管理员账号：admin，密码：admin123。测试教师账号：teacher01，密码：teacher01。测试学生账号：student01，密码：student01。

### 5.2 基础数据

系统初始化基础数据包括：角色定义、权限定义、系统配置、示例年级（2025级高一至高三）、示例课程（语文、数学、英语等）。

## 六、数据字典

### 6.1 枚举值说明

性别：1男，2女。用户类型：admin管理员，teacher教师，student学生，parent家长。账号状态：0禁用，1正常。学段：1初中，2高中。年级级别：1初一，2初二，3初三，4高一，5高二，6高三。在读状态：1在读，2休学，3转学，4退学，5毕业。考试类型：1期中，2期末，3月考，4模拟，5调研。考勤类型：1出勤，2迟到，3早退，4旷课，5请假。请假类型：1事假，2病假，3其他。异动类型：1休学，2复学，3转学，4退学，5留级，6升级。状态通用：0否，1是。
