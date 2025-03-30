"""
This is the main entry point for the AI.
It defines the workflow graph and the entry point for the agent.
"""
# pylint: disable=line-too-long, unused-import
import json
from typing import cast, Dict, Any

from langchain_core.messages import AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from research_canvas.langgraph.state import AgentState
from research_canvas.langgraph.download import download_node
from research_canvas.langgraph.chat import chat_node
from research_canvas.langgraph.search import search_node
from research_canvas.langgraph.delete import delete_node, perform_delete_node
from research_canvas.langgraph.model_config import set_current_model

# Define a new graph
workflow = StateGraph(AgentState)
workflow.add_node("download", download_node)
workflow.add_node("chat_node", chat_node)
workflow.add_node("search_node", search_node)
workflow.add_node("delete_node", delete_node)
workflow.add_node("perform_delete_node", perform_delete_node)


memory = MemorySaver()
workflow.set_entry_point("download")
workflow.add_edge("download", "chat_node")
workflow.add_edge("delete_node", "perform_delete_node")
workflow.add_edge("perform_delete_node", "chat_node")
workflow.add_edge("search_node", "download")
graph = workflow.compile(checkpointer=memory, interrupt_after=["delete_node"])

# 自定义的graph调用函数，支持model_name参数
def create_graph_with_model(model_name=None):
    """创建一个新的graph实例，支持model_name参数"""
    # 如果指定了model_name，设置为当前模型
    if model_name:
        set_current_model(model_name)
    
    # 编译graph
    compiled_graph = workflow.compile(
        checkpointer=memory, 
        interrupt_after=["delete_node"]
    )
    
    return compiled_graph
