<template>
  <div class="page-container">
    <div class="page-header">
      <h2>学生管理</h2>
      <el-button v-if="hasPermission('student:create')" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加学生
      </el-button>
    </div>
    
    <el-card>
      <div class="search-form">
        <el-input v-model="searchForm.name" placeholder="姓名" clearable @change="loadData" style="width: 150px" />
        <el-input v-model="searchForm.studentNo" placeholder="学号" clearable @change="loadData" style="width: 150px" />
        <el-select v-model="searchForm.gradeId" placeholder="年级" clearable @change="loadData" style="width: 150px">
          <el-option v-for="g in grades" :key="g.id" :label="g.grade_name" :value="g.id" />
        </el-select>
        <el-select v-model="searchForm.classId" placeholder="班级" clearable @change="loadData" style="width: 150px">
          <el-option v-for="c in classes" :key="c.id" :label="c.class_name" :value="c.id" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="student_no" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="birth_date" label="出生日期" width="120" />
        <el-table-column prop="grade" label="年级" width="100">
          <template #default="{ row }">
            {{ row.grade?.grade_name }}
          </template>
        </el-table-column>
        <el-table-column prop="class" label="班级" width="120">
          <template #default="{ row }">
            {{ row.class?.class_name }}
          </template>
        </el-table-column>
        <el-table-column prop="guardian_phone" label="联系电话" width="120" />
        <el-table-column prop="academic_status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.academic_status)">
              {{ getStatusText(row.academic_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button v-if="hasPermission('student:view')" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button v-if="hasPermission('student:edit')" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="hasPermission('student:delete')" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @change="loadData"
      />
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学号" prop="student_no">
          <el-input v-model="form.student_no" :disabled="!!form.id" />
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
        <el-form-item label="出生日期" prop="birth_date">
          <el-date-picker v-model="form.birth_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="年级" prop="grade_id">
          <el-select v-model="form.grade_id" @change="handleGradeChange" style="width: 100%">
            <el-option v-for="g in grades" :key="g.id" :label="g.grade_name" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="class_id">
          <el-select v-model="form.class_id" style="width: 100%">
            <el-option v-for="c in filterClasses" :key="c.id" :label="c.class_name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学生类型" prop="student_type">
          <el-radio-group v-model="form.student_type">
            <el-radio :value="1">初中生</el-radio>
            <el-radio :value="2">高中生</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="监护人" prop="guardian_name">
          <el-input v-model="form.guardian_name" placeholder="监护人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="guardian_phone">
          <el-input v-model="form.guardian_phone" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()

const hasPermission = (permission) => userStore.hasPermission(permission)

const loading = ref(false)
const tableData = ref([])
const grades = ref([])
const classes = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const searchForm = reactive({
  name: '',
  studentNo: '',
  gradeId: '',
  classId: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  student_no: '',
  name: '',
  gender: 1,
  birth_date: '',
  grade_id: '',
  class_id: '',
  student_type: 1,
  guardian_name: '',
  guardian_phone: ''
})

const rules = {
  student_no: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  birth_date: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  grade_id: [{ required: true, message: '请选择年级', trigger: 'change' }]
}

const filterClasses = computed(() => {
  if (!form.grade_id) return []
  return classes.value.filter(c => c.grade_id === form.grade_id)
})

const getStatusType = (status) => {
  const types = { 1: '', 2: 'warning', 3: 'info', 4: 'danger', 5: 'success' }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = { 1: '在读', 2: '休学', 3: '转学', 4: '退学', 5: '毕业' }
  return texts[status] || ''
}

const handleGradeChange = () => {
  form.class_id = ''
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('/students', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      }
    })
    tableData.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadGrades = async () => {
  try {
    const res = await api.get('/grades')
    grades.value = res.data || []
  } catch (error) {
    console.error('加载年级失败:', error)
  }
}

const loadClasses = async () => {
  try {
    const res = await api.get('/classes')
    classes.value = res.data || []
  } catch (error) {
    console.error('加载班级失败:', error)
  }
}

const handleAdd = () => {
  Object.assign(form, {
    id: null,
    student_no: '',
    name: '',
    gender: 1,
    birth_date: '',
    grade_id: '',
    class_id: '',
    student_type: 1,
    guardian_name: '',
    guardian_phone: ''
  })
  dialogTitle.value = '添加学生'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑学生'
  dialogVisible.value = true
}

const handleView = (row) => {
  handleEdit(row)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await api.put(`/students/${form.id}`, form)
          ElMessage.success('更新成功')
        } else {
          await api.post('/students', form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该学生吗？', '提示', { type: 'warning' })
    await api.delete(`/students/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  loadData()
  loadGrades()
  loadClasses()
})
</script>
