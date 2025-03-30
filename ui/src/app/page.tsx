"use client";

import { CopilotKit } from "@copilotkit/react-core";
import Main from "./Main";

export default function ModelSelectorWrapper() {
  return <Home />;
}

function Home() {
  const agent = "research_agent_google_genai";
  
  // 固定使用Google Gemini模型
  const runtimeUrl = "/api/copilotkit";

  return (
    <CopilotKit runtimeUrl={runtimeUrl} showDevConsole={false} agent={agent}>
      <Main />
    </CopilotKit>
  );
}
