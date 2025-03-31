const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// 加载环境变量，使用绝对路径
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = 5000; // 固定使用5000端口

// 示例营销活动数据
const sampleCampaigns = [
  {
    id: uuidv4(),
    title: "夏季新品促销活动",
    status: "active",
    brief: "推广我们新的夏季产品线，目标是提高销售额和品牌曝光度。",
    createdAt: new Date(2023, 4, 15).toISOString(),
    targetAudience: {
      ageRange: "18-35",
      gender: "所有",
      location: "全国一线城市"
    },
    goals: "提高品牌知名度，增加30%的网站流量，销售增长25%",
    marketingChannels: ["社交媒体", "影响者营销", "电子邮件"],
    budget: {
      amount: 50000,
      currency: "CNY"
    },
    description: "夏季系列产品推广，包括新款服装、配饰和家居用品。"
  },
  {
    id: uuidv4(),
    title: "会员忠诚度计划",
    status: "draft",
    brief: "为现有客户建立忠诚度计划，鼓励重复购买并提高客户保留率。",
    createdAt: new Date(2023, 5, 10).toISOString(),
    targetAudience: {
      ageRange: "25-55",
      gender: "所有",
      location: "全国"
    },
    goals: "提高客户终身价值，增加会员计划注册，提高重复购买率",
    marketingChannels: ["电子邮件", "移动应用", "直接营销"],
    budget: {
      amount: 30000,
      currency: "CNY"
    },
    description: "为忠实客户提供特别折扣、优先购买权和专属活动。"
  },
  {
    id: uuidv4(),
    title: "内容营销策略",
    status: "completed",
    brief: "创建高质量的内容以吸引新受众并建立我们在行业内的专业形象。",
    createdAt: new Date(2023, 3, 22).toISOString(),
    targetAudience: {
      ageRange: "20-45",
      gender: "所有",
      location: "全国"
    },
    goals: "增加网站流量，提高社交媒体参与度，增加转化率",
    marketingChannels: ["博客", "社交媒体", "电子书"],
    budget: {
      amount: 20000,
      currency: "CNY"
    },
    description: "创建和分发与目标受众相关的价值内容。"
  },
  {
    id: uuidv4(),
    title: "节日促销活动",
    status: "scheduled",
    brief: "为即将到来的节日季节准备特别促销活动，提高销售额。",
    createdAt: new Date(2023, 6, 5).toISOString(),
    targetAudience: {
      ageRange: "所有",
      gender: "所有",
      location: "全国"
    },
    goals: "提高节日季节销售额，吸引新客户，清理库存",
    marketingChannels: ["电视广告", "社交媒体", "电子邮件", "线下活动"],
    budget: {
      amount: 100000,
      currency: "CNY"
    },
    description: "节日限时优惠，包括特别礼品包装和送货选项。"
  },
  {
    id: uuidv4(),
    title: "产品发布会",
    status: "draft",
    brief: "为新产品线规划一场大型发布活动。",
    createdAt: new Date(2023, 7, 20).toISOString(),
    targetAudience: {
      ageRange: "25-40",
      gender: "所有",
      location: "北京、上海、广州"
    },
    goals: "创造产品知名度，获得媒体报道，生成销售线索",
    marketingChannels: ["专业活动", "新闻发布", "社交媒体"],
    budget: {
      amount: 80000,
      currency: "CNY"
    },
    description: "包括新闻发布会、媒体专访和产品演示。"
  }
];

// 中间件
app.use(cors());
app.use(express.json());

// API路由 - 获取所有营销活动
app.get('/api/campaigns', (req, res) => {
  res.json(sampleCampaigns);
});

// API路由 - 获取单个营销活动
app.get('/api/campaigns/:id', (req, res) => {
  const campaign = sampleCampaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  res.json(campaign);
});

// API路由 - 创建新的营销活动
app.post('/api/campaigns', (req, res) => {
  const newCampaign = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  sampleCampaigns.push(newCampaign);
  res.status(201).json(newCampaign);
});

// API路由 - 更新营销活动
app.patch('/api/campaigns/:id', (req, res) => {
  const campaignIndex = sampleCampaigns.findIndex(c => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  
  sampleCampaigns[campaignIndex] = {
    ...sampleCampaigns[campaignIndex],
    ...req.body
  };
  
  res.json(sampleCampaigns[campaignIndex]);
});

// API路由 - 删除营销活动
app.delete('/api/campaigns/:id', (req, res) => {
  const campaignIndex = sampleCampaigns.findIndex(c => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  
  const deletedCampaign = sampleCampaigns.splice(campaignIndex, 1)[0];
  res.json({ message: 'Campaign deleted', campaign: deletedCampaign });
});

// 根路由
app.get('/', (req, res) => {
  res.send('Marketing Campaigns API');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 