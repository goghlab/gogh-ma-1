"""
This module provides shared configuration and state for model selection.
"""

# 在模块级别定义一个变量，用于存储当前使用的模型名称
current_model = None

# 更新模型使用的函数
def set_current_model(model_name):
    """设置当前使用的模型名称"""
    global current_model
    current_model = model_name
    print(f"Set current model to: {current_model}")

# 获取当前模型的函数
def get_current_model():
    """获取当前使用的模型名称"""
    return current_model 