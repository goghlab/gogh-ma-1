# Research Canvas with Google Gemini

一个使用Google Gemini模型的研究助手应用程序。此项目基于CopilotKit的CoAgents框架，支持使用Google Gemini 1.5 Pro模型进行交互。

## 功能特点

- 使用Google Gemini 1.5 Pro模型进行自然语言处理
- 前端使用Next.js和React构建的现代UI
- 后端使用FastAPI和LangGraph处理请求
- 支持多种模型切换（OpenAI、Anthropic、Google Gemini）

## 架构

项目由两个主要部分组成：

- `agent/`：包含后端代码，使用Python和FastAPI
- `ui/`：包含前端代码，使用Next.js和React

## 环境要求

- Python 3.12+
- Node.js 18+
- Poetry
- npm/pnpm

## 环境变量

在项目根目录创建一个`.env`文件，包含以下环境变量：

```
MODEL=google_genai
GOOGLE_API_KEY=你的Google API密钥
TAVILY_API_KEY=你的Tavily API密钥（用于搜索功能）
```

## 安装与运行

### 后端

1. 进入`agent`目录：
   ```bash
   cd agent
   ```

2. 使用Poetry安装依赖：
   ```bash
   poetry install
   ```

3. 启动后端服务器：
   ```bash
   poetry run uvicorn research_canvas.demo:app --host 0.0.0.0 --port 8000
   ```

### 前端

1. 进入`ui`目录：
   ```bash
   cd ui
   ```

2. 安装依赖：
   ```bash
   npm install
   # 或
   pnpm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   # 或
   pnpm dev
   ```

4. 在浏览器中访问`http://localhost:3000`

## 使用方法

1. 在前端界面底部选择"Google Generative AI"模型
2. 使用聊天界面与代理进行交互
3. 代理将使用Google Gemini模型处理您的请求并提供响应

## API端点

- `/health`：健康检查端点（GET）
- `/copilotkit`：CopilotKit集成的主要端点（POST）
- `/gemini`：测试Gemini模型的简单端点（POST）
- `/test_gemini`：直接测试Gemini模型的端点（POST）

## 定制与扩展

如果需要添加新功能或修改现有功能，可以编辑以下文件：

- `agent/research_canvas/demo.py`：主要的后端入口点
- `agent/research_canvas/langgraph/model.py`：模型配置和选择
- `ui/src/app/api/copilotkit/route.ts`：前端API路由
- `ui/src/app/page.tsx`：前端主页面

# CoAgents Research Canvas Example

This example demonstrates a research canvas UI.

**Live demo:** https://examples-coagents-research-canvas-ui.vercel.app/

Tutorial Video:

[![IMAGE ALT TEXT](http://img.youtube.com/vi/0b6BVqPwqA0/0.jpg)](http://www.youtube.com/watch?v=0b6BVqPwqA0 "Build Agent-Native Apps with LangGraph & CoAgents (tutorial)")


---

## Running the Agent

**These instructions assume you are in the `coagents-research-canvas/` directory**

## Running the Agent

First, install the backend dependencies:

### Python SDK

```sh
cd agent-py
poetry install
```

### JS-SDK

```sh
cd agent-js
pnpm install
```

Then, create a `.env` file inside `./agent-py` or `./agent-js` with the following:

```
OPENAI_API_KEY=...
TAVILY_API_KEY=...
LANGSMITH_API_KEY=...(JS ONLY)
```

⚠️ IMPORTANT:
Make sure the OpenAI API Key you provide, supports gpt-4o.

Then, run the demo:

### Python

```sh
poetry run demo
```

## Running the UI

First, install the dependencies:

```sh
cd ./ui
pnpm i
```

Then, create a `.env` file inside `./ui` with the following:

```
OPENAI_API_KEY=...
```

Then, run the Next.js project:

```sh
pnpm run dev
```

⚠️ IMPORTANT:
If you're using the JS agent, follow the steps and uncomment the code inside the `app/api/copilotkit/route.ts`, `remoteEndpoints` action: 

```ts
//const runtime = new CopilotRuntime({
 // remoteEndpoints: [
    // Uncomment this if you want to use LangGraph JS, make sure to
    // remove the remote action url below too.
    //
    // langGraphPlatformEndpoint({
    //   deploymentUrl: "http://localhost:8123",
    //   langsmithApiKey: process.env.LANGSMITH_API_KEY || "", // only used in LangGraph Platform deployments
    //   agents: [{
    //       name: "research_agentt",
    //       description: "Research agent"
    //   }]
    // }),
 // ],
//});
```
**Next for JS run these commands:**
- Run this command to start your LangGraph server `npx @langchain/langgraph-cli dev --host localhost --port 8123`
- Run this command to connect your Copilot Cloud Tunnel to the LangGraph server `npx copilotkit@latest dev --port 8123`

## Usage

Navigate to [http://localhost:3000](http://localhost:3000).

# LangGraph Studio

Run LangGraph studio, then load the `./agent-py` folder into it.

# Troubleshooting

A few things to try if you are running into trouble:

1. Make sure there is no other local application server running on the 8000 port.
2. Under `/agent/research_canvas/demo.py`, change `0.0.0.0` to `127.0.0.1` or to `localhost`
