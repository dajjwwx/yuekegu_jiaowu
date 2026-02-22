import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/students/index.vue'),
        meta: { title: '学生管理', permission: 'student:view' }
      },
      {
        path: 'teachers',
        name: 'Teachers',
        component: () => import('@/views/teachers/index.vue'),
        meta: { title: '教师管理', permission: 'teacher:view' }
      },
      {
        path: 'grades',
        name: 'Grades',
        component: () => import('@/views/grades/index.vue'),
        meta: { title: '年级管理', permission: 'grade:view' }
      },
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('@/views/classes/index.vue'),
        meta: { title: '班级管理', permission: 'class:view' }
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('@/views/courses/index.vue'),
        meta: { title: '课程管理', permission: 'course:view' }
      },
      {
        path: 'exams',
        name: 'Exams',
        component: () => import('@/views/exams/index.vue'),
        meta: { title: '考试管理', permission: 'exam:view' }
      },
      {
        path: 'scores',
        name: 'Scores',
        component: () => import('@/views/scores/index.vue'),
        meta: { title: '成绩管理', permission: 'score:view' }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/analysis/index.vue'),
        meta: { title: '成绩分析', permission: 'score:view' }
      },
      {
        path: 'schedules',
        name: 'Schedules',
        component: () => import('@/views/schedules/index.vue'),
        meta: { title: '课表管理', permission: 'schedule:view' }
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/attendance/index.vue'),
        meta: { title: '考勤管理', permission: 'attendance:view' }
      },
      {
        path: 'notices',
        name: 'Notices',
        component: () => import('@/views/notices/index.vue'),
        meta: { title: '通知公告', permission: 'notice:view' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/index.vue'),
        meta: { title: '用户管理', permission: 'system:user' }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/roles/index.vue'),
        meta: { title: '角色管理', permission: 'system:role' }
      },
      {
        path: 'enrollments',
        name: 'Enrollments',
        component: () => import('@/views/enrollment/index.vue'),
        meta: { title: '招生管理', permission: 'enrollment:view' }
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/views/finance/index.vue'),
        meta: { title: '财务管理', permission: 'finance:view' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
