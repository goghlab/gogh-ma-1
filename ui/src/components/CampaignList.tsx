"use client";

import React from 'react';
import { useState } from "react";
import { Campaign } from "@/lib/types";
import { PenSquare, Grid, List } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onSelectCampaign?: (campaign: Campaign) => void;
  onDeleteCampaign?: (campaign: Campaign) => void;
  viewMode: "grid" | "list";
}

function CampaignCard({ campaign, onSelectCampaign, onDeleteCampaign, viewMode }: CampaignCardProps) {
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const gridCard = (
    <div className="relative group bg-[#272729] rounded-lg border border-[#414144] p-4 hover:border-[#5D4EFF] transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
          campaign.status === "draft" 
            ? "bg-[#494950] text-zinc-200" 
            : campaign.status === "active"
              ? "bg-green-600 text-white"
              : "bg-[#5D4EFF] text-white"
        }`}>
          {campaign.status === 'draft' ? 'Draft' : 
           campaign.status === 'active' ? 'Active' : 'Completed'}
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1 rounded hover:bg-[#35353a]" 
            title="Edit Campaign"
            onClick={() => onSelectCampaign && onSelectCampaign(campaign)}
          >
            <PenSquare size={14} className="text-zinc-400" />
          </button>
          {onDeleteCampaign && (
            <button 
              className="p-1 rounded hover:bg-[#35353a]" 
              title="Delete Campaign"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${campaign.title}"?`)) {
                  onDeleteCampaign(campaign);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
      <h3 
        className="text-white font-medium mb-2 cursor-pointer hover:text-[#5D4EFF] transition-colors" 
        onClick={() => onSelectCampaign && onSelectCampaign(campaign)}
      >
        {campaign.title}
      </h3>
      <p className="text-zinc-400 text-sm line-clamp-2 mb-3">{campaign.brief || "No description"}</p>
      <div className="text-xs text-zinc-500">Created {formatDate(campaign.createdAt)}</div>
    </div>
  );
  
  const listCard = (
    <div className="relative group bg-[#272729] rounded-lg border border-[#414144] p-3 hover:border-[#5D4EFF] transition-all">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`mr-3 px-2 py-1 text-xs font-medium rounded-full ${
            campaign.status === "draft" 
              ? "bg-[#494950] text-zinc-200" 
              : campaign.status === "active"
                ? "bg-green-600 text-white"
                : "bg-[#5D4EFF] text-white"
          }`}>
            {campaign.status === 'draft' ? 'Draft' : 
             campaign.status === 'active' ? 'Active' : 'Completed'}
          </div>
          <h3 
            className="text-white font-medium cursor-pointer hover:text-[#5D4EFF] transition-colors" 
            onClick={() => onSelectCampaign && onSelectCampaign(campaign)}
          >
            {campaign.title}
          </h3>
        </div>
        <div className="flex items-center">
          <div className="text-xs text-zinc-500 mr-3">Created {formatDate(campaign.createdAt)}</div>
          <div className="flex space-x-1">
            <button 
              className="p-1 rounded hover:bg-[#35353a]" 
              title="Edit Campaign"
              onClick={() => onSelectCampaign && onSelectCampaign(campaign)}
            >
              <PenSquare size={14} className="text-zinc-400" />
            </button>
            {onDeleteCampaign && (
              <button 
                className="p-1 rounded hover:bg-[#35353a]" 
                title="Delete Campaign"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${campaign.title}"?`)) {
                    onDeleteCampaign(campaign);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  return viewMode === "grid" ? gridCard : listCard;
}

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign?: (campaign: Campaign) => void;
  onDeleteCampaign?: (campaign: Campaign) => void;
  viewMode?: "grid" | "list";
}

export function CampaignList({ campaigns, onSelectCampaign, onDeleteCampaign, viewMode: externalViewMode }: CampaignListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">(externalViewMode || "grid");
  
  // 使用直接传入的 campaigns 数组
  const filteredCampaigns =
    filter === "all"
      ? campaigns
      : campaigns.filter(campaign => campaign.status === filter.toLowerCase());

  return (
    <div className="w-full h-full overflow-y-auto pb-4 md:pb-10 bg-[#1e1e20]">
      <div className="w-full sticky top-0 bg-[#1e1e20] pt-1 px-4 md:px-10 pb-2 z-10">
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
              className={`p-1.5 rounded-md ${
                viewMode === "grid"
                  ? "bg-[#35353a] text-[#5D4EFF]"
                  : "text-zinc-400 hover:bg-[#2a2a2e]"
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md ${
                viewMode === "list"
                  ? "bg-[#35353a] text-[#5D4EFF]"
                  : "text-zinc-400 hover:bg-[#2a2a2e]"
              }`}
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
                  onDeleteCampaign={onDeleteCampaign}
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
                  onDeleteCampaign={onDeleteCampaign}
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