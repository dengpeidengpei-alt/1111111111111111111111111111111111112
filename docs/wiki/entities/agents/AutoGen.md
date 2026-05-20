---
type: framework
category: agents
key: AutoGen
source: Microsoft / GitHub microsoft/autogen
date: 2026-05-20
---

# AutoGen

> Microsoft 开源多 Agent 对话框架 | ConversableAgent × GroupChat × Nested Chats

## 概述

| 属性 | 值 |
|------|-----|
| 开发者 | Microsoft |
| 类型 | 多 Agent 对话框架 |
| 源码 | https://github.com/microsoft/autogen |
| Stars | 活跃（头部项目） |
| 定位 | 多 Agent 协作的对话驱动框架 |
| 特点 | 灵活对话、角色定义、人类参与 |

AutoGen 是 Microsoft 开发的开源多 Agent 框架，通过ConversableAgent 对话机制实现任务分解与协作。与其他框架不同，AutoGen 强调对话驱动、灵活组合和人类参与。

## 核心架构

### ConversableAgent

```python
class ConversableAgent:
    """
    可对话 Agent
    AutoGen 的核心抽象
    """
    def __init__(
        self,
        name: str,
        system_message: str,  # 角色定义
        llm_config: dict,      # LLM 配置
        human_input_mode: str  # 人类输入模式
    ):
        self.name = name
        self.system_message = system_message
        self.llm_config = llm_config
        self.human_input_mode = human_input_mode
        self.chat_history = [[Self-Healing-Loop]]

    def send(self, message, recipient):
        """发送消息给另一个 Agent"""
        recipient.receive(message, self)

    def receive(self, message, sender):
        """接收消息"""
        self.chat_history.append({
            "sender": sender.name,
            "message": message,
            "timestamp": now()
        })

    def generate_reply(self, messages):
        """生成回复（由 LLM 提供）"""
        # 构建 prompt
        # 调用 LLM
        # 返回回复
        pass

    def initiate_chat(self, recipient, message):
        """发起对话"""
        self.send(message, recipient)
        # recipient 处理后回复
        # 对话继续直到终止
```

### 三种人类输入模式

```python
# ALWAYS: 总是等待人类输入
human_input_mode="ALWAYS"

# NEVER: 完全自主，不需要人类输入
human_input_mode="NEVER"

# TERMINATE: 当特定条件满足时请求人类输入
human_input_mode="TERMINATE"
```

## 核心功能

### 1. GroupChat（群聊模式）

```python
from autogen import GroupChat, GroupChatManager

class MultiAgentGroupChat:
    """
    多 Agent 群聊
    动态对话路由
    """
    def __init__(self, agents):
        self.agents = agents
        self.groupchat = GroupChat(
            agents=agents,
            messages=[[Self-Healing-Loop]],
            max_round=20
        )
        self.manager = GroupChatManager(
            groupchat=self.groupchat
        )

    def start_conversation(self, initial_message):
        """开始群聊"""
        # 指定发言人
        speaker = self.select_speaker()
        speaker.initiate_chat(
            self.manager,
            message=initial_message
        )

    def select_speaker(self):
        """选择发言人"""
        # 可以是轮询、随机、或基于状态的策略
        return random.choice(self.agents)
```

### 2. Nested Chats（嵌套对话）

```python
class NestedChatManager:
    """
    嵌套对话
    处理复杂工作流
    """
    def __init__(self):
        self.chat_trees = {}

    def create_nested_chat(self, parent_agent, child_agents, task):
        """
        创建嵌套对话结构
        父 Agent 调用子 Agent 处理子任务
        """
        results = [[Self-Healing-Loop]]
        for child in child_agents:
            result = child.initiate_chat(parent_agent, task)
            results.append(result)

        # 汇总子任务结果
        summary = self.summarize(results)
        return summary
```

### 3. 对话模式

```python
class ConversationModes:
    """
    AutoGen 对话模式
    """
    # 1. 双方对话 (Two-agent)
    def two_agent_chat(self, agent1, agent2, topic):
        result = agent1.initiate_chat(agent2, message=topic)
        return result

    # 2. 群聊 (Group chat)
    def group_chat(self, agents, topic, max_rounds=20):
        gc = GroupChat(agents=agents)
        mgr = GroupChatManager(groupchat=gc)
        agents[0].initiate_chat(mgr, message=topic)

    # 3. 层级对话 (Hierarchical)
    def hierarchical_chat(self, manager, workers, task):
        # 管理器分解任务给 workers
        subtasks = manager.decompose(task)
        results = [w.initiate_chat(manager, t) for w, t in zip(workers, subtasks)]
        return manager.aggregate(results)
```

## 高级特性

### 代码执行与工具调用

```python
class CodeExecutionAgent(ConversableAgent):
    """
    支持代码执行的 Agent
    """
    def __init__(self, name, **kwargs):
        super().__init__(name, **kwargs)
        self.code_executor = CodeExecutor()

    def generate_reply(self, messages):
        # 检查是否需要执行代码
        if self.should_execute_code(messages[-1]):
            code = self.extract_code(messages[-1])
            result = self.code_executor.execute(code)
            # 将结果注入对话
            return f"Code execution result: {result}"
        return super().generate_reply(messages)
```

### 状态管理

```python
class AgentState:
    """
    Agent 状态管理
    """
    def __init__(self):
        self.context = {}          # 当前上下文
        self.memory = [[Self-Healing-Loop]]           # 记忆
        self.tools_used = [[Self-Healing-Loop]]       # 使用过的工具
        self.conversation_history = [[Self-Healing-Loop]]  # 对话历史

    def save(self):
        """保存状态"""
        return {
            "context": self.context,
            "memory": self.memory,
            "tools_used": self.tools_used,
            "history": self.conversation_history
        }

    def restore(self, state):
        """恢复状态"""
        self.context = state["context"]
        self.memory = state["memory"]
        self.tools_used = state["tools_used"]
        self.conversation_history = state["history"]
```

### 消息转换

```python
class MessageTransform:
    """
    消息转换
    支持不同格式的消息
    """
    @staticmethod
    def text_to_agent_message(text, sender, receiver):
        return {
            "sender": sender,
            "receiver": receiver,
            "content": text,
            "type": "text"
        }

    @staticmethod
    def code_to_agent_message(code, language, sender, receiver):
        return {
            "sender": sender,
            "receiver": receiver,
            "content": code,
            "type": "code",
            "language": language
        }

    @staticmethod
    def function_result_to_message(result, sender, receiver):
        return {
            "sender": sender,
            "receiver": receiver,
            "content": str(result),
            "type": "function_result"
        }
```

## 使用模式

### 模式 1: sequential（顺序对话）

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Sequential 模式                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Agent A → Agent B → Agent C → Agent D                            │
│         ↓         ↓         ↓         ↓                            │
│       任务1     任务2     任务3     任务4                            │
│                                                                     │
│   特点：按顺序执行，下游依赖上游输出                                   │
└─────────────────────────────────────────────────────────────────────┘
```

```python
from autogen import ConversableAgent

# 创建 Agent
agent_a = ConversableAgent(name="A", system_message="分析问题")
agent_b = ConversableAgent(name="B", system_message="生成方案")
agent_c = ConversableAgent(name="C", system_message="评估风险")

# 顺序对话
result_a = agent_a.initiate_chat(agent_b, message="分析这个问题")
result_b = agent_b.initiate_chat(agent_c, message="基于A的分析生成方案")
```

### 模式 2: parallel（并行对话）

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Parallel 模式                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Manager                                                           │
│      ↓         ↓         ↓                                          │
│   Agent A   Agent B   Agent C                                      │
│      ↓         ↓         ↓                                          │
│   结果A     结果B     结果C                                          │
│      ↓         ↓         ↓                                          │
│   Manager（汇总）                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

```python
import asyncio

async def parallel_chat(manager, agents, task):
    # 并行发起多个对话
    tasks = [agent.initiate_chat(manager, task) for agent in agent[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
    results = await asyncio.gather(*tasks)
    return manager.summarize(results)
```

### 模式 3: hierarchical（层级管理）

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Hierarchical 模式                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    Manager Agent                                     │
│                    (任务分解)                                        │
│                         ↓                                           │
│   ┌──────────────────┼──────────────────┐                           │
│   ↓                  ↓                  ↓                           │
│ Worker A          Worker B          Worker C                        │
│ (执行子任务)      (执行子任务)      (执行子任务)                       │
│                         ↓                                           │
│                    Manager Agent                                     │
│                    (结果汇总)                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 生态与工具

### AutoGen Studio

```python
# AutoGen Studio 是一个 GUI 工具
# 用于可视化构建 Agent 工作流

# 功能：
# - 拖拽式 Agent 配置
# - 对话流程设计
# - 测试与调试
# - 部署到生产
```

### Magentic

```python
# 将 AutoGen 接入 LangChain
from magentic import Agent

# 使用 LangChain 的工具和链
agent = Agent(
    model=openai.ChatOpenAI(model="gpt-4"),
    tools=[search_tool, calculator_too[[Self-Healing-Loop]],
    system_message="你是一个有帮助的助手"
)
```

### 与其他框架对比

| 维度 | AutoGen | [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] | [[agents/CrewAI.m[[knowledge/Design-Toolkit]]] | [[agents/Hermes-Agent.m[[knowledge/Design-Toolkit]]] |
|------|---------|-------------------|------------|------------------|
| 开发者 | Microsoft | Community | CrewAI Inc | Community |
| 架构 | 对话驱动 | 分层协作 | Role/Task/Crew | 5 阶段递进 |
| 协调模式 | 动态对话 | 6 种模式 | 3 种 Process | 5 阶段 |
| 复杂度 | 中 | 高 | 中 | 高 |
| 扩展性 | 中 | 高 | 中 | 高 |
| 学习曲线 | 低 | 高 | 低 | 中 |
| 适用场景 | 快速原型、对话协作 | 复杂工作流 | 结构化任务 | 全栈开发 |

## 代码示例

### 示例 1: 代码审查团队

```python
from autogen import ConversableAgent, GroupChat, GroupChatManager

# 创建角色
code_reviewer = ConversableAgent(
    name="Code_Reviewer",
    system_message="你是一个严格的代码审查员，专注于代码质量和安全",
    llm_config={"model": "gpt-4"}
)

security_expert = ConversableAgent(
    name="Security_Expert",
    system_message="你是一个安全专家，专注于发现安全漏洞",
    llm_config={"model": "gpt-4"}
)

test_engineer = ConversableAgent(
    name="Test_Engineer",
    system_message="你是一个测试工程师，专注于测试覆盖率和边界情况",
    llm_config={"model": "gpt-4"}
)

# 创建群聊
group_chat = GroupChat(
    agents=[code_reviewer, security_expert, test_enginee[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]],
    messages=[[Self-Healing-Loop]],
    max_round=10
)

manager = GroupChatManager(groupchat=group_chat)

# 发起代码审查
code_reviewer.initiate_chat(
    manager,
    message="审查以下代码：\n```python\ndef unsafe_eval(expr):\n    return eval(expr)\n```"
)
```

### 示例 2: 研究助手团队

```python
# 研究助手团队
research_lead = ConversableAgent(
    name="Research_Lead",
    system_message="你是一个研究负责人，负责分解任务和协调团队",
    llm_config={"model": "gpt-4"}
)

data_collector = ConversableAgent(
    name="Data_Collector",
    system_message="你负责收集和整理数据",
    llm_config={"model": "gpt-4"}
)

analyst = ConversableAgent(
    name="Analyst",
    system_message="你负责分析数据并生成洞察",
    llm_config={"model": "gpt-4"}
)

writer = ConversableAgent(
    name="Writer",
    system_message="你负责将分析结果写成报告",
    llm_config={"model": "gpt-4"}
)

# 层级协作
task = "分析 AI Agent 的发展趋势"

# 研究负责人分解任务
subtasks = research_lead.decompose(task)

# 并行执行子任务
data = data_collector.initiate_chat(research_lead, subtasks[0])
insights = analyst.initiate_chat(research_lead, subtasks[1])

# 汇总写作
report = writer.initiate_chat(research_lead, f"{data}\n{insights}")
```

## 最佳实践

### 1. 角色定义清晰

```python
# 好：清晰的任务描述
assistant = ConversableAgent(
    name="Data_Analyst",
    system_message="""你是一个专业的数据分析师。
    职责：
    - 清洗和预处理数据
    - 进行统计分析
    - 生成可视化图表
    - 解释分析结果

    风格：
    - 严谨、准确
    - 提供数据支撑的结论
    """
)

# 不好：模糊的描述
assistant = ConversableAgent(
    name="Helper",
    system_message="你是一个助手"
)
```

### 2. 控制对话终止

```python
# 使用 termination_signal 控制何时结束对话
def should_terminate(message):
    # 自定义终止条件
    if "任务完成" in message:
        return True
    if "错误" in message and message.count("错误") > 3:
        return True
    return False
```

### 3. 处理长对话

```python
# 上下文压缩
def compress_context(messages, max_tokens=4000):
    """压缩对话历史"""
    # 按重要性排序
    # 保留关键消息
    # 摘要填充空白
    pass
```

## Cross-refs

- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 多 Agent 系统（架构对比）
- [[agents/CrewAI.m[[knowledge/Design-Toolkit]]] — 类似框架（对比）
- [[agents/Hermes-Agent.m[[knowledge/Design-Toolkit]]] — 全栈教程（系统学习）
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent 驱动 RAG（知识增强）
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — 模型上下文协议（工具扩展）