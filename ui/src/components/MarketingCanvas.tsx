"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCoAgent,
  useCoAgentStateRender,
  useCopilotAction,
} from "@copilotkit/react-core";
import { Progress } from "./Progress";
import { EditResourceDialog } from "./EditResourceDialog";
import { AddResourceDialog } from "./AddResourceDialog";
import { Resources } from "./Resources";
import { AgentState, Resource } from "@/lib/types";

export function MarketingCanvas() {
  const model = "google_genai";
  const agent = "research_agent_google_genai";

  const { state, setState } = useCoAgent<AgentState>({
    name: agent,
    initialState: {
      model,
    },
  });

  useCoAgentStateRender({
    name: agent,
    render: ({ state, nodeName, status }) => {
      if (!state.logs || state.logs.length === 0) {
        return null;
      }
      return <Progress logs={state.logs} />;
    },
  });

  useCopilotAction({
    name: "DeleteResources",
    description:
      "Prompt the user for resource delete confirmation, and then perform resource deletion",
    available: "remote",
    parameters: [
      {
        name: "urls",
        type: "string[]",
      },
    ],
    renderAndWait: ({ args, status, handler }) => {
      return (
        <div
          className=""
          data-test-id="delete-resource-generative-ui-container"
        >
          <div className="font-bold text-base mb-2">
            Delete these resources?
          </div>
          <Resources
            resources={resources.filter((resource) =>
              (args.urls || []).includes(resource.url)
            )}
            customWidth={200}
          />
          {status === "executing" && (
            <div className="mt-4 flex justify-start space-x-2">
              <button
                onClick={() => handler("NO")}
                className="px-4 py-2 text-[#6766FC] border border-[#6766FC] rounded text-sm font-bold"
              >
                Cancel
              </button>
              <button
                data-test-id="button-delete"
                onClick={() => handler("YES")}
                className="px-4 py-2 bg-[#6766FC] text-white rounded text-sm font-bold"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      );
    },
  });

  const resources: Resource[] = state.resources || [];
  const setResources = (resources: Resource[]) => {
    setState({ ...state, resources });
  };

  const [newResource, setNewResource] = useState<Resource>({
    url: "",
    title: "",
    description: "",
  });
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  const addResource = () => {
    if (newResource.url) {
      setResources([...resources, { ...newResource }]);
      setNewResource({ url: "", title: "", description: "" });
      setIsAddResourceOpen(false);
    }
  };

  const removeResource = (url: string) => {
    setResources(
      resources.filter((resource: Resource) => resource.url !== url)
    );
  };

  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false);

  const handleCardClick = (resource: Resource) => {
    setEditResource({ ...resource });
    setOriginalUrl(resource.url);
    setIsEditResourceOpen(true);
  };

  const updateResource = () => {
    if (editResource && originalUrl) {
      setResources(
        resources.map((resource) =>
          resource.url === originalUrl ? { ...editResource } : resource
        )
      );
      setEditResource(null);
      setOriginalUrl(null);
      setIsEditResourceOpen(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-10 bg-[#1e1e20]">
      <div className="space-y-6 md:space-y-8 pb-6 md:pb-10">
        <div>
          <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3 text-zinc-200">
            Campaign Brief
          </h2>
          <Input
            placeholder="Enter your campaign brief"
            value={state.campaign_brief || ""}
            onChange={(e) =>
              setState({ ...state, campaign_brief: e.target.value })
            }
            aria-label="Campaign brief"
            className="bg-[#2e2e32] px-4 md:px-6 py-6 md:py-8 border-0 shadow-none rounded-lg md:rounded-xl text-sm md:text-md font-extralight focus-visible:ring-0 placeholder:text-zinc-500 text-zinc-200"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-medium text-zinc-200">References & Inspiration</h2>
            <EditResourceDialog
              isOpen={isEditResourceOpen}
              onOpenChange={setIsEditResourceOpen}
              editResource={editResource}
              setEditResource={setEditResource}
              updateResource={updateResource}
            />
            <AddResourceDialog
              isOpen={isAddResourceOpen}
              onOpenChange={setIsAddResourceOpen}
              newResource={newResource}
              setNewResource={setNewResource}
              addResource={addResource}
            />
          </div>
          {resources.length === 0 && (
            <div className="text-xs md:text-sm text-zinc-500">
              Click the button above to add references or inspiration.
            </div>
          )}

          {resources.length !== 0 && (
            <Resources
              resources={resources}
              handleCardClick={handleCardClick}
              removeResource={removeResource}
            />
          )}
        </div>

        <div className="flex flex-col h-full">
          <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3 text-zinc-200">
            Campaign Draft
          </h2>
          <Textarea
            data-test-id="campaign-draft"
            placeholder="Write your campaign draft here"
            value={state.report || ""}
            onChange={(e) => setState({ ...state, report: e.target.value })}
            rows={8}
            aria-label="Campaign draft"
            className="bg-[#2e2e32] px-4 md:px-6 py-6 md:py-8 border-0 shadow-none rounded-lg md:rounded-xl text-sm md:text-md font-extralight focus-visible:ring-0 placeholder:text-zinc-500 text-zinc-200"
            style={{ minHeight: "180px" }}
          />
        </div>
      </div>
    </div>
  );
} 