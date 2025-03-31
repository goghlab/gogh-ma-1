import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
  langGraphPlatformEndpoint,
  copilotKitEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// 使用一个虚拟的OpenAI API密钥，因为我们实际上不会使用OpenAI
// 但CopilotKit框架需要一个适配器，即使我们使用Google Gemini
const openai = new OpenAI({ apiKey: "sk-dummy-key-for-compatibility" });
const llmAdapter = new OpenAIAdapter({ openai } as any);
const langsmithApiKey = process.env.LANGSMITH_API_KEY as string;

export const POST = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const deploymentUrl =
      searchParams.get("lgcDeploymentUrl") || process.env.LGC_DEPLOYMENT_URL;

    const isCrewAi = searchParams.get("coAgentsModel") === "crewai";
    const isGoogleGenAI = searchParams.get("coAgentsModel") === "google_genai";

    // 确保在使用Google Generative AI时使用正确的agent名称
    const agentName = isGoogleGenAI ? "research_agent_google_genai" : "research_agent";

    console.log("Creating endpoint with agentName:", agentName);
    console.log("isGoogleGenAI:", isGoogleGenAI);

    const remoteEndpoint =
      deploymentUrl && !isCrewAi
        ? langGraphPlatformEndpoint({
            deploymentUrl,
            langsmithApiKey,
            agents: [
              {
                name: "research_agent",
                description: "Research agent",
              },
              {
                name: "research_agent_google_genai",
                description: "Research agent",
                assistantId: "9dc0ca3b-1aa6-547d-93f0-e21597d2011c",
              },
            ],
          })
        : copilotKitEndpoint({
            // 如果主端点/copilotkit不工作，可以切换到备份端点/copilotkit_backup
            url:
              process.env.REMOTE_ACTION_URL || "http://localhost:8080/copilotkit",
            // 备份端点
            // url: process.env.REMOTE_ACTION_URL || "http://localhost:8000/copilotkit_backup",
          });

    const runtime = new CopilotRuntime({
      remoteEndpoints: [remoteEndpoint],
    });

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: llmAdapter,
      endpoint: "/api/copilotkit",
    });

    // 尝试处理请求
    const response = await handleRequest(req);
    
    // 记录响应信息
    console.log("Response status:", response.status);
    
    return response;
  } catch (error) {
    console.error("Error in copilotkit route:", error);
    
    // 返回友好的错误响应
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
};
