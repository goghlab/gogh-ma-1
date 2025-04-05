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
            className="mr-4 p-2 rounded hover:bg-[#1a1a1d] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">{displayCampaign.title}</h2>
          <div className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
            displayCampaign.status === "draft" 
              ? "bg-[#2a2a2e] text-zinc-300" 
              : displayCampaign.status === "active"
                ? "bg-green-600/80 text-white"
                : "bg-[#5D4EFF]/80 text-white"
          }`}>
            {displayCampaign.status === 'draft' ? 'Draft' : 
             displayCampaign.status === 'active' ? 'Active' : 'Completed'}
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-10 grid grid-cols-1 gap-6">
        <div className="bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
          <h3 className="text-lg font-medium mb-3">Campaign Brief</h3>
          <p className="text-zinc-300 text-sm">
            {displayCampaign.brief || displayCampaign.description || 'No brief available'}
          </p>
        </div>

        <div className="bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
          <h3 className="text-lg font-medium mb-3">Campaign Goals</h3>
          <p className="text-zinc-300 text-sm">
            {displayCampaign.goals || 'No goals specified'}
          </p>
        </div>

        <div className="bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
          <h3 className="text-lg font-medium mb-3">Marketing Channels</h3>
          <div className="flex flex-wrap gap-2">
            {displayCampaign.marketingChannels && displayCampaign.marketingChannels.length > 0 ? (
              displayCampaign.marketingChannels.map((channel: string, index: number) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-[#2a2a2e] text-zinc-300 rounded text-xs"
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
    </div>
  );
} 