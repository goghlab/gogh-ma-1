"use client";

import React, { useState, useEffect } from 'react';
import { Campaign } from "@/lib/types";
import { ArrowLeft, PlusCircle, Edit, BarChart3, Calendar, User, Globe, DollarSign } from 'lucide-react';
import { CampaignBlueprint } from './CampaignBlueprint';

// Add local sample data
const dummyCampaignDetails: Record<string, any> = {
  // Can add more sample data, using ID as key
  'default': {
    title: "Sample Marketing Campaign",
    status: "draft",
    brief: "This is a sample marketing campaign brief",
    createdAt: new Date().toISOString(),
    campaignBrief: {
      content: "This is a detailed marketing campaign brief that outlines our strategy and approach. We will focus on creating engaging content across Facebook, Instagram, and X to reach our target audience effectively.",
      lastUpdated: new Date().toISOString()
    },
    goals: {
      content: "Our primary goals include increasing brand awareness by 50%, boosting social media engagement by 30%, and achieving a 25% growth in followers across our main social platforms.",
      lastUpdated: new Date().toISOString()
    },
    marketingChannels: {
      channels: ["Facebook", "Instagram", "X"],
      lastUpdated: new Date().toISOString()
    }
  },
  // Add specific campaign data
  '02f0dc6c-cc8c-4ccb-b4b8-4b7f4225de62': {
    campaignBrief: {
      content: "Our summer product line promotion aims to showcase our latest collection through engaging social media content. We will create visually appealing posts for Instagram, engaging stories on Facebook, and real-time updates on X.",
      lastUpdated: "2023-05-14T16:00:00.000Z"
    },
    goals: {
      content: "We aim to achieve a 30% increase in social media engagement, with specific focus on Instagram Reels performance and Facebook post reach.",
      lastUpdated: "2023-05-14T16:00:00.000Z"
    },
    marketingChannels: {
      channels: ["Instagram", "Facebook", "X"],
      lastUpdated: "2023-05-14T16:00:00.000Z"
    }
  },
  'd64d1a95-8d53-4f26-bb5b-b442a3dd773a': {
    campaignBrief: {
      content: "The loyalty program will be promoted through our main social media channels, featuring exclusive member stories on Instagram, community engagement on Facebook, and program updates on X.",
      lastUpdated: "2023-06-09T16:00:00.000Z"
    },
    goals: {
      content: "Key objectives include increasing social media following by 40% across platforms, with particular emphasis on Facebook group engagement and Instagram story interactions.",
      lastUpdated: "2023-06-09T16:00:00.000Z"
    },
    marketingChannels: {
      channels: ["Facebook", "Instagram", "X"],
      lastUpdated: "2023-06-09T16:00:00.000Z"
    }
  },
  '0efc0194-6a22-4abc-a96c-8f70aaa69790': {
    campaignBrief: {
      content: "Our content strategy focuses on creating platform-specific content that resonates with each social media audience. We will develop engaging posts for Facebook, visual stories for Instagram, and trending topics for X.",
      lastUpdated: "2023-04-21T16:00:00.000Z"
    },
    goals: {
      content: "We aim to increase our social media presence by achieving 45% higher engagement rates on Instagram, expanding Facebook reach, and improving X post interactions.",
      lastUpdated: "2023-04-21T16:00:00.000Z"
    },
    marketingChannels: {
      channels: ["Facebook", "Instagram", "X"],
      lastUpdated: "2023-04-21T16:00:00.000Z"
    }
  }
};

interface CampaignDetailProps {
  campaign: Campaign | null;
  onBack: () => void;
}

export function CampaignDetail({ campaign, onBack }: CampaignDetailProps) {
  const [fullCampaign, setFullCampaign] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);

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
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Campaign Brief</h3>
            <span className="text-xs text-zinc-500">
              Last updated: {displayCampaign.campaignBrief?.lastUpdated ? 
                new Date(displayCampaign.campaignBrief.lastUpdated).toLocaleDateString() : 
                'Not available'}
            </span>
          </div>
          <p className="text-zinc-300 text-sm">
            {displayCampaign.campaignBrief?.content || 'No brief available'}
          </p>
        </div>

        <div className="bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Key Offer</h3>
            <span className="text-xs text-zinc-500">
              Last updated: {displayCampaign.keyOffer?.lastUpdated ? 
                new Date(displayCampaign.keyOffer.lastUpdated).toLocaleDateString() : 
                'Not available'}
            </span>
          </div>
          <p className="text-zinc-300 text-sm">
            {displayCampaign.keyOffer?.content || 'No key offer specified'}
          </p>
        </div>

        <div className="bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Social Media Channels</h3>
            <span className="text-xs text-zinc-500">
              Last updated: {displayCampaign.marketingChannels?.lastUpdated ? 
                new Date(displayCampaign.marketingChannels.lastUpdated).toLocaleDateString() : 
                'Not available'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayCampaign.marketingChannels?.channels && displayCampaign.marketingChannels.channels.length > 0 ? (
              displayCampaign.marketingChannels.channels.map((channel: string, index: number) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-[#2a2a2e] text-zinc-300 rounded text-xs"
                >
                  {channel}
                </span>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No social media channels specified</p>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button 
            className="px-6 py-3 border-2 border-[#5D4EFF] text-[#5D4EFF] rounded-lg hover:bg-[#5D4EFF] hover:text-white transition-all duration-200 font-medium"
            onClick={() => setIsBlueprintOpen(!isBlueprintOpen)}
          >
            {isBlueprintOpen ? 'Hide Campaign Blueprint' : 'Generate Campaign Blueprint'}
          </button>
        </div>

        <CampaignBlueprint isOpen={isBlueprintOpen} />
      </div>
    </div>
  );
} 