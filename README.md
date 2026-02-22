# 高完中教务管理系统

基于 Vue3 + Node.js 的高完中教务管理系统。

## 技术栈

### 前端
- Vue 3 + Composition API
- Vite 构建工具
- Element Plus UI 组件库
- Pinia 状态管理
- Vue Router 路由管理

### 后端
- Node.js + Express
- Sequelize ORM
- MySQL 数据库
- JWT 认证

## 项目结构

```
educational-admin/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 公共组件
│   │   ├── layouts/       # 布局组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # 状态管理
│   │   ├── styles/        # 全局样式
│   │   ├── views/         # 页面组件
│   │   └── main.js        # 入口文件
│   └── package.json
├── server/                # 后端项目
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── models/            # 数据模型
│   ├── routes/            # 路由配置
│   ├── middlewares/       # 中间件
│   ├── scripts/           # 脚本
│   ├── app.js            # 应用入口
│   └── package.json
└── docs/                  # 项目文档
```

## 快速开始

### 1. 环境要求
- Node.js 16+
- MySQL 5.7+

### 2. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 3. 配置数据库

创建 MySQL 数据库：
```sql
CREATE DATABASE educational_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

修改 `server/.env` 中的数据库配置：
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=educational_admin
DB_USER=root
DB_PASSWORD=your_password
```

### 4. 初始化数据库

```bash
cd server
npm run init
```

这将创建所有数据表并插入初始数据。

### 5. 启动服务

```bash
# 启动后端 (端口 3000)
cd server
npm run dev

# 启动前端 (端口 5173)
cd client
npm run dev
```

### 6. 访问系统

打开浏览器访问 http://localhost:5173

默认管理员账号：
- 用户名：admin
- 密码：admin123

## 功能模块

- 用户认证与权限管理 (RBAC)
- 学生信息管理
- 教师信息管理
- 年级班级管理
- 课程管理
- 考试管理
- 成绩管理
- 课表管理
- 考勤管理
- 通知公告
- 招生管理
- 财务管理

## 开发说明

### 前端开发
```bash
cd client
npm run dev      # 开发模式
npm run build    # 生产构建
```

### 后端开发
```bash
cd server
npm run dev      # 开发模式 (热重载)
npm start        # 生产模式
```

### 初始化数据
```bash
cd server
npm run init     # 初始化数据库
```

## License

MIT
