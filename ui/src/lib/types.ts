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
};

export type AgentState = {
  model: string;
  campaign_brief: string;
  report: string;
  resources: any[];
  logs: any[];
  campaigns: Campaign[];
}