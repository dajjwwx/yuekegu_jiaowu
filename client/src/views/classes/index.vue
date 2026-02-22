<template>
  <div class="page-container">
    <div class="page-header">
      <h2>班级管理</h2>
      <el-button v-if="hasPermission('class:create')" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加班级
      </el-button>
    </div>
    
    <el-card>
      <div class="search-form">
        <el-select v-model="searchForm.gradeId" placeholder="年级" clearable @change="loadData" style="width: 150px">
          <el-option v-for="g in grades" :key="g.id" :label="g.grade_name" :value="g.id" />
        </el-select>
      </div>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="class_name" label="班级名称" width="120" />
        <el-table-column prop="grade" label="年级" width="120">
          <template #default="{ row }">{{ row.grade?.grade_name }}</template>
        </el-table-column>
        <el-table-column prop="class_type" label="班级类型" width="100" />
        <el-table-column prop="room_no" label="教室" width="100" />
        <el-table-column prop="teacher" label="班主任" width="100">
          <template #default="{ row }">{{ row.teacher?.name }}</template>
        </el-table-column>
        <el-table-column prop="student_count" label="学生人数" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '进行中' : '已解散' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="hasPermission('class:edit')" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="hasPermission('class:delete')" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="班级名称" prop="class_name">
          <el-input v-model="form.class_name" />
        </el-form-item>
        <el-form-item label="所属年级" prop="grade_id">
          <el-select v-model="form.grade_id" style="width: 100%">
            <el-option v-for="g in grades" :key="g.id" :label="g.grade_name" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级类型" prop="class_type">
          <el-select v-model="form.class_type" style="width: 100%">
            <el-option label="普通班" value="普通" />
            <el-option label="实验班" value="实验" />
            <el-option label="重点班" value="重点" />
            <el-option label="艺术班" value="艺术" />
          </el-select>
        </el-form-item>
        <el-form-item label="教室" prop="room_no">
          <el-input v-model="form.room_no" />
        </el-form-item>
        <el-form-item label="班主任" prop="teacher_id">
          <el-select v-model="form.teacher_id" style="width: 100%" filterable>
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
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

const loading = ref(false)
const tableData = ref([])
const grades = ref([])
const teachers = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const searchForm = reactive({ gradeId: '' })

const form = reactive({ id: null, class_name: '', grade_id: '', class_type: '普通', room_no: '', teacher_id: '' })
const rules = { class_name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }], grade_id: [{ required: true, message: '请选择年级', trigger: 'change' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('/classes', { params: searchForm })
    tableData.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const loadGrades = async () => {
  try {
    const res = await api.get('/grades')
    grades.value = res.data || []
  } catch (e) { console.error(e) }
}

const loadTeachers = async () => {
  try {
    const res = await api.get('/teachers', { params: { pageSize: 1000 } })
    teachers.value = res.data.list || []
  } catch (e) { console.error(e) }
}

const handleAdd = () => {
  Object.assign(form, { id: null, class_name: '', grade_id: '', class_type: '普通', room_no: '', teacher_id: '' })
  dialogTitle.value = '添加班级'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑班级'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        form.id ? await api.put(`/classes/${form.id}`, form) : await api.post('/classes', form)
        ElMessage.success('保存成功')
        dialogVisible.value = false
        loadData()
      } catch (e) { console.error(e) }
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该班级吗？', '提示', { type: 'warning' })
    await api.delete(`/classes/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => { loadData(); loadGrades(); loadTeachers() })
</script>
