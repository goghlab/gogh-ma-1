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
import requests
import json


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

@tool
def CreateNewCampaign(): # pylint: disable=invalid-name,unused-argument
    """User chooses to create a new marketing campaign, use this tool to guide the creation process."""

@tool
def JustBrowsing(): # pylint: disable=invalid-name,unused-argument
    """User chooses to just browse, not create a new campaign. Reply to confirm they can freely browse and ask for help anytime."""

@tool
def DefineTargetAudience(audience_description: str, age_range: str = ""): # pylint: disable=invalid-name,unused-argument
    """Define the target audience for the marketing campaign. Can include age range information."""

@tool
def SelectAgeRange(age_range: str): # pylint: disable=invalid-name,unused-argument
    """Select the target audience age range, such as: '18-24', '25-34', '35-44', '45-54', '55+'."""

@tool
def SetCampaignGoals(goals: str): # pylint: disable=invalid-name,unused-argument
    """Set the goals for the marketing campaign."""

@tool
def SelectMarketingChannels(channels: str): # pylint: disable=invalid-name,unused-argument
    """Select the channels for the marketing campaign."""

@tool
def SetCampaignBudget(budget: str): # pylint: disable=invalid-name,unused-argument
    """Set the budget for the marketing campaign."""


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
            CreateNewCampaign,
            JustBrowsing,
            DefineTargetAudience,
            SelectAgeRange,
            SetCampaignGoals,
            SelectMarketingChannels,
            SetCampaignBudget,
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
            
            If they choose "Yes, create a new campaign", use the CreateNewCampaign tool. Then use the CreateCampaign tool to add a new campaign to their workspace.
            Ask them for a campaign title and use it to create the campaign.
            
            If they choose "No, just browsing", use the JustBrowsing tool, and tell them they can freely browse and ask for help anytime.
            
            # Special Message Handling
            If the user sends a message containing "I need help customizing this campaign", DO NOT ask if they want to create a campaign again.
            Instead, present them with options for customizing their campaign:
            
            1. Target Audience: Who are you trying to reach? Tell me about your ideal customer.
            2. Campaign Goals: What do you want to achieve with this campaign? (e.g., increase website traffic, generate leads, boost sales)
            3. Marketing Channels: Where will you reach your audience? (e.g., social media, email, search ads)
            4. Campaign Budget: How much are you willing to spend?
            
            Then guide the user based on their selection:
            
            ## Target Audience
            If they mention wanting to "define the target audience", use the DefineTargetAudience tool and help them identify their ideal customers.
            First, offer them clickable options for age ranges:
            - 18-24 years old
            - 25-34 years old
            - 35-44 years old
            - 45-54 years old
            - 55+ years old
            
            When they select an age range, use the SelectAgeRange tool. Then ask additional questions like:
            - What gender demographic are you primarily targeting?
            - What location or geographical area are you focusing on?
            - What interests or behaviors do they have?
            - What problems are they trying to solve?
            
            After collecting all this information, use the DefineTargetAudience tool with the complete description including the age range information.
            
            ## Campaign Goals
            If they mention wanting to "set campaign goals", use the SetCampaignGoals tool and help them define specific, measurable goals.
            Ask them questions like:
            - Are you looking to increase brand awareness?
            - Do you want to generate leads?
            - Are you focused on direct sales?
            - What metrics would indicate success?
            
            ## Marketing Channels
            If they mention wanting to "choose marketing channels", use the SelectMarketingChannels tool and help them select the best platforms.
            Ask them questions like:
            - Where does your target audience spend time online?
            - Which channels have worked well for you in the past?
            - Do you prefer digital channels, traditional media, or a mix?
            
            ## Campaign Budget
            If they mention wanting to "set a campaign budget", use the SetCampaignBudget tool and help them allocate resources effectively.
            Ask them questions like:
            - What's your total budget for this campaign?
            - How do you want to distribute the budget across channels?
            - Are there any cost constraints to be aware of?
            
            # Other Features
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
            
            # 向MongoDB发送请求，保存活动
            try:
                print(f"发送活动到MongoDB: {new_campaign['title']}")
                response = requests.post("http://localhost:5000/api/campaigns", 
                                         json=new_campaign, 
                                         headers={"Content-Type": "application/json"})
                
                if response.status_code == 201:
                    print(f"活动成功保存到MongoDB: {response.json()}")
                else:
                    print(f"MongoDB API错误: {response.status_code} {response.text}")
            except Exception as e:
                print(f"发送活动到MongoDB出错: {str(e)}")
            
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
        if ai_message.tool_calls[0]["name"] == "CreateNewCampaign":
            # 引导用户创建新的营销活动
            # 在这里我们只返回提示消息，后续用户提供标题后会调用CreateCampaign工具
            
            # 记录用户请求创建新活动
            print("用户请求创建新活动，等待提供标题")
            
            return Command(
                goto="chat_node",
                update={
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content="Let's create a new marketing campaign. What would you like to name it?"
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "JustBrowsing":
            return Command(
                goto="chat_node",
                update={
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content="No problem! Feel free to browse. Let me know if you need any help."
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "DefineTargetAudience":
            audience_description = ai_message.tool_calls[0]["args"]["audience_description"]
            age_range = ai_message.tool_calls[0]["args"]["age_range"]
            # Update target audience information
            return Command(
                goto="chat_node",
                update={
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content=f"Successfully defined target audience: {audience_description}, {age_range}"
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "SelectAgeRange":
            age_range = ai_message.tool_calls[0]["args"]["age_range"]
            # Update target audience age range
            return Command(
                goto="chat_node",
                update={
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content=f"Successfully selected target audience age range: {age_range}"
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "SetCampaignGoals":
            goals = ai_message.tool_calls[0]["args"]["goals"]
            # Update campaign goals
            return Command(
                goto="chat_node",
                update={
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content=f"Successfully set campaign goals: {goals}"
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "SelectMarketingChannels":
            channels = ai_message.tool_calls[0]["args"]["channels"]
            # Update marketing channels
            return Command(
                goto="chat_node",
                update={
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content=f"Successfully selected marketing channels: {channels}"
                    )]
                }
            )
        if ai_message.tool_calls[0]["name"] == "SetCampaignBudget":
            budget = ai_message.tool_calls[0]["args"]["budget"]
            # Update campaign budget
            return Command(
                goto="chat_node",
                update={
                    "messages": [ai_message, ToolMessage(
                        tool_call_id=ai_message.tool_calls[0]["id"],
                        content=f"Successfully set campaign budget: {budget}"
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
