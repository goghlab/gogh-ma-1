const Campaign = require('../models/Campaign');

/**
 * 营销活动服务
 * 提供与数据库交互的方法
 */
const campaignService = {
  /**
   * 获取所有营销活动
   */
  getAllCampaigns: async () => {
    try {
      return await Campaign.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching campaigns: ${error.message}`);
    }
  },

  /**
   * 获取单个营销活动
   * @param {string} id - 营销活动ID
   */
  getCampaignById: async (id) => {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) throw new Error('Campaign not found');
      return campaign;
    } catch (error) {
      throw new Error(`Error fetching campaign: ${error.message}`);
    }
  },

  /**
   * 创建新的营销活动
   * @param {Object} campaignData - 营销活动数据
   */
  createCampaign: async (campaignData) => {
    try {
      const campaign = new Campaign({
        title: campaignData.title || 'New Campaign',
        description: campaignData.description || '',
        status: campaignData.status || 'draft',
        targetAudience: campaignData.targetAudience || {},
        goals: campaignData.goals || '',
        marketingChannels: campaignData.marketingChannels || [],
        budget: campaignData.budget || { amount: 0, currency: 'USD' }
      });
      
      return await campaign.save();
    } catch (error) {
      throw new Error(`Error creating campaign: ${error.message}`);
    }
  },

  /**
   * 更新营销活动
   * @param {string} id - 营销活动ID
   * @param {Object} updateData - 更新数据
   */
  updateCampaign: async (id, updateData) => {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) throw new Error('Campaign not found');
      
      // 更新字段
      Object.keys(updateData).forEach(key => {
        campaign[key] = updateData[key];
      });
      
      return await campaign.save();
    } catch (error) {
      throw new Error(`Error updating campaign: ${error.message}`);
    }
  },

  /**
   * 删除营销活动
   * @param {string} id - 营销活动ID
   */
  deleteCampaign: async (id) => {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) throw new Error('Campaign not found');
      
      await campaign.deleteOne();
      return { success: true, message: 'Campaign deleted' };
    } catch (error) {
      throw new Error(`Error deleting campaign: ${error.message}`);
    }
  },

  /**
   * 根据目标受众更新营销活动
   * @param {string} id - 营销活动ID
   * @param {Object} audienceData - 目标受众数据
   */
  updateTargetAudience: async (id, audienceData) => {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) throw new Error('Campaign not found');
      
      campaign.targetAudience = {
        ...campaign.targetAudience,
        ...audienceData
      };
      
      return await campaign.save();
    } catch (error) {
      throw new Error(`Error updating target audience: ${error.message}`);
    }
  },

  /**
   * 更新营销活动目标
   * @param {string} id - 营销活动ID
   * @param {string} goals - 营销活动目标
   */
  updateCampaignGoals: async (id, goals) => {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) throw new Error('Campaign not found');
      
      campaign.goals = goals;
      return await campaign.save();
    } catch (error) {
      throw new Error(`Error updating campaign goals: ${error.message}`);
    }
  },

  /**
   * 更新营销渠道
   * @param {string} id - 营销活动ID
   * @param {Array} channels - 营销渠道列表
   */
  updateMarketingChannels: async (id, channels) => {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) throw new Error('Campaign not found');
      
      campaign.marketingChannels = channels;
      return await campaign.save();
    } catch (error) {
      throw new Error(`Error updating marketing channels: ${error.message}`);
    }
  },

  /**
   * 更新营销活动预算
   * @param {string} id - 营销活动ID
   * @param {Object} budget - 预算信息
   */
  updateBudget: async (id, budget) => {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) throw new Error('Campaign not found');
      
      campaign.budget = {
        ...campaign.budget,
        ...budget
      };
      
      return await campaign.save();
    } catch (error) {
      throw new Error(`Error updating budget: ${error.message}`);
    }
  }
};

module.exports = campaignService; 