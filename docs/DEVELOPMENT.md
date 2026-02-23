# 岳各庄学校教务管理系统 - 开发文档

## 1. 项目概述

### 1.1 项目简介

岳各庄学校教务管理系统是一套基于 Vue3 + Node.js 的高完中（高级中学）教务管理平台，用于管理学校的日常教务工作，包括学生信息管理、教师管理、课程安排、考试管理、成绩管理、财务管理等核心功能。

### 1.2 技术栈

#### 前端技术
- **框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **网络请求**: Axios
- **样式方案**: SCSS

#### 后端技术
- **运行时**: Node.js
- **框架**: Express.js
- **ORM**: Sequelize
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcryptjs

### 1.3 项目结构

```
yuekegu_jiaowu/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/          # API 接口封装
│   │   ├── components/   # 公共组件
│   │   ├── layouts/      # 布局组件
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # Pinia 状态管理
│   │   ├── styles/       # 全局样式
│   │   ├── views/        # 页面组件
│   │   └── main.js       # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                # 后端项目
│   ├── config/           # 配置文件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由接口
│   ├── middlewares/     # 中间件
│   ├── scripts/         # 脚本工具
│   ├── tests/           # 单元测试
│   ├── app.js          # 应用入口
│   └── package.json
├── docs/                 # 项目文档
│   ├── SPEC.md         # 需求规格说明
│   └── database.md     # 数据库设计
├── mcp.json             # MCP配置
└── README.md            # 项目说明
```

---

## 2. 功能模块

### 2.1 用户认证模块

- **登录**: 用户名密码登录，支持 JWT token 认证
- **注册**: 新用户注册（需管理员审核）
- **Token刷新**: 自动刷新过期 token
- **权限控制**: 基于 RBAC 的权限管理

### 2.2 用户管理

- **用户列表**: 分页展示用户，支持搜索筛选
- **用户详情**: 查看用户详细信息及关联角色
- **创建用户**: 新建系统用户
- **编辑用户**: 修改用户信息
- **禁用/启用**: 禁用/启用用户账号
- **密码修改**: 修改用户密码

### 2.3 角色权限管理

- **角色管理**: 创建、编辑、删除角色
- **权限管理**: 配置角色权限
- **权限继承**: 支持角色权限继承

### 2.4 学生管理

- **学生档案**: 记录学生基本信息（姓名、性别、出生日期、籍贯等）
- **学号管理**: 自动生成学号
- **班级分配**: 将学生分配到班级
- **学籍状态**: 在籍、转学、退学等状态管理
- **家长信息**: 记录家长联系方式

### 2.5 教师管理

- **教师档案**: 记录教师基本信息
- **工号管理**: 自动生成工号
- **部门管理**: 所属教研组/部门
- **职称管理**: 职称评定信息
- **任教课程**: 分配的授课课程

### 2.6 年级班级管理

- **年级管理**: 年级设置（一年级、二年级...）
- **班级管理**: 班级创建、编辑、删除
- **班主任分配**: 分配班主任
- **学生分配**: 将学生分配到班级
- **班级容量**: 设定班级人数上限

### 2.7 课程管理

- **课程设置**: 创建课程（语文、数学、英语等）
- **课程类型**: 必修课、选修课
- **学分设置**: 课程学分
- **适用年级**: 课程适用的年级

### 2.8 考试管理

- **考试创建**: 创建期中考、期末考等
- **考试安排**: 设置考试时间、科目
- **成绩录入**: 录入学生成绩
- **成绩审核**: 成绩审核流程

### 2.9 成绩管理

- **成绩录入**: 按班级/科目录入成绩
- **成绩查询**: 查询学生成绩
- **成绩统计**: 平均分、及格率、优秀率
- **成绩分析**: 成绩趋势分析

### 2.10 课表管理

- **课表编排**: 按班级/教师编排课表
- **教室分配**: 分配教室
- **课表查询**: 查看个人课表
- **调课处理**: 临时调课申请

### 2.11 考勤管理

- **考勤记录**: 记录学生出勤情况
- **考勤统计**: 出勤率统计
- **考勤报表**: 生成考勤报表

### 2.12 通知公告

- **发布通知**: 发布系统通知
- **通知类型**: 普通通知、紧急通知
- **通知范围**: 全校/班级/个人

### 2.13 招生管理

- **报名登记**: 学生报名信息登记
- **资格审核**: 审核报名资格
- **录取管理**: 录取结果管理

### 2.14 财务管理

- **收费项目**: 设置收费项目（学费、住宿费、餐费等）
- **缴费记录**: 记录学生缴费情况
- **欠费提醒**: 欠费学生提醒

### 2.15 数据分析

- **统计面板**: 展示关键数据指标
- **成绩分析**: 成绩分布、趋势分析
- **考勤分析**: 出勤率分析

---

## 3. 数据库设计

### 3.1 核心表结构

#### users - 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 密码哈希 |
| user_type | ENUM | 用户类型(admin/teacher/student/parent) |
| real_name | VARCHAR(50) | 真实姓名 |
| phone | VARCHAR(20) | 电话 |
| email | VARCHAR(100) | 邮箱 |
| avatar | VARCHAR(255) | 头像 |
| status | TINYINT | 状态(0禁用/1启用) |
| last_login_at | DATETIME | 最后登录时间 |
| last_login_ip | VARCHAR(45) | 最后登录IP |

#### roles - 角色表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| role_code | VARCHAR(50) | 角色代码（唯一） |
| role_name | VARCHAR(50) | 角色名称 |
| role_type | ENUM | 角色类型 |
| description | VARCHAR(255) | 描述 |
| status | TINYINT | 状态 |

#### permissions - 权限表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| permission_code | VARCHAR(100) | 权限代码（唯一） |
| permission_name | VARCHAR(50) | 权限名称 |
| module | VARCHAR(50) | 所属模块 |
| description | VARCHAR(255) | 描述 |

#### students - 学生表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| user_id | BIGINT | 关联用户ID |
| student_no | VARCHAR(50) | 学号（唯一） |
| name | VARCHAR(50) | 姓名 |
| gender | TINYINT | 性别(1男/2女) |
| birth_date | DATE | 出生日期 |
| id_card | VARCHAR(18) | 身份证号 |
| grade_id | BIGINT | 年级ID |
| class_id | BIGINT | 班级ID |
| enrollment_year | INT | 入学年份 |
| guardian_name | VARCHAR(50) | 监护人姓名 |
| guardian_phone | VARCHAR(20) | 监护人电话 |
| address | VARCHAR(255) | 地址 |

#### teachers - 教师表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| user_id | BIGINT | 关联用户ID |
| teacher_no | VARCHAR(50) | 工号（唯一） |
| name | VARCHAR(50) | 姓名 |
| gender | TINYINT | 性别 |
| phone | VARCHAR(20) | 电话 |
| email | VARCHAR(100) | 邮箱 |
| department | VARCHAR(50) | 部门 |
| position | VARCHAR(50) | 职位 |
| title | VARCHAR(50) | 职称 |
| hire_date | DATE | 入职日期 |
| education | VARCHAR(20) | 学历 |
| major | VARCHAR(50) | 专业 |

#### grades - 年级表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| grade_name | VARCHAR(50) | 年级名称 |
| grade_level | TINYINT | 年级级别(1-3) |
| section | TINYINT | 学部(1高中/2初中) |
| academic_year | INT | 学年 |
| grade_leader_id | BIGINT | 年级组长ID |
| status | TINYINT | 状态 |

#### classes - 班级表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| class_name | VARCHAR(50) | 班级名称 |
| grade_id | BIGINT | 所属年级 |
| class_type | VARCHAR(20) | 班级类型 |
| room_no | VARCHAR(20) | 教室号 |
| teacher_id | BIGINT | 班主任ID |
| student_count | INT | 学生人数 |
| max_students | INT | 最大人数 |
| academic_year | INT | 学年 |
| semester | TINYINT | 学期 |

#### courses - 课程表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| course_code | VARCHAR(50) | 课程代码 |
| course_name | VARCHAR(100) | 课程名称 |
| course_type | TINYINT | 课程类型 |
| subject | VARCHAR(50) | 学科 |
| credit | DECIMAL(3,1) | 学分 |
| hours | INT | 学时 |

#### exams - 考试表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| exam_name | VARCHAR(100) | 考试名称 |
| exam_type | TINYINT | 考试类型 |
| academic_year | INT | 学年 |
| semester | TINYINT | 学期 |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| total_score | DECIMAL(5,1) | 总分 |
| pass_score | DECIMAL(5,1) | 及格分 |
| is_published | TINYINT | 是否发布 |

#### scores - 成绩表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| student_id | BIGINT | 学生ID |
| exam_id | BIGINT | 考试ID |
| course_id | BIGINT | 课程ID |
| score | DECIMAL(5,1) | 分数 |
| score_type | TINYINT | 成绩类型 |
| rank | INT | 排名 |
| class_rank | INT | 班级排名 |

#### schedules - 课表表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| class_id | BIGINT | 班级ID |
| course_id | BIGINT | 课程ID |
| teacher_id | BIGINT | 教师ID |
| weekday | TINYINT | 星期(1-7) |
| lesson_no | TINYINT | 第几节课 |
| room_no | VARCHAR(20) | 教室 |
| academic_year | INT | 学年 |
| semester | TINYINT | 学期 |

#### attendance_records - 考勤记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| student_id | BIGINT | 学生ID |
| course_id | BIGINT | 课程ID |
| attendance_date | DATE | 考勤日期 |
| attendance_type | TINYINT | 考勤类型 |
| status | TINYINT | 状态 |
| recorded_by | BIGINT | 记录人 |

#### notices - 通知公告表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 内容 |
| notice_type | TINYINT | 通知类型 |
| is_urgent | TINYINT | 是否紧急 |
| publish_by | BIGINT | 发布人 |
| status | TINYINT | 状态 |

#### enrollments - 招生报名表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| enroll_no | VARCHAR(50) | 报名编号 |
| name | VARCHAR(50) | 学生姓名 |
| gender | TINYINT | 性别 |
| birth_date | DATE | 出生日期 |
| phone | VARCHAR(20) | 联系电话 |
| guardian_name | VARCHAR(50) | 监护人姓名 |
| enroll_year | INT | 报名年份 |
| status | TINYINT | 状态 |

#### payment_records - 缴费记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| student_id | BIGINT | 学生ID |
| charge_item_id | BIGINT | 收费项目ID |
| amount | DECIMAL(10,2) | 金额 |
| payment_method | TINYINT | 支付方式 |
| status | TINYINT | 状态 |

---

## 4. API接口文档

### 4.1 认证接口

#### POST /api/auth/login
登录接口

**请求参数:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "username": "admin",
    "realName": "管理员",
    "userType": "admin",
    "avatar": ""
  }
}
```

#### GET /api/auth/info
获取当前用户信息

**请求头:**
```
Authorization: Bearer <token>
```

#### POST /api/auth/register
用户注册

### 4.2 用户管理

#### GET /api/users
获取用户列表

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量
- `username`: 用户名（模糊搜索）
- `userType`: 用户类型
- `status`: 状态

#### POST /api/users
创建用户

#### PUT /api/users/:id
更新用户

#### DELETE /api/users/:id
禁用用户

### 4.3 角色权限

#### GET /api/roles
获取角色列表

#### POST /api/roles
创建角色

#### GET /api/permissions
获取权限列表

### 4.4 学生管理

#### GET /api/students
获取学生列表

#### POST /api/students
创建学生

#### PUT /api/students/:id
更新学生信息

### 4.5 教师管理

#### GET /api/teachers
获取教师列表

#### POST /api/teachers
创建教师

### 4.6 年级管理

#### GET /api/grades
获取年级列表

#### POST /api/grades
创建年级

### 4.7 班级管理

#### GET /api/classes
获取班级列表

#### POST /api/classes
创建班级

### 4.8 课程管理

#### GET /api/courses
获取课程列表

#### POST /api/courses
创建课程

### 4.9 考试管理

#### GET /api/exams
获取考试列表

#### POST /api/exams
创建考试

### 4.10 成绩管理

#### GET /api/scores
获取成绩列表

#### POST /api/scores
录入成绩

### 4.11 课表管理

#### GET /api/schedules
获取课表

#### POST /api/schedules
创建课表

### 4.12 考勤管理

#### GET /api/attendance
获取考勤记录

#### POST /api/attendance
记录考勤

### 4.13 通知管理

#### GET /api/notices
获取通知列表

#### POST /api/notices
发布通知

### 4.14 招生管理

#### GET /api/enrollments
获取报名列表

#### POST /api/en报名

### rollments
创建4.15 财务管理

#### GET /api/finance
获取缴费记录

#### POST /api/finance
创建缴费记录

### 4.16 数据分析

#### GET /api/analysis/dashboard
获取仪表盘数据

#### GET /api/analysis/scores
获取成绩分析

---

## 5. 开发指南

### 5.1 开发环境搭建

#### 1. 克隆项目
```bash
git clone https://github.com/dajjwwx/yuekegu_jiaowu.git
cd yuekegu_jiaowu
```

#### 2. 安装后端依赖
```bash
cd server
npm install
```

#### 3. 安装前端依赖
```bash
cd client
npm install
```

#### 4. 配置数据库

创建 MySQL 数据库：
```sql
CREATE DATABASE yuekegu_jiaowu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

修改 `server/.env` 配置：
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yuekegu_jiaowu
DB_USER=root
DB_PASSWORD=your_password
```

#### 5. 初始化数据库
```bash
cd server
npm run init
```

#### 6. 启动开发服务

后端服务：
```bash
cd server
npm run dev
```

前端服务：
```bash
cd client
npm run dev
```

### 5.2 运行测试

```bash
cd server
npm test
```

### 5.3 添加新功能

#### 后端新增接口步骤

1. 在 `server/routes/` 目录创建路由文件
2. 在 `server/models/` 目录定义数据模型（如需要）
3. 在 `server/app.js` 注册路由
4. 编写单元测试

#### 前端新增页面步骤

1. 在 `client/src/views/` 目录创建页面组件
2. 在 `client/src/router/index.js` 添加路由
3. 在 `client/src/api/` 封装接口（如需要）

### 5.4 代码规范

- 使用 ES6+ 语法
- 变量命名使用 camelCase
- 常量命名使用 UPPER_SNAKE_CASE
- Vue 组件使用 Composition API
- 接口返回统一使用 JSON 格式

---

## 6. 部署说明

### 6.1 生产环境构建

#### 后端构建
```bash
cd server
npm run build  # 如有构建脚本
```

#### 前端构建
```bash
cd client
npm run build
```

### 6.2 环境变量

生产环境需要配置以下环境变量：
- `NODE_ENV=production`
- `PORT=3000`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`

---

## 7. 常见问题

### 7.1 数据库连接失败
- 检查 MySQL 服务是否启动
- 检查数据库配置是否正确

### 7.2 前端无法访问后端
- 检查后端服务是否启动
- 检查跨域配置

### 7.3 Token 过期
- 重新登录获取新 token

---

## 8. 更新日志

### v1.0.0 (2024-xx-xx)
- 初始版本发布
- 完成基础功能模块开发
- 添加单元测试覆盖

---

## 9. 许可证

MIT License
