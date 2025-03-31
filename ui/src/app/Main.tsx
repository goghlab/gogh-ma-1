import { CampaignList } from "@/components/CampaignList";
import { AgentState, Campaign } from "@/lib/types";
import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Logo } from "@/components/Logo";
import { useState, useEffect } from "react";
import { LayoutGrid, BarChart3, Settings, FileText, MessageSquare } from "lucide-react";

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

  // 添加聊天状态跟踪
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCampaignOptions, setShowCampaignOptions] = useState(false);
  const [showAgeRangeOptions, setShowAgeRangeOptions] = useState(false);
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [hasAskedAboutCampaign, setHasAskedAboutCampaign] = useState(false);

  // 添加客户端渲染状态
  const [isClient, setIsClient] = useState(false);

  // 检测窗口大小并更新isMobile状态
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 从MongoDB加载营销活动数据
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/campaigns');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        
        // 将MongoDB数据转换为前端所需的Campaign类型
        const formattedCampaigns = data.map((campaign: any) => ({
          id: campaign._id,
          title: campaign.title,
          status: campaign.status as 'active' | 'draft' | 'completed' | 'scheduled',
          brief: campaign.description || '',
          createdAt: campaign.createdAt
        }));
        
        console.log('Fetched campaigns from database:', formattedCampaigns);
        
        // 更新状态
        setState({
          ...state,
          campaigns: formattedCampaigns
        });
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    // 页面加载时获取营销活动
    fetchCampaigns();
  }, []);

  // 定义新的营销活动创建操作
  useCopilotAction({
    name: "CreateNewCampaign",
    description: "创建一个新的营销活动",
    parameters: [],
    handler: () => {
      // 清除日志
      setState({ ...state, logs: [] });
      // 切换到campaigns视图
      setActiveView("campaigns");
    }
  });

  // 定义浏览操作
  useCopilotAction({
    name: "JustBrowsing",
    description: "用户只想浏览，不创建新活动",
    parameters: [],
    handler: () => {
      // 清除日志
      setState({ ...state, logs: [] });
      // 无特殊操作，AI会处理回复
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
    `
  }, [hasAskedAboutCampaign]);

  // 为聊天提供建议回复
  const getSuggestedReplies = () => {
    return [
      { 
        text: "Yes, create a new campaign",
        onClick: () => {
          // 标记用户已交互
          setHasInteracted(true);
          setShowSuggestions(false);
          // 标记已询问过创建活动的问题
          setHasAskedAboutCampaign(true);
          
          // 触发视图切换
          setActiveView("campaigns");
          
          // 模拟用户输入并发送消息
          const message = "Yes, create a new campaign";
          // 找到输入元素
          const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
          if (messageInput) {
            // 设置值
            messageInput.value = message;
            // 触发输入事件
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 直接使用提交按钮
            const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
              setTimeout(() => {
                submitButton.click();
                
                // 等待AI响应后，再次检查是否需要创建新活动
                setTimeout(() => {
                  const defaultTitle = "New Marketing Campaign";
                  
                  // 先尝试获取当前的活动列表
                  const campaigns = state.campaigns || [];
                  const existingCampaign = campaigns.find(c => c.title === defaultTitle);
                  
                  // 如果没有同名活动，创建一个新的
                  if (!existingCampaign) {
                    // 创建新活动的数据
                    const newCampaignData = {
                      title: defaultTitle,
                      status: 'draft',
                      description: "",
                      targetAudience: {
                        ageRange: "",
                        gender: "",
                        location: ""
                      },
                      goals: "",
                      marketingChannels: [],
                      budget: {
                        amount: 0,
                        currency: "USD"
                      }
                    };
                    
                    // 将活动保存到MongoDB
                    fetch('http://localhost:5000/api/campaigns', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(newCampaignData),
                    })
                    .then(response => response.json())
                    .then(savedCampaign => {
                      console.log('Campaign saved to database:', savedCampaign);
                      
                      // 将保存的活动格式化为前端所需格式
                      const formattedCampaign = {
                        id: savedCampaign._id,
                        title: savedCampaign.title,
                        status: savedCampaign.status as 'active' | 'draft' | 'completed' | 'scheduled',
                        brief: savedCampaign.description || '',
                        createdAt: savedCampaign.createdAt
                      };
                      
                      // 更新状态
                      setState({
                        ...state,
                        campaigns: [...campaigns, formattedCampaign]
                      });
                      
                      // 标记活动已创建，准备显示选项按钮
                      setCampaignCreated(true);
                      
                      // 在1500ms后发送后续指导消息
                      setTimeout(() => {
                        // 找到输入元素
                        const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
                        const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
                        
                        if (messageInput && submitButton) {
                          // 自动发送系统消息
                          messageInput.value = "I need help customizing this campaign";
                          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                          submitButton.click();
                          
                          // 800ms后显示选项按钮
                          setTimeout(() => {
                            setShowCampaignOptions(true);
                          }, 800);
                        }
                      }, 1500);
                    })
                    .catch(error => {
                      console.error('Error saving campaign:', error);
                      
                      // 即使API调用失败，也创建本地活动（降级方案）
                      const newCampaign = {
                        id: Math.random().toString(36).substring(2, 15),
                        title: defaultTitle,
                        status: 'draft' as const,
                        brief: "",
                        createdAt: new Date().toISOString()
                      };
                      
                      setState({
                        ...state,
                        campaigns: [...campaigns, newCampaign]
                      });
                      
                      setCampaignCreated(true);
                    });
                  }
                }, 1000);
              }, 100);
            } else {
              // 回退方案：触发回车键
              setTimeout(() => {
                messageInput.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'Enter',
                  code: 'Enter',
                  keyCode: 13,
                  which: 13,
                  bubbles: true,
                  cancelable: true
                }));
                
                // 立即切换到campaigns视图
                setActiveView("campaigns");
                
                // 等待AI响应后，再次检查是否需要创建新活动
                setTimeout(() => {
                  const defaultTitle = "New Marketing Campaign";
                  
                  // 先尝试获取当前的活动列表
                  const campaigns = state.campaigns || [];
                  const existingCampaign = campaigns.find(c => c.title === defaultTitle);
                  
                  // 如果没有同名活动，创建一个新的
                  if (!existingCampaign) {
                    // 使用相同的代码创建和保存活动到MongoDB
                    const newCampaignData = {
                      title: defaultTitle,
                      status: 'draft',
                      description: "",
                      targetAudience: {
                        ageRange: "",
                        gender: "",
                        location: ""
                      },
                      goals: "",
                      marketingChannels: [],
                      budget: {
                        amount: 0,
                        currency: "USD"
                      }
                    };
                    
                    // 保存到MongoDB
                    fetch('http://localhost:5000/api/campaigns', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(newCampaignData),
                    })
                    .then(response => response.json())
                    .then(savedCampaign => {
                      console.log('Campaign saved to database:', savedCampaign);
                      
                      const formattedCampaign = {
                        id: savedCampaign._id,
                        title: savedCampaign.title,
                        status: savedCampaign.status as 'active' | 'draft' | 'completed' | 'scheduled',
                        brief: savedCampaign.description || '',
                        createdAt: savedCampaign.createdAt
                      };
                      
                      setState({
                        ...state,
                        campaigns: [...campaigns, formattedCampaign]
                      });
                      
                      setCampaignCreated(true);
                      
                      setTimeout(() => {
                        const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
                        const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
                        
                        if (messageInput && submitButton) {
                          messageInput.value = "I need help customizing this campaign";
                          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                          submitButton.click();
                          
                          setTimeout(() => {
                            setShowCampaignOptions(true);
                          }, 800);
                        }
                      }, 1500);
                    })
                    .catch(error => {
                      console.error('Error saving campaign:', error);
                      
                      // 降级方案
                      const newCampaign = {
                        id: Math.random().toString(36).substring(2, 15),
                        title: defaultTitle,
                        status: 'draft' as const,
                        brief: "",
                        createdAt: new Date().toISOString()
                      };
                      
                      setState({
                        ...state,
                        campaigns: [...campaigns, newCampaign]
                      });
                      
                      setCampaignCreated(true);
                    });
                  }
                }, 1000);
              }, 100);
            }
          }
        }
      },
      { 
        text: "No, just browsing",
        onClick: () => {
          // 标记用户已交互
          setHasInteracted(true);
          setShowSuggestions(false);
          // 标记已询问过创建活动的问题
          setHasAskedAboutCampaign(true);
          
          // 模拟用户输入并发送消息
          const message = "No, just browsing";
          // 找到输入元素
          const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
          if (messageInput) {
            // 设置值
            messageInput.value = message;
            // 触发输入事件
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 直接使用提交按钮
            const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
              setTimeout(() => {
                submitButton.click();
              }, 100);
            } else {
              // 回退方案：触发回车键
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

  // 创建活动设置选项
  const getCampaignOptionReplies = () => {
    return [
      { 
        text: "1. Target Audience: Who are you trying to reach? Tell me about your ideal customer.",
        onClick: () => {
          sendChatMessage("I want to define the target audience");
          // 显示年龄段选项
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

  // 创建年龄段选项
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

  // 辅助函数：发送聊天消息
  const sendChatMessage = (message: string) => {
    // 隐藏选项按钮
    setShowCampaignOptions(false);
    setShowAgeRangeOptions(false);
    
    // 找到输入元素
    const messageInput = document.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement;
    const submitButton = document.querySelector('.copilotKitInputControls button[type="submit"]') as HTMLButtonElement;
    
    if (messageInput && submitButton) {
      // 设置值
      messageInput.value = message;
      // 触发输入事件
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      // 点击提交按钮
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
            
            /* 滚动条样式 */
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
            
            /* 加载状态动画 */
            .copilotKitTypingIndicator {
              color: #9e97ff !important;
              font-size: 13px !important;
              padding: 4px 8px !important;
            }
            
            /* 选项按钮自定义样式 */
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
              // 标记用户已交互
              setHasInteracted(true);
              setShowSuggestions(false);
              // 标记已询问过创建活动的问题
              setHasAskedAboutCampaign(true);
              
              // 如果用户已经开始设置活动，hide campaign options
              if (campaignCreated && message.toLowerCase() !== "i need help customizing this campaign") {
                setShowCampaignOptions(false);
                setShowAgeRangeOptions(false);
              }
              
              // clear the logs before starting the new campaign
              setState({ ...state, logs: [] });
              await new Promise((resolve) => setTimeout(resolve, 30));
            }}
            labels={{
              title: "Marketing Assistant",
              initial: "Hello! I'm your marketing assistant. How can I help you today?",
              placeholder: "Type your message...",
            }}
          />
          
          {/* 添加初始建议回复按钮 */}
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
          
          {/* 添加活动设置选项按钮 */}
          {showCampaignOptions && !showAgeRangeOptions && (
            <div className="custom-suggestions">
              <div className="w-full text-center text-sm text-gray-400 mb-3">Choose an option to continue:</div>
              {getCampaignOptionReplies().map((reply, index) => {
                // 将文本分割为标题和示例部分
                const textParts = reply.text.split('(e.g.,');
                const mainText = textParts[0].replace(/^\d+\.\s+/, ''); // 移除数字前缀
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
          
          {/* 添加年龄段选项按钮 */}
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
