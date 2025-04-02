import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
  langGraphPlatformEndpoint,
  copilotKitEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// 创建一个最小化的适配器
const dummyAdapter = new OpenAIAdapter({ 
  openai: new OpenAI({ apiKey: "dummy" }) as any, 
  model: "gpt-3.5-turbo" 
});

// 定义Campaign接口用于类型检查
interface Campaign {
  id: string;
  title: string;
  status: string;
  brief: string;
  createdAt: string;
}

// 配置直接调用本地的LangGraph代理
export const POST = async (req: NextRequest) => {
  try {
    console.log("收到CopilotKit请求");
    
    // 检查是否是创建活动的操作
    let body;
    try {
      const clonedRequest = req.clone();
      body = await clonedRequest.json();
      
      if (body?.messages) {
        const lastMessage = body.messages[body.messages.length - 1];
        if (lastMessage?.role === 'user') {
          console.log("用户消息内容:", lastMessage.content);
        }
      }
      
      // 检查是否是工具调用
      if (body?.actions) {
        console.log("请求包含工具调用:", JSON.stringify(body.actions, null, 2));
      }
    } catch (error) {
      console.log("无法解析请求体:", error);
    }

    // 设置LangGraph代理端点
    const searchParams = req.nextUrl.searchParams;
    const isGoogleGenAI = searchParams.get("coAgentsModel") === "google_genai";
    const agentName = isGoogleGenAI ? "research_agent_google_genai" : "research_agent";

    console.log("Creating endpoint with agentName:", agentName);
    console.log("isGoogleGenAI:", isGoogleGenAI);

    // 使用LangGraph代理端点
    const remoteEndpoint = copilotKitEndpoint({
      url: "http://localhost:8000/copilotkit", // LangGraph代理的地址（更新为8000端口）
    });

    // 创建运行时配置
    const runtime = new CopilotRuntime({
      remoteEndpoints: [remoteEndpoint],
    });

    // 将请求传递给LangGraph代理
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: dummyAdapter, // 使用最小化适配器
      endpoint: "/api/copilotkit",
    });

    try {
      // 处理请求并将结果返回给用户
      const response = await handleRequest(req);
      console.log("LangGraph处理响应状态:", response.status);
      return response;
    } catch (error) {
      console.error("处理CopilotKit请求失败:", error);
      
      // 提供友好的错误响应
      return NextResponse.json({
        response: "抱歉，无法处理您的请求。请稍后再试。"
      });
    }
  } catch (error) {
    console.error("Error in copilotkit route:", error);
    
    // 返回友好的错误响应
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
};
