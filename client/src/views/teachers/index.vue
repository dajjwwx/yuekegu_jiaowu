<template>
  <div class="page-container">
    <div class="page-header">
      <h2>教师管理</h2>
      <el-button v-if="hasPermission('teacher:create')" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加教师
      </el-button>
    </div>
    
    <el-card>
      <div class="search-form">
        <el-input v-model="searchForm.name" placeholder="姓名" clearable @change="loadData" style="width: 150px" />
        <el-input v-model="searchForm.teacherNo" placeholder="工号" clearable @change="loadData" style="width: 150px" />
        <el-select v-model="searchForm.department" placeholder="部门" clearable @change="loadData" style="width: 150px">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="teacher_no" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">{{ row.gender === 1 ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '在职' : '离职' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button v-if="hasPermission('teacher:edit')" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="hasPermission('teacher:delete')" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, sizes, prev, pager, next" @change="loadData" />
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="工号" prop="teacher_no">
          <el-input v-model="form.teacher_no" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" />
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="入职日期" prop="hire_date">
          <el-date-picker v-model="form.hire_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
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
const departments = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const searchForm = reactive({ name: '', teacherNo: '', department: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({
  id: null, teacher_no: '', name: '', gender: 1, phone: '', department: '', position: '', title: '', hire_date: ''
})

const rules = {
  teacher_no: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('/teachers', { params: { page: pagination.page, pageSize: pagination.pageSize, ...searchForm } })
    tableData.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const loadDepartments = async () => {
  try {
    const res = await api.get('/teachers', { params: { pageSize: 1000 } })
    departments.value = [...new Set((res.data.list || []).map(t => t.department).filter(Boolean))]
  } catch (e) { console.error(e) }
}

const handleAdd = () => {
  Object.assign(form, { id: null, teacher_no: '', name: '', gender: 1, phone: '', department: '', position: '', title: '', hire_date: '' })
  dialogTitle.value = '添加教师'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑教师'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        form.id ? await api.put(`/teachers/${form.id}`, form) : await api.post('/teachers', form)
        ElMessage.success('保存成功')
        dialogVisible.value = false
        loadData()
      } catch (e) { console.error(e) }
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该教师吗？', '提示', { type: 'warning' })
    await api.delete(`/teachers/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => { loadData(); loadDepartments() })
</script>
