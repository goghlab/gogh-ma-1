"""
This module provides a function to get a model based on the configuration.
"""
import os
from typing import cast, Any
from langchain_core.language_models.chat_models import BaseChatModel
from research_canvas.langgraph.state import AgentState
from research_canvas.langgraph.model_config import get_current_model

def get_model(state: AgentState) -> BaseChatModel:
    """
    Get a model based on the environment variable.
    """

    # First try to get from state
    state_model = state.get("model")
    
    # Then try to get from agent module
    agent_model = get_current_model()
    
    # Then try to get from environment variable
    env_model = os.getenv("MODEL")
    
    # Choose model based on priority
    model = state_model or agent_model or env_model or "openai"

    print(f"Using model: {model} (from {'state' if state_model else 'agent' if agent_model else 'env' if env_model else 'default'})")

    if model == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            temperature=0, 
            model="gpt-4o-mini", 
            model_kwargs={"response_format": {"type": "json_object"}}
        )
    if model == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            temperature=0,
            model_name="claude-3-5-sonnet-20240620",
            timeout=None,
            stop=None
        )
    if model == "google_genai":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            temperature=0,
            model="gemini-1.5-pro",
            api_key=cast(Any, os.getenv("GOOGLE_API_KEY")) or None,
            convert_system_message_to_human=True
        )

    raise ValueError("Invalid model specified")
