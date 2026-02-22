<template>
  <div class="page-container">
    <div class="page-header"><h2>角色管理</h2><el-button v-if="hasPermission('system:role:create')" type="primary" @click="handleAdd"><el-icon><Plus /></el-icon> 添加角色</el-button></div>
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="role_code" label="角色代码" width="120" />
        <el-table-column prop="role_name" label="角色名称" width="120" />
        <el-table-column prop="role_type" label="类型" width="100"><template #default="{ row }">{{ {system:'系统',management:'管理',teacher:'教师',student:'学生',parent:'家长'}[row.role_type] }}</template></el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag></template>
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
        <el-form-item label="角色代码" prop="role_code"><el-input v-model="form.role_code" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="角色名称" prop="role_name"><el-input v-model="form.role_name" /></el-form-item>
        <el-form-item label="角色类型" prop="role_type">
          <el-select v-model="form.role_type" style="width: 100%">
            <el-option label="系统" value="system" /><el-option label="管理" value="management" /><el-option label="教师" value="teacher" /><el-option label="学生" value="student" /><el-option label="家长" value="parent" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
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
const form = reactive({ id: null, role_code: '', role_name: '', role_type: 'teacher', description: '' })
const rules = { role_code: [{ required: true, message: '请输入角色代码', trigger: 'blur' }], role_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }] }

const loadData = async () => { loading.value = true; try { const res = await api.get('/roles'); tableData.value = res.data || [] } catch (e) { console.error(e) } finally { loading.value = false } }
const handleAdd = () => { Object.assign(form, { id: null, role_code: '', role_name: '', role_type: 'teacher', description: '' }); dialogTitle.value = '添加角色'; dialogVisible.value = true }
const handleEdit = (row) => { Object.assign(form, row); dialogTitle.value = '编辑角色'; dialogVisible.value = true }
const handleSubmit = async () => { if (!formRef.value) return; await formRef.value.validate(async (valid) => { if (valid) { try { form.id ? await api.put(`/roles/${form.id}`, form) : await api.post('/roles', form); ElMessage.success('保存成功'); dialogVisible.value = false; loadData() } catch (e) { console.error(e) } }) })
const handleDelete = async (row) => { try { await ElMessageBox.confirm('确定删除该角色吗？', '提示', { type: 'warning' }); await api.delete(`/roles/${row.id}`); ElMessage.success('删除成功'); loadData() } catch (e) { if (e !== 'cancel') console.error(e) } }

onMounted(() => loadData())
</script>
