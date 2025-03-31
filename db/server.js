const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const campaignRoutes = require('./routes/campaigns');
require('dotenv').config();

const app = express();
const PORT = 5000; // 使用固定端口5000

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/campaigns', campaignRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('Marketing Campaigns API');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 