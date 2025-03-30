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

    # 首先尝试从state获取
    state_model = state.get("model")
    
    # 然后尝试从agent模块获取
    agent_model = get_current_model()
    
    # 然后尝试从环境变量获取
    env_model = os.getenv("MODEL")
    
    # 按优先级选择模型
    model = state_model or agent_model or env_model or "openai"

    print(f"Using model: {model} (from {'state' if state_model else 'agent' if agent_model else 'env' if env_model else 'default'})")

    if model == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(temperature=0, model="gpt-4o-mini")
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
            api_key=cast(Any, os.getenv("GOOGLE_API_KEY")) or None
        )

    raise ValueError("Invalid model specified")
