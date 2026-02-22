<template>
  <div class="page-container">
    <div class="page-header"><h2>考勤管理</h2></div>
    <el-card>
      <div class="search-form">
        <el-date-picker v-model="searchForm.attendanceDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" @change="loadData" style="width: 150px" />
        <el-select v-model="searchForm.classId" placeholder="选择班级" clearable @change="loadData" style="width: 150px">
          <el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" />
        </el-select>
        <el-button v-if="hasPermission('attendance:input')" type="primary" @click="showInputDialog = true">录入考勤</el-button>
        <el-button type="info" @click="showStatDialog = true">考勤统计</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="attendance_date" label="日期" width="120" />
        <el-table-column prop="student" label="学生" width="100"><template #default="{ row }">{{ row.student?.name }}</template></el-table-column>
        <el-table-column prop="course" label="课程" width="120"><template #default="{ row }">{{ row.course?.course_name || '班级考勤' }}</template></el-table-column>
        <el-table-column prop="attendance_type" label="考勤状态" width="100">
          <template #default="{ row }">
            <el-tag :type="['success','warning','warning','danger','info'][row.attendance_type - 1]">{{ ['出勤','迟到','早退','旷课','请假'][row.attendance_type - 1] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="showInputDialog" title="录入考勤" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="班级"><el-select v-model="form.classId" style="width: 100%" @change="loadClassStudents"><el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" /></el-select></el-form-item>
        <el-form-item label="日期"><el-date-picker v-model="form.attendanceDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item>
        <el-form-item label="考勤类型"><el-radio-group v-model="form.attendanceType"><el-radio :value="1">出勤</el-radio><el-radio :value="2">迟到</el-radio><el-radio :value="3">早退</el-radio><el-radio :value="4">旷课</el-radio><el-radio :value="5">请假</el-radio></el-radio-group></el-form-item>
      </el-form>
      <el-table :data="students" border max-height="300">
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="student_no" label="学号" />
        <el-table-column label="选择"><template #default="{ row }"><el-checkbox v-model="row.selected" /></template></el-table-column>
      </el-table>
      <template #footer><el-button @click="showInputDialog = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交</el-button></template>
    </el-dialog>
    <el-dialog v-model="showStatDialog" title="考勤统计" width="400px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="出勤">{{ stats.present }}</el-descriptions-item>
        <el-descriptions-item label="迟到">{{ stats.late }}</el-descriptions-item>
        <el-descriptions-item label="早退">{{ stats.leaveEarly }}</el-descriptions-item>
        <el-descriptions-item label="旷课">{{ stats.absent }}</el-descriptions-item>
        <el-descriptions-item label="请假">{{ stats.leave }}</el-descriptions-item>
      </el-descriptions>
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

const loading = ref(false), tableData = ref([]), classes = ref([]), students = ref([]), showInputDialog = ref(false), showStatDialog = ref(false)
const searchForm = reactive({ attendanceDate: '', classId: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const form = reactive({ classId: '', attendanceDate: '', attendanceType: 1 })
const stats = reactive({ present: 0, late: 0, leaveEarly: 0, absent: 0, leave: 0 })

const loadData = async () => { loading.value = true; try { const res = await api.get('/attendance', { params: { ...searchForm, page: pagination.page, pageSize: pagination.pageSize } }); tableData.value = res.data || []; pagination.total = res.data.total || 0 } catch (e) { console.error(e) } finally { loading.value = false } }
const loadClasses = async () => { try { const res = await api.get('/classes'); classes.value = res.data || [] } catch (e) { console.error(e) } }
const loadClassStudents = async () => { if (!form.classId) return; try { const res = await api.get('/students', { params: { classId: form.classId, pageSize: 1000 } }); students.value = (res.data.list || []).map(s => ({ id: s.id, name: s.name, student_no: s.student_no, selected: false })) } catch (e) { console.error(e) } }
const handleSubmit = async () => { try { const selected = students.value.filter(s => s.selected).map(s => s.id); await api.post('/attendance/batch', { classId: form.classId, attendanceDate: form.attendanceDate, attendanceType: form.attendanceType, studentIds: selected }); ElMessage.success('提交成功'); showInputDialog.value = false; loadData() } catch (e) { console.error(e) } }
const loadStats = async () => { try { const res = await api.get('/attendance/statistics', { params: searchForm }); Object.assign(stats, res.data) } catch (e) { console.error(e) } }
const openStatDialog = () => { showStatDialog.value = true; loadStats() }

onMounted(() => { loadData(); loadClasses() })
</script>
