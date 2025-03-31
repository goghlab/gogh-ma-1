"""Chat Node"""

from typing import List, Dict, Any, cast, Literal
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import SystemMessage, AIMessage, ToolMessage
from langchain.tools import tool
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_customize_config
from research_canvas.langgraph.state import AgentState
from research_canvas.langgraph.model import get_model
from research_canvas.langgraph.download import get_resource
import uuid
import datetime


@tool
def Search(queries: List[str]): # pylint: disable=invalid-name,unused-argument
    """A list of one or more search queries to find good resources to support the marketing campaign."""

@tool
def WriteCampaign(report: str): # pylint: disable=invalid-name,unused-argument
    """Write the marketing campaign draft."""

@tool
def WriteCampaignBrief(campaign_brief: str): # pylint: disable=invalid-name,unused-argument
    """Write the marketing campaign brief."""

@tool
def CreateCampaign(title: str, status: str = "draft"): # pylint: disable=invalid-name,unused-argument
    """Create a new marketing campaign with given title and status."""

@tool
def DeleteCampaign(campaign_id: str, confirmation_title: str): # pylint: disable=invalid-name,unused-argument
    """Delete a marketing campaign. Requires the campaign ID and confirmation of the campaign title for verification."""
    
@tool
def DeleteResources(urls: List[str]): # pylint: disable=invalid-name,unused-argument
    """Delete the URLs from the resources."""


async def chat_node(state: AgentState, config: RunnableConfig) -> \
    Command[Literal["search_node", "chat_node", "delete_node", "__end__"]]:
    """
    Chat Node
    """

    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "report",
            "tool": "WriteCampaign",
            "tool_argument": "report",
        }, {
            "state_key": "campaign_brief",
            "tool": "WriteCampaignBrief",
            "tool_argument": "campaign_brief",
        }],
    )

    state["resources"] = state.get("resources", [])
    state["campaigns"] = state.get("campaigns", [])
    campaign_brief = state.get("campaign_brief", "")
    report = state.get("report", "")

    resources = []

    for resource in state["resources"]:
        content = get_resource(resource["url"])
        if content == "ERROR":
            continue
        resources.append({
            **resource,
            "content": content
        })

    model = get_model(state)
    # Prepare the kwargs for the ainvoke method
    ainvoke_kwargs = {}
    if model.__class__.__name__ in ["ChatOpenAI"]:
        ainvoke_kwargs["parallel_tool_calls"] = False

    response = await model.bind_tools(
        [
            Search,
            WriteCampaign,
            WriteCampaignBrief,
            CreateCampaign,
            DeleteCampaign,
            DeleteResources,
        ],
        **ainvoke_kwargs  # Pass the kwargs conditionally
    ).ainvoke([
        SystemMessage(
            content=f"""
            You are a marketing campaign assistant. You help the user create effective marketing campaigns.

            Your primary job is to help users create and manage marketing campaigns. 
            
            When users start a conversation, ask them if they want to create a new marketing campaign to boost sales.
            Offer two clear choices:
            1. Yes, create a new campaign
            2. No, just browsing
            
            If they choose to create a campaign, use the CreateCampaign tool to add a new campaign to their workspace.
            Ask them for a campaign title and use it to create the campaign.
            
            If a user asks to delete a campaign:
            1. Ask them to confirm by typing the exact campaign title
            2. Only proceed with deletion if they correctly type the campaign title
            3. Use the DeleteCampaign tool with the campaign ID and confirmation title
            
            You can also help users create a campaign brief. After creating a campaign, guide them through key questions:
            - What product or service is being marketed?
            - Who is the target audience?
            - What messaging style would work best?
            
            Do not recite the resources, instead use them as inspiration and reference for your campaign ideas.
            
            When asked about creating a campaign brief, use the WriteCampaignBrief tool.
            When asked about creating a campaign draft, use the WriteCampaign tool.
            Never EVER respond with the draft directly, only use the appropriate tool.

            Current campaigns:
            {state.get("campaigns", [])}
            
            This is the current campaign brief:
            {campaign_brief}

            This is the campaign draft:
            {report}

            Here are the references & inspiration that you have available:
            {resources}
            """
        ),
        *state["messages"],
    ], config)

    ai_message = cast(AIMessage, response)

    if ai_message.tool_calls:
        if ai_message.tool_calls[0]["name"] == "WriteCampaign":
            report = ai_message.tool_calls[0]["args"].get("report", "")
            return Command(
                goto="chat_node",
                update={
                    "report": report,
                    "messages": [ai_message, ToolMessage(
                    tool_call_id=ai_message.tool_calls[0]["id"],
                    content="Campaign draft written."
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "WriteCampaignBrief":
            campaign_brief = ai_message.tool_calls[0]["args"]["campaign_brief"]
            return Command(
                goto="chat_node",
                update={
                    "campaign_brief": campaign_brief,
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content="Campaign brief written."
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "CreateCampaign":
            title = ai_message.tool_calls[0]["args"]["title"]
            status = ai_message.tool_calls[0]["args"].get("status", "draft")
            
            # Create a new campaign
            new_campaign = {
                "id": str(uuid.uuid4()),
                "title": title,
                "status": status,
                "brief": campaign_brief,
                "createdAt": datetime.datetime.now().isoformat()
            }
            
            # Add to campaigns list
            campaigns = state.get("campaigns", [])
            campaigns.append(new_campaign)
            
            return Command(
                goto="chat_node",
                update={
                    "campaigns": campaigns,
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content=f"New campaign '{title}' created successfully."
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "DeleteCampaign":
            campaign_id = ai_message.tool_calls[0]["args"]["campaign_id"]
            confirmation_title = ai_message.tool_calls[0]["args"]["confirmation_title"]
            
            # Get campaigns list
            campaigns = state.get("campaigns", [])
            
            # Find campaign by ID
            campaign_to_delete = next((c for c in campaigns if c["id"] == campaign_id), None)
            
            if campaign_to_delete and campaign_to_delete["title"] == confirmation_title:
                # Remove campaign from list
                campaigns = [c for c in campaigns if c["id"] != campaign_id]
                
                return Command(
                    goto="chat_node",
                    update={
                        "campaigns": campaigns,
                        "messages": [ai_message, ToolMessage(
                            tool_call_id=ai_message.tool_calls[0]["id"],
                            content=f"Campaign '{confirmation_title}' deleted successfully."
                        )]
                    }
                )
            else:
                # Incorrect confirmation or campaign not found
                return Command(
                    goto="chat_node",
                    update={
                        "messages": [ai_message, ToolMessage(
                            tool_call_id=ai_message.tool_calls[0]["id"],
                            content=f"Cannot delete campaign. Either the campaign was not found or the confirmation title doesn't match."
                        )]
                    }
                )
       
    goto = "__end__"
    if ai_message.tool_calls and ai_message.tool_calls[0]["name"] == "Search":
        goto = "search_node"
    elif ai_message.tool_calls and ai_message.tool_calls[0]["name"] == "DeleteResources":
        goto = "delete_node"


    return Command(
        goto=goto,
        update={
            "messages": response
        }
    )
