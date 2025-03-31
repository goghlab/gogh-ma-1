const mongoose = require('mongoose');

// 简单的营销活动模型，后续可扩展
const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // 基本目标受众信息
  targetAudience: {
    ageRange: String,
    gender: String,
    location: String
  },
  // 基本目标
  goals: String,
  // 基本营销渠道
  marketingChannels: [String],
  // 预算
  budget: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  // 简短描述
  description: String
});

// 更新时自动更新updatedAt字段
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema); 