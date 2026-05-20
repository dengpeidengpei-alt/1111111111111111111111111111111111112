---
type: entity
category: ai
key: Agentic RAG
source: Claude-Evo AI research
date: 2026-05-14
layer: 4.0
stars: 4
---

# Agentic RAG

## Overview
- **本质**: LLM作为Agent驱动RAG检索决策
- **突破**: 从被动检索 → 主动决策检索
- **趋势**: 2024-2026年主流研究方向

## 发展历程

| 时代 | 特点 | 局限 |
|------|------|------|
| Naive RAG | 一次检索 | 盲目、不精准 |
| Advanced RAG | 预处理优化 | 仍然被动 |
| Agentic RAG | LLM决策检索 | 复杂度增加 |

## 核心架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Agentic RAG 流程                                  │
└─────────────────────────────────────────────────────────────────────────┘

    用户Query
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      LLM Agent (决策大脑)                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  1. 判断是否需要检索                                               │  │
│  │  2. 选择检索策略（关键词/向量/混合）                              │  │
│  │  3. 决定检索多少次                                                 │  │
│  │  4. 判断检索结果是否足够                                            │  │
│  │  5. 决定是否需要重检索                                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         检索器 (Retriever)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │  Keyword   │  │   Vector    │  │   Graph     │                    │
│  │  BM25      │  │  Embedding  │  │  Knowledge  │                    │
│  └─────────────┘  └─────────────┘  └─────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         知识库 (Knowledge Base)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │ Vector  │  │   SQL   │  │   KG    │  │   PDF   │                   │
│  │   DB    │  │ Database│  │  Graph  │  │  Docs   │                   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Agent决策类型

### 1. 检索判断
```python
decision = agent.decide_retrieval(query)
# "这个问题需要最新信息吗？" → Yes/No
```

### 2. 策略选择
```python
strategy = agent.choose_strategy(query)
# - naive_retrieval: 简单向量搜索
# - hybrid_retrieval: BM25 + vector
# - knowledge_graph: 实体关系检索
# - multi-hop: 多跳推理
```

### 3. 重检索判断
```python
sufficient = agent.assess_sufficiency(context, query)
# "当前上下文足够回答问题吗？" → Yes/No
```

## Agent能力矩阵

| 能力 | 描述 | 实现难度 |
|------|------|----------|
| 判断检索时机 | 决定何时检索 | ★★☆ |
| 选择检索源 | 决定从哪检索 | ★★★ |
| 迭代检索 | 多轮检索优化 | ★★★ |
| 自我修正 | 检索结果不好时调整 | ★★★ |
| 生成回答 | 综合检索结果回答 | ★☆☆ |

## 关键技术

### 1. ReAct集成
```python
class AgenticRAG:
    def __init__(self):
        self.agent = ReActAgent()

    def retrieve(self, query):
        thought = self.agent.think(query)
        if "检索" in thought:
            return self.vector_db.search(query)
        return None
```

### 2. 思维链推理
```
问题：我应该买特斯拉股票吗？
思考：1. 需要了解特斯拉最新财务状况
思考：2. 需要了解电动汽车行业趋势
思考：3. 需要了解竞争对手情况
行动：检索[特斯拉2024财报]
```

### 3. 多向量数据库路由
```python
class Router:
    def route(self, query):
        if "数值" in query:
            return sql_db
        if "关系" in query:
            return kg_db
        return vector_db
```

## 与传统RAG对比

| 维度 | Naive RAG | Agentic RAG |
|------|-----------|-------------|
| 检索次数 | 1次 | 多次/迭代 |
| 检索策略 | 固定 | 动态选择 |
| 结果评估 | 无 | LLM自评 |
| 自我修正 | 无 | 有 |
| 适用场景 | 简单问答 | 复杂推理 |

## 实际案例

### 案例1：多跳问答
```
问题：特斯拉CEO马斯克的净资产是多少？

Agent思考：
1. 马斯克是谁 → 特斯拉CEO
2. 需要检索 → 特斯拉股价+持股数
3. 股价检索 → $X
4. 持股数检索 → Y%
5. 计算 → X * Y = 净资产

这需要多次检索，Naive RAG无法完成
```

### 案例2：对比分析
```
问题：比较苹果和微软的云业务增长

Agent判断：
1. 需要分别检索两家公司云业务数据
2. 需要检索时间段一致
3. 需要计算增长率
4. 综合对比回答
```

## 工具调用

```python
# Agent可调用的工具
tools = [
    "vector_search",      # 向量检索
    "bm25_search",        # 关键词检索
    "kg_query",           # 知识图谱查询
    "sql_query",          # 数据库查询
    "web_search",        # 网络搜索
    "calculate",         # 计算
    "compare"            # 对比分析
]

# Agent决定调用哪些
agent.plan(query) → [tool1, tool2, ...]
```

## 实现框架

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| LangChain Agent | 多种Agent类型 | 快速原型 |
| LlamaIndex | 专门针对RAG | RAG优化 |
| DSPy | 声明式优化 | 自动化调优 |
| 自定义 | 完全可控 | 生产环境 |

## 决策流程详解

### 单轮检索决策

```
用户Query: "特斯拉2024年Q3营收同比增长多少？"

┌─────────────────────────────────────────────────────────────┐
│ Step 1: 查询分析                                             │
├─────────────────────────────────────────────────────────────┤
│ 判断：需要检索外部知识（财务数据）                           │
│ 置信度：高                                                  │
│ 时间敏感性：高（需要最新财报）                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: 检索执行                                             │
├─────────────────────────────────────────────────────────────┤
│ 工具选择：web_search + sql_query                            │
│ 关键词：Tesla 2024 Q3 earnings revenue YoY                  │
│ 向量查询："特斯拉 财报 营收 增长"                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 结果评估                                             │
├─────────────────────────────────────────────────────────────┤
│ 收集到：Q3营收$25.2B，去年同期$23.1B                       │
│ 计算：(25.2-23.1)/23.1 = 9.1%                              │
│ 置信度：中高（多个来源确认）                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: 回答生成                                             │
├─────────────────────────────────────────────────────────────┤
│ "特斯拉2024年Q3营收为$25.2B，同比增长9.1%"                 │
│ 补充：绝对增长额$2.1B                                       │
└─────────────────────────────────────────────────────────────┘
```

### 多轮迭代检索

```python
def multi_hop_retrieval(agent, query, max_iter=3):
    """多跳检索示例：需要多轮推理的复杂问题"""
    context = [[Self-Healing-Loop]]
    for i in range(max_iter):
        # Agent决定下一步行动
        decision = agent.decide_next_action(query, context)

        if decision.action == "retrieve":
            results = agent.execute_retrieval(decision.tool, decision.query)
            context.append({"type": "retrieval", "data": results})

        elif decision.action == "calculate":
            result = agent.execute_calculation(decision.expression)
            context.append({"type": "calculation", "data": result})

        elif decision.action == "answer":
            # 置信度足够，生成最终答案
            return agent.generate_answer(query, context)

        else:
            # 无法继续
            break

    # 尝试综合已有信息生成答案
    return agent.generate_answer(query, context)
```

### 自我修正机制

```python
class SelfCorrectionAgent:
    def assess_quality(self, response, context, query):
        """评估回答质量，决定是否需要修正"""
        issues = [[Self-Healing-Loop]]

        # 检查事实性
        if not self.fact_check(response, context):
            issues.append("factual_error")

        # 检查完整性
        if self.is_incomplete(response, query):
            issues.append("incomplete")

        # 检查相关性
        if not self.is_relevant(response, query):
            issues.append("irrelevant")

        return issues

    def refine(self, query, context, issues):
        """根据问题类型进行修正"""
        if "factual_error" in issues:
            # 重新检索核实事实
            new_retrieval = self.correct_facts(query, context)
            context = self.replace_facts(context, new_retrieval)

        if "incomplete" in issues:
            # 补充缺失信息
            missing_info = self.identify_missing(query, context)
            for info in missing_info:
                retrieval = self.retrieve(info)
                context.append(retrieval)

        return context
```

## 高级检索策略

### 混合检索路由

```python
class HybridRouter:
    """智能路由到最适合的检索器组合"""

    def route(self, query):
        """
        根据查询特征选择检索策略
        """
        features = self.extract_features(query)

        strategies = [[Self-Healing-Loop]]

        # 关键词主导：使用BM25
        if features["keyword_density"] > 0.5:
            strategies.append(("bm25", 0.8))

        # 语义模糊：使用向量检索
        if features["semantic_complexity"] > 0.5:
            strategies.append(("vector", 0.9))

        # 关系型查询：使用知识图谱
        if features["entity_count"] > 2:
            strategies.append(("knowledge_graph", 0.7))

        # 多跳需求：使用图检索
        if features["requires_reasoning"]:
            strategies.append(("multi_hop", 0.8))

        # 加权合并
        return self.weighted_merge(strategies)
```

### 上下文压缩

```python
class ContextCompressor:
    """压缩冗余上下文，保留关键信息"""

    def compress(self, retrieved_docs, query, max_length=4000):
        """
        压缩策略：
        1. 相似度排序
        2. 去除冗余
        3. 关键信息优先
        """
        # 按与query的相关性排序
        scored = self.score_documents(retrieved_docs, query)

        compressed = [[Self-Healing-Loop]]
        current_length = 0

        for doc, score in scored:
            doc_length = len(doc.content)

            if current_length + doc_length > max_length:
                # 截断而非丢弃
                remaining = max_length - current_length
                compressed.append(doc.truncate(remaining))
                break

            compressed.append(doc)
            current_length += doc_length

        return compressed

    def score_documents(self, docs, query):
        """多维度评分"""
        scores = [[Self-Healing-Loop]]
        for doc in docs:
            relevance = self.embedding_similarity(doc, query)
            novelty = self.novelty_score(doc, scores)
            quality = doc.quality_score

            # 加权得分
            total = 0.4 * relevance + 0.3 * novelty + 0.3 * quality
            scores.append((doc, total))

        return sorted(scores, key=lambda x: x[1], reverse=True)
```

## 生产级实现架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Agentic RAG 生产架构                                │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │   API Gateway   │
                        │   (负载均衡)    │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────┴─────┐           ┌──────┴──────┐
              │  Agent 1  │           │  Agent N    │
              │ (独立实例) │           │ (独立实例)  │
              └─────┬─────┘           └──────┬──────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │  检索编排层    │ │  缓存层        │ │  监控日志层   │
      │  (Orchestra)  │ │  (Redis)      │ │  (Prometheus)│
      └───────────────┘ └───────────────┘ └───────────────┘
              │                 │                 │
              └────────────┬────┴────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌───────────────┐         ┌───────────────┐
      │  Vector DB    │         │  KG/Graph DB  │
      │  (Milvus等)   │         │  (Neo4j等)    │
      └───────────────┘         └───────────────┘
```

### 高可用配置

```yaml
# agentic_rag_config.yaml
agentic_rag:
  # Agent配置
  agent:
    model: "gpt-4-turbo"
    temperature: 0.0
    max_tokens: 2048

  # 检索配置
  retrieval:
    top_k: 10
    rerank: true
    hybrid_weight: 0.5  # BM25 + vector权重

  # 多跳配置
  multi_hop:
    max_iterations: 5
    confidence_threshold: 0.8
    self_correction: true

  # 缓存配置
  cache:
    enabled: true
    ttl: 3600  # 1小时
    embedding_cache: true

  # 限流配置
  rate_limit:
    requests_per_minute: 100
    concurrent_agents: 10
```

## Cross-refs
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 基础RAG知识
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 记忆增强RAG
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 知识图谱检索
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — Agent推理框架
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 可用DSPy优化

## Overview
- **本质**: LLM作为Agent驱动RAG检索决策
- **突破**: 从被动检索 → 主动决策检索
- **趋势**: 2024-2026年主流研究方向

## 发展历程

| 时代 | 特点 | 局限 |
|------|------|------|
| Naive RAG | 一次检索 | 盲目、不精准 |
| Advanced RAG | 预处理优化 | 仍然被动 |
| Agentic RAG | LLM决策检索 | 复杂度增加 |

## 核心架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Agentic RAG 流程                                  │
└─────────────────────────────────────────────────────────────────────────┘

    用户Query
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      LLM Agent (决策大脑)                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  1. 判断是否需要检索                                               │  │
│  │  2. 选择检索策略（关键词/向量/混合）                              │  │
│  │  3. 决定检索多少次                                                 │  │
│  │  4. 判断检索结果是否足够                                            │  │
│  │  5. 决定是否需要重检索                                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         检索器 (Retriever)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │  Keyword   │  │   Vector    │  │   Graph     │                    │
│  │  BM25      │  │  Embedding  │  │  Knowledge  │                    │
│  └─────────────┘  └─────────────┘  └─────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         知识库 (Knowledge Base)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │ Vector  │  │   SQL   │  │   KG    │  │   PDF   │                   │
│  │   DB    │  │ Database│  │  Graph  │  │  Docs   │                   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Agent决策类型

### 1. 检索判断
```python
decision = agent.decide_retrieval(query)
# "这个问题需要最新信息吗？" → Yes/No
```

### 2. 策略选择
```python
strategy = agent.choose_strategy(query)
# - naive_retrieval: 简单向量搜索
# - hybrid_retrieval: BM25 + vector
# - knowledge_graph: 实体关系检索
# - multi-hop: 多跳推理
```

### 3. 重检索判断
```python
sufficient = agent.assess_sufficiency(context, query)
# "当前上下文足够回答问题吗？" → Yes/No
```

## Agent能力矩阵

| 能力 | 描述 | 实现难度 |
|------|------|----------|
| 判断检索时机 | 决定何时检索 | ★★☆ |
| 选择检索源 | 决定从哪检索 | ★★★ |
| 迭代检索 | 多轮检索优化 | ★★★ |
| 自我修正 | 检索结果不好时调整 | ★★★ |
| 生成回答 | 综合检索结果回答 | ★☆☆ |

## 关键技术

### 1. ReAct集成
```python
class AgenticRAG:
    def __init__(self):
        self.agent = ReActAgent()

    def retrieve(self, query):
        thought = self.agent.think(query)
        if "检索" in thought:
            return self.vector_db.search(query)
        return None
```

### 2. 思维链推理
```
问题：我应该买特斯拉股票吗？
思考：1. 需要了解特斯拉最新财务状况
思考：2. 需要了解电动汽车行业趋势
思考：3. 需要了解竞争对手情况
行动：检索[特斯拉2024财报]
```

### 3. 多向量数据库路由
```python
class Router:
    def route(self, query):
        if "数值" in query:
            return sql_db
        if "关系" in query:
            return kg_db
        return vector_db
```

## 与传统RAG对比

| 维度 | Naive RAG | Agentic RAG |
|------|-----------|-------------|
| 检索次数 | 1次 | 多次/迭代 |
| 检索策略 | 固定 | 动态选择 |
| 结果评估 | 无 | LLM自评 |
| 自我修正 | 无 | 有 |
| 适用场景 | 简单问答 | 复杂推理 |

## 实际案例

### 案例1：多跳问答
```
问题：特斯拉CEO马斯克的净资产是多少？

Agent思考：
1. 马斯克是谁 → 特斯拉CEO
2. 需要检索 → 特斯拉股价+持股数
3. 股价检索 → $X
4. 持股数检索 → Y%
5. 计算 → X * Y = 净资产

这需要多次检索，Naive RAG无法完成
```

### 案例2：对比分析
```
问题：比较苹果和微软的云业务增长

Agent判断：
1. 需要分别检索两家公司云业务数据
2. 需要检索时间段一致
3. 需要计算增长率
4. 综合对比回答
```

## 工具调用

```python
# Agent可调用的工具
tools = [
    "vector_search",      # 向量检索
    "bm25_search",        # 关键词检索
    "kg_query",           # 知识图谱查询
    "sql_query",          # 数据库查询
    "web_search",        # 网络搜索
    "calculate",         # 计算
    "compare"            # 对比分析
]

# Agent决定调用哪些
agent.plan(query) → [tool1, tool2, ...]
```

## 实现框架

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| LangChain Agent | 多种Agent类型 | 快速原型 |
| LlamaIndex | 专门针对RAG | RAG优化 |
| DSPy | 声明式优化 | 自动化调优 |
| 自定义 | 完全可控 | 生产环境 |

## Cross-refs
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 基础RAG知识
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 记忆增强RAG
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 知识图谱检索
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — Agent推理框架
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 可用DSPy优化