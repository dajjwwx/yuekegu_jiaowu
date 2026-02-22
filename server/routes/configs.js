const express = require('express');
const router = express.Router();
const { SystemConfig } = require('../models');
const { auth, checkPermission } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { configType } = req.query;
    const where = {};
    if (configType) where.config_type = configType;

    const configs = await SystemConfig.findAll({ where });
    res.json(configs);
  } catch (error) {
    console.error('获取配置列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:key', auth, async (req, res) => {
  try {
    const config = await SystemConfig.findOne({
      where: { config_key: req.params.key }
    });

    if (!config) {
      return res.status(404).json({ message: '配置不存在' });
    }

    res.json(config);
  } catch (error) {
    console.error('获取配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, checkPermission('system:config'), async (req, res) => {
  try {
    const { configKey, configValue, configType, configDesc } = req.body;

    const [config, created] = await SystemConfig.findOrCreate({
      where: { config_key: configKey },
      defaults: {
        config_value: configValue,
        config_type: configType,
        config_desc: configDesc
      }
    });

    if (!created) {
      config.config_value = configValue;
      if (configType) config.config_type = configType;
      if (configDesc) config.config_desc = configDesc;
      await config.save();
    }

    res.json({ message: created ? '创建成功' : '更新成功' });
  } catch (error) {
    console.error('保存配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:key', auth, checkPermission('system:config'), async (req, res) => {
  try {
    const config = await SystemConfig.findOne({
      where: { config_key: req.params.key }
    });

    if (!config) {
      return res.status(404).json({ message: '配置不存在' });
    }

    const { configValue, configDesc } = req.body;

    if (configValue !== undefined) config.config_value = configValue;
    if (configDesc !== undefined) config.config_desc = configDesc;

    await config.save();
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
