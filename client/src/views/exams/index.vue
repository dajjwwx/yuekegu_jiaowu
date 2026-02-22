<template>
  <div class="page-container">
    <div class="page-header"><h2>考试管理</h2><el-button v-if="hasPermission('exam:create')" type="primary" @click="handleAdd"><el-icon><Plus /></el-icon> 创建考试</el-button></div>
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="exam_name" label="考试名称" />
        <el-table-column prop="exam_type" label="类型" width="80"><template #default="{ row }">{{ ['','期中','期末','月考','模拟'][row.exam_type] }}</template></el-table-column>
        <el-table-column prop="academic_year" label="学年" width="80" />
        <el-table-column prop="semester" label="学期" width="60"><template #default="{ row }">{{ row.semester }}学期</template></el-table-column>
        <el-table-column prop="start_date" label="开始日期" width="120" />
        <el-table-column prop="is_published" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.is_published ? 'success' : 'warning'">{{ row.is_published ? '已发布' : '未发布' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="hasPermission('exam:publish') && !row.is_published" type="success" link @click="handlePublish(row)">发布</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="考试名称" prop="exam_name"><el-input v-model="form.exam_name" /></el-form-item>
        <el-form-item label="考试类型" prop="exam_type"><el-select v-model="form.exam_type" style="width: 100%"><el-option label="期中" :value="1" /><el-option label="期末" :value="2" /><el-option label="月考" :value="3" /><el-option label="模拟" :value="4" /></el-select></el-form-item>
        <el-form-item label="学年" prop="academic_year"><el-input-number v-model="form.academic_year" :min="2020" :max="2030" /></el-form-item>
        <el-form-item label="学期" prop="semester"><el-radio-group v-model="form.semester"><el-radio :value="1">上学期</el-radio><el-radio :value="2">下学期</el-radio></el-radio-group></el-form-item>
        <el-form-item label="开始日期" prop="start_date"><el-date-picker v-model="form.start_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item>
        <el-form-item label="结束日期" prop="end_date"><el-date-picker v-model="form.end_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item>
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
const form = reactive({ id: null, exam_name: '', exam_type: 1, academic_year: new Date().getFullYear(), semester: 1, start_date: '', end_date: '' })
const rules = { exam_name: [{ required: true, message: '请输入考试名称', trigger: 'blur' }], start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }] }

const loadData = async () => { loading.value = true; try { const res = await api.get('/exams'); tableData.value = res.data || [] } catch (e) { console.error(e) } finally { loading.value = false } }
const handleAdd = () => { Object.assign(form, { id: null, exam_name: '', exam_type: 1, academic_year: new Date().getFullYear(), semester: 1, start_date: '', end_date: '' }); dialogTitle.value = '创建考试'; dialogVisible.value = true }
const handleEdit = (row) => { Object.assign(form, row); dialogTitle.value = '编辑考试'; dialogVisible.value = true }
const handleSubmit = async () => { if (!formRef.value) return; await formRef.value.validate(async (valid) => { if (valid) { try { form.id ? await api.put(`/exams/${form.id}`, form) : await api.post('/exams', form); ElMessage.success('保存成功'); dialogVisible.value = false; loadData() } catch (e) { console.error(e) } }) })
const handlePublish = async (row) => { try { await api.post(`/exams/${row.id}/publish`); ElMessage.success('发布成功'); loadData() } catch (e) { console.error(e) } }
const handleDelete = async (row) => { try { await ElMessageBox.confirm('确定删除该考试吗？', '提示', { type: 'warning' }); await api.delete(`/exams/${row.id}`); ElMessage.success('删除成功'); loadData() } catch (e) { if (e !== 'cancel') console.error(e) } }

onMounted(() => loadData())
</script>
