"""
This is the state definition for the AI.
It defines the state of the agent and the state of the conversation.
"""

from typing import List, Dict, Any, TypedDict
from langgraph.graph import MessagesState

class Resource(TypedDict):
    """
    Represents a resource. Give it a good title and a short description.
    """
    url: str
    title: str
    description: str

class Campaign(TypedDict):
    """
    Represents a marketing campaign.
    """
    id: str
    title: str
    status: str  # "active", "draft", "completed", "scheduled"
    brief: str
    createdAt: str

class Log(TypedDict):
    """
    Represents a log of an action performed by the agent.
    """
    message: str
    done: bool

class AgentState(MessagesState):
    """
    This is the state of the agent.
    It is a subclass of the MessagesState class from langgraph.
    """
    model: str
    campaign_brief: str  # 营销活动简介
    report: str
    resources: List[Resource]
    logs: List[Log]
    campaigns: List[Campaign]
