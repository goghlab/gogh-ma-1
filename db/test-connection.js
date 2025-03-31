const connectDB = require('./config/db');
const Campaign = require('./models/Campaign');
const mongoose = require('mongoose');

async function testConnection() {
  try {
    // 连接数据库
    const connected = await connectDB();
    if (!connected) {
      console.error('无法连接到MongoDB，测试中止');
      return;
    }
    
    // 创建一个测试营销活动
    console.log('创建测试营销活动...');
    const testCampaign = new Campaign({
      title: '测试营销活动',
      description: '这是一个测试营销活动',
      targetAudience: {
        ageRange: '25-34',
        gender: 'all',
        location: '全球'
      },
      goals: '测试MongoDB连接',
      marketingChannels: ['电子邮件', '社交媒体'],
      budget: {
        amount: 1000,
        currency: 'USD'
      }
    });
    
    // 保存测试数据
    await testCampaign.save();
    console.log('测试营销活动已保存，ID:', testCampaign._id);
    
    // 从数据库查询
    console.log('从数据库查询营销活动...');
    const savedCampaign = await Campaign.findById(testCampaign._id);
    console.log('查询结果:', savedCampaign);
    
    // 关闭连接
    await mongoose.connection.close();
    console.log('MongoDB连接已关闭');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
testConnection(); 