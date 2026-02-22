const express = require('express');
const router = express.Router();
const { ChargeItem, PaymentRecord, Student } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/items', auth, async (req, res) => {
  try {
    const { academicYear, itemType } = req.query;
    const where = {};
    if (academicYear) where.academic_year = academicYear;
    if (itemType) where.item_type = itemType;
    const items = await ChargeItem.findAll({ where, order: [['id', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/items', auth, checkPermission('finance:charge'), async (req, res) => {
  try {
    const { itemName, itemType, chargeStandard, chargeUnit, academicYear, semester, deadline, isRequired, remark } = req.body;
    const item = await ChargeItem.create({ itemName, itemType, chargeStandard, chargeUnit, academicYear, semester, deadline, isRequired: isRequired ?? 1, remark });
    res.status(201).json({ message: '创建成功', itemId: item.id });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/items/:id', auth, checkPermission('finance:charge'), async (req, res) => {
  try {
    const item = await ChargeItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '收费项目不存在' });
    const allowed = ['itemName', 'chargeStandard', 'deadline', 'status', 'remark'];
    allowed.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f] });
    await item.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/records', auth, async (req, res) => {
  try {
    const { studentId, chargeItemId, status } = req.query;
    const where = {};
    if (studentId) where.student_id = studentId;
    if (chargeItemId) where.charge_item_id = chargeItemId;
    if (status) where.status = status;
    const records = await PaymentRecord.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/records', auth, checkPermission('finance:payment'), async (req, res) => {
  try {
    const { studentId, chargeItemId, amount, paymentMethod, paymentTime, paymentNo, remark } = req.body;
    const record = await PaymentRecord.create({ studentId, chargeItemId, amount, paymentMethod, paymentTime: paymentTime || new Date(), paymentNo, operatorId: req.userId, status: 1, remark });
    res.status(201).json({ message: '缴费成功', recordId: record.id });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/statistics', auth, async (req, res) => {
  try {
    const { academicYear } = req.query;
    const where = { academic_year: academicYear || new Date().getFullYear() };
    const items = await ChargeItem.findAll({ where });
    const stats = await Promise.all(items.map(async item => {
      const paid = await PaymentRecord.sum('amount', { where: { chargeItemId: item.id, status: 1 } }) || 0;
      const unpaid = (item.chargeStandard * 50) - paid;
      return { itemId: item.id, itemName: item.itemName, chargeStandard: item.chargeStandard, paid, unpaid };
    }));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
