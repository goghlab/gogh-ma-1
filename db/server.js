const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// 加载环境变量，使用绝对路径
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = 5000; // 固定使用5000端口

// 数据文件路径
const CAMPAIGNS_FILE = path.resolve(__dirname, 'campaigns.json');

// 初始示例活动数据
const initialCampaigns = [
  {
    id: uuidv4(),
    title: "Summer Product Promotion",
    status: "active",
    brief: "Promote our new summer product line",
    createdAt: new Date(2023, 4, 15).toISOString(),
    campaignBrief: {
      content: "Promote our new summer product line with the goal of increasing sales and brand exposure. This campaign will focus on our latest summer collection including clothing, accessories, and home goods.",
      lastUpdated: new Date(2023, 4, 15).toISOString()
    },
    goals: {
      content: "Increase brand awareness, boost website traffic by 30%, and achieve 25% sales growth through targeted marketing efforts.",
      lastUpdated: new Date(2023, 4, 15).toISOString()
    },
    marketingChannels: {
      channels: ["Social Media", "Influencer Marketing", "Email Marketing"],
      lastUpdated: new Date(2023, 4, 15).toISOString()
    }
  },
  {
    id: uuidv4(),
    title: "Customer Loyalty Program",
    status: "draft",
    brief: "Create a loyalty program for existing customers",
    createdAt: new Date(2023, 5, 10).toISOString(),
    campaignBrief: {
      content: "Create a loyalty program for existing customers to encourage repeat purchases and improve retention. Offer special discounts, early access, and exclusive events for loyal customers.",
      lastUpdated: new Date(2023, 5, 10).toISOString()
    },
    goals: {
      content: "Increase customer lifetime value, boost membership sign-ups, and improve repeat purchase rate through personalized rewards.",
      lastUpdated: new Date(2023, 5, 10).toISOString()
    },
    marketingChannels: {
      channels: ["Email", "Mobile App", "Direct Marketing"],
      lastUpdated: new Date(2023, 5, 10).toISOString()
    }
  },
  {
    id: uuidv4(),
    title: "Content Marketing Strategy",
    status: "completed",
    brief: "Create high-quality content to attract new audiences",
    createdAt: new Date(2023, 3, 22).toISOString(),
    campaignBrief: {
      content: "Create high-quality content to attract new audiences and establish our professional image in the industry. Focus on delivering value through educational and engaging content.",
      lastUpdated: new Date(2023, 3, 22).toISOString()
    },
    goals: {
      content: "Increase website traffic, improve social media engagement, and boost conversion rates through valuable content creation.",
      lastUpdated: new Date(2023, 3, 22).toISOString()
    },
    marketingChannels: {
      channels: ["Blog", "Social Media", "eBooks"],
      lastUpdated: new Date(2023, 3, 22).toISOString()
    }
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

// 读取持久化的活动数据
function readCampaigns() {
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      // 如果文件不存在，则使用初始数据并写入文件
      writeCampaigns(initialCampaigns);
      return initialCampaigns;
    }
  } catch (error) {
    console.error('读取活动数据失败:', error);
    // 如果读取失败，不要返回initialCampaigns，而是返回空数组
    return [];
  }
}

// 写入活动数据到文件
function writeCampaigns(campaigns) {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存活动数据失败:', error);
    return false;
  }
}

// 初始化活动数据
let campaigns = readCampaigns();

// 如果是首次运行且没有数据，使用初始数据
if (campaigns.length === 0 && !fs.existsSync(CAMPAIGNS_FILE)) {
  campaigns = initialCampaigns;
  writeCampaigns(campaigns);
}

// 中间件
app.use(cors());
app.use(express.json());

// API路由 - 获取所有营销活动
app.get('/api/campaigns', (req, res) => {
  try {
    // 每次获取时都重新读取，确保数据最新
    campaigns = readCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error('获取活动失败:', error);
    res.status(500).json({ error: '获取活动失败' });
  }
});

// API路由 - 获取单个营销活动
app.get('/api/campaigns/:id', (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: '找不到该活动' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('获取活动失败:', error);
    res.status(500).json({ error: '获取活动失败' });
  }
});

// API路由 - 创建新的营销活动
app.post('/api/campaigns', (req, res) => {
  try {
    console.log('收到创建活动请求:', JSON.stringify(req.body, null, 2));
    
    // 保留客户端传来的ID，如果没有则生成新ID
    const newCampaign = {
      id: req.body.id || uuidv4(),
      ...req.body,
      createdAt: req.body.createdAt || new Date().toISOString()
    };
    
    console.log('准备创建新活动:', JSON.stringify(newCampaign, null, 2));
    campaigns.push(newCampaign);
    
    // 写入文件保存
    const success = writeCampaigns(campaigns);
    if (!success) {
      console.error('保存活动到文件失败');
      return res.status(500).json({ error: '保存活动失败' });
    }
    
    console.log('成功创建活动，当前活动总数:', campaigns.length);
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('创建活动失败:', error);
    res.status(500).json({ error: '创建活动失败' });
  }
});

// API路由 - 更新营销活动
app.patch('/api/campaigns/:id', (req, res) => {
  try {
    const campaignIndex = campaigns.findIndex(c => c.id === req.params.id);
    if (campaignIndex === -1) {
      return res.status(404).json({ message: '找不到该活动' });
    }
    
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...req.body
    };
    
    // 写入文件保存
    const success = writeCampaigns(campaigns);
    if (!success) {
      return res.status(500).json({ error: '保存活动失败' });
    }
    
    res.json(campaigns[campaignIndex]);
  } catch (error) {
    console.error('更新活动失败:', error);
    res.status(500).json({ error: '更新活动失败' });
  }
});

// API路由 - 删除营销活动
app.delete('/api/campaigns/:id', (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: '找不到该活动' });
    }
    
    // 从数组中移除活动
    campaigns.splice(campaignIndex, 1);
    
    // 写入文件保存
    const success = writeCampaigns(campaigns);
    if (!success) {
      console.error('保存活动到文件失败');
      return res.status(500).json({ error: '删除活动失败' });
    }
    
    res.json({ message: '活动已成功删除' });
  } catch (error) {
    console.error('删除活动失败:', error);
    res.status(500).json({ error: '删除活动失败' });
  }
});

// 根路由
app.get('/', (req, res) => {
  res.send('营销活动API - 数据已持久化存储');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器在端口 ${PORT} 上运行中`);
  console.log(`活动数据将持久保存到: ${CAMPAIGNS_FILE}`);
});

module.exports = app; 