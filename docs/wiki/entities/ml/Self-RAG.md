---
type: entity
category: ml
key: Self-RAG (Self-Reflective RAG)
source: Claude-Evo research
date: 2026-05-20
layer: 4.0
---

# Self-RAG - 自我反思检索增强生成

## Overview

| 维度 | 说明 |
|------|------|
| 全称 | Self-Reflective Retrieval-Augmented Generation |
| 本质 | 让LLM自主判断是否需要检索的RAG变体 |
| 核心价值 | 减少不必要的检索，降低幻觉 |
| 论文 | [Self-RAG (ICLR 2024)](https://arxiv.org/abs/2310.11511) |

## 核心机制

### 1. 判断token生成

Self-RAG在生成过程中，会为每个token预测一个特殊标签，指示该token是否需要检索：

| 标签 | 含义 | 行为 |
|------|------|------|
| `[检索]` | 需要外部知识 | 执行检索 |
| `[不检索]` | 已有足够上下文 | 直接生成 |
| `[相关]` | 检索结果相关 | 整合后生成 |
| `[不相关]` | 检索结果不相关 | 直接生成 |

### 2. 检索触发

```python
# Self-RAG 检索判断伪代码
def should_retrieve(context, query):
    # 1. 计算当前上下文与查询的关联度
    relevance = compute_relevance(context, query)

    # 2. 关联度低于阈值时触发检索
    if relevance < THRESHOLD:
        return True

    # 3. 遇到知识边界token时触发检索
    if is_knowledge_boundary(context):
        return True

    return False
```

### 3. 相关性评估

检索后，模型会评估检索结果的相关性：

```python
def evaluate_relevance(retrieved_docs, query):
    # 使用is-relevant token评估每个文档
    for doc in retrieved_docs:
        judgment = llm.judge(f"Does this doc answer: {query}?", doc)

        if judgment.is_relevant:
            # 整合相关文档到上下文
            context = combine(context, doc)
        else:
            # 跳过不相关文档，依赖自身知识
            pass

    return context
```

## 流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     Self-RAG 流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Query → [是否检索?] → 否 → 生成                           │
│                   ↓是                                       │
│              检索 → [相关?] → 否 → 生成（依赖自身知识）      │
│                         ↓是                                 │
│                    整合 → 生成                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

详细流程：

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   输入Query  │────▶│  判断模块    │────▶│  决策标签    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
            ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
            │ [检索]触发   │           │ [不检索]    │           │ [无需检索]   │
            │ 检索模块    │           │ 直接生成    │           │ 直接生成    │
            └──────────────┘           └──────────────┘           └──────────────┘
                    │                                                   │
                    ▼                                                   │
            ┌──────────────┐                                           │
            │  评估相关性  │                                           │
            └──────────────┘                                           │
                    │                                                   │
        ┌───────────┴───────────┐                                       │
        ▼                       ▼                                       │
┌──────────────┐         ┌──────────────┐                               │
│ [相关]整合  │         │ [不相关]    │                               │
│ 整合检索结果│         │ 丢弃检索    │                               │
└──────────────┘         └──────────────┘                               │
        │                       │                                       │
        ▼                       ▼                                       │
┌──────────────┐         ┌──────────────┐                               │
│  最终生成    │         │  最终生成    │                               │
└──────────────┘         └──────────────┘                               │
```

## 与RAG对比

| 维度 | Self-RAG | 标准RAG |
|------|----------|--------|
| 检索触发 | 动态判断（按需） | 总是检索 |
| 幻觉程度 | 减少（自我反思） | 可能增加（无关检索） |
| 计算效率 | 高（避免不必要检索） | 中（固定检索开销） |
| 生成质量 | 更高（过滤低质量检索） | 中 |
| 训练复杂度 | 高（需要特殊训练） | 低（无需额外训练） |
| 适用场景 | 知识密集型问答 | 通用检索增强 |

## 代码示例

### 基础Self-RAG实现

```python
import torch
from torch import nn

class SelfRAG(nn.Module):
    def __init__(self, llm, retriever, threshold=0.5):
        self.llm = llm
        self.retriever = retriever
        self.threshold = threshold

    def generate(self, query, context=None):
        """Self-RAG 生成流程"""
        output = [[Self-Healing-Loop]]
        done = False

        while not done:
            # 1. 判断是否需要检索
            needs_retrieval = self.should_retrieve(query, output)

            if needs_retrieval:
                # 2. 执行检索
                docs = self.retriever.search(query, k=5)

                # 3. 评估检索结果相关性
                relevant_docs = [[Self-Healing-Loop]]
                for doc in docs:
                    if self.is_relevant(doc, query):
                        relevant_docs.append(doc)

                # 4. 整合相关文档
                if relevant_docs:
                    context = self.combine_context(output, relevant_docs)
                else:
                    # 丢弃不相关文档，依赖自身知识
                    pass

            # 5. 生成下一个token
            token = self.llm.generate_token(query, context, output)
            output.append(token)

            if token == "<eos>":
                done = True

        return output

    def should_retrieve(self, query, output):
        """判断是否需要检索"""
        # 检查上下文是否足够回答查询
        context_str = " ".join(str(t) for t in output)
        relevance = self.compute_relevance(context_str, query)

        return relevance < self.threshold

    def is_relevant(self, doc, query):
        """评估检索结果是否相关"""
        prompt = f"Query: {query}\nDoc: {doc}\nIs the doc relevant?"
        response = self.llm.generate(prompt)
        return "yes" in response.lower()
```

### 与DSPy结合

```python
import dspy

class SelfRAGModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.TypedPredictor(
            signature=(str, str) -> str,
            instructions="生成回答，使用[检索]标记何时需要检索"
        )

    def forward(self, query):
        # Step 1: 尝试直接生成
        response = self.generate(query)

        # Step 2: 检查是否需要检索
        if "[检索]" in response:
            # 执行检索
            docs = retrieve(query)
            # 评估相关性
            relevant = [d for d in docs if is_relevant(d, query)]
            if relevant:
                response = self.generate(query, context=relevant)

        return response
```

## 关键Paper

| Paper | 年份 | 贡献 |
|-------|------|------|
| Self-RAG | 2024 | 自我反思RAG框架 |
| PRCA | 2024 | 检索后压缩增强 |
| RECOMP | 2024 | 检索压缩器对比 |
| Corrective-RAG | 2024 | 检索结果自我修正 |

## 变体

| 变体 | 特点 | 适用场景 |
|------|------|----------|
| Self-RAG (Original) | 端到端训练 | 通用QA |
| Corrective-RAG | 检索结果验证 | 高精度场景 |
| PRCA | 检索压缩 | 长文档处理 |
| RECOMP | 选择性压缩 | 资源受限场景 |

## Cross-refs

- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 基础RAG，Self-RAG的基线
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent驱动RAG，与Self-RAG互补
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 推理+检索，与Self-RAG有相似判断机制
- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — 推理链提示，增强判断能力
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 底层架构
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 对比学习用于训练判断模块
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 可用DSPy编译优化Self-RAG