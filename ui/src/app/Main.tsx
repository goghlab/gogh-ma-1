import { CampaignList } from "@/components/CampaignList";
import { AgentState, Campaign } from "@/lib/types";
import { useCoAgent } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Logo } from "@/components/Logo";
import { useState, useEffect, useRef } from "react";
import { LayoutGrid, BarChart3, Settings, FileText, MessageSquare, Plus } from "lucide-react";

export default function Main() {
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

  // 添加选中的营销活动状态
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // 添加当前视图状态
  const [activeView, setActiveView] = useState<string>("campaigns");

  // 添加响应式布局状态
  const [isMobile, setIsMobile] = useState(false);

  // 检测窗口大小并更新isMobile状态
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  useCopilotChatSuggestions({
    instructions: "Do you want to create a new marketing campaign to boost sales?",
  });

  const renderContent = () => {
    switch (activeView) {
      case "campaigns":
      default:
        return (
          <div className="w-full h-full">
            <CampaignList 
              campaigns={state.campaigns || []} 
              onSelectCampaign={(campaign: Campaign) => setSelectedCampaign(campaign)}
            />
          </div>
        );
    }
  }

  return (
    <>
      <header className="h-[60px] bg-[#111111] text-white flex items-center justify-center relative">
        <div className="absolute left-4 md:left-10">
          {/* 可以放置其他元素，如返回按钮等 */}
        </div>
        <Logo size="sm" />
      </header>

      <div
        className={`flex flex-1`}
        style={{ height: "calc(100vh - 60px)" }}
      >
        {/* 垂直导航栏 */}
        <div className="w-[60px] bg-[#111111] flex flex-col items-center py-4">
          <button 
            onClick={() => setActiveView("campaigns")} 
            className={`w-10 h-10 flex items-center justify-center rounded-md mb-4 ${activeView === "campaigns" ? "bg-[#272729]" : "hover:bg-[#1e1e20]"}`}
            title="Campaigns"
          >
            <LayoutGrid size={20} className={activeView === "campaigns" ? "text-[#5D4EFF]" : "text-zinc-400"} />
          </button>
          <button 
            onClick={() => setActiveView("analytics")} 
            className={`w-10 h-10 flex items-center justify-center rounded-md mb-4 ${activeView === "analytics" ? "bg-[#272729]" : "hover:bg-[#1e1e20]"}`}
            title="Analytics"
          >
            <BarChart3 size={20} className={activeView === "analytics" ? "text-[#5D4EFF]" : "text-zinc-400"} />
          </button>
          <button 
            onClick={() => setActiveView("content")} 
            className={`w-10 h-10 flex items-center justify-center rounded-md mb-4 ${activeView === "content" ? "bg-[#272729]" : "hover:bg-[#1e1e20]"}`}
            title="Content"
          >
            <FileText size={20} className={activeView === "content" ? "text-[#5D4EFF]" : "text-zinc-400"} />
          </button>
          <button 
            onClick={() => setActiveView("messages")} 
            className={`w-10 h-10 flex items-center justify-center rounded-md mb-4 ${activeView === "messages" ? "bg-[#272729]" : "hover:bg-[#1e1e20]"}`}
            title="Messages"
          >
            <MessageSquare size={20} className={activeView === "messages" ? "text-[#5D4EFF]" : "text-zinc-400"} />
          </button>
          
          <div className="flex-grow"></div>
          
          <button 
            onClick={() => setActiveView("settings")} 
            className={`w-10 h-10 flex items-center justify-center rounded-md mb-4 ${activeView === "settings" ? "bg-[#272729]" : "hover:bg-[#1e1e20]"}`}
            title="Settings"
          >
            <Settings size={20} className={activeView === "settings" ? "text-[#5D4EFF]" : "text-zinc-400"} />
          </button>
        </div>

        {/* 主内容区 */}
        <div className={`${isMobile ? 'h-[50vh]' : 'flex-1'} overflow-hidden bg-[#1e1e20]`}>
          {renderContent()}
        </div>

        {/* 聊天区域 */}
        <div
          className={`${isMobile ? 'w-full h-[50vh]' : 'w-[500px] h-full'} flex-shrink-0`}
          style={
            {
              "--copilot-kit-background-color": "#1a1a1e",
              "--copilot-kit-secondary-color": "#2d2d30",
              "--copilot-kit-separator-color": "#222225",
              "--copilot-kit-primary-color": "#e4e4e7",
              "--copilot-kit-contrast-color": "#ffffff",
              "--copilot-kit-secondary-contrast-color": "#e4e4e7",
              "--copilot-kit-user-input-bg-color": "#2a2a30",
              "--copilot-kit-input-text-color": "#e0e0e0",
            } as any
          }
        >
          <CopilotChat
            className="h-full copilot-chat"
            onSubmitMessage={async (message) => {
              // clear the logs before starting the new campaign
              setState({ ...state, logs: [] });
              await new Promise((resolve) => setTimeout(resolve, 30));
            }}
            labels={{
              initial: "Hi! I'm your marketing assistant. Would you like to create a new marketing campaign to boost sales?",
            }}
          />
        </div>
      </div>
    </>
  );
}
