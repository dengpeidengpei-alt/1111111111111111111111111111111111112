---
type: entity
category: agents
key: AutoGPT
source: GitHub 163k+ stars
date: 2026-05-20
---

# AutoGPT

> 自主执行多步骤任务的 AI Agent，先驱性开源项目

## 概述

| 属性 | 值 |
|------|-----|
| GitHub | 163k+ stars |
| 类型 | 自主式 AI Agent |
| 定位 | 多步骤任务自动化 |
| 特点 | 自我反思 + 长期记忆 + 工具使用 |
| 深度 | ★★★★☆ |

AutoGPT 是最早被广泛使用的自主式 GPT Agent 之一，核心设计理念是让 AI Agent 能够自主规划、执行和反思多步骤复杂任务，而非等待人类逐步指令。

## 核心特性

### 1. 自主规划 (Autonomous Planning)
- Agent 自动分解任务为子目标
- 根据上下文动态调整计划
- 无需人类干预每一步

### 2. 自我批评/反思 (Self-Criticism)
- 执行后进行结果评估
- 识别错误并修正
- 持续优化行为策略

### 3. 长期记忆 (Long-term Memory)
- 跨会话保持上下文
- 存储关键决策信息
- 经验积累与复用

### 4. 工具使用 (Tool Usage)
- 文件系统操作
- 网络搜索
- 代码执行
- API 调用

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        AutoGPT 架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐               │
│   │  User   │────▶│ Planning│────▶│Execution│               │
│   │ Input   │     │         │     │         │               │
│   └─────────┘     └────┬────┘     └────┬────┘               │
│                        │                │                    │
│                        ▼                ▼                    │
│                   ┌─────────┐     ┌─────────┐               │
│                   │Memory   │◀────│Reflection│              │
│                   │(长期记忆)│     │(自我批评) │               │
│                   └─────────┘     └─────────┘               │
│                        │                │                    │
│                        └───────▶────────┘                    │
│                                   │                          │
│                              Next Loop                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 核心 Loop

```python
# AutoGPT 核心 loop 伪代码
while not done:
    # 1. 规划阶段
    plan = create_plan(task, memory)
    
    # 2. 执行阶段
    result = execute(plan, tools)
    
    # 3. 反思阶段
    critique = self_criticize(result)
    
    # 4. 更新记忆
    memory.add(critique)
    
    # 5. 检查是否完成
    if is_complete(result):
        done = True
```

## 与 Phantom 对比

| 维度 | AutoGPT | Phantom |
|------|---------|---------|
| 自主性 | 高 | 高 |
| 记忆 | 长期向量存储 | 三层 (情景/语义/程序) |
| 工具 | 内置多工具 | MCP 扩展 |
| 架构 | 单 Agent 循环 | 多通道 + Bun 运行时 |
| 进化 | 自我批评 | 三层进化管道 |
| 通信 | CLI | 多通道 (Slack/TG/Email) |

## 代码示例

### 基础使用

```python
from autogen import AssistantAgent, UserProxyAgent

# 创建 Assistant Agent
assistant = AssistantAgent(
    name="assistant",
    system_message="你是一个有帮助的AI助手"
)

# 创建用户代理
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER"
)

# 启动任务
user_proxy.initiate_chat(
    assistant,
    message="帮我研究最新的AI技术趋势并整理成报告"
)
```

### 自我反思实现

```python
class SelfCritiqueAgent:
    def __init__(self):
        self.memory = MemoryStore()
    
    def execute_with_reflection(self, task):
        # 执行任务
        result = self.execute(task)
        
        # 自我批评
        critique = self.critique(result)
        
        # 学习改进
        if critique.needs_improvement:
            self.learn(critique)
            return self.execute_with_reflection(task)
        
        return result
    
    def critique(self, result):
        # 评估结果质量
        score = self.evaluate(result)
        
        if score < threshold:
            return Critique(
                needs_improvement=True,
                feedback=self.generate_feedback(result)
            )
        return Critique(needs_improvement=False)
```

## 发展历程

| 时间 | 版本 | 重要特性 |
|------|------|----------|
| 2023年初 | v0.1 | 基础自主循环 |
| 2023年 | v1.0 | 添加记忆系统 |
| 2023年 | v2.0 | 多工具支持 |
| 2024年 | v3.0+ | 性能优化 + REST API |

## 适用场景

- **自动化研究**: 自动搜集、汇总信息
- **代码开发**: 端到端开发任务
- **数据分析**: 多步骤数据处理
- **内容创作**: 长文本生成与迭代

## Cross-refs

- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — AI coworker，多通道通信
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — 自主 RAG 实现
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 多 Agent 自组织系统
- [[agents/Agency-Agents.m[[knowledge/Design-Toolkit]]] — 通用 Agent 框架
- [[agents/AutoGen.m[[knowledge/Design-Toolkit]]] — Microsoft 多 Agent 对话框架