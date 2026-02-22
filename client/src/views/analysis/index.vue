<template>
  <div class="page-container">
    <div class="page-header"><h2>成绩分析</h2></div>
    
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="考试">
          <el-select v-model="searchForm.examId" placeholder="选择考试" clearable style="width: 180px" @change="loadAnalysis">
            <el-option v-for="e in exams" :key="e.id" :label="e.exam_name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="选择班级" clearable style="width: 150px" @change="loadAnalysis">
            <el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="searchForm.courseId" placeholder="选择课程" clearable style="width: 150px" @change="loadAnalysis">
            <el-option v-for="c in courses" :key="c.id" :label="c.course_name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAnalysis">查询</el-button>
          <el-button type="success" @click="loadAIAnalysis" :loading="aiLoading">
            <el-icon><MagicStick /></el-icon> AI智能分析
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" v-if="summary">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ summary.average }}</div>
          <div class="stat-label">平均分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ summary.max }}</div>
          <div class="stat-label">最高分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ summary.min }}</div>
          <div class="stat-label">最低分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ summary.rates?.passRate || 0 }}%</div>
          <div class="stat-label">及格率</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px" v-if="summary">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>成绩分布</span>
          </template>
          <div class="chart-container">
            <div class="bar-chart">
              <div class="bar-item" v-for="(item, key) in summary.distribution" :key="key">
                <div class="bar-label">{{ getDistLabel(key) }}</div>
                <div class="bar-wrapper">
                  <div class="bar" :style="{ width: getBarWidth(item) + '%', background: getBarColor(key) }">
                    <span class="bar-value">{{ item }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>统计指标</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="参考人数">{{ summary.total }}</el-descriptions-item>
            <el-descriptions-item label="平均分">{{ summary.average }}</el-descriptions-item>
            <el-descriptions-item label="中位数">{{ summary.median }}</el-descriptions-item>
            <el-descriptions-item label="标准差">{{ summary.standardDeviation }}</el-descriptions-item>
            <el-descriptions-item label="优秀率">{{ summary.rates?.excellentRate || 0 }}%</el-descriptions-item>
            <el-descriptions-item label="良好率">{{ summary.rates?.goodRate || 0 }}%</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px" v-if="aiAnalysis">
      <template #header>
        <div class="ai-header">
          <span><el-icon class="ai-icon"><MagicStick /></el-icon> AI智能分析报告</span>
          <el-tag type="success">智能生成</el-tag>
        </div>
      </template>
      
      <el-tabs v-model="aiTab">
        <el-tab-pane label="总体概况" name="overview">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="ai-stat">
                <div class="ai-stat-value">{{ aiAnalysis.overview?.totalStudents || 0 }}</div>
                <div class="ai-stat-label">参评人数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="ai-stat">
                <div class="ai-stat-value">{{ aiAnalysis.overview?.averageScore || 0 }}</div>
                <div class="ai-stat-label">平均分</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="ai-stat">
                <div class="ai-stat-value">{{ aiAnalysis.overview?.passRate || 0 }}</div>
                <div class="ai-stat-label">及格率</div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <el-tab-pane label="科目分析" name="course">
          <el-table :data="aiAnalysis.courseAnalysis" stripe>
            <el-table-column prop="course" label="科目" />
            <el-table-column prop="average" label="平均分" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '良好' ? 'success' : 'warning'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="AI洞察" name="insight">
          <div class="insight-list">
            <el-alert v-for="(insight, index) in aiAnalysis.aiInsight" :key="index" :title="insight" type="success" :closable="false" style="margin-bottom: 10px" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="教学建议" name="advice">
          <div class="advice-list">
            <el-collapse v-model="activeAdvice">
              <el-collapse-item title="智能教学建议" name="advice">
                <div class="advice-content">
                  <ul>
                    <li v-for="(advice, index) in aiAnalysis.teaching" :key="index">{{ advice }}</li>
                  </ul>
                </div>
              </el-collapse-item>
              <el-collapse-item title="重点关注科目" name="weak">
                <div class="advice-content">
                  <el-tag v-for="c in aiAnalysis.weakCourses" :key="c" type="danger" style="margin-right: 8px">{{ c }}</el-tag>
                  <span v-if="aiAnalysis.weakCourses?.length === 0">暂无</span>
                </div>
              </el-collapse-item>
              <el-collapse-item title="优势科目" name="strong">
                <div class="advice-content">
                  <el-tag v-for="c in aiAnalysis.strongCourses" :key="c" type="success" style="margin-right: 8px">{{ c }}</el-tag>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card style="margin-top: 20px" v-if="trendData && trendData.trend?.length > 0">
      <template #header>
        <span>成绩趋势</span>
      </template>
      <el-table :data="trendData.trend" stripe>
        <el-table-column prop="examName" label="考试" />
        <el-table-column prop="courseName" label="科目" />
        <el-table-column prop="score" label="成绩" width="100" />
        <el-table-column prop="date" label="日期" width="120" />
      </el-table>
      <div class="trend-summary" v-if="trendData.summary">
        <el-tag :type="trendData.summary.trend === 'rising' ? 'success' : trendData.summary.trend === 'declining' ? 'danger' : 'info'">
          {{ trendData.summary.description }}
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const userStore = useUserStore()

const exams = ref([])
const classes = ref([])
const courses = ref([])
const summary = ref(null)
const aiAnalysis = ref(null)
const trendData = ref(null)
const aiLoading = ref(false)
const aiTab = ref('overview')
const activeAdvice = ref(['advice'])

const searchForm = reactive({
  examId: '',
  classId: '',
  courseId: ''
})

const loadOptions = async () => {
  try {
    const [e, c, co] = await Promise.all([
      api.get('/exams'),
      api.get('/classes'),
      api.get('/courses')
    ])
    exams.value = e.data || []
    classes.value = c.data || []
    courses.value = co.data || []
    
    if (exams.value.length > 0) {
      searchForm.examId = exams.value[0].id
      loadAnalysis()
    }
  } catch (e) {
    console.error(e)
  }
}

const loadAnalysis = async () => {
  if (!searchForm.examId) return
  try {
    const res = await api.get('/analysis/summary', { params: searchForm })
    summary.value = res.data.data || res.data
    
    const trendRes = await api.get('/analysis/trend', { 
      params: { studentId: userStore.userInfo?.profile?.id, courseId: searchForm.courseId } 
    })
    trendData.value = trendRes.data
  } catch (e) {
    console.error(e)
  }
}

const loadAIAnalysis = async () => {
  if (!searchForm.examId) {
    alert('请先选择考试')
    return
  }
  aiLoading.value = true
  try {
    const res = await api.get('/analysis/ai-analysis', { params: searchForm })
    aiAnalysis.value = res.data.analysis || res.data
    aiTab.value = 'overview'
  } catch (e) {
    console.error(e)
  } finally {
    aiLoading.value = false
  }
}

const getDistLabel = (key) => {
  const labels = { excellent: '优秀', good: '良好', medium: '中等', pass: '及格', fail: '不及格' }
  return labels[key] || key
}

const getBarWidth = (value) => {
  if (!summary.value?.distribution) return 0
  const total = Object.values(summary.value.distribution).reduce((a, b) => a + b, 0)
  return total > 0 ? (value / total) * 100 : 0
}

const getBarColor = (key) => {
  const colors = { excellent: '#67c23a', good: '#409eff', medium: '#e6a23c', pass: '#909399', fail: '#f56c6c' }
  return colors[key] || '#409eff'
}

onMounted(() => loadOptions())
</script>

<style scoped lang="scss">
.stat-card {
  text-align: center;
  .stat-value {
    font-size: 32px;
    font-weight: 600;
    color: #409eff;
  }
  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 8px;
  }
}

.chart-container {
  padding: 20px 0;
}

.bar-chart {
  .bar-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    .bar-label {
      width: 60px;
      font-size: 14px;
    }
    .bar-wrapper {
      flex: 1;
      .bar {
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 8px;
        color: #fff;
        font-size: 12px;
        transition: width 0.3s;
      }
    }
  }
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .ai-icon {
    margin-right: 8px;
    color: #409eff;
  }
}

.ai-stat {
  text-align: center;
  padding: 20px;
  .ai-stat-value {
    font-size: 36px;
    font-weight: 600;
    color: #409eff;
  }
  .ai-stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 8px;
  }
}

.insight-list, .advice-list {
  padding: 10px;
}

.advice-content {
  padding: 10px;
  line-height: 2;
  ul {
    margin: 0;
    padding-left: 20px;
    li {
      margin-bottom: 8px;
    }
  }
}

.trend-summary {
  margin-top: 15px;
  text-align: center;
}

.search-card {
  margin-bottom: 20px;
}
</style>
