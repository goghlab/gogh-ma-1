import { CampaignList } from "@/components/CampaignList";
import { AgentState, Campaign } from "@/lib/types";
import { useCoAgent } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Logo } from "@/components/Logo";
import { useState, useEffect, useRef } from "react";

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

  return (
    <>
      <h1 className="flex h-[60px] bg-[#111111] text-white items-center px-4 md:px-10 text-xl md:text-2xl font-medium">
        <Logo size="sm" className="mr-3" />
      </h1>

      <div
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} flex-1`}
        style={{ height: "calc(100vh - 60px)" }}
      >
        <div className={`${isMobile ? 'h-[50vh]' : 'flex-1'} overflow-hidden`}>
          <CampaignList 
            campaigns={state.campaigns || []} 
            onSelectCampaign={(campaign: Campaign) => setSelectedCampaign(campaign)}
          />
        </div>
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
