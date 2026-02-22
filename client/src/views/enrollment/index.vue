<template>
  <div class="page-container">
    <div class="page-header"><h2>招生管理</h2><el-button type="primary" @click="showAddDialog = true"><el-icon><Plus /></el-icon> 在线报名</el-button></div>
    <el-card>
      <div class="search-form">
        <el-input v-model="searchForm.name" placeholder="姓名" clearable style="width: 150px" />
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="待审核" :value="0" /><el-option label="已录取" :value="1" /><el-option label="未录取" :value="2" /><el-option label="已报到" :value="3" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="enroll_no" label="报名号" width="140" />
        <el-table-column prop="name" label="姓名" width="80" />
        <el-table-column prop="gender" label="性别" width="60"><template #default="{ row }">{{ row.gender === 1 ? '男' : '女' }}</template></el-table-column>
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="guardian_name" label="监护人" width="80" />
        <el-table-column prop="graduation_school" label="毕业学校" />
        <el-table-column prop="score" label="中考成绩" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="['','success','danger','warning'][row.status]">{{ ['待审核','已录取','未录取','已报到'][row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="showAddDialog" title="在线报名" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="性别" prop="gender"><el-radio-group v-model="form.gender"><el-radio :value="1">男</el-radio><el-radio :value="2">女</el-radio></el-radio-group></el-form-item>
        <el-form-item label="出生日期" prop="birthDate"><el-date-picker v-model="form.birthDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item>
        <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="监护人" prop="guardianName"><el-input v-model="form.guardianName" /></el-form-item>
        <el-form-item label="监护人电话" prop="guardianPhone"><el-input v-model="form.guardianPhone" /></el-form-item>
        <el-form-item label="毕业学校"><el-input v-model="form.graduationSchool" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="showAddDialog = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import { ElMessage } from 'element-plus'

const loading = ref(false), tableData = ref([]), showAddDialog = ref(false), formRef = ref()
const searchForm = reactive({ name: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({ name: '', gender: 1, birthDate: '', phone: '', guardianName: '', guardianPhone: '', graduationSchool: '' })
const rules = { name: [{ required: true, message: '请输入姓名', trigger: 'blur' }], phone: [{ required: true, message: '请输入电话', trigger: 'blur' }], guardianName: [{ required: true, message: '请输入监护人', trigger: 'blur' }], guardianPhone: [{ required: true, message: '请输入监护人电话', trigger: 'blur' }] }

const loadData = async () => { loading.value = true; try { const res = await api.get('/enrollments', { params: { ...searchForm, page: pagination.page, pageSize: pagination.pageSize } }); tableData.value = res.data.list || []; pagination.total = res.data.total || 0 } catch (e) { console.error(e) } finally { loading.value = false } }
const handleSubmit = async () => { if (!formRef.value) return; await formRef.value.validate(async (valid) => { if (valid) { try { await api.post('/enrollments', form); ElMessage.success('报名成功'); showAddDialog.value = false; loadData() } catch (e) { console.error(e) } }) }
const handleEdit = (row) => { Object.assign(form, row); showAddDialog.value = true }

onMounted(() => loadData())
</script>
