<template>
  <div class="page-container">
    <div class="page-header"><h2>通知公告</h2><el-button v-if="hasPermission('notice:create')" type="primary" @click="handleAdd"><el-icon><Plus /></el-icon> 发布通知</el-button></div>
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="notice_type" label="类型" width="80"><template #default="{ row }">{{ row.notice_type === 1 ? '通知' : '公告' }}</template></el-table-column>
        <el-table-column prop="is_urgent" label="紧急" width="60"><template #default="{ row }"><el-tag v-if="row.is_urgent" type="danger" size="small">是</el-tag></template></el-table-column>
        <el-table-column prop="publisher" label="发布人" width="100"><template #default="{ row }">{{ row.publisher?.real_name }}</template></el-table-column>
        <el-table-column prop="publish_time" label="发布时间" width="160" />
        <el-table-column prop="read_count" label="阅读量" width="80" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button v-if="hasPermission('notice:edit')" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="hasPermission('notice:delete')" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="类型" prop="notice_type"><el-radio-group v-model="form.notice_type"><el-radio :value="1">通知</el-radio><el-radio :value="2">公告</el-radio></el-radio-group></el-form-item>
        <el-form-item label="紧急"><el-switch v-model="form.is_urgent" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="viewVisible" title="查看通知" width="600px">
      <h3>{{ currentNotice.title }}</h3>
      <p style="color: #909399; margin: 10px 0">发布时间：{{ currentNotice.publish_time }}</p>
      <div style="margin-top: 20px; line-height: 2">{{ currentNotice.content }}</div>
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

const loading = ref(false), tableData = ref([]), dialogVisible = ref(false), viewVisible = ref(false), dialogTitle = ref(''), formRef = ref(), currentNotice = ref({})
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({ id: null, title: '', content: '', notice_type: 1, is_urgent: 0 })
const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], content: [{ required: true, message: '请输入内容', trigger: 'blur' }] }

const loadData = async () => { loading.value = true; try { const res = await api.get('/notices', { params: { page: pagination.page, pageSize: pagination.pageSize } }); tableData.value = res.data.list || []; pagination.total = res.data.total || 0 } catch (e) { console.error(e) } finally { loading.value = false } }
const handleAdd = () => { Object.assign(form, { id: null, title: '', content: '', notice_type: 1, is_urgent: 0 }); dialogTitle.value = '发布通知'; dialogVisible.value = true }
const handleEdit = (row) => { Object.assign(form, row); dialogTitle.value = '编辑通知'; dialogVisible.value = true }
const handleView = async (row) => { try { const res = await api.get(`/notices/${row.id}`); currentNotice.value = res.data; viewVisible.value = true } catch (e) { console.error(e) } }
const handleSubmit = async () => { if (!formRef.value) return; await formRef.value.validate(async (valid) => { if (valid) { try { form.id ? await api.put(`/notices/${form.id}`, form) : await api.post('/notices', form); ElMessage.success('保存成功'); dialogVisible.value = false; loadData() } catch (e) { console.error(e) } }) })
const handleDelete = async (row) => { try { await ElMessageBox.confirm('确定删除该通知吗？', '提示', { type: 'warning' }); await api.delete(`/notices/${row.id}`); ElMessage.success('删除成功'); loadData() } catch (e) { if (e !== 'cancel') console.error(e) } }

onMounted(() => loadData())
</script>
