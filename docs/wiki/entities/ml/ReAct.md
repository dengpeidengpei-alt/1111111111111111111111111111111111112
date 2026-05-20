---
type: entity
category: ml
key: ReAct
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# ReAct - Reasoning + Acting

## Overview
- **全称**: Synergizing Reasoning, Acting, and Planning
- **本质**: 让LLM在推理过程中交替使用工具
- **论文**: arXiv:2210.03629 (ICLR 2023)
- **作者**: Shunyu Yao et al.

## 核心思想

```
传统LLM：
问题 → 直接回答（可能幻觉）

ReAct：
问题 → 思考 → 行动 → 观察 → 思考 → ...
                         ↓
                    外部工具/环境
```

## 与其他方法对比

| 方法 | 特点 | 适用场景 |
|------|------|----------|
| CoT | 纯推理 | 数学、逻辑 |
| ReAct | 推理+行动 | 需要外部知识 |
| ToT | 多路径搜索 | 探索性任务 |
| Reflexion | 自我反思 | 错误纠正 |

## ReAct循环

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ReAct 循环                                      │
└─────────────────────────────────────────────────────────────────────────┘

    问题输入
        │
        ▼
┌─────────────────┐
│   Think (思考)  │ → 分析问题，决定下一步行动
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Act (行动)    │ → 调用工具/搜索/计算
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Observe (观察) │ → 获取行动结果
└────────┬────────┘
         │
         ▼
    结果足够？
    ┌────┴────┐
    │ Yes     │ No
    ↓         ↓
   回答    继续循环
```

## 实现示例

### LangChain Agent实现
```python
from langchain.agents import AgentType, initialize_agent, Tool
from langchain.llms import OpenAI

# 定义工具
tools = [
    Tool(name="Search", func=search_db, description="搜索数据库"),
    Tool(name="Calculator", func=calculate, description="执行计算"),
]

# 初始化ReAct Agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.REACT_DOCSTORE,
    verbose=True
)

# 执行
result = agent("问题是...")
```

### 伪代码实现
```python
def react_agent(question, tools):
    history = [[Self-Healing-Loop]]

    while not is_done(question):
        # 1. Think
        thought = llm.think(f"""
            Question: {question}
            History: {history}
            What should I do next?
        """)

        # 2. Act
        action = llm.select_action(f"""
            Thought: {thought}
            Available actions: {list_tools(tools)}
        """)

        # 3. Execute
        result = tools[action.nam[[Self-Healing-Loop]].execute(action.args)

        # 4. Observe
        history.append({
            "thought": thought,
            "action": action,
            "result": result
        })

    return llm.answer(question, history)
```

## 实际应用

### 1. 知识库问答
```
问题：特斯拉2024年Q3的营收是多少？

Thought：我需要搜索特斯拉最新财报数据
Action：Search["特斯拉 2024 Q3 营收"]
Observation：$25.2B
Thought：现在计算同比增长率
Action：Calculate["(25.2 - 23.1) / 23.1 * 100"]
Observation：9.1%
Answer：特斯拉2024年Q3营收$25.2B，同比增长9.1%
```

### 2. 多跳推理
```
问题：谁是特斯拉最大竞争对手？

Thought：我需要搜索电动汽车市场数据
Action：Search["电动汽车市场份额 2024"]
Observation：特斯拉17%，比亚迪15%，大众12%...
Thought：最大竞争对手应该是比亚迪
Action：Search["比亚迪 vs 特斯拉 2024"]
Observation：比亚迪在多个市场追赶特斯拉
Answer：比亚迪是特斯拉最大的竞争对手
```

### 3. 数学推理+计算
```
问题：苹果股价涨了50%，现在值多少钱？

Thought：需要知道苹果原始股价
Action：Search["苹果股价 2023"]
Observation：$150
Thought：计算150 * 1.5
Action：Calculate["150 * 1.5"]
Observation：$225
Answer：现在值$225
```

## 提示词模板

```python
react_prompt = """
你是一个能思考、行动、观察的AI助手。

可用工具：
- Search[query]: 搜索信息
- Calculate[exp[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]: 计算数学表达式
- Read[fil[[Self-Healing-Loop]]: 读取文件

循环：
1. Thought: 分析问题，决定行动
2. Action: 执行工具调用
3. Observation: 获取结果
4. 重复直到回答

开始问题：{question}

格式示例：
Thought: 我需要...
Action: Search[...]
Observation: 结果是...
...
"""
```

## 与其他框架对比

| 维度 | ReAct | CoT | ToT |
|------|-------|-----|-----|
| 工具使用 | ✅ | ❌ | ❌ |
| 多路径 | ❌ | ❌ | ✅ |
| 自我反思 | 部分 | ❌ | ❌ |
| 实现复杂度 | 中 | 低 | 高 |

## Cross-refs
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — ReAct常与RAG结合
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent驱动RAG
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 可编译优化ReAct Agent
- [[ml/World-Models.m[[knowledge/Design-Toolkit]]] — 动作执行基础