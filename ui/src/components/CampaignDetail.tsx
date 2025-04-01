"use client";

import React, { useState, useEffect } from 'react';
import { Campaign } from "@/lib/types";
import { ArrowLeft, PlusCircle, Edit, BarChart3, Calendar, User, Globe, DollarSign } from 'lucide-react';

// Add local sample data
const dummyCampaignDetails: Record<string, any> = {
  // Can add more sample data, using ID as key
  'default': {
    title: "Sample Marketing Campaign",
    status: "draft",
    brief: "This is a sample marketing campaign brief, used for UI design and development phase.",
    description: "This is a detailed marketing campaign description, used to showcase UI layout and design effects.",
    createdAt: new Date().toISOString(),
    targetAudience: {
      ageRange: "25-34",
      gender: "All",
      location: "National Tier-1 Cities"
    },
    goals: "Increase brand awareness, boost website traffic by 30%, and achieve 25% sales growth",
    marketingChannels: ["Social Media", "Influencer Marketing", "Email"],
    budget: {
      amount: 50000,
      currency: "USD"
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
      
      // Use local data instead of fetching from API
      setTimeout(() => {
        // Check if there's detailed data for this ID, otherwise use default data
        const details = dummyCampaignDetails[campaign.id] || dummyCampaignDetails.default;
        
        // Merge basic campaign data with detailed data
        const mergedData = {
          ...campaign,
          ...details,
          // Ensure title and status use the passed-in campaign data
          title: campaign.title,
          status: campaign.status
        };
        
        setFullCampaign(mergedData);
        setLoading(false);
      }, 500); // Add 500ms delay to simulate network request

      /* Commented out original API call code
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
        <p className="text-zinc-500">Please select a campaign to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-zinc-500">Loading campaign details...</p>
      </div>
    );
  }

  // Use complete data or basic data
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
            {displayCampaign.status === 'draft' ? 'Draft' : 
             displayCampaign.status === 'active' ? 'Active' : 'Completed'}
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side campaign information */}
        <div className="space-y-6">
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">Campaign Brief</h3>
            <p className="text-zinc-300 text-sm">
              {displayCampaign.brief || displayCampaign.description || 'No brief available'}
            </p>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">Target Audience</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <User size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">Age Range</p>
                  <p className="text-sm">{displayCampaign.targetAudience?.ageRange || 'All ages'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">Gender</p>
                  <p className="text-sm">{displayCampaign.targetAudience?.gender || 'All'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Globe size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">Location</p>
                  <p className="text-sm">{displayCampaign.targetAudience?.location || 'Nationwide'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">Marketing Channels</h3>
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
                <p className="text-zinc-500 text-sm">No marketing channels specified</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side campaign information */}
        <div className="space-y-6">
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">Campaign Goals</h3>
            <p className="text-zinc-300 text-sm">
              {displayCampaign.goals || 'No goals specified'}
            </p>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Budget</h3>
              <div className="flex items-center text-sm">
                <DollarSign size={16} className="text-zinc-400 mr-1" />
                <span className="font-medium">
                  {displayCampaign.budget?.amount ? 
                    `${displayCampaign.budget.amount} ${displayCampaign.budget.currency || 'USD'}` : 
                    'Not set'}
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
              <span>Used: $0</span>
              <span>Remaining: {displayCampaign.budget?.amount ? `$${displayCampaign.budget.amount}` : '$0'}</span>
            </div>
          </div>
          
          <div className="bg-[#272729] rounded-lg p-5 border border-[#414144]">
            <h3 className="text-lg font-medium mb-3">Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">Created Date</p>
                  <p className="text-sm">{new Date(displayCampaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">Start Date</p>
                  <p className="text-sm">{displayCampaign.startDate ? 
                    new Date(displayCampaign.startDate).toLocaleDateString() : 
                    'Not set'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar size={16} className="text-zinc-400 mt-1 mr-2" />
                <div>
                  <p className="text-zinc-400 text-xs">End Date</p>
                  <p className="text-sm">{displayCampaign.endDate ? 
                    new Date(displayCampaign.endDate).toLocaleDateString() : 
                    'Not set'}
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