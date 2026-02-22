<template>
  <div class="page-container">
    <div class="page-header"><h2>课表管理</h2></div>
    <el-card>
      <div class="search-form">
        <el-select v-model="searchForm.classId" placeholder="选择班级" clearable @change="loadData" style="width: 150px">
          <el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" />
        </el-select>
        <el-select v-model="searchForm.teacherId" placeholder="选择教师" clearable @change="loadData" style="width: 150px">
          <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-button v-if="hasPermission('schedule:create')" type="primary" @click="showAddDialog = true">添加课表</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="class" label="班级" width="120"><template #default="{ row }">{{ row.class?.class_name }}</template></el-table-column>
        <el-table-column prop="course" label="课程" width="120"><template #default="{ row }">{{ row.course?.course_name }}</template></el-table-column>
        <el-table-column prop="teacher" label="教师" width="100"><template #default="{ row }">{{ row.teacher?.name }}</template></el-table-column>
        <el-table-column prop="weekday" label="星期" width="80"><template #default="{ row }">{{ ['周一','周二','周三','周四','周五','周六','周日'][row.weekday - 1] }}</template></el-table-column>
        <el-table-column prop="lesson_no" label="第几节" width="80" />
        <el-table-column prop="room_no" label="教室" width="100" />
        <el-table-column label="操作" width="100"><template #default="{ row }"><el-button type="danger" link @click="handleDelete(row)">删除</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="showAddDialog" title="添加课表" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="班级" prop="class_id"><el-select v-model="form.class_id" style="width: 100%"><el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" /></el-select></el-form-item>
        <el-form-item label="课程" prop="course_id"><el-select v-model="form.course_id" style="width: 100%"><el-option v-for="c in courses" :key="c.id" :label="c.course_name" :value="c.id" /></el-select></el-form-item>
        <el-form-item label="教师" prop="teacher_id"><el-select v-model="form.teacher_id" style="width: 100%" filterable><el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" /></el-select></el-form-item>
        <el-form-item label="星期" prop="weekday"><el-select v-model="form.weekday" style="width: 100%"><el-option v-for="(d,i) in ['周一','周二','周三','周四','周五','周六','周日']" :key="i+1" :label="d" :value="i+1" /></el-select></el-form-item>
        <el-form-item label="第几节" prop="lesson_no"><el-input-number v-model="form.lesson_no" :min="1" :max="10" /></el-form-item>
        <el-form-item label="教室"><el-input v-model="form.room_no" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="showAddDialog = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const hasPermission = (p) => userStore.hasPermission(p)

const loading = ref(false), tableData = ref([]), classes = ref([]), teachers = ref([]), courses = ref([]), showAddDialog = ref(false), formRef = ref()
const searchForm = reactive({ classId: '', teacherId: '' })
const form = reactive({ class_id: '', course_id: '', teacher_id: '', weekday: 1, lesson_no: 1, room_no: '', academic_year: new Date().getFullYear(), semester: 1 })
const rules = { class_id: [{ required: true, message: '请选择班级', trigger: 'change' }], course_id: [{ required: true, message: '请选择课程', trigger: 'change' }], teacher_id: [{ required: true, message: '请选择教师', trigger: 'change' }] }

const loadData = async () => { loading.value = true; try { const res = await api.get('/schedules', { params: searchForm }); tableData.value = res.data || [] } catch (e) { console.error(e) } finally { loading.value = false } }
const loadOptions = async () => { try { const [c, t, co] = await Promise.all([api.get('/classes'), api.get('/teachers'), api.get('/courses')]); classes.value = c.data || []; teachers.value = t.data.list || []; courses.value = co.data || [] } catch (e) { console.error(e) } }
const handleSubmit = async () => { if (!formRef.value) return; await formRef.value.validate(async (valid) => { if (valid) { try { await api.post('/schedules', form); ElMessage.success('添加成功'); showAddDialog.value = false; loadData() } catch (e) { console.error(e) } }) })
const handleDelete = async (row) => { try { await ElMessageBox.confirm('确定删除该课表吗？', '提示', { type: 'warning' }); await api.delete(`/schedules/${row.id}`); ElMessage.success('删除成功'); loadData() } catch (e) { if (e !== 'cancel') console.error(e) } }

onMounted(() => { loadData(); loadOptions() })
</script>
