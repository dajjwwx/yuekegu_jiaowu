<template>
  <div class="page-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="收费项目管理" name="items">
        <div class="page-header"><h2>收费项目管理</h2><el-button type="primary" @click="showAddItem = true"><el-icon><Plus /></el-icon> 添加项目</el-button></div>
        <el-table :data="items" v-loading="loading" stripe>
          <el-table-column prop="item_name" label="项目名称" />
          <el-table-column prop="item_type" label="类型" width="80"><template #default="{ row }">{{ ['','学费','住宿费','餐费','代收费'][row.item_type] }}</template></el-table-column>
          <el-table-column prop="charge_standard" label="收费标准" width="100" />
          <el-table-column prop="academic_year" label="学年" width="80" />
          <el-table-column prop="deadline" label="截止日期" width="120" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag></template>
          </el-table-column>
        </el-table>
        <el-dialog v-model="showAddItem" title="添加收费项目" width="500px">
          <el-form :model="itemForm" label-width="100px">
            <el-form-item label="项目名称"><el-input v-model="itemForm.itemName" /></el-form-item>
            <el-form-item label="项目类型"><el-select v-model="itemForm.itemType" style="width: 100%"><el-option label="学费" :value="1" /><el-option label="住宿费" :value="2" /><el-option label="餐费" :value="3" /><el-option label="代收费" :value="4" /></el-select></el-form-item>
            <el-form-item label="收费标准"><el-input-number v-model="itemForm.chargeStandard" :min="0" /></el-form-item>
            <el-form-item label="学年"><el-input-number v-model="itemForm.academicYear" :min="2020" :max="2030" /></el-form-item>
          </el-form>
          <template #footer><el-button @click="showAddItem = false">取消</el-button><el-button type="primary" @click="submitItem">确定</el-button></template>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="缴费记录" name="records">
        <div class="page-header"><h2>缴费记录</h2><el-button type="primary" @click="showPayDialog = true"><el-icon><Plus /></el-icon> 缴费</el-button></div>
        <el-table :data="records" v-loading="loading" stripe>
          <el-table-column prop="student_id" label="学生ID" width="80" />
          <el-table-column prop="charge_item_id" label="收费项目ID" width="120" />
          <el-table-column prop="amount" label="金额" width="100" />
          <el-table-column prop="payment_time" label="缴费时间" width="160" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'warning'">{{ row.status === 1 ? '已缴费' : '未缴费' }}</el-tag></template>
          </el-table-column>
        </el-table>
        <el-dialog v-model="showPayDialog" title="缴费" width="400px">
          <el-form :model="payForm" label-width="100px">
            <el-form-item label="学生ID"><el-input-number v-model="payForm.studentId" /></el-form-item>
            <el-form-item label="收费项目"><el-select v-model="payForm.chargeItemId" style="width: 100%"><el-option v-for="i in items" :key="i.id" :label="i.item_name" :value="i.id" /></el-select></el-form-item>
            <el-form-item label="金额"><el-input-number v-model="payForm.amount" :min="0" /></el-form-item>
          </el-form>
          <template #footer><el-button @click="showPayDialog = false">取消</el-button><el-button type="primary" @click="submitPayment">确定</el-button></template>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="财务统计" name="statistics">
        <div class="page-header"><h2>财务统计</h2></div>
        <el-table :data="statistics" stripe>
          <el-table-column prop="item_name" label="收费项目" />
          <el-table-column prop="charge_standard" label="收费标准" width="120" />
          <el-table-column prop="paid" label="已缴金额" width="120" />
          <el-table-column prop="unpaid" label="未缴金额" width="120" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import { ElMessage } from 'element-plus'

const activeTab = ref('items')
const loading = ref(false), items = ref([]), records = ref([]), statistics = ref([])
const showAddItem = ref(false), showPayDialog = ref(false)
const itemForm = reactive({ itemName: '', itemType: 1, chargeStandard: 0, academicYear: new Date().getFullYear() })
const payForm = reactive({ studentId: '', chargeItemId: '', amount: 0 })

const loadItems = async () => { try { const res = await api.get('/finance/items'); items.value = res.data || [] } catch (e) { console.error(e) } }
const loadRecords = async () => { try { const res = await api.get('/finance/records'); records.value = res.data || [] } catch (e) { console.error(e) } }
const loadStatistics = async () => { try { const res = await api.get('/finance/statistics'); statistics.value = res.data || [] } catch (e) { console.error(e) } }
const submitItem = async () => { try { await api.post('/finance/items', itemForm); ElMessage.success('添加成功'); showAddItem.value = false; loadItems() } catch (e) { console.error(e) } }
const submitPayment = async () => { try { await api.post('/finance/records', payForm); ElMessage.success('缴费成功'); showPayDialog.value = false; loadRecords() } catch (e) { console.error(e) } }

onMounted(() => { loadItems(); loadRecords(); loadStatistics() })
</script>
