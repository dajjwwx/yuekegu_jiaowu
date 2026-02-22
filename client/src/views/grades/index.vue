<template>
  <div class="page-container">
    <div class="page-header">
      <h2>年级管理</h2>
      <el-button v-if="hasPermission('grade:create')" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加年级
      </el-button>
    </div>
    
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="grade_name" label="年级名称" width="150" />
        <el-table-column prop="grade_level" label="年级级别" width="100">
          <template #default="{ row }">{{ ['初一','初二','初三','高一','高二','高三'][row.grade_level - 1] }}</template>
        </el-table-column>
        <el-table-column prop="section" label="学段" width="100">
          <template #default="{ row }">{{ row.section === 1 ? '初中' : '高中' }}</template>
        </el-table-column>
        <el-table-column prop="academic_year" label="学年" width="100" />
        <el-table-column prop="gradeLeader" label="年级组长" width="100">
          <template #default="{ row }">{{ row.gradeLeader?.name }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '进行中' : '已结束' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="hasPermission('grade:edit')" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="hasPermission('grade:delete')" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="年级名称" prop="grade_name">
          <el-input v-model="form.grade_name" />
        </el-form-item>
        <el-form-item label="年级级别" prop="grade_level">
          <el-select v-model="form.grade_level" style="width: 100%">
            <el-option v-for="(g, i) in ['初一','初二','初三','高一','高二','高三']" :key="i+1" :label="g" :value="i+1" />
          </el-select>
        </el-form-item>
        <el-form-item label="学段" prop="section">
          <el-radio-group v-model="form.section">
            <el-radio :value="1">初中</el-radio>
            <el-radio :value="2">高中</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="学年" prop="academic_year">
          <el-input-number v-model="form.academic_year" :min="2020" :max="2030" />
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
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const form = reactive({ id: null, grade_name: '', grade_level: 1, section: 1, academic_year: new Date().getFullYear() })
const rules = { grade_name: [{ required: true, message: '请输入年级名称', trigger: 'blur' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('/grades')
    tableData.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleAdd = () => {
  Object.assign(form, { id: null, grade_name: '', grade_level: 1, section: 1, academic_year: new Date().getFullYear() })
  dialogTitle.value = '添加年级'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑年级'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        form.id ? await api.put(`/grades/${form.id}`, form) : await api.post('/grades', form)
        ElMessage.success('保存成功')
        dialogVisible.value = false
        loadData()
      } catch (e) { console.error(e) }
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该年级吗？', '提示', { type: 'warning' })
    await api.delete(`/grades/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => loadData())
</script>
