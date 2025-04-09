export type Resource = {
  url: string;
  title: string;
  description: string;
};

export type Campaign = {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'completed' | 'scheduled';
  brief: string;
  createdAt: string;
  campaignBrief?: {
    content: string;
    lastUpdated: string;
  };
  goals?: {
    content: string;
    lastUpdated: string;
  };
  marketingChannels?: {
    channels: string[];
    lastUpdated: string;
  };
};

export type AgentState = {
  model: string;
  campaign_brief: string;
  report: string;
  resources: any[];
  logs: any[];
  campaigns: Campaign[];
}

export interface SocialPost {
  type?: 'post' | 'reel';
  content: string;
  hashtags: string[];
  suggestedImage?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  scheduledTime?: string;
  published?: boolean;
  link?: string;
  // Meta API specific fields
  mediaContainerId?: string;  // For Instagram media container
  postId?: string;           // ID of the created post
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
  errorMessage?: string;     // In case of posting failure
}

export interface CampaignBlueprint {
  facebook: {
    posts: SocialPost[];
  };
  instagram: {
    posts: SocialPost[];
  };
  x: {
    posts: SocialPost[];
  };
}