<template>
  <el-container class="main-layout">
    <el-aside width="220px">
      <div class="logo">
        <h1>教务管理系统</h1>
      </div>
      <el-menu
        :default-active="route.path"
        :router="true"
        :collapse="false"
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-sub-menu index="education" v-if="hasMenuPermission('student:view') || hasMenuPermission('teacher:view')">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>教务管理</span>
          </template>
          <el-menu-item index="/students" v-if="hasMenuPermission('student:view')">学生管理</el-menu-item>
          <el-menu-item index="/teachers" v-if="hasMenuPermission('teacher:view')">教师管理</el-menu-item>
          <el-menu-item index="/grades" v-if="hasMenuPermission('grade:view')">年级管理</el-menu-item>
          <el-menu-item index="/classes" v-if="hasMenuPermission('class:view')">班级管理</el-menu-item>
          <el-menu-item index="/courses" v-if="hasMenuPermission('course:view')">课程管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="teaching" v-if="hasMenuPermission('exam:view') || hasMenuPermission('score:view')">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>教学管理</span>
          </template>
          <el-menu-item index="/exams" v-if="hasMenuPermission('exam:view')">考试管理</el-menu-item>
          <el-menu-item index="/scores" v-if="hasMenuPermission('score:view')">成绩管理</el-menu-item>
          <el-menu-item index="/analysis" v-if="hasMenuPermission('score:view')">成绩分析</el-menu-item>
          <el-menu-item index="/schedules" v-if="hasMenuPermission('schedule:view')">课表管理</el-menu-item>
          <el-menu-item index="/attendance" v-if="hasMenuPermission('attendance:view')">考勤管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/notices" v-if="hasMenuPermission('notice:view')">
          <el-icon><Bell /></el-icon>
          <span>通知公告</span>
        </el-menu-item>
        
        <el-sub-menu index="business" v-if="hasMenuPermission('enrollment:view') || hasMenuPermission('finance:view')">
          <template #title>
            <el-icon><Coin /></el-icon>
            <span>业务管理</span>
          </template>
          <el-menu-item index="/enrollments" v-if="hasMenuPermission('enrollment:view')">招生管理</el-menu-item>
          <el-menu-item index="/finance" v-if="hasMenuPermission('finance:view')">财务管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="system" v-if="hasMenuPermission('system:user')">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/users" v-if="hasMenuPermission('system:user')">用户管理</el-menu-item>
          <el-menu-item index="/roles" v-if="hasMenuPermission('system:role')">角色管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-left">
          <span class="username">{{ userStore.realName }}</span>
          <span class="user-type">{{ userTypeText }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userTypeText = computed(() => {
  const types = { admin: '管理员', teacher: '教师', student: '学生', parent: '家长' }
  return types[userStore.userType] || ''
})

const hasMenuPermission = (permission) => {
  return userStore.hasPermission(permission)
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    })
  } else if (command === 'password') {
    router.push('/password')
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100%;
  
  .el-aside {
    background: #304156;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #263445;
      
      h1 {
        color: #fff;
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .sidebar-menu {
      border-right: none;
      background: #304156;
      
      :deep(.el-menu-item), :deep(.el-sub-menu__title) {
        color: #bfcbd9;
        
        &:hover {
          background: #263445;
        }
      }
      
      :deep(.el-menu-item.is-active) {
        background: #409eff !important;
        color: #fff;
      }
    }
  }
  
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    padding: 0 20px;
    
    .header-left {
      .username {
        margin-right: 8px;
        font-weight: 500;
      }
      
      .user-type {
        color: #909399;
        font-size: 12px;
      }
    }
    
    .header-right {
      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      }
    }
  }
  
  .el-main {
    background: #f0f2f5;
  }
}
</style>
