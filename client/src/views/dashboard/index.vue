<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studentCount }}</div>
              <div class="stat-label">学生总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon size="30"><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.teacherCount }}</div>
              <div class="stat-label">教师总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon size="30"><House /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.classCount }}</div>
              <div class="stat-label">班级总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon size="30"><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.noticeCount }}</div>
              <div class="stat-label">通知公告</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近通知</span>
          </template>
          <el-empty v-if="notices.length === 0" description="暂无通知" />
          <div v-else class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item">
              <el-tag v-if="notice.is_urgent" type="danger" size="small">紧急</el-tag>
              <span class="notice-title">{{ notice.title }}</span>
              <span class="notice-time">{{ formatTime(notice.publish_time) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button v-if="hasPermission('student:create')" @click="$router.push('/students?action=add')">
              <el-icon><Plus /></el-icon> 添加学生
            </el-button>
            <el-button v-if="hasPermission('score:input')" @click="$router.push('/scores?action=input')">
              <el-icon><Edit /></el-icon> 录入成绩
            </el-button>
            <el-button v-if="hasPermission('notice:create')" @click="$router.push('/notices?action=add')">
              <el-icon><Bell /></el-icon> 发布通知
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const userStore = useUserStore()

const stats = ref({
  studentCount: 0,
  teacherCount: 0,
  classCount: 0,
  noticeCount: 0
})

const notices = ref([])

const hasPermission = (permission) => userStore.hasPermission(permission)

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString()
}

const loadStats = async () => {
  try {
    const [studentRes, teacherRes, classRes, noticeRes] = await Promise.all([
      api.get('/students', { params: { pageSize: 1 } }),
      api.get('/teachers', { params: { pageSize: 1 } }),
      api.get('/classes', { params: { pageSize: 1 } }),
      api.get('/notices', { params: { pageSize: 1, status: 1 } })
    ])
    
    stats.value = {
      studentCount: studentRes.data.total || 0,
      teacherCount: teacherRes.data.total || 0,
      classCount: classRes.data.total || 0,
      noticeCount: noticeRes.data.total || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadNotices = async () => {
  try {
    const res = await api.get('/notices', { params: { pageSize: 5, status: 1 } })
    notices.value = res.data.list || []
  } catch (error) {
    console.error('加载通知失败:', error)
  }
}

onMounted(() => {
  loadStats()
  loadNotices()
})
</script>

<style scoped lang="scss">
.dashboard {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
      
      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #333;
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
  
  .notice-list {
    .notice-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .notice-title {
        flex: 1;
        cursor: pointer;
        
        &:hover {
          color: #409eff;
        }
      }
      
      .notice-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .quick-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}
</style>
