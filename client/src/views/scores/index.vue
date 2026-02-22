<template>
  <div class="page-container">
    <div class="page-header"><h2>成绩管理</h2></div>
    <el-card>
      <div class="search-form">
        <el-select v-model="searchForm.examId" placeholder="选择考试" clearable @change="loadData" style="width: 150px">
          <el-option v-for="e in exams" :key="e.id" :label="e.exam_name" :value="e.id" />
        </el-select>
        <el-select v-model="searchForm.classId" placeholder="选择班级" clearable @change="loadData" style="width: 150px">
          <el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" />
        </el-select>
        <el-select v-model="searchForm.courseId" placeholder="选择课程" clearable @change="loadData" style="width: 150px">
          <el-option v-for="c in courses" :key="c.id" :label="c.course_name" :value="c.id" />
        </el-select>
        <el-button v-if="hasPermission('score:input')" type="primary" @click="showInputDialog = true">录入成绩</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="student" label="学生" width="100">
          <template #default="{ row }">{{ row.student?.name }}</template>
        </el-table-column>
        <el-table-column prop="student_no" label="学号" width="100">
          <template #default="{ row }">{{ row.student?.student_no }}</template>
        </el-table-column>
        <el-table-column prop="course" label="课程" width="120">
          <template #default="{ row }">{{ row.course?.course_name }}</template>
        </el-table-column>
        <el-table-column prop="exam" label="考试" width="120">
          <template #default="{ row }">{{ row.exam?.exam_name }}</template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="80" />
        <el-table-column prop="rank" label="排名" width="60" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'info' : 'warning'>{{ ['','已审核','已发布','待审核'][row.status] }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="showInputDialog" title="录入成绩" width="80%">
      <el-form label-width="100px">
        <el-form-item label="考试"><el-select v-model="inputForm.examId" style="width: 200px"><el-option v-for="e in exams" :key="e.id" :label="e.exam_name" :value="e.id" /></el-select></el-form-item>
        <el-form-item label="课程"><el-select v-model="inputForm.courseId" style="width: 200px"><el-option v-for="c in courses" :key="c.id" :label="c.course_name" :value="c.id" /></el-select></el-form-item>
        <el-form-item label="班级"><el-select v-model="inputForm.classId" style="width: 200px" @change="loadClassStudents"><el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" /></el-select></el-form-item>
      </el-form>
      <el-table :data="studentScores" border>
        <el-table-column prop="student_no" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column label="成绩"><template #default="{ row }"><el-input-number v-model="row.score" :min="0" :max="150" :precision="1" /></template></el-table-column>
      </el-table>
      <template #footer><el-button @click="showInputDialog = false">取消</el-button><el-button type="primary" @click="handleSubmitScores">提交</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/api'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const hasPermission = (p) => userStore.hasPermission(p)

const loading = ref(false), tableData = ref([]), exams = ref([]), classes = ref([]), courses = ref([]), showInputDialog = ref(false), studentScores = ref([])
const searchForm = reactive({ examId: '', classId: '', courseId: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const inputForm = reactive({ examId: '', courseId: '', classId: '' })

const loadData = async () => { loading.value = true; try { const res = await api.get('/scores', { params: { ...searchForm, page: pagination.page, pageSize: pagination.pageSize } }); tableData.value = res.data || []; pagination.total = res.data.total || 0 } catch (e) { console.error(e) } finally { loading.value = false } }
const loadOptions = async () => { try { const [e, c, co] = await Promise.all([api.get('/exams'), api.get('/classes'), api.get('/courses')]); exams.value = e.data || []; classes.value = c.data || []; courses.value = co.data || [] } catch (e) { console.error(e) } }
const loadClassStudents = async () => { if (!inputForm.classId) return; try { const res = await api.get('/students', { params: { classId: inputForm.classId, pageSize: 1000 } }); studentScores.value = (res.data.list || []).map(s => ({ studentId: s.id, student_no: s.student_no, name: s.name, score: 0 })) } catch (e) { console.error(e) } }
const handleSubmitScores = async () => { try { await api.post('/scores/batch', { examId: inputForm.examId, courseId: inputForm.courseId, scores: studentScores.value }); ElMessage.success('提交成功'); showInputDialog.value = false; loadData() } catch (e) { console.error(e) } }

onMounted(() => { loadData(); loadOptions() })
</script>
