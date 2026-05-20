---
type: entity
category: knowledge
key: Agent Memory Systems
source: Claude-Evo
date: 2026-05-20
---

# Agent Memory Systems

**学习时间**: 2026-05-20 19:20
**来源**: 互联网搜索

---

## Agent Memory 核心挑战

AI Agent需要记忆，不仅仅是"存下来"，而是：
- 跨会话持久化
- 高效检索
- 长期感知能力

---

## Memory分类体系

### 按时间跨度

| 类型 | 说明 |
|------|------|
| **短期记忆** | 当前任务内的上下文 |
| **中期记忆** | 跨任务的近期信息 |
| **长期记忆** | 持久化存储的历史经验 |

### 按功能角色

| 类型 | 说明 |
|------|------|
| **Resource Memory** | 资源层 |
| **Entry Memory** | 条目层 |
| **Category Memory** | 类别层 |

---

## 五大技术路线

| 技术 | 说明 |
|------|------|
| **上下文窗口** | Context Window，简单但有限 |
| **RAG** | 检索增强生成 |
| **向量数据库** | Milvus, Pinecone, FAISS |
| **知识图谱** | 结构化关系 |
| **混合结构** | 图谱+向量混合 |

---

## 三层分级架构

```
Category Memory (类别)
    ↓
Entry Memory (条目)
    ↓
Resource Memory (资源)
```

**特点**:
- 记忆衰减机制
- 冲突解决
- 高效检索

---

## TencentDB Agent Memory (2026-05开源)

**发布**: 2026年5月14日，腾讯云正式开源

**功能**:
- 短期记忆压缩
- 长期个性化记忆

**适用场景**: Agent长任务场景

---

## Memvid - AI持久记忆方案

**特点**:
- 单文件架构
- 自动分块+向量化+索引
- MCP/SDK/API接入
- <5ms检索延迟

---

## Agent Memory vs 传统RAG

| 对比 | Agent Memory | 传统RAG |
|------|-------------|---------|
| 目标 | Agent持续学习 | 问答增强 |
| 更新 | 动态更新+衰减 | 静态检索 |
| 个性化 | 支持 | 不支持 |
| 上下文 | 长期感知 | 单次检索 |

---

## Cross-refs

- [[knowledge/Self-Improving-Agent-Patterns.m[[knowledge/Design-Toolkit]]] — 自改进Agent模式
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — Agentic工作流与RAG
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志