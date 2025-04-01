"use client";

import React, { useState, useEffect } from 'react';
import { Campaign } from "@/lib/types";
import { ArrowLeft, PlusCircle, Edit, BarChart3, Calendar, User, Globe, DollarSign } from 'lucide-react';

// 添加本地示例数据
const dummyCampaignDetails: Record<string, any> = {
  // 可以添加更多示例数据，使用ID作为键
  'default': {
    title: "示例营销活动",
    status: "draft",
    brief: "这是一个示例营销活动简介，用于UI设计和开发阶段。",
    description: "这是一个详细的营销活动描述，用于展示UI布局和设计效果。",
    createdAt: new Date().toISOString(),
    targetAudience: {
      ageRange: "25-34",
      gender: "所有",
      location: "全国一线城市"
    },
    goals: "提高品牌知名度，增加30%的网站流量，销售增长25%",
    marketingChannels: ["社交媒体", "影响者营销", "电子邮件"],
    budget: {
      amount: 50000,
      currency: "CNY"
    },
    startDate: new Date(2023, 9, 1).toISOString(),
    endDate: new Date(2023, 11, 31).toISOString()
  }
};

interface CampaignDetailProps {
  campaign: Campaign | null;
  onBack: () => void;
}

export function CampaignDetail({ campaign, onBack }: CampaignDetailProps) {
  const [fullCampaign, setFullCampaign] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (campaign) {
      setLoading(true);
      
      // 使用本地数据而不是从API获取
      setTimeout(() => {
        // 查看是否有对应ID的详细数据，如果没有则使用默认数据
        const details = dummyCampaignDetails[campaign.id] || dummyCampaignDetails.default;
        
        // 将基本活动数据和详细数据合并
        const mergedData = {
          ...campaign,
          ...details,
          // 确保标题和状态使用传入的活动数据
          title: campaign.title,
          status: campaign.status
        };
        
        setFullCampaign(mergedData);
        setLoading(false);
      }, 500); // 添加500ms延迟模拟网络请求

      /* 注释掉原有的API调用代码
      fetch(`http://localhost:5000/api/campaigns/${campaign.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setFullCampaign(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching campaign details:', error);
          setLoading(false);
        });
      */
    }
  }, [campaign]);

  if (!campaign) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-zinc-500">请选择一个营销活动以查看详情</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-zinc-500">正在加载活动详情...</p>
      </div>
    );
  }

  // 使用完整数据或者基本数据
  const displayCampaign = fullCampaign || campaign;

  return (
    <div className="w-full h-full overflow-y-auto pb-10 bg-[#1e1e20] text-white">
      <div className="sticky top-0 z-10 bg-[#1e1e20] pt-4 px-4 md:px-10 pb-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="mr-4 p-2 rounded hover:bg-[#35353a] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">{displayCampaign.title}</h2>
          <div className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
            displayCampaign.status === "draft" 
              ? "bg-[#494950] text-zinc-200" 
              : displayCampaign.status === "active"
                ? "bg-green-600 text-white"
                : "bg-[#5D4EFF] text-white"
          }`}>
            {displayCampaign.status === 'draft' ? '草稿' : 
             displayCampaign.status === 'active' ? '进行中' : '已完成'}
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧活动信息 */}
        <div className="space-y-6">
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">活动简介</h3>
            <p className="text-zinc-300 text-sm">
              {displayCampaign.brief || displayCampaign.description || '暂无活动简介'}
            </p>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">目标受众</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <User size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">年龄段</p>
                  <p className="text-sm">{displayCampaign.targetAudience?.ageRange || '所有年龄'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">性别</p>
                  <p className="text-sm">{displayCampaign.targetAudience?.gender || '所有'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Globe size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">地区</p>
                  <p className="text-sm">{displayCampaign.targetAudience?.location || '全国'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">营销渠道</h3>
            <div className="flex flex-wrap gap-2">
              {displayCampaign.marketingChannels && displayCampaign.marketingChannels.length > 0 ? (
                displayCampaign.marketingChannels.map((channel: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-[#35353a] text-zinc-300 rounded text-xs"
                  >
                    {channel}
                  </span>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">未指定营销渠道</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 右侧活动信息 */}
        <div className="space-y-6">
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">活动目标</h3>
            <p className="text-zinc-300 text-sm">
              {displayCampaign.goals || '暂无活动目标'}
            </p>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">预算</h3>
              <div className="flex items-center text-sm">
                <DollarSign size={16} className="text-zinc-400 mr-1" />
                <span className="font-medium">
                  {displayCampaign.budget?.amount ? 
                    `${displayCampaign.budget.amount} ${displayCampaign.budget.currency || 'CNY'}` : 
                    '未设置'}
                </span>
              </div>
            </div>
            <div className="h-2 bg-[#35353a] rounded overflow-hidden">
              <div 
                className="h-full bg-[#5D4EFF]" 
                style={{ width: '35%' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-400">
              <span>已使用: ¥0</span>
              <span>剩余: {displayCampaign.budget?.amount ? `¥${displayCampaign.budget.amount}` : '¥0'}</span>
            </div>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">日程安排</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">创建日期</p>
                  <p className="text-sm">{new Date(displayCampaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">开始日期</p>
                  <p className="text-sm">{displayCampaign.startDate ? 
                    new Date(displayCampaign.startDate).toLocaleDateString() : 
                    '未设置'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">结束日期</p>
                  <p className="text-sm">{displayCampaign.endDate ? 
                    new Date(displayCampaign.endDate).toLocaleDateString() : 
                    '未设置'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 