const express = require('express');
const router = express.Router();
const { Notice } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { noticeType, targetType, status, page = 1, pageSize = 10 } = req.query;
    const where = {};

    if (noticeType) where.notice_type = noticeType;
    if (targetType) where.target_type = targetType;
    if (status) where.status = status;

    const { count, rows } = await Notice.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: '通知不存在' });
    }

    notice.read_count += 1;
    await notice.save();

    res.json(notice);
  } catch (error) {
    console.error('获取通知详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('notice:create'), async (req, res) => {
  try {
    const { title, content, noticeType, targetType, targetIds, isUrgent, expireTime } = req.body;

    const notice = await Notice.create({
      title,
      content,
      notice_type: noticeType || 1,
      target_type: targetType || 1,
      target_ids: targetIds,
      is_urgent: isUrgent || 0,
      publish_by: req.userId,
      publish_time: new Date(),
      expire_time: expireTime,
      status: 1
    });

    res.status(201).json({ message: '发布成功', noticeId: notice.id });
  } catch (error) {
    console.error('发布通知失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, checkPermission('notice:edit'), async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: '通知不存在' });
    }

    const { title, content, noticeType, targetType, targetIds, isUrgent, expireTime, status } = req.body;

    if (title) notice.title = title;
    if (content) notice.content = content;
    if (noticeType) notice.notice_type = noticeType;
    if (targetType) notice.target_type = targetType;
    if (targetIds) notice.target_ids = targetIds;
    if (isUrgent !== undefined) notice.is_urgent = isUrgent;
    if (expireTime) notice.expire_time = expireTime;
    if (status !== undefined) notice.status = status;

    await notice.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新通知失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, checkPermission('notice:delete'), async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: '通知不存在' });
    }

    await notice.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
