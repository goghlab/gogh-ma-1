const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

// 获取所有营销活动
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个营销活动
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新的营销活动
router.post('/', async (req, res) => {
  const campaign = new Campaign({
    title: req.body.title,
    description: req.body.description,
    targetAudience: req.body.targetAudience,
    goals: req.body.goals,
    marketingChannels: req.body.marketingChannels,
    budget: req.body.budget
  });

  try {
    const newCampaign = await campaign.save();
    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新营销活动
router.patch('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
    // 只更新提供的字段
    if (req.body.title) campaign.title = req.body.title;
    if (req.body.description) campaign.description = req.body.description;
    if (req.body.status) campaign.status = req.body.status;
    if (req.body.targetAudience) campaign.targetAudience = req.body.targetAudience;
    if (req.body.goals) campaign.goals = req.body.goals;
    if (req.body.marketingChannels) campaign.marketingChannels = req.body.marketingChannels;
    if (req.body.budget) campaign.budget = req.body.budget;
    
    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除营销活动
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
    await campaign.deleteOne();
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 