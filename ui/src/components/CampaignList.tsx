"use client";

import React from 'react';
import { useState } from "react";
import { Campaign } from "@/lib/types";
import { PenSquare } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
}

function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div className="bg-[#272729] rounded-lg border border-[#414144] p-4 mb-4">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <PenSquare className="w-4 h-4 mr-2" />
          <h3 className="text-md font-semibold text-white">
            {campaign.title}
          </h3>
        </div>
        <div
          className={`text-xs px-2 py-1 rounded ${
            campaign.status === "draft"
              ? "bg-[#494950] text-white"
              : "bg-[#6766FC] text-white"
          }`}
        >
          {campaign.status}
        </div>
      </div>
      <p className="text-sm text-white/60 mb-4">
        {campaign.brief
          ? campaign.brief.length > 100
            ? campaign.brief.substring(0, 100) + "..."
            : campaign.brief
          : "No brief available"}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/40">
          {new Date(campaign.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign?: (campaign: Campaign) => void;
  userChat?: any;
}

export function CampaignList({ campaigns, onSelectCampaign, userChat }: CampaignListProps) {
  const [filter, setFilter] = useState<string>("all");
  
  const filteredCampaigns =
    filter === "all"
      ? campaigns
      : campaigns.filter(campaign => campaign.status === filter.toLowerCase());

  const handleDelete = (campaign: Campaign) => {
    // 发送删除请求到AI，触发确认流程
    const chatElement = document.querySelector('.copilot-chat') as HTMLElement;
    if (chatElement) {
      const input = chatElement.querySelector('input') as HTMLInputElement;
      if (input) {
        input.value = `I want to delete the campaign "${campaign.title}" with ID ${campaign.id}`;
        
        // 模拟输入事件
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
        
        // 模拟提交
        setTimeout(() => {
          const button = chatElement.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (button) button.click();
        }, 100);
      }
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-10 bg-[#1e1e20]">
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-white">营销活动</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs rounded-md ${
                filter === "all"
                  ? "bg-[#6766FC] text-white"
                  : "bg-[#35353a] text-white/60"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-3 py-1 text-xs rounded-md ${
                filter === "draft"
                  ? "bg-[#6766FC] text-white"
                  : "bg-[#35353a] text-white/60"
              }`}
            >
              草稿
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 text-xs rounded-md ${
                filter === "completed"
                  ? "bg-[#6766FC] text-white"
                  : "bg-[#35353a] text-white/60"
              }`}
            >
              已完成
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-[#272729] border border-[#414144] rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-zinc-200">{campaign.title}</h3>
                    <div className={`px-2 py-1 text-xs rounded ${
                      campaign.status === "draft" 
                        ? "bg-[#494950] text-zinc-200" 
                        : "bg-[#6766FC] text-white"}`}
                    >
                      {campaign.status === 'draft' ? '草稿' : '已完成'}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                    {campaign.brief || '无简介'}
                  </p>
                  <div className="text-xs text-zinc-500 mb-3">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between">
                    <button 
                      className="px-3 py-1.5 text-xs rounded-md bg-[#35353a] text-zinc-300 hover:bg-[#45454a]"
                      onClick={() => onSelectCampaign && onSelectCampaign(campaign)}
                    >
                      查看详情
                    </button>
                    <button 
                      className="px-3 py-1.5 text-xs rounded-md bg-[#6c2c2c] text-zinc-300 hover:bg-[#8c3c3c]"
                      onClick={() => handleDelete(campaign)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 bg-[#272729] rounded-lg border border-[#414144]">
              <p className="text-white">暂无符合条件的营销活动</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 