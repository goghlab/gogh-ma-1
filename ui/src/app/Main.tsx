import { CampaignList } from "@/components/CampaignList";
import { CampaignDetail } from "@/components/CampaignDetail";
import { AgentState, Campaign } from "@/lib/types";
import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Logo } from "@/components/Logo";
import { useState, useEffect } from "react";
import { LayoutGrid, BarChart3, Settings, FileText, MessageSquare } from "lucide-react";

// Add type declaration for the window object
declare global {
  interface Window {
    clearCampaignsStorage: () => void;
    resetCampaignsStorage: () => void;
  }
}

// Define a unique storage key for this application
const STORAGE_KEY = 'marketing-app-campaigns';

// 完全重新实现的存储操作函数
const storageOps = {
  // 从localStorage获取活动数据
  getCampaigns: (): Campaign[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('获取活动数据失败:', error);
      return [];
    }
  },

  // 保存活动数据到localStorage
  saveCampaigns: (campaigns: Campaign[]): boolean => {
    try {
      const jsonData = JSON.stringify(campaigns);
      localStorage.setItem(STORAGE_KEY, jsonData);
      console.log('活动数据已保存:', campaigns.length);
      return true;
    } catch (error) {
      console.error('保存活动数据失败:', error);
      return false;
    }
  },

  // 删除指定ID的活动
  deleteCampaign: (id: string): boolean => {
    try {
      // 获取现有活动
      const campaigns = storageOps.getCampaigns();
      // 找到要删除的活动索引
      const index = campaigns.findIndex(c => c.id === id);
      
      if (index === -1) {
        console.error(`找不到ID为 ${id} 的活动`);
        return false;
      }
      
      // 删除活动
      campaigns.splice(index, 1);
      
      // 保存更新后的活动列表
      storageOps.saveCampaigns(campaigns);
      console.log(`已删除ID为 ${id} 的活动，剩余 ${campaigns.length} 个活动`);
      return true;
    } catch (error) {
      console.error('删除活动失败:', error);
      return false;
    }
  },

  // 按标题删除活动
  deleteCampaignByTitle: async (title: string): Promise<boolean> => {
    try {
      // 获取现有活动
      const campaigns = storageOps.getCampaigns();
      // 找到要删除的活动索引
      const index = campaigns.findIndex(c => c.title.toLowerCase() === title.toLowerCase());
      
      if (index === -1) {
        console.error(`找不到标题为 ${title} 的活动`);
        return false;
      }
      
      // 获取活动ID以便调用后端API
      const campaignId = campaigns[index].id;
      
      console.log(`尝试删除活动ID: ${campaignId}, 标题: ${title}`);
      
      // 直接调用后端API删除
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`后端API删除活动失败: ${response.statusText}`);
      }
      
      // API调用成功后，更新本地存储
      campaigns.splice(index, 1);
      storageOps.saveCampaigns(campaigns);
      
      console.log(`成功删除活动标题: ${title}，ID: ${campaignId}`);
      return true;
    } catch (error) {
      console.error('删除活动失败:', error);
      return false;
    }
  },
  
  // 添加新活动
  addCampaign: async (campaign: Campaign): Promise<boolean> => {
    try {
      console.log(`尝试添加新活动: ${campaign.title}`);
      
      // 直接调用后端API创建记录
      const response = await fetch('http://localhost:5000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign)
      });
      
      if (!response.ok) {
        throw new Error(`后端API创建活动失败: ${response.statusText}`);
      }
      
      // 获取后端返回的新活动数据
      const createdCampaign = await response.json();
      console.log(`后端API成功创建活动: ${createdCampaign.id}`);
      
      // 获取更新后的活动列表
      const updatedCampaigns = await fetch('http://localhost:5000/api/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(res => {
        if (!res.ok) throw new Error(`获取更新后的活动失败: ${res.statusText}`);
        return res.json();
      });
      
      // 更新本地存储
      storageOps.saveCampaigns(updatedCampaigns);
      
      console.log(`成功添加新活动: ${campaign.title}, 当前有 ${updatedCampaigns.length} 个活动`);
      return true;
    } catch (error) {
      console.error('添加活动失败:', error);
      return false;
    }
  },
  
  // 清空所有活动
  clearCampaigns: (): boolean => {
    try {
      storageOps.saveCampaigns([]);
      console.log('已清空所有活动');
      return true;
    } catch (error) {
      console.error('清空活动失败:', error);
      return false;
    }
  },
  
  // 重置为默认活动
  resetToDefaults: (defaultCampaigns: Campaign[]): boolean => {
    try {
      storageOps.saveCampaigns(defaultCampaigns);
      console.log('已重置为默认活动');
      return true;
    } catch (error) {
      console.error('重置活动失败:', error);
      return false;
    }
  }
};

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

  // Add selected campaign state
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Add current view state
  const [activeView, setActiveView] = useState<string>("campaigns");

  // Add responsive layout state
  const [isMobile, setIsMobile] = useState(false);

  // Add chat state tracking
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCampaignOptions, setShowCampaignOptions] = useState(false);
  const [showAgeRangeOptions, setShowAgeRangeOptions] = useState(false);
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [hasAskedAboutCampaign, setHasAskedAboutCampaign] = useState(false);

  // Add client-side rendering state
  const [isClient, setIsClient] = useState(false);

  // Add local sample data
  const initialDummyCampaigns = [
    {
      id: "campaign-1",
      title: "Summer Product Promotion",
      status: "active" as const,
      brief: "Promote our new summer product line with the goal of increasing sales and brand exposure.",
      createdAt: new Date(2023, 4, 15).toISOString()
    },
    {
      id: "campaign-2",
      title: "Customer Loyalty Program",
      status: "draft" as const,
      brief: "Create a loyalty program for existing customers to encourage repeat purchases and improve retention.",
      createdAt: new Date(2023, 5, 10).toISOString()
    },
    {
      id: "campaign-3",
      title: "Content Marketing Strategy",
      status: "completed" as const,
      brief: "Create high-quality content to attract new audiences and establish our professional image in the industry.",
      createdAt: new Date(2023, 3, 22).toISOString()
    },
    {
      id: "campaign-4",
      title: "Holiday Promotions",
      status: "active" as const,
      brief: "Prepare special promotions for the upcoming holiday season to boost sales.",
      createdAt: new Date(2023, 6, 5).toISOString()
    },
    {
      id: "campaign-5",
      title: "Product Launch Event",
      status: "draft" as const,
      brief: "Plan a major launch event for the new product line.",
      createdAt: new Date(2023, 7, 20).toISOString()
    }
  ];

  // 初始化和加载数据
  useEffect(() => {
    // 客户端渲染检测
    setIsClient(true);
    
    const initializeStorage = () => {
      // 检查localStorage是否已初始化
      console.log('检查localStorage是否已初始化...');
      const existingData = localStorage.getItem(STORAGE_KEY);
      
      if (!existingData) {
        console.log('初始化localStorage，设置默认活动数据');
        // 初始化默认数据
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDummyCampaigns));
        console.log('成功初始化默认活动:', initialDummyCampaigns.length);
      } else {
        console.log('localStorage已包含活动数据，无需初始化');
      }
    };
    
    // 检测窗口大小
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始化localStorage
    initializeStorage();
    
    // 检测窗口大小
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    
    // 同步后端和前端数据
    const syncWithBackend = async () => {
      console.log('正在同步广告系列数据...');
      try {
        // 获取后端数据
        const response = await fetch('http://localhost:5000/api/campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`获取广告系列失败: ${response.statusText}`);
        }
        
        const backendCampaigns = await response.json();
        console.log('从后端获取的广告系列:', backendCampaigns.length);
        
        // 更新本地存储
        storageOps.saveCampaigns(backendCampaigns);
        
        // 更新应用状态
        setState(prevState => ({
          model: prevState?.model || model,
          campaign_brief: prevState?.campaign_brief || "",
          resources: prevState?.resources || [],
          report: prevState?.report || "",
          logs: prevState?.logs || [],
          campaigns: backendCampaigns
        }));
        
        console.log('广告系列数据同步完成');
      } catch (error) {
        console.error('同步广告系列数据失败:', error);
        
        // 如果同步失败，使用本地存储数据
        const localCampaigns = storageOps.getCampaigns();
        setState(prevState => ({
          model: prevState?.model || model,
          campaign_brief: prevState?.campaign_brief || "",
          resources: prevState?.resources || [],
          report: prevState?.report || "",
          logs: prevState?.logs || [],
          campaigns: localCampaigns
        }));
      }
    };
    
    // 立即执行首次同步
    syncWithBackend();
    
    // 设置定期同步
    const syncInterval = setInterval(syncWithBackend, 30000);
    
    // 设置窗口全局方法
    window.clearCampaignsStorage = () => {
      storageOps.clearCampaigns();
      
      // 更新应用状态以反映清空的活动列表
      setState(prevState => ({
        model: prevState?.model || model,
        campaign_brief: prevState?.campaign_brief || "",
        resources: prevState?.resources || [],
        report: prevState?.report || "",
        logs: prevState?.logs || [],
        campaigns: []
      }));
      
      console.log('已清空活动数据并更新应用状态');
    };
    
    window.resetCampaignsStorage = () => {
      storageOps.resetToDefaults(initialDummyCampaigns);
      
      // 更新应用状态以反映默认活动列表
      setState(prevState => ({
        model: prevState?.model || model,
        campaign_brief: prevState?.campaign_brief || "",
        resources: prevState?.resources || [],
        report: prevState?.report || "",
        logs: prevState?.logs || [],
        campaigns: initialDummyCampaigns
      }));
      
      console.log('已重置为默认活动数据并更新应用状态');
    };
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', checkWindowSize);
      clearInterval(syncInterval);
    };
  }, []);

  // Define new marketing campaign creation action
  useCopilotAction({
    name: "CreateNewCampaign",
    description: "Create a new marketing campaign",
    parameters: [
      {
        name: "campaignTitle",
        type: "string",
        description: "The title for the new campaign (optional)"
      }
    ],
    handler: async (params) => {
      // 记录收到的参数
      console.log('CreateNewCampaign被触发，参数:', params);
      
      // 清空日志并切换到活动视图
      setActiveView("campaigns");

      // 将之前传入的标题参数提取出来，如果不存在则使用默认标题
      const campaignTitle = params.campaignTitle || `新营销活动 ${new Date().toLocaleDateString()}`;
      console.log(`准备创建活动：${campaignTitle}`);

      // 创建活动对象
      const newCampaign = {
        id: `campaign-${Date.now()}`,
        title: campaignTitle.trim(),
        status: "draft" as const,
        brief: "通过AI助手创建的营销活动",
        createdAt: new Date().toISOString()
      };

      try {
        // 调用LangGraph直接处理CreateCampaign工具调用
        // 通过更新state对象，LangGraph会处理Campaign的创建
        setState((prevState?: AgentState) => {
          const currentState = prevState || {
            model,
            campaign_brief: "",
            resources: [],
            report: "",
            logs: [],
            campaigns: []
          };
          
          return {
            model: currentState.model,
            campaign_brief: currentState.campaign_brief,
            resources: currentState.resources,
            report: currentState.report,
            logs: currentState.logs,
            campaigns: [...(currentState.campaigns || []), newCampaign]
          };
        });

        // 确保在UI中看到结果
        const localCampaigns = storageOps.getCampaigns();
        const updatedCampaigns = [...localCampaigns, newCampaign];
        storageOps.saveCampaigns(updatedCampaigns);

        // 标记已创建活动
        setCampaignCreated(true);
        
        return `成功创建活动 "${campaignTitle}"！您可以在活动列表中查看它。`;
      } catch (error) {
        console.error('创建活动失败:', error);
        return `创建活动失败: ${(error as Error).message || '未知错误'}`;
      }
    }
  });

  // Define browsing action
  useCopilotAction({
    name: "JustBrowsing",
    description: "User just wants to browse, not create a new campaign",
    parameters: [],
    handler: () => {
      // Clear logs
      setState({ ...state, logs: [] });
      // No special operation, AI will handle the reply
    }
  });

  // Define delete campaign action
  useCopilotAction({
    name: "DeleteCampaign",
    description: "Delete a marketing campaign by its title",
    parameters: [
      {
        name: "campaignTitle",
        type: "string",
        description: "The exact title of the campaign to delete"
      }
    ],
    handler: async (params) => {
      // 记录收到的参数
      console.log('DeleteCampaign被触发，参数:', params);
      
      // 将传入的标题参数提取出来
      const { campaignTitle } = params;
      
      if (!campaignTitle) {
        return "无法删除活动：未提供活动标题。";
      }
      
      try {
        console.log(`准备删除活动：${campaignTitle}`);
        
        // 使用LangGraph处理删除
        // 首先在当前状态中查找活动
        const campaigns = state?.campaigns || [];
        const campaignToDelete = campaigns.find(c => 
          c.title.toLowerCase() === campaignTitle.toLowerCase()
        );
        
        if (!campaignToDelete) {
          return `找不到标题为"${campaignTitle}"的活动。请检查标题是否正确。`;
        }
        
        // 更新状态，删除活动
        setState((prevState?: AgentState) => {
          const currentState = prevState || {
            model,
            campaign_brief: "",
            resources: [],
            report: "",
            logs: [],
            campaigns: []
          };
          
          return {
            model: currentState.model,
            campaign_brief: currentState.campaign_brief,
            resources: currentState.resources,
            report: currentState.report,
            logs: currentState.logs,
            campaigns: (currentState.campaigns || []).filter(c => 
              c.title.toLowerCase() !== campaignTitle.toLowerCase()
            )
          };
        });
        
        // 确保在UI中看到更新
        const localCampaigns = storageOps.getCampaigns();
        const updatedCampaigns = localCampaigns.filter(c => 
          c.title.toLowerCase() !== campaignTitle.toLowerCase()
        );
        storageOps.saveCampaigns(updatedCampaigns);
        
        return `已成功删除活动"${campaignTitle}"。`;
      } catch (error) {
        console.error('删除活动失败:', error);
        return `删除活动失败: ${(error as Error).message || '未知错误'}`;
      }
    }
  });

  useCopilotChatSuggestions({
    instructions: `
    When users start a conversation, if they haven't been asked before, ask them if they want to create a new marketing campaign to boost sales.
    Offer two clear choices:
    1. "Yes, create a new campaign" - If they choose this, use the CreateNewCampaign tool.
    2. "No, just browsing" - If they choose this, use the JustBrowsing tool, and reply "No problem, feel free to browse. Let me know if you need any help."
    
    IMPORTANT: ${hasAskedAboutCampaign ? 'The user has already been asked about creating a campaign, don\'t ask this question again. Just help them or answer their question directly.' : 'This is the first interaction, you can ask the user if they want to create a new campaign.'}
    
    After a user creates a new marketing campaign, don't ask if they want to create a new campaign again. Instead, guide them through setting up their campaign:
    
    If the user sends "I need help customizing this campaign", DO NOT ask if they want to create a campaign again.
    Instead, present them with options for customizing their campaign:
    
    1. Target Audience: Who are you trying to reach? Tell me about your ideal customer.
    2. Campaign Goals: What do you want to achieve with this campaign? (e.g., increase website traffic, generate leads, boost sales)
    3. Marketing Channels: Where will you reach your audience? (e.g., social media, email, search ads)
    4. Campaign Budget: How much are you willing to spend?

    CAMPAIGN DELETION INSTRUCTIONS:
    If the user wants to delete a campaign, help them by using the DeleteCampaign tool. Be careful to get the exact title right.
    1. When a user says something like "delete campaign", "remove campaign", or specifically mentions a campaign title to delete, recognize this as a delete intent.
    2. If the user doesn't specify which campaign to delete, ask them "Which campaign would you like to delete? Please provide the exact title."
    3. Once they provide a title, confirm by asking "Are you sure you want to delete the campaign titled '[title]'?"
    4. After confirmation, call the DeleteCampaign tool with the exact campaign title as parameter.
    5. The parameter name is "campaignTitle" and it must match exactly the title of an existing campaign.
    6. If there's an error, explain that the campaign couldn't be found and ask the user to check the title.
    
    CAMPAIGN CREATION INSTRUCTIONS:
    If the user asks to "create a campaign", "add a new campaign", "new campaign", or anything similar:
    1. Recognize this as a campaign creation intent and call the CreateNewCampaign tool.
    2. If the user provides a specific title (e.g., "create a summer campaign"), pass it as the "campaignTitle" parameter.
    3. If no specific title is mentioned, leave the parameter empty to use the default title.
    4. After creating a campaign, tell the user it was successful and they can see it in their campaigns list.
    
    If the user wants to see their campaigns, tell them they can view their campaigns in the campaigns panel on the left side of the screen.
    
    NEVER SUGGEST RELOADING THE PAGE. All operations should update the state directly without page reloads.
    `
  }, [hasAskedAboutCampaign]);

  // Provide suggested replies for chat
  const getSuggestedReplies = () => {
    return [
      { 
        text: "Yes, create a new campaign",
        onClick: () => {
          // Mark user as having interacted
          setHasInteracted(true);
          setShowSuggestions(false);
          // Mark that we've asked about creating a campaign
          setHasAskedAboutCampaign(true);
          
          // Trigger view switch
          setActiveView("campaigns");
          
          // Simulate user input and send message
          const message = "Yes, create a new campaign";
          // Find input element
          const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
          if (messageInput) {
            // Set value
            messageInput.value = message;
            // Trigger input event
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Directly use the submit button
            const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
              setTimeout(() => {
                submitButton.click();
                
                // Wait for AI to respond asking for campaign name
                setTimeout(async () => {
                  console.log("等待用户输入活动名称...");
                  // 不会立即创建活动，而是等待用户输入名称后，由AI触发CreateNewCampaign操作
                }, 1000);
              }, 100);
            }
          }
        }
      },
      { 
        text: "No, just browsing",
        onClick: () => {
          // Mark user as having interacted
          setHasInteracted(true);
          setShowSuggestions(false);
          // Mark that we've asked about creating a campaign
          setHasAskedAboutCampaign(true);
          
          // Simulate user input and send message
          const message = "No, just browsing";
          // Find input element
          const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
          if (messageInput) {
            // Set value
            messageInput.value = message;
            // Trigger input event
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Directly use the submit button
            const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
              setTimeout(() => {
                submitButton.click();
              }, 100);
            } else {
              // Fallback solution: trigger enter key
              setTimeout(() => {
                messageInput.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'Enter',
                  code: 'Enter',
                  keyCode: 13,
                  which: 13,
                  bubbles: true,
                  cancelable: true
                }));
              }, 100);
            }
          }
        }
      }
    ];
  };

  // Create campaign setup options
  const getCampaignOptionReplies = () => {
    return [
      { 
        text: "1. Target Audience: Who are you trying to reach? Tell me about your ideal customer.",
        onClick: () => {
          sendChatMessage("I want to define the target audience");
          // Show age range options
          setTimeout(() => {
            setShowAgeRangeOptions(true);
          }, 1000);
        }
      },
      { 
        text: "2. Campaign Goals: What do you want to achieve with this campaign? (e.g., increase website traffic, generate leads, boost sales)",
        onClick: () => {
          sendChatMessage("I want to set campaign goals");
        }
      },
      { 
        text: "3. Marketing Channels: Where will you reach your audience? (e.g., social media, email, search ads)",
        onClick: () => {
          sendChatMessage("I want to choose marketing channels");
        }
      },
      { 
        text: "4. Campaign Budget: How much are you willing to spend?",
        onClick: () => {
          sendChatMessage("I want to set a campaign budget");
        }
      }
    ];
  };

  // Create age range options
  const getAgeRangeOptions = () => {
    return [
      { 
        text: "18-24 years old",
        onClick: () => {
          sendChatMessage("Target audience age range: 18-24 years old");
          setShowAgeRangeOptions(false);
        }
      },
      { 
        text: "25-34 years old",
        onClick: () => {
          sendChatMessage("Target audience age range: 25-34 years old");
          setShowAgeRangeOptions(false);
        }
      },
      { 
        text: "35-44 years old",
        onClick: () => {
          sendChatMessage("Target audience age range: 35-44 years old");
          setShowAgeRangeOptions(false);
        }
      },
      { 
        text: "45-54 years old",
        onClick: () => {
          sendChatMessage("Target audience age range: 45-54 years old");
          setShowAgeRangeOptions(false);
        }
      },
      { 
        text: "55+ years old",
        onClick: () => {
          sendChatMessage("Target audience age range: 55+ years old");
          setShowAgeRangeOptions(false);
        }
      }
    ];
  };

  // Helper function: send chat message
  const sendChatMessage = (message: string) => {
    // Hide option buttons
    setShowCampaignOptions(false);
    setShowAgeRangeOptions(false);
    
    // Find input element
    const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
    const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
    
    if (messageInput && submitButton) {
      // Set value
      messageInput.value = message;
      // Trigger input event
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      // Click submit button
      setTimeout(() => {
        submitButton.click();
      }, 100);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "campaigns":
      default:
        return (
          <div className="w-full h-full">
            {selectedCampaign ? (
              <CampaignDetail 
                campaign={selectedCampaign} 
                onBack={() => setSelectedCampaign(null)}
              />
            ) : (
              <>
                <div className="w-full sticky top-0 bg-[#1e1e20] pt-4 px-4 md:px-10 pb-2 z-10">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-white">Marketing Campaigns</h2>
                    <button 
                      className="px-3 py-1.5 bg-[#5D4EFF] text-white text-sm rounded-md flex items-center hover:bg-[#4c3fe6] transition-colors"
                      onClick={async () => {
                        // 创建新活动
                        try {
                          // 生成唯一ID和默认标题
                          const newId = `campaign-${Date.now()}`;
                          let newTitle = "新活动";
                          
                          // 获取现有活动
                          const existingCampaigns = storageOps.getCampaigns();
                          
                          // 确保标题唯一
                          let counter = 1;
                          while (existingCampaigns.some((c: Campaign) => c.title === newTitle)) {
                            newTitle = `新活动 ${counter}`;
                            counter++;
                          }
                          
                          // 创建新活动对象
                          const newCampaign = {
                            id: newId,
                            title: newTitle,
                            status: "draft" as const,
                            brief: "点击编辑活动详情",
                            createdAt: new Date().toISOString()
                          };
                          
                          console.log("UI创建新活动:", newCampaign);
                          
                          // 直接调用后端API创建记录
                          const response = await fetch('http://localhost:5000/api/campaigns', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(newCampaign)
                          });
                          
                          if (!response.ok) {
                            throw new Error(`后端API创建活动失败: ${response.statusText}`);
                          }
                          
                          // 获取后端返回的新活动数据
                          const createdCampaign = await response.json();
                          console.log("后端创建的活动:", createdCampaign);
                          
                          // 获取更新后的活动列表
                          const updatedCampaignsResponse = await fetch('http://localhost:5000/api/campaigns', {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                            }
                          });
                          
                          if (!updatedCampaignsResponse.ok) {
                            throw new Error(`获取更新后的活动列表失败: ${updatedCampaignsResponse.statusText}`);
                          }
                          
                          const updatedCampaigns = await updatedCampaignsResponse.json();
                          
                          // 更新本地存储
                          storageOps.saveCampaigns(updatedCampaigns);
                          
                          // 更新应用状态
                          setState(prevState => ({
                            model: prevState?.model || model,
                            campaign_brief: prevState?.campaign_brief || "",
                            resources: prevState?.resources || [],
                            report: prevState?.report || "",
                            logs: prevState?.logs || [],
                            campaigns: updatedCampaigns
                          }));
                          
                          console.log(`UI添加 - 成功创建新活动 "${newTitle}"`);
                          
                          // 选择新创建的活动
                          setTimeout(() => {
                            // 尝试从更新后的活动列表中找到刚创建的活动
                            const justCreatedCampaign = updatedCampaigns.find((c: Campaign) => c.id === createdCampaign.id || c.id === newId);
                            if (justCreatedCampaign) {
                              setSelectedCampaign(justCreatedCampaign);
                            }
                          }, 100);
                        } catch (error) {
                          console.error('创建新活动时出错:', error);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M12 5v14M5 12h14"></path>
                      </svg>
                      New Campaign
                    </button>
                  </div>
                </div>
                
                <CampaignList 
                  campaigns={state.campaigns || []} 
                  onSelectCampaign={(campaign: Campaign) => setSelectedCampaign(campaign)}
                  onDeleteCampaign={(campaign: Campaign) => {
                    // 确认删除
                    if (window.confirm(`确定要删除"${campaign.title}"吗？`)) {
                      console.log(`UI直接删除活动: ${campaign.title}`);
                      
                      try {
                        // 记录要删除的活动ID
                        const idToDelete = campaign.id;
                        
                        // 删除活动
                        const success = storageOps.deleteCampaign(idToDelete);
                        
                        if (!success) {
                          console.error(`UI删除活动 ${campaign.title} 失败`);
                          return;
                        }
                        
                        // 从localStorage重新获取最新的活动列表
                        const afterDelete = storageOps.getCampaigns();
                        console.log(`删除后有 ${afterDelete.length} 个活动`);
                        
                        // 验证活动是否已删除
                        const stillExists = afterDelete.some(c => c.id === idToDelete);
                        if (stillExists) {
                          console.error(`UI删除失败 - 活动 ${campaign.title} 仍然存在`);
                          return;
                        }
                        
                        // 更新应用状态
                        setState(prevState => ({
                          model: prevState?.model || model,
                          campaign_brief: prevState?.campaign_brief || "",
                          resources: prevState?.resources || [],
                          report: prevState?.report || "",
                          logs: prevState?.logs || [],
                          campaigns: afterDelete
                        }));
                        
                        console.log(`UI删除成功: ${campaign.title}`);
                      } catch (error) {
                        console.error('UI删除活动时出错:', error);
                      }
                    }
                  }}
                />
              </>
            )}
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
          className={`${isMobile ? 'w-full h-[50vh]' : 'w-[500px] h-full'} flex-shrink-0 border-l border-[#2a2a2e] relative`}
          style={
            {
              "--copilot-kit-background-color": "#1a1a1e",
              "--copilot-kit-secondary-color": "#2d2d30",
              "--copilot-kit-separator-color": "#222225",
              "--copilot-kit-primary-color": "#5D4EFF",
              "--copilot-kit-contrast-color": "#ffffff",
              "--copilot-kit-secondary-contrast-color": "#e4e4e7",
              "--copilot-kit-user-input-bg-color": "#2a2a30",
              "--copilot-kit-input-text-color": "#e0e0e0",
              "--copilot-kit-muted-color": "#888",
              "--copilot-kit-scrollbar-color": "rgba(93, 78, 255, 0.3)",
            } as any
          }
        >
          {/* 聊天工具栏 */}
          <div className="absolute top-0 right-0 p-2 flex z-10">
            <button 
              className="p-1.5 rounded-md bg-[#272729] text-[#5D4EFF] hover:bg-[#35353a] transition-colors mr-2"
              title="Create a new campaign via chat"
              onClick={async () => {
                // 创建新活动
                try {
                  // 生成唯一ID和默认标题
                  const newId = `campaign-${Date.now()}`;
                  let newTitle = "新活动";
                  
                  // 获取现有活动
                  const existingCampaigns = storageOps.getCampaigns();
                  
                  // 确保标题唯一
                  let counter = 1;
                  while (existingCampaigns.some((c: Campaign) => c.title === newTitle)) {
                    newTitle = `新活动 ${counter}`;
                    counter++;
                  }
                  
                  // 创建新活动对象
                  const newCampaign = {
                    id: newId,
                    title: newTitle,
                    status: "draft" as const,
                    brief: "点击编辑活动详情",
                    createdAt: new Date().toISOString()
                  };
                  
                  console.log("UI创建新活动:", newCampaign);
                  
                  // 直接调用后端API创建记录
                  console.log("发送POST请求到 http://localhost:5000/api/campaigns");
                  const response = await fetch('http://localhost:5000/api/campaigns', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newCampaign)
                  });
                  
                  console.log("后端API响应状态:", response.status, response.statusText);
                  
                  if (!response.ok) {
                    throw new Error(`后端API创建活动失败: ${response.status} ${response.statusText}`);
                  }
                  
                  // 获取后端返回的新活动数据
                  const createdCampaign = await response.json();
                  console.log("后端创建的活动:", createdCampaign);
                  
                  // 获取更新后的活动列表
                  const updatedCampaignsResponse = await fetch('http://localhost:5000/api/campaigns', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    }
                  });
                  
                  if (!updatedCampaignsResponse.ok) {
                    throw new Error(`获取更新后的活动列表失败: ${updatedCampaignsResponse.status} ${updatedCampaignsResponse.statusText}`);
                  }
                  
                  const updatedCampaigns = await updatedCampaignsResponse.json();
                  
                  // 更新本地存储
                  storageOps.saveCampaigns(updatedCampaigns);
                  
                  // 更新应用状态
                  setState(prevState => ({
                    model: prevState?.model || model,
                    campaign_brief: prevState?.campaign_brief || "",
                    resources: prevState?.resources || [],
                    report: prevState?.report || "",
                    logs: prevState?.logs || [],
                    campaigns: updatedCampaigns
                  }));
                  
                  console.log(`UI添加 - 成功创建新活动 "${newTitle}"`);
                  
                  // 选择新创建的活动
                  setTimeout(() => {
                    // 尝试从更新后的活动列表中找到刚创建的活动
                    const justCreatedCampaign = updatedCampaigns.find((c: Campaign) => c.id === createdCampaign.id || c.id === newId);
                    if (justCreatedCampaign) {
                      setSelectedCampaign(justCreatedCampaign);
                    }
                  }, 100);
                } catch (error) {
                  console.error('创建新活动时出错:', error);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </button>
          </div>

          <style jsx global>{`
            .copilot-chat input[type="text"], 
            .copilot-chat textarea {
              color: #ffffff !important;
              background-color: #2a2a30 !important;
              border-color: #3a3a40 !important;
              border-radius: 8px !important;
              padding: 12px 16px !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
              transition: all 0.2s ease !important;
              font-size: 14px !important;
            }
            
            .copilot-chat input[type="text"]:focus, 
            .copilot-chat textarea:focus {
              border-color: #5D4EFF !important;
              box-shadow: 0 0 0 2px rgba(93, 78, 255, 0.2) !important;
            }
            
            .copilot-chat input[type="text"]::placeholder, 
            .copilot-chat textarea::placeholder {
              color: #aaaaaa !important;
              opacity: 0.8 !important;
            }
            
            .copilot-chat .user-message {
              background-color: #4a4a65 !important;
              color: white !important;
              border-radius: 12px 12px 4px 12px !important;
              padding: 12px 16px !important;
              margin: 8px 0 !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              max-width: 90% !important;
              align-self: flex-end !important;
            }
            
            .copilot-chat .ai-message {
              background-color: #2d2d40 !important;
              color: white !important;
              border-radius: 12px 12px 12px 4px !important;
              padding: 12px 16px !important;
              margin: 8px 0 !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              max-width: 90% !important;
              align-self: flex-start !important;
            }
            
            .copilotKitMessage.copilotKitUserMessage {
              background-color: #4a4a65 !important;
              color: white !important;
              border-radius: 12px 12px 4px 12px !important;
              padding: 12px 16px !important;
              margin: 8px 0 !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              max-width: 90% !important;
              align-self: flex-end !important;
              line-height: 1.5 !important;
            }
            
            .copilotKitMessage.copilotKitAssistantMessage {
              background-color: #2d2d40 !important;
              color: white !important;
              border-radius: 12px 12px 12px 4px !important;
              padding: 12px 16px !important;
              margin: 8px 0 !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              max-width: 90% !important;
              align-self: flex-start !important;
              line-height: 1.5 !important;
            }
            
            .copilotKitMessageContent {
              font-size: 14px !important;
              line-height: 1.6 !important;
            }
            
            .copilotKitMessageContent a {
              color: #8e8eff !important;
              text-decoration: underline !important;
              transition: color 0.2s ease !important;
            }
            
            .copilotKitMessageContent a:hover {
              color: #a5a5ff !important;
            }
            
            .copilotKitInputWrapper {
              padding: 16px !important;
              background-color: #1d1d22 !important;
              border-top: 1px solid #333 !important;
            }
            
            .copilotKitChatFeed {
              padding: 16px !important;
              display: flex !important;
              flex-direction: column !important;
              overflow-y: auto !important;
            }
            
            .copilotKitChatFeedContent {
              display: flex !important;
              flex-direction: column !important;
              gap: 16px !important;
            }
            
            .copilotKitChatHeader {
              padding: 12px 16px !important;
              border-bottom: 1px solid #333 !important;
              background-color: #1d1d22 !important;
            }
            
            .copilotKitInputControls {
              margin-top: 8px !important;
            }
            
            .copilotKitResponseButton {
              transition: background-color 0.2s ease !important;
              padding: 8px 12px !important;
              border-radius: 6px !important;
              background-color: rgba(93, 78, 255, 0.1) !important;
              border: 1px solid rgba(93, 78, 255, 0.3) !important;
              color: #9e97ff !important;
              font-size: 13px !important;
              font-weight: 500 !important;
              margin: 4px !important;
            }
            
            .copilotKitResponseButton:hover {
              background-color: rgba(93, 78, 255, 0.2) !important;
            }
            
            .custom-suggestions {
              position: absolute;
              bottom: 80px;
              left: 0;
              right: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 10px;
              padding: 16px;
              z-index: 10;
              background-color: #1a1a1e;
              border-top: 1px solid #2a2a2e;
            }
            
            /* Scrollbar styles */
            .copilotKitChatFeed::-webkit-scrollbar {
              width: 6px !important;
              height: 6px !important;
            }
            
            .copilotKitChatFeed::-webkit-scrollbar-track {
              background: #1a1a1e !important;
            }
            
            .copilotKitChatFeed::-webkit-scrollbar-thumb {
              background-color: rgba(93, 78, 255, 0.3) !important;
              border-radius: 6px !important;
            }
            
            .copilotKitChatFeed::-webkit-scrollbar-thumb:hover {
              background-color: rgba(93, 78, 255, 0.5) !important;
            }
            
            /* Loading status animation */
            .copilotKitTypingIndicator {
              color: #9e97ff !important;
              font-size: 13px !important;
              padding: 4px 8px !important;
            }
            
            /* Option button custom styles */
            .campaign-option-button {
              width: 100%;
              padding: 12px 16px !important;
              text-align: left !important;
              border-radius: 8px !important;
              font-size: 14px !important;
              transition: all 0.2s ease !important;
              display: flex !important;
              align-items: flex-start !important;
              background-color: rgba(93, 78, 255, 0.1) !important;
              border: 1px solid rgba(93, 78, 255, 0.3) !important;
              color: #e0e0e0 !important;
            }
            
            .campaign-option-button:hover {
              background-color: rgba(93, 78, 255, 0.2) !important;
              transform: translateY(-1px) !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
            }
            
            .campaign-option-number {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              min-width: 24px !important;
              height: 24px !important;
              margin-right: 12px !important;
              background-color: rgba(93, 78, 255, 0.3) !important;
              border-radius: 50% !important;
              font-weight: 600 !important;
              font-size: 13px !important;
              flex-shrink: 0 !important;
            }
            
            .campaign-option-content {
              flex: 1 !important;
              line-height: 1.5 !important;
            }
            
            .campaign-option-example {
              display: block !important;
              font-size: 12px !important;
              color: #aaa !important;
              margin-top: 4px !important;
            }
          `}</style>
          
          <CopilotChat
            className="h-full copilot-chat"
            onSubmitMessage={async (message) => {
              // Mark user as having interacted
              setHasInteracted(true);
              setShowSuggestions(false);
              // Mark that we've asked about creating a campaign
              setHasAskedAboutCampaign(true);
              
              // If user has already started setting up a campaign, hide campaign options
              if (campaignCreated && message.toLowerCase() !== "i need help customizing this campaign") {
                setShowCampaignOptions(false);
                setShowAgeRangeOptions(false);
              }
              
              // Clear the logs before starting a new campaign
              setState({ ...state, logs: [] });
              await new Promise((resolve) => setTimeout(resolve, 30));
              
              // 检查是否是删除活动的请求
              const deleteMatch = message.toLowerCase().match(/delete(?:\s+the)?\s+(?:campaign)?\s*["']?([^"']+)["']?/i);
              if (deleteMatch) {
                const campaignTitle = deleteMatch[1].trim();
                console.log(`DEBUG: 通过聊天消息检测到删除请求：${campaignTitle}`);
                
                // 获取当前活动列表
                const storedCampaignsStr = localStorage.getItem(STORAGE_KEY);
                if (storedCampaignsStr) {
                  const storedCampaigns = JSON.parse(storedCampaignsStr);
                  const campaignExists = storedCampaigns.some((c: Campaign) => 
                    c.title.toLowerCase() === campaignTitle.toLowerCase()
                  );
                  
                  if (campaignExists) {
                    console.log(`DEBUG: 找到要删除的活动：${campaignTitle}`);
                    // 这里不需要直接调用 DeleteCampaign，AI助手会自动调用
                  }
                }
              }
              
              // 检查是否是创建活动的请求
              const createMatch = message.toLowerCase().match(/create(?:\s+a)?\s+(?:new)?\s+(?:campaign|marketing campaign)(?:\s+(?:called|named|titled)\s+["']?([^"']+)["']?)?/i);
              if (createMatch) {
                const campaignTitle = createMatch[1] ? createMatch[1].trim() : null;
                console.log(`DEBUG: 通过聊天消息检测到创建请求：${campaignTitle || '默认标题'}`);
                // 这里不需要直接调用 CreateNewCampaign，AI助手会自动调用
              }
            }}
            labels={{
              title: "Marketing Assistant",
              placeholder: "Type your message...",
              initial: "Hello! I'm your marketing assistant. How can I help you today? You can ask me to create or delete campaigns."
            }}
          />
          
          {/* Add initial suggested reply buttons */}
          {showSuggestions && !hasInteracted && (
            <div className="custom-suggestions">
              {getSuggestedReplies().map((reply, index) => (
                <button
                  key={index}
                  onClick={reply.onClick}
                  className="copilotKitResponseButton whitespace-nowrap"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}
          
          {/* Add campaign setup option buttons */}
          {showCampaignOptions && !showAgeRangeOptions && (
            <div className="custom-suggestions">
              <div className="w-full text-center text-sm text-gray-400 mb-3">Choose an option to continue:</div>
              {getCampaignOptionReplies().map((reply, index) => {
                // Split text into title and example parts
                const textParts = reply.text.split('(e.g.,');
                const mainText = textParts[0].replace(/^\d+\.\s+/, ''); // Remove number prefix
                const exampleText = textParts.length > 1 ? `(e.g., ${textParts[1]}` : '';
                const numberPrefix = reply.text.match(/^\d+/)?.[0] || (index + 1).toString();
                
                return (
                  <button
                    key={index}
                    onClick={reply.onClick}
                    className="campaign-option-button"
                  >
                    <span className="campaign-option-number">{numberPrefix}</span>
                    <span className="campaign-option-content">
                      {mainText}
                      {exampleText && <span className="campaign-option-example">{exampleText}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Add age range option buttons */}
          {showAgeRangeOptions && (
            <div className="custom-suggestions">
              <div className="w-full text-center text-sm text-gray-400 mb-3">Select target audience age range:</div>
              {getAgeRangeOptions().map((reply, index) => {
                return (
                  <button
                    key={index}
                    onClick={reply.onClick}
                    className="campaign-option-button"
                  >
                    <span className="campaign-option-number">{index + 1}</span>
                    <span className="campaign-option-content">
                      {reply.text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
