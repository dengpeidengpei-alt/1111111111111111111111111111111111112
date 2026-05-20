---
type: entity
category: agents
key: CrewAI
source: Claude-Evo
date: 2026-05-20
---

# CrewAI

> AI Agent 团队编排框架，支持角色化 Agent 与任务协作。

## 概述

| 属性 | 值 |
|------|-----|
| 开发者 | CrewAI Inc. |
| 类型 | 多 Agent 团队编排框架 |
| 源码 | https://github.com/crewAI/crewAI |
| 活跃度 | 活跃维护 |
| 深度 | ★★★★☆ |

CrewAI 是一个开源的多 Agent 框架，专注于让多个 AI Agent 以团队形式协作完成任务。与单 Agent 系统不同，CrewAI 强调通过明确的角色定义、任务分配和工作流程编排来实现复杂的协作目标。

## 核心概念

### Crew（团队）

Crew 是 CrewAI 的核心抽象，代表一个 Agent 团队：
- 包含多个具有不同角色的 Agent
- 管理任务分配和执行顺序
- 支持多种工作流程模式

### Task（任务）

Task 代表团队中单个 Agent 需要完成的工作：
- 有明确的目标和预期输出
- 可以设置依赖关系（前置任务）
- 支持输出格式定义

### Process（工作流程）

Process 定义 Agent 协作的方式：
- **Sequential**：顺序执行，按任务依赖链执行
- **Parallel**：并行执行，Agent 同时处理不同任务
- **Hierarchical**：层级执行，有明确的管理 Agent

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                       CrewAI 架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Crew                                                       │
│   ├── Agent1 (Researcher) ─→ Task1                          │
│   ├── Agent2 (Writer) ─→ Task2                              │
│   └── Agent3 (Reviewer) ─→ Task3                            │
│                                                              │
│   Process: Sequential / Parallel / Hierarchical             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

- **Agent**：角色化主体，有明确的 goal、 backstory 和工具集
- **Task**：任务单元，有描述、expected_output 和依赖配置
- **Crew**：团队编排器，管理 agents 和 tasks 的关系
- **Process**：工作流程引擎，控制执行顺序和模式

## 代码示例

### 基础示例

```python
from crewai import Agent, Task, Crew

# 创建研究员 Agent
researcher = Agent(
    role="Researcher",
    goal="Research the latest AI developments",
    backstory="You are a diligent research analyst specializing in AI technology"
)

# 创建作家 Agent
writer = Agent(
    role="Writer",
    goal="Write compelling articles based on research",
    backstory="You are an experienced tech writer with a talent for clear explanations"
)

# 定义任务
research_task = Task(
    description="Research the latest developments in AI agents",
    agent=researcher
)

write_task = Task(
    description="Write a 1000-word article about AI agents",
    agent=writer
)

# 创建团队并执行
crew = Crew(
    agents=[researcher, write[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]],
    tasks=[research_task, write_task],
    process="sequential"
)

result = crew.kickoff()
```

### 并行执行示例

```python
from crewai import Agent, Task, Crew

# 创建多个并行工作的 Agent
agent1 = Agent(role="Data Collector", goal="Collect data from sources")
agent2 = Agent(role="Data Analyzer", goal="Analyze collected data")
agent3 = Agent(role="Report Writer", goal="Write final report")

# 任务定义
task1 = Task(description="Collect sales data", agent=agent1)
task2 = Task(description="Analyze data trends", agent=agent2)
task3 = Task(description="Write report", agent=agent3)

# 并行执行模式
crew = Crew(
    agents=[agent1, agent2, agent3],
    tasks=[task1, task2, task3],
    process="parallel"
)
```

## 与 AutoGen 对比

| 维度 | CrewAI | AutoGen |
|------|--------|---------|
| 角色定义 | 明确分工（role/goal/backstory） | 通用对话（system_message） |
| 工作流程 | 预设模式（Sequential/Parallel/Hierarchical） | 动态对话驱动 |
| 复杂度 | 中 | 中 |
| 适用场景 | 结构化任务协作 | 灵活对话协作 |
| 学习曲线 | 低 | 中 |
| 工具集成 | 内置工具支持 | 需手动配置 |

## 生态与扩展

- **CrewAI Platform**: 云平台，支持团队管理和监控
- **crewAI Tools**: 官方工具库（搜索、文件处理等）
- **LangChain 集成**: 可与 LangChain 生态结合使用

## Cross-refs

- [[agents/AutoGen.m[[knowledge/Design-Toolkit]]] — Microsoft 多 Agent 对话框架
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 139 Agent 系统
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent 驱动的 RAG 实现
- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — 多层记忆 Agent 系统
- [[agents/SE-Agent-Code.m[[knowledge/Design-Toolkit]]] — 代码专用 Agent