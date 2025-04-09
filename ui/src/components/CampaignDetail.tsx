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
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isEditing, setIsEditing] = useState({
    brief: false,
    keyOffer: false,
    channels: false
  });
  const [editValues, setEditValues] = useState({
    brief: '',
    keyOffer: '',
    channels: [] as string[]
  });
  const blueprintRef = React.useRef<HTMLDivElement>(null);

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
        setEditValues({
          brief: mergedData.campaignBrief?.content || '',
          keyOffer: mergedData.keyOffer?.content || '',
          channels: mergedData.marketingChannels?.channels || []
        });
        setLoading(false);
      }, 500);
    }
  }, [campaign]);

  // Add new useEffect to handle blueprint generation
  useEffect(() => {
    if (isBlueprintOpen) {
      // If any section is being edited, save it
      if (isEditing.brief) handleSave('brief');
      if (isEditing.keyOffer) handleSave('keyOffer');
      if (isEditing.channels) handleSave('channels');
      
      // Reset all editing states
      setIsEditing({
        brief: false,
        keyOffer: false,
        channels: false
      });
    }
  }, [isBlueprintOpen]);

  const handleSave = (field: 'brief' | 'keyOffer' | 'channels') => {
    if (fullCampaign) {
      const updatedCampaign = { ...fullCampaign };
      const now = new Date().toISOString();

      switch (field) {
        case 'brief':
          updatedCampaign.campaignBrief = {
            content: editValues.brief,
            lastUpdated: now
          };
          break;
        case 'keyOffer':
          updatedCampaign.keyOffer = {
            content: editValues.keyOffer,
            lastUpdated: now
          };
          break;
        case 'channels':
          updatedCampaign.marketingChannels = {
            channels: editValues.channels,
            lastUpdated: now
          };
          break;
      }

      setFullCampaign(updatedCampaign);
      setIsEditing({ ...isEditing, [field]: false });
    }
  };

  const handleBlueprintAction = () => {
    if (isBlueprintOpen) {
      setShowDeleteConfirm(true);
    } else {
      setIsGeneratingBlueprint(true);
      // Simulate API call to generate blueprint
      setTimeout(() => {
        setIsGeneratingBlueprint(false);
        setIsBlueprintOpen(true);
        // Add smooth scroll after blueprint is generated
        setTimeout(() => {
          blueprintRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }, 2000);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      setIsBlueprintOpen(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

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
                : "bg-[#1a1a1d] text-white"
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
            <div className="flex items-center space-x-4">
              <span className="text-xs text-zinc-500">
                Last updated: {displayCampaign.campaignBrief?.lastUpdated ? 
                  new Date(displayCampaign.campaignBrief.lastUpdated).toLocaleDateString() : 
                  'Not available'}
              </span>
              <button 
                onClick={() => {
                  if (isEditing.brief) {
                    handleSave('brief');
                  } else {
                    setIsEditing({ ...isEditing, brief: true });
                    setEditValues({ ...editValues, brief: displayCampaign.campaignBrief?.content || '' });
                  }
                }}
                disabled={isBlueprintOpen}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isBlueprintOpen 
                    ? "bg-[#1e1e20] text-zinc-500 cursor-not-allowed" 
                    : "bg-[#2a2a2e] text-zinc-300 hover:bg-[#35353a]"
                }`}
              >
                {isEditing.brief ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          {isEditing.brief ? (
            <textarea
              value={editValues.brief}
              onChange={(e) => setEditValues({ ...editValues, brief: e.target.value })}
              className="w-full bg-[#2a2a2e] text-zinc-300 text-sm p-3 rounded border border-[#414144] focus:outline-none focus:border-[#5D4EFF]"
              rows={4}
              placeholder="Enter campaign brief..."
            />
          ) : (
            <p className="text-zinc-300 text-sm">
              {displayCampaign.campaignBrief?.content || 'No brief available'}
            </p>
          )}
        </div>

        <div className="bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Key Offer</h3>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-zinc-500">
                Last updated: {displayCampaign.keyOffer?.lastUpdated ? 
                  new Date(displayCampaign.keyOffer.lastUpdated).toLocaleDateString() : 
                  'Not available'}
              </span>
              <button 
                onClick={() => {
                  if (isEditing.keyOffer) {
                    handleSave('keyOffer');
                  } else {
                    setIsEditing({ ...isEditing, keyOffer: true });
                    setEditValues({ ...editValues, keyOffer: displayCampaign.keyOffer?.content || '' });
                  }
                }}
                disabled={isBlueprintOpen}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isBlueprintOpen 
                    ? "bg-[#1e1e20] text-zinc-500 cursor-not-allowed" 
                    : "bg-[#2a2a2e] text-zinc-300 hover:bg-[#35353a]"
                }`}
              >
                {isEditing.keyOffer ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          {isEditing.keyOffer ? (
            <textarea
              value={editValues.keyOffer}
              onChange={(e) => setEditValues({ ...editValues, keyOffer: e.target.value })}
              className="w-full bg-[#2a2a2e] text-zinc-300 text-sm p-3 rounded border border-[#414144] focus:outline-none focus:border-[#5D4EFF]"
              rows={4}
              placeholder="Enter key offer..."
            />
          ) : (
            <p className="text-zinc-300 text-sm">
              {displayCampaign.keyOffer?.content || 'No key offer specified'}
            </p>
          )}
        </div>

        <div className="bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Social Media Channels</h3>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-zinc-500">
                Last updated: {displayCampaign.marketingChannels?.lastUpdated ? 
                  new Date(displayCampaign.marketingChannels.lastUpdated).toLocaleDateString() : 
                  'Not available'}
              </span>
              <button 
                onClick={() => {
                  if (isEditing.channels) {
                    handleSave('channels');
                  } else {
                    setIsEditing({ ...isEditing, channels: true });
                    setEditValues({ ...editValues, channels: displayCampaign.marketingChannels?.channels || [] });
                  }
                }}
                disabled={isBlueprintOpen}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isBlueprintOpen 
                    ? "bg-[#1e1e20] text-zinc-500 cursor-not-allowed" 
                    : "bg-[#2a2a2e] text-zinc-300 hover:bg-[#35353a]"
                }`}
              >
                {isEditing.channels ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          {isEditing.channels ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {['Facebook', 'Instagram', 'X'].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => {
                      const currentChannels = editValues.channels;
                      if (currentChannels.includes(channel)) {
                        setEditValues({
                          ...editValues,
                          channels: currentChannels.filter(ch => ch !== channel)
                        });
                      } else {
                        setEditValues({
                          ...editValues,
                          channels: [...currentChannels, channel]
                        });
                      }
                    }}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      editValues.channels.includes(channel)
                        ? 'bg-[#5D4EFF] text-white'
                        : 'bg-[#2a2a2e] text-zinc-300 hover:bg-[#35353a]'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <div className="flex justify-center mt-6">
          <div className="relative">
            <button 
              className={`px-6 py-3 border-2 rounded-lg transition-all duration-200 font-medium ${
                isBlueprintOpen 
                  ? "bg-transparent border-[#5D4EFF] text-[#5D4EFF] hover:bg-[#5D4EFF] hover:text-white" 
                  : "bg-white border-[#1a1a1d] text-[#1a1a1d] hover:bg-[#1a1a1d] hover:text-white"
              }`}
              onClick={handleBlueprintAction}
              disabled={isGeneratingBlueprint}
            >
              {isGeneratingBlueprint ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1a1a1d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Blueprint...
                </div>
              ) : isBlueprintOpen ? (
                'Delete Blueprint'
              ) : (
                'Generate Campaign Blueprint'
              )}
            </button>
            
            {showDeleteConfirm && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 p-4 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg shadow-lg w-80">
                <p className="text-sm text-zinc-300 mb-3">Please type "delete" to confirm deletion</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-[#2a2a2e] text-zinc-300 text-sm p-2 rounded border border-[#414144] focus:outline-none focus:border-[#5D4EFF] mb-3"
                  placeholder="Type 'delete' to confirm"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-3 py-1 text-sm text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                    className={`px-3 py-1 text-sm rounded ${
                      deleteConfirmText.toLowerCase() === 'delete'
                        ? 'bg-[#5D4EFF] text-white hover:bg-[#4B3ECC]'
                        : 'bg-[#2a2a2e] text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div ref={blueprintRef}>
          <CampaignBlueprint isOpen={isBlueprintOpen} />
        </div>
      </div>
    </div>
  );
} 