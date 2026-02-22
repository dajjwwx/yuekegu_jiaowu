<template>
  <div class="page-container">
    <div class="page-header"><h2>用户管理</h2><el-button v-if="hasPermission('system:user:create')" type="primary" @click="handleAdd"><el-icon><Plus /></el-icon> 添加用户</el-button></div>
    <el-card>
      <div class="search-form">
        <el-input v-model="searchForm.username" placeholder="用户名" clearable @change="loadData" style="width: 150px" />
        <el-select v-model="searchForm.userType" placeholder="用户类型" clearable @change="loadData" style="width: 150px">
          <el-option label="管理员" value="admin" /><el-option label="教师" value="teacher" /><el-option label="学生" value="student" /><el-option label="家长" value="parent" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="real_name" label="姓名" width="120" />
        <el-table-column prop="user_type" label="类型" width="80"><template #default="{ row }">{{ {admin:'管理员',teacher:'教师',student:'学生',parent:'家长'}[row.user_type] }}</template></el-table-column>
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="hasPermission('system:user:delete')" type="danger" link @click="handleDelete(row)">禁用</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username"><el-input v-model="form.username" :disabled="!!form.id" /></el-form-item>
        <el-form-item v-if="!form.id" label="密码" prop="password"><el-input v-model="form.password" type="password" /></el-form-item>
        <el-form-item label="姓名" prop="realName"><el-input v-model="form.real_name" /></el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="form.user_type" style="width: 100%">
            <el-option label="管理员" value="admin" /><el-option label="教师" value="teacher" /><el-option label="学生" value="student" /><el-option label="家长" value="parent" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
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
const searchForm = reactive({ username: '', userType: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({ id: null, username: '', password: '', real_name: '', user_type: 'teacher', phone: '', email: '' })
const rules = { username: [{ required: true, message: '请输入用户名', trigger: 'blur' }], real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }], password: [{ required: true, message: '请输入密码', trigger: 'blur' }] }

const loadData = async () => { loading.value = true; try { const res = await api.get('/users', { params: { ...searchForm, page: pagination.page, pageSize: pagination.pageSize } }); tableData.value = res.data.list || []; pagination.total = res.data.total || 0 } catch (e) { console.error(e) } finally { loading.value = false } }
const handleAdd = () => { Object.assign(form, { id: null, username: '', password: '', real_name: '', user_type: 'teacher', phone: '', email: '' }); dialogTitle.value = '添加用户'; dialogVisible.value = true }
const handleEdit = (row) => { Object.assign(form, row); form.password = ''; dialogTitle.value = '编辑用户'; dialogVisible.value = true }
const handleSubmit = async () => { if (!formRef.value) return; await formRef.value.validate(async (valid) => { if (valid) { try { form.id ? await api.put(`/users/${form.id}`, form) : await api.post('/users', form); ElMessage.success('保存成功'); dialogVisible.value = false; loadData() } catch (e) { console.error(e) } }) })
const handleDelete = async (row) => { try { await ElMessageBox.confirm('确定禁用该用户吗？', '提示', { type: 'warning' }); await api.delete(`/users/${row.id}`); ElMessage.success('操作成功'); loadData() } catch (e) { if (e !== 'cancel') console.error(e) } }

onMounted(() => loadData())
</script>
