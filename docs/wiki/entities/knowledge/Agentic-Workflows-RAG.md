---
type: entity
category: knowledge
key: Agentic Workflows & RAG Patterns
source: Claude-Evo
date: 2026-05-20
---

# Agentic Workflows & RAG Patterns

**学习时间**: 2026-05-20 19:00
**来源**: 互联网搜索

---

## Agentic Workflow 核心概念

**定义**: 利用多个Agent协作，将复杂任务分解为可管理的子任务，并通过迭代达成目标

**对比**:
| 概念 | 说明 |
|------|------|
| LLM | 单一问答 |
| AI Agent | 规划+记忆+工具+行动协同 |
| Agentic Workflow | 多Agent协作自动化业务流程 |

---

## Andrew Ng 提出的4种AI Agent设计模式

| 模式 | 说明 |
|------|------|
| **Reflection** | Agent自我审视和修正输出 |
| **Tool Use** | LLM调用外部工具 |
| **Planning** | Agent主动规划执行步骤 |
| **Multi-Agent Collaboration** | 多Agent分工协作 |

---

## 21种Agentic AI设计模式（2025总结）

### 核心类别

1. **ReAct** - 推理+行动+观察循环
2. **Plan-and-Execute** - 计划与执行分离
3. **Self-Correction** - 自主纠错
4. **Query Decomposition** - 查询分解
5. **Memory-Augmented** - 记忆增强

### 多Agent模式

6. **Supervisor-Worker** - 监督者-工作者模式
7. **Handoff** - 交接模式
8. **Broadcast** - 广播模式
9. **Round Robin** - 循环模式
10. **Consensus** - 共识模式

---

## RAG 检索增强生成

### RAG解决的核心问题

| 问题 | RAG方案 |
|------|--------|
| 幻觉 | 检索真实数据再生成 |
| 信息滞后 | 实时检索外部知识库 |
| 专业领域知识匮乏 | 领域知识库增强 |
| 数据隐私 | 本地知识库不泄露 |

### RAG系统架构

```
文档加载 → 切分预处理 → 向量化 → 存储到向量数据库
    ↓
用户query → 向量化 → 相似度检索 → 增强Prompt → LLM生成
```

### 向量数据库对比

| 数据库 | 特点 | 适用场景 |
|--------|------|----------|
| **FAISS** | Meta开源，高效向量检索 | 大规模检索 |
| **Pinecone** | 全托管商业服务 | 云端生产环境 |
| **Milvus** | 开源分布式 | 大规模生产级 |
| **Weaviate** | 多模态语义检索 | 图像+文本 |
| **Qdrant** | Rust高性能 | 低延迟需求 |
| **Chroma** | 轻量级实验工具 | 快速原型 |

### RAG优化技术

1. **Query Expansion** - 查询扩展
2. **Hybrid Search** - 混合检索(关键词+向量)
3. **Reranking** - 结果重排
4. **Chunk Optimization** - 分块优化
5. **Metadata Filtering** - 元数据过滤

---

## Agentic RAG (2025趋势)

**定义**: 在传统RAG基础上引入Agent机制

**架构**:
```
用户query → Agent(决策) → 检索器 → Generator → Agent(校验) → 输出
```

**特点**:
- 更自主的检索决策
- 多轮决策能力
- 动态路径选择

---

## 向量检索流程

```
1. 文档切分 → 2. Embedding模型向量化 → 3. 存入向量数据库
    ↓
用户query → Embedding → 相似度计算 → Top-K检索 → 增强上下文 → 生成
```

**关键指标**:
- `k` 值选择影响召回率和精度
- `similarity_threshold` 控制相关性阈值
- `rerank` 可提升最终结果质量

---

## Cross-refs

- [[knowledge/AI-Agent-Trends-2025.m[[knowledge/Design-Toolkit]]] — AI Agent六大趋势
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — LightRAG与TCM知识库集成
- [[knowledge/Design-Toolkit.m[[knowledge/Design-Toolkit]]] — 设计工具包