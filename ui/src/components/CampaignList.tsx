"use client";

import React from 'react';
import { useState } from "react";
import { Campaign } from "@/lib/types";
import { PenSquare, Grid, List } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onSelectCampaign?: (campaign: Campaign) => void;
  handleDelete: (campaign: Campaign) => void;
  viewMode: "grid" | "list";
}

function CampaignCard({ campaign, onSelectCampaign, handleDelete, viewMode }: CampaignCardProps) {
  if (viewMode === "list") {
    // 列表视图
    return (
      <div className="bg-[#272729] border border-[#414144] rounded-lg overflow-hidden mb-3">
        <div className="p-3 flex items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-md font-medium text-zinc-200 mr-2">{campaign.title}</h3>
              <div className={`px-2 py-0.5 text-xs font-medium rounded ${
                campaign.status === "draft" 
                  ? "bg-[#494950] text-zinc-200" 
                  : "bg-[#5D4EFF] text-white"}`}
              >
                {campaign.status === 'draft' ? 'Draft' : 'Completed'}
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {new Date(campaign.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="px-2 py-1 text-xs rounded-md bg-[#35353a] text-zinc-300 hover:bg-[#45454a]"
              onClick={() => onSelectCampaign && onSelectCampaign(campaign)}
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 网格视图
  return (
    <div className="bg-[#272729] border border-[#414144] rounded-lg overflow-hidden h-full">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-zinc-200">{campaign.title}</h3>
          <div className={`px-2 py-1 text-xs font-medium rounded ${
            campaign.status === "draft" 
              ? "bg-[#494950] text-zinc-200" 
              : "bg-[#5D4EFF] text-white"}`}
          >
            {campaign.status === 'draft' ? 'Draft' : 'Completed'}
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
          {campaign.brief || 'No brief available'}
        </p>
        <div className="text-xs text-zinc-500 mb-3">
          {new Date(campaign.createdAt).toLocaleDateString()}
        </div>
        <div className="flex justify-between">
          <button 
            className="w-full px-3 py-1.5 text-xs rounded-md bg-[#35353a] text-zinc-300 hover:bg-[#45454a]"
            onClick={() => onSelectCampaign && onSelectCampaign(campaign)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign?: (campaign: Campaign) => void;
  userChat?: any;
  viewMode?: "grid" | "list";
}

export function CampaignList({ campaigns, onSelectCampaign, userChat, viewMode: externalViewMode }: CampaignListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">(externalViewMode || "grid");
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>(campaigns);
  
  // 当外部campaigns变化时更新本地状态
  React.useEffect(() => {
    setLocalCampaigns(campaigns);
  }, [campaigns]);
  
  const filteredCampaigns =
    filter === "all"
      ? localCampaigns
      : localCampaigns.filter(campaign => campaign.status === filter.toLowerCase());

  const handleDelete = (campaign: Campaign) => {
    // 创建一个确认对话框
    if (window.confirm(`Are you sure you want to delete the campaign "${campaign.title}"?`)) {
      // 从MongoDB中删除活动
      fetch(`http://localhost:5000/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Campaign deleted from database:', data);
        
        // 从本地状态中移除活动
        const updatedCampaigns = localCampaigns.filter(c => c.id !== campaign.id);
        setLocalCampaigns(updatedCampaigns);
        
        // 记录删除操作
        console.log(`Deleted campaign: ${campaign.title} (ID: ${campaign.id})`);
      })
      .catch(error => {
        console.error('Error deleting campaign:', error);
        alert('Error deleting campaign. Please try again.');
      });
    }
  };

  const handleStatusChange = async (campaign: Campaign, newStatus: 'active' | 'draft' | 'completed' | 'scheduled') => {
    try {
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Campaign status updated:', data);

      // 从本地状态中更新活动状态
      const updatedCampaigns = localCampaigns.map(c =>
        c.id === campaign.id ? { ...c, status: newStatus } : c
      );
      setLocalCampaigns(updatedCampaigns);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert('Error updating campaign status. Please try again.');
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto pb-4 md:pb-10 bg-[#1e1e20]">
      <div className="w-full sticky top-0 bg-[#1e1e20] pt-4 px-4 md:px-10 pb-2 z-10">
        <h2 className="text-xl font-semibold text-white mb-4">Marketing Campaigns</h2>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs rounded-md ${
                filter === "all"
                  ? "bg-[#5D4EFF] text-white font-medium"
                  : "bg-[#35353a] text-white/60"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-3 py-1 text-xs rounded-md ${
                filter === "draft"
                  ? "bg-[#5D4EFF] text-white font-medium"
                  : "bg-[#35353a] text-white/60"
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 text-xs rounded-md ${
                filter === "completed"
                  ? "bg-[#5D4EFF] text-white font-medium"
                  : "bg-[#35353a] text-white/60"
              }`}
            >
              Completed
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setViewMode("grid")} 
              className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-[#35353a] text-[#5D4EFF]" : "text-zinc-400 hover:bg-[#2a2a2e]"}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")} 
              className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-[#35353a] text-[#5D4EFF]" : "text-zinc-400 hover:bg-[#2a2a2e]"}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10">
        {viewMode === "grid" ? (
          // 网格视图
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onSelectCampaign={onSelectCampaign}
                  handleDelete={handleDelete}
                  viewMode={viewMode}
                />
              ))
            ) : (
              <div className="col-span-full text-center p-6 bg-[#272729] rounded-lg border border-[#414144]">
                <p className="text-white">No marketing campaigns found</p>
              </div>
            )}
          </div>
        ) : (
          // 列表视图
          <div className="space-y-1">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onSelectCampaign={onSelectCampaign}
                  handleDelete={handleDelete}
                  viewMode={viewMode}
                />
              ))
            ) : (
              <div className="text-center p-6 bg-[#272729] rounded-lg border border-[#414144]">
                <p className="text-white">No marketing campaigns found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 