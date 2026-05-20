---
type: entity
category: ml
key: DSPy
source: GitHub Stanford NLP
date: 2026-05-16
layer: 4.0
stars: 5
---

# DSPy - Declarative Self-improving Language Programs

## Overview
- **Team**: 斯坦福NLP团队
- **Type**: 声明式LLM编程框架
- **核心理念**: 代码即提示，训练即优化
- **GitHub**: stanfordnlp/dspy
- **ICLR 2026 Oral**

## 核心突破

### 传统方式的问题
```
提示工程 = 手工打磨
问题：不可复现、依赖经验、难以迁移
```

### DSPy方式
```
代码即提示
训练 = 优化
问题：自动搜索最优提示组合
```

## Core Modules

| 模块 | 作用 | 示例 |
|------|------|------|
| `dspy.Retrieve` | 检索模块 | `dspy.Retrieve("query")` |
| `dspy.Generate` | 生成模块 | 自定义生成逻辑 |
| `dspy.Predict` | 预测模块 | `dspy.Predict("question -> answer")` |
| `dspy.ChainOfThought` | 思维链 | 带推理的预测 |
| `dspy.Module` | 自定义程序基类 | 组合多个模块 |

## Optimizers (Teleprompters)

| Optimizer | 策略 | 适用场景 |
|-----------|------|----------|
| `BootstrapFewShot` | 3个示例 bootstrapping | 快速原型 |
| `MIPRO` | 多任务贝叶斯优化 | 大规模搜索 |
| `COPRO` | 贪婪坐标优化 | 资源受限 |
| `GridFreeRandomSearch` | 无网格随机搜索 | 超参数探索 |

## Bootstrap优化流程

### Compiler工作原理

DSPy Compiler是核心组件，负责将声明式程序转换为优化后的可执行程序：

```
输入: Module + trainset + metric
         ↓
    Bootstrap阶段
         ↓
    生成候选 demonstrations
         ↓
    评估与选择
         ↓
    输出: 优化后的 Module
```

**三个阶段**:
1. **Bootstrap**: 使用种子示例生成训练信号
2. **Search**: 在提示空间搜索最优组合
3. **Evaluate**: 用metric评估并选择最佳配置

### Metrics定义

Metric是评估程序质量的核心函数：

```python
# 简单匹配
def exact_match(example, pred, trace=None):
    return example.answer == pred.answer

# 带推理的评估
def chain_of_thought_metric(example, pred, trace=None):
    return pred.rationale.endswith(example.answer)

# 多维度评估
def hybrid_metric(example, pred, trace=None):
    exact = example.answer == pred.answer
    length_penalty = len(pred.answer) < 200
    return 0.7 * exact + 0.3 * length_penalty
```

### Teleprompter选择指南

| 场景 | 推荐Teleprompter | 原因 |
|------|------------------|------|
| 快速原型 | `BootstrapFewShot` | 仅需3个示例 |
| 大规模搜索 | `MIPRO` | 贝叶斯优化高效 |
| 资源受限 | `COPRO` | 贪婪策略省资源 |
| 探索性 | `GridFreeRandomSearch` | 随机搜索多样性 |

## 工作流程

```python
import dspy

# 1. 定义程序
class RAG(dspy.Module):
    def __init__(self):
        self.retrieve = dspy.Retrieve("context")
        self.generate = dspy.ChainOfThought("context, question -> answer")

    def forward(self, question):
        context = self.retrieve(question)
        return self.generate(context=context, question=question)

# 2. 编译优化
teleprompter = dspy.BootstrapFewShot(metric=your_metric)
compiled_rag = teleprompter.compile(RAG(), trainset=trainset)

# 3. 使用
result = compiled_rag(question="...")
```

## 高级用法

### 完整Compiler示例

```python
from dspy import ChainOfThought, Module

class RAG(dspy.Module):
    def __init__(self):
        self.retrieve = dspy.Retrieve(k=3)
        self.answer = ChainOfThought(QuestionAnswer)

    def forward(self, query):
        context = self.retrieve(query)
        return self.answer(context=context, question=query)

# 使用 Compiler
compiler = dspy.Compiler(RAG, trainset=train_data)
compiled_rag = compiler.compile()

# 验证
test_result = compiled_rag(query="什么是DSPy?")
```

### 自定义Metric与Early Stopping

```python
from dspy import evaluate

# 带验证的评估
def balanced_metric(example, pred, trace=None):
    exact = example.answer == pred.answer
    relevance = pred.answer != ""  # 防止空输出
    return exact and relevance

# Early stopping配置
teleprompter = dspy.BootstrapFewShot(
    metric=balanced_metric,
    max_bootstrapped_demos=4,
    max_rounds=3,
    early_stopping_rounds=2
)
```

## 与其他框架对比

| 维度 | DSPy | LangChain | AutoGen |
|------|------|-----------|---------|
| 重点 | 编译优化 | Chains | 多Agent |
| 灵活性 | 中 | 高 | 高 |
| 门槛 | 高 | 低 | 中 |
| 优化方式 | 内置Compiler | 外部/手工 | 手工 |
| 学习方式 | 自动metric驱动 | 手工调试 | 手工 |
| 提示管理 | 程序化 | 模板化 | 分散 |

**选择建议**:
- **DSPy**: 需要自动优化提示、追求最佳性能
- **LangChain**: 快速构建、灵活组合现有组件
- **AutoGen**: 多Agent协作、需要人机交互

## 典型应用场景

### 1. RAG优化
```
问题: RAG系统中检索和生成配合不佳
解决: DSPy编译优化检索+生成组合
效果: 自动发现最优prompt配置
```

### 2. Agent工作流
```python
class Agent(dspy.Module):
    def __init__(self):
        self.reason = dspy.ChainOfThought(Reason)
        self.act = dspy.Predict("state -> action")

    def forward(self, state):
        rationale = self.reason(state=state)
        action = self.act(state=state, rationale=rationale)
        return action
```

### 3. Prompt自动优化
- 自动生成示例（Bootstrap）
- 搜索最优指令措辞
- 协调多模块提示

## 关键洞察

1. **3个示例 > 0个示例**
   - BootstrapFewShot 仅需3个种子示例
   - 自动生成更多训练信号

2. **指标驱动优化**
   - 定义 `metric = exact_match`
   - 自动搜索最优模块组合

3. **超越RL**
   - 传统RL需要大量标注
   - DSPy 仅需少量示例

4. **编译优于手工**
   - Compiler自动探索提示空间
   - 超越人类手工调优

5. **模块化设计**
   - 自由组合Retrieve、Predict、ChainOfThought
   - 支持自定义模块

## Cross-refs

- [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] — 自进化方法论对比
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 推理+行动，DSPy可集成
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — RAG场景是DSPy典型用例
- [[agents/Hermes-Agent.m[[knowledge/Design-Toolkit]]] — 使用DSPy优化的Agent
- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — Teleprompter基础，BootstrapFewShot核心依赖
- [[PromptEngineerin[[Self-Healing-Loop]]] — 提示工程基础
- [[LLM-Optimizatio[[Self-Healing-Loop]]] — LLM优化方法论