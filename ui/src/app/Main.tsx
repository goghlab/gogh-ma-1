import { ResearchCanvas } from "@/components/ResearchCanvas";
import { AgentState } from "@/lib/types";
import { useCoAgent } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Logo } from "@/components/Logo";

export default function Main() {
  const model = "google_genai";
  const agent = "research_agent_google_genai";
  
  const { state, setState } = useCoAgent<AgentState>({
    name: agent,
    initialState: {
      model,
      research_question: "",
      resources: [],
      report: "",
      logs: [],
    },
  });

  useCopilotChatSuggestions({
    instructions: "Lifespan of penguins",
  });

  return (
    <>
      <h1 className="flex h-[60px] bg-[#111111] text-white items-center px-10 text-2xl font-medium">
        <Logo size="sm" className="mr-3" />
      </h1>

      <div
        className="flex flex-1"
        style={{ height: "calc(100vh - 60px)" }}
      >
        <div className="flex-1 overflow-hidden">
          <ResearchCanvas />
        </div>
        <div
          className="w-[500px] h-full flex-shrink-0"
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
            className="h-full"
            onSubmitMessage={async (message) => {
              // clear the logs before starting the new research
              setState({ ...state, logs: [] });
              await new Promise((resolve) => setTimeout(resolve, 30));
            }}
            labels={{
              initial: "Hi! How can I assist you with your research today?",
            }}
          />
        </div>
      </div>
    </>
  );
}
