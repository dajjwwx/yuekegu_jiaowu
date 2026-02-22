<template>
  <div class="page-container">
    <div class="page-header">
      <h2>课程管理</h2>
      <el-button v-if="hasPermission('course:create')" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加课程
      </el-button>
    </div>
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="course_code" label="课程代码" width="100" />
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column prop="subject" label="学科" width="100" />
        <el-table-column prop="course_type" label="类型" width="80">
          <template #default="{ row }">{{ ['','必修','选修','限选'][row.course_type] }}</template>
        </el-table-column>
        <el-table-column prop="section" label="学段" width="80">
          <template #default="{ row }">{{ ['','初中','高中','初高中'][row.section] }}</template>
        </el-table-column>
        <el-table-column prop="is_exam_course" label="考试科目" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_exam_course ? 'danger' : 'info'">{{ row.is_exam_course ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="课程代码" prop="course_code"><el-input v-model="form.course_code" /></el-form-item>
        <el-form-item label="课程名称" prop="course_name"><el-input v-model="form.course_name" /></el-form-item>
        <el-form-item label="学科" prop="subject"><el-input v-model="form.subject" /></el-form-item>
        <el-form-item label="课程类型" prop="course_type">
          <el-select v-model="form.course_type" style="width: 100%">
            <el-option label="必修" :value="1" /><el-option label="选修" :value="2" /><el-option label="限选" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="学段" prop="section">
          <el-radio-group v-model="form.section">
            <el-radio :value="1">初中</el-radio><el-radio :value="2">高中</el-radio><el-radio :value="3">初高中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
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

const loading = ref(false), tableData = ref([]), dialogVisible = ref(false), dialogTitle = ref(''), formRef = ref()
const form = reactive({ id: null, course_code: '', course_name: '', subject: '', course_type: 1, section: 1 })
const rules = { course_code: [{ required: true, message: '请输入课程代码', trigger: 'blur' }], course_name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }], subject: [{ required: true, message: '请输入学科', trigger: 'blur' }] }

const loadData = async () => {
  loading.value = true
  try { const res = await api.get('/courses'); tableData.value = res.data || [] } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleAdd = () => { Object.assign(form, { id: null, course_code: '', course_name: '', subject: '', course_type: 1, section: 1 }); dialogTitle.value = '添加课程'; dialogVisible.value = true }
const handleEdit = (row) => { Object.assign(form, row); dialogTitle.value = '编辑课程'; dialogVisible.value = true }
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) { try { form.id ? await api.put(`/courses/${form.id}`, form) : await api.post('/courses', form); ElMessage.success('保存成功'); dialogVisible.value = false; loadData() } catch (e) { console.error(e) } }
  })
}
const handleDelete = async (row) => {
  try { await ElMessageBox.confirm('确定删除该课程吗？', '提示', { type: 'warning' }); await api.delete(`/courses/${row.id}`); ElMessage.success('删除成功'); loadData() } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => loadData())
</script>
