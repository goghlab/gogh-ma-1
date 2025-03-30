"""Demo"""

import os
from dotenv import load_dotenv
load_dotenv()

# pylint: disable=wrong-import-position
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import traceback
import json
import time

# 首先导入model_config，这样其他模块在导入时可以使用它
from research_canvas.langgraph.model_config import set_current_model, get_current_model

# 从环境变量获取默认模型
default_model = os.getenv("MODEL", "openai")
print(f"Default model from environment: {default_model}")

# 设置默认模型
set_current_model(default_model)

# 然后导入其他模块
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAgent
from copilotkit.crewai import CrewAIAgent
from research_canvas.crewai.agent import ResearchCanvasFlow
from research_canvas.langgraph.agent import graph, create_graph_with_model

# from contextlib import asynccontextmanager
# from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
# @asynccontextmanager
# async def lifespan(fastapi_app: FastAPI):
#     """Lifespan for the FastAPI app."""
#     async with AsyncSqliteSaver.from_conn_string(
#         ":memory:"
#     ) as checkpointer:
#         # Create an async graph
#         graph = workflow.compile(checkpointer=checkpointer)

#         # Create SDK with the graph
#         sdk = CopilotKitRemoteEndpoint(
#             agents=[
#                 LangGraphAgent(
#                     name="research_agent",
#                     description="Research agent.",
#                     graph=graph,
#                 ),
#                 LangGraphAgent(
#                     name="research_agent_google_genai",
#                     description="Research agent.",
#                     graph=graph
#                 ),
#             ],
#         )

#         # Add the CopilotKit FastAPI endpoint
#         add_fastapi_endpoint(fastapi_app, sdk, "/copilotkit")
#         yield

# app = FastAPI(lifespan=lifespan)

# 为Google Gemini模型创建一个专用的graph实例
google_genai_graph = create_graph_with_model("google_genai")

# 使用默认模型创建一个graph实例
default_graph = create_graph_with_model(default_model)

app = FastAPI()

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许前端域
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
    expose_headers=["*"],  # 暴露所有头
    allow_origin_regex=".*",  # 允许所有来源（仅用于开发环境）
)

sdk = CopilotKitRemoteEndpoint(
    agents=[
        CrewAIAgent(
            name="research_agent_crewai",
            description="Research agent.",
            flow=ResearchCanvasFlow(),
        ),
        LangGraphAgent(
            name="research_agent",
            description="Research agent.",
            graph=default_graph,
        ),
        LangGraphAgent(
            name="research_agent_google_genai",
            description="Research agent using Google Gemini.",
            graph=google_genai_graph,
        ),
    ],
)

# 先使用CopilotKit的add_fastapi_endpoint函数注册端点
add_fastapi_endpoint(app, sdk, "/copilotkit")

# 然后用我们自己的端点覆盖它
@app.post("/copilotkit")
async def custom_copilotkit_handler(request: Request):
    """自定义的/copilotkit端点处理程序，覆盖原来的端点"""
    try:
        # 读取请求内容
        body_bytes = await request.body()
        body_str = body_bytes.decode()
        
        # 记录完整的请求内容
        print(f"Raw request body: {body_str}")
        
        try:
            data = json.loads(body_str)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            return {"error": f"Invalid JSON: {str(e)}"}
        
        print(f"Received data in copilotkit: {data}")
        
        # 处理工具调用结果
        if "tool_call_id" in data:
            print(f"Processing tool call result: {data}")
            # 这是工具调用的结果，需要返回一个合适的响应
            tool_call_id = data.get("tool_call_id")
            result = data.get("content", "No result provided")
            
            response_data = {
                "id": f"response-{tool_call_id}",
                "object": "chat.completion",
                "created": int(time.time()),
                "model": "gemini-1.5-pro",
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": f"以下是搜索结果：\n\n{result}\n\n让我为您总结一下这些信息。",
                        },
                        "finish_reason": "stop"
                    }
                ],
                "usage": {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0
                }
            }
            
            # 使用JSONResponse以确保正确的Content-Type
            from fastapi.responses import JSONResponse
            return JSONResponse(content=response_data)
        
        # 标准请求处理
        messages = data.get("messages", [])
        agent_name = data.get("agent", "research_agent")
        tools = data.get("tools", [])  # 获取工具定义
        tool_choice = data.get("tool_choice", "auto")  # 工具选择
        
        # 判断是否需要执行工具调用
        need_tool_call = (tool_choice != "none" and len(tools) > 0)
        
        # 检查最后一条消息，如果是工具结果，不需要再做工具调用
        last_msg_is_tool_result = False
        if messages and len(messages) > 0:
            last_msg = messages[-1]
            if last_msg.get("role") == "tool" or "tool_call_id" in last_msg:
                last_msg_is_tool_result = True
                need_tool_call = False
        
        # 确定使用哪个模型
        model_name = "google_genai" if agent_name == "research_agent_google_genai" else default_model
        print(f"Using model: {model_name} for agent: {agent_name}")
        
        # 使用选定的模型处理请求
        from research_canvas.langgraph.model import get_model
        from research_canvas.langgraph.state import AgentState
        from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
        
        # 从messages列表中提取和转换消息
        lc_messages = []
        for msg in messages:
            content = msg.get("content", "")
            if msg.get("role") == "user":
                lc_messages.append(HumanMessage(content=content))
            elif msg.get("role") == "assistant":
                lc_messages.append(AIMessage(content=content))
            elif msg.get("role") == "system":
                lc_messages.append(SystemMessage(content=content))
            elif msg.get("role") == "tool":
                tool_call_id = msg.get("tool_call_id", "unknown")
                lc_messages.append(ToolMessage(content=content, tool_call_id=tool_call_id))
        
        if not lc_messages:
            return {"error": "No valid messages received"}
        
        # 临时设置当前模型（确保在当前请求中使用正确的模型）
        current_model = get_current_model()
        set_current_model(model_name)
        
        try:
            # 创建状态
            state = AgentState({})
            
            # 获取模型
            model = get_model(state)
            
            # 调用模型
            ai_response = model.invoke(lc_messages)
            
            # 确定是返回普通消息还是工具调用
            if need_tool_call and not last_msg_is_tool_result and "search" in [tool.get("function", {}).get("name") for tool in tools]:
                # 模拟工具调用 - 这里我们创建一个search工具调用
                response_data = {
                    "id": f"response-{agent_name}",
                    "object": "chat.completion",
                    "created": int(time.time()),
                    "model": model_name,
                    "choices": [
                        {
                            "index": 0,
                            "message": {
                                "role": "assistant",
                                "content": None,  # 当有工具调用时，content为null
                                "tool_calls": [
                                    {
                                        "id": f"call-search-{int(time.time())}",
                                        "type": "function",
                                        "function": {
                                            "name": "search",
                                            "arguments": json.dumps({
                                                "query": lc_messages[-1].content if isinstance(lc_messages[-1], HumanMessage) else "general search"
                                            })
                                        }
                                    }
                                ]
                            },
                            "finish_reason": "tool_calls"
                        }
                    ],
                    "usage": {
                        "prompt_tokens": 0,
                        "completion_tokens": 0,
                        "total_tokens": 0
                    }
                }
            else:
                # 返回普通消息
                response_data = {
                    "id": f"response-{agent_name}",
                    "object": "chat.completion",
                    "created": int(time.time()),
                    "model": model_name,
                    "choices": [
                        {
                            "index": 0,
                            "message": {
                                "role": "assistant",
                                "content": ai_response.content,
                            },
                            "finish_reason": "stop"
                        }
                    ],
                    "usage": {
                        "prompt_tokens": 0,
                        "completion_tokens": 0,
                        "total_tokens": 0
                    }
                }
            
            # 恢复原来的模型设置
            if current_model:
                set_current_model(current_model)
                
            # 使用JSONResponse以确保正确的Content-Type
            from fastapi.responses import JSONResponse
            return JSONResponse(content=response_data)
            
        except Exception as e:
            if current_model:
                set_current_model(current_model)
            print(f"Error in custom_copilotkit_handler: {str(e)}")
            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))
            
    except Exception as e:
        print(f"Error in custom_copilotkit_handler: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# 添加自定义日志记录中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    path = request.url.path
    method = request.method
    
    print(f"Received request: {method} {path}")
    
    if path == "/copilotkit" and method == "POST":
        # 保存请求体
        body_bytes = await request.body()
        
        # 为了能够多次读取请求体，我们需要修改request._receive
        async def receive():
            return {"type": "http.request", "body": body_bytes}
        
        request._receive = receive
        
        # 尝试解析和记录请求体
        try:
            body = body_bytes.decode()
            print(f"Request body for {path}: {body}")
        except Exception as e:
            print(f"Error decoding request body: {str(e)}")
    
    try:
        response = await call_next(request)
        
        print(f"Response status: {response.status_code}")
        
        # 记录响应体（如果可能）
        if path == "/copilotkit":
            try:
                # 这里我们只记录响应状态码，不尝试读取响应体
                # 因为它可能是流式响应或已经被消费
                print(f"Response headers for {path}: {response.headers}")
            except Exception as e:
                print(f"Error logging response: {str(e)}")
        
        return response
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        print(traceback.format_exc())
        raise


@app.get("/health")
def health():
    """Health check."""
    return {"status": "ok"}


@app.post("/gemini")
async def gemini_endpoint(request: Request):
    data = await request.json()
    # 处理请求数据
    return {"message": "Gemini endpoint received", "data": data}


@app.post("/test_gemini")
async def test_gemini(request: Request):
    try:
        data = await request.json()
        query = data.get("query", "你好")
        
        # 使用Google Gemini模型处理请求
        from research_canvas.langgraph.model import get_model
        from research_canvas.langgraph.state import AgentState
        from langchain_core.messages import HumanMessage
        
        # 创建一个包含model=google_genai的状态
        state = AgentState({})
        # 获取Google Gemini模型
        model = get_model(state)
        
        # 调用模型
        response = model.invoke([HumanMessage(content=query)])
        
        return {"response": response.content}
    except Exception as e:
        print(f"Error in test_gemini: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


def main():
    """Run the uvicorn server."""
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "research_canvas.demo:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_dirs=(
            ["."] +
            (["../../../sdk-python/copilotkit"]
             if os.path.exists("../../../sdk-python/copilotkit")
             else []
             )
        )
    )
