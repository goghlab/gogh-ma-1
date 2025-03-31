"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCoAgent,
  useCoAgentStateRender,
  useCopilotAction,
} from "@copilotkit/react-core";
import { Progress } from "./Progress";
import { EditResourceDialog } from "./EditResourceDialog";
import { AddResourceDialog } from "./AddResourceDialog";
import { Resources } from "./Resources";
import { AgentState, Resource, Campaign } from "@/lib/types";
import { PlusCircle } from "lucide-react";

// 活动卡片组件
const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  return (
    <div className="bg-[#2e2e32] p-6 rounded-xl cursor-pointer hover:bg-[#3a3a3f] transition-colors duration-200">
      <h3 className="font-medium text-lg text-zinc-200 mb-2 truncate">{campaign.title}</h3>
      <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{campaign.brief}</p>
      <div className="text-zinc-500 text-xs">
        创建于 {new Date(campaign.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export function MarketingCanvas() {
  const model = "google_genai";
  const agent = "research_agent_google_genai";

  const { state, setState } = useCoAgent<AgentState>({
    name: agent,
    initialState: {
      model,
      campaign_brief: "",
      resources: [],
      report: "",
      logs: [],
      campaigns: [],
    },
  });

  useCoAgentStateRender({
    name: agent,
    render: ({ state, nodeName, status }) => {
      if (!state.logs || state.logs.length === 0) {
        return null;
      }
      return <Progress logs={state.logs} />;
    },
  });

  useCopilotAction({
    name: "DeleteResources",
    description:
      "Prompt the user for resource delete confirmation, and then perform resource deletion",
    available: "remote",
    parameters: [
      {
        name: "urls",
        type: "string[]",
      },
    ],
    renderAndWait: ({ args, status, handler }) => {
      return (
        <div
          className=""
          data-test-id="delete-resource-generative-ui-container"
        >
          <div className="font-bold text-base mb-2">
            Delete these resources?
          </div>
          <Resources
            resources={state.resources.filter((resource) =>
              (args.urls || []).includes(resource.url)
            )}
            customWidth={200}
          />
          {status === "executing" && (
            <div className="mt-4 flex justify-start space-x-2">
              <button
                onClick={() => handler("NO")}
                className="px-4 py-2 text-[#6766FC] border border-[#6766FC] rounded text-sm font-bold"
              >
                Cancel
              </button>
              <button
                data-test-id="button-delete"
                onClick={() => handler("YES")}
                className="px-4 py-2 bg-[#6766FC] text-white rounded text-sm font-bold"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      );
    },
  });

  const resources = state.resources || [];
  const setResources = (resources: Resource[]) => {
    setState({ ...state, resources });
  };

  const [newResource, setNewResource] = useState<Resource>({
    url: "",
    title: "",
    description: "",
  });
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  const addResource = () => {
    if (newResource.url) {
      setResources([...resources, { ...newResource }]);
      setNewResource({ url: "", title: "", description: "" });
      setIsAddResourceOpen(false);
    }
  };

  const removeResource = (url: string) => {
    setResources(
      resources.filter((resource: Resource) => resource.url !== url)
    );
  };

  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false);

  const handleCardClick = (resource: Resource) => {
    setEditResource({ ...resource });
    setOriginalUrl(resource.url);
    setIsEditResourceOpen(true);
  };

  const updateResource = () => {
    if (editResource && originalUrl) {
      setResources(
        resources.map((resource) =>
          resource.url === originalUrl ? { ...editResource } : resource
        )
      );
      setEditResource(null);
      setOriginalUrl(null);
      setIsEditResourceOpen(false);
    }
  };

  const campaigns = state.campaigns || [];

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-10 bg-[#1e1e20]">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 mb-2">营销活动</h1>
        <p className="text-zinc-400 text-sm">管理您的所有营销活动</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="bg-[#2e2e32] w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-zinc-300 font-medium mb-2">没有活动</h3>
          <p className="text-zinc-500 text-sm max-w-xs">
            在右侧聊天界面与AI助手交流，创建您的第一个营销活动
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
} 