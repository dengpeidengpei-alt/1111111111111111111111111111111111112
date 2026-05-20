---
type: entity
category: knowledge
key: Karpathy LLM Wiki
source: Karpathy pattern
date: 2026-05-14
rating: 4
---

# Karpathy LLM Wiki Pattern

## Overview

让AI通过阅读来学习的最佳实践。由Andrej Karpathy提出，核心思想是**LLM本身作为知识库和自组织系统**，通过结构化文档实现知识的维护、扩展和检索。

## Core Concept

### LLM as Knowledge Base

传统知识库依赖人工维护，而Karpathy模式让LLM**自我管理知识**：

| 维度 | 传统知识库 | Karpathy LLM Wiki |
|------|------------|-------------------|
| 知识录入 | 人工编写/导入 | AI自动生成/更新 |
| 知识更新 | 定期维护 | 实时增量 |
| 知识检索 | 关键词/向量匹配 | 自然语言理解 |
| 知识演化 | 静态 | 自组织 |

### Wiki Self-Organization Mechanism

Wiki的自我组织通过三层架构实现：

```
┌─────────────────────────────────────────────────────────┐
│                    Transcripts Layer                    │
│              (对话/演讲原文，无损记录)                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Entities Layer                       │
│           (人/项目/工具，实体描述卡片)                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Concepts Layer                       │
│              (主题/规则/过程，抽象总结)                  │
└─────────────────────────────────────────────────────────┘
```

**自组织规则：**
- **Ingest**: 新知识进入Transcripts层
- **Distill**: Transcripts压缩提炼到Entities层
- **Synthesize**: Entities进一步抽象到Concepts层
- **Cross-link**: 层间自动建立双向引用

## Implementation Principles

### How LLM Maintains and Extends Knowledge

#### 1. Incremental Ingestion (增量摄入)

```python
class WikiIngestor:
    """Wiki知识摄入器 - 将新知识增量写入Wiki"""

    def ingest(self, source: str, content: str) -> None:
        # Step 1: 识别内容类型
        entity_type = self.classify(content)

        # Step 2: 写入对应层
        if entity_type == "conversation":
            path = f"transcripts/{date_today()}_{slugify(source)}.md"
        elif entity_type == "entity":
            path = f"entities/{category}/{slugify(source)}.md"
        elif entity_type == "concept":
            path = f"concepts/{date_today()}_concept_{slugify(source)}.md"

        # Step 3: 生成标准化格式
        standardized = self.standardize(content, entity_type)

        # Step 4: 自动建立Cross-refs
        links = self.find_related_entities(standardized)
        standardized += self.generate_crossrefs(links)

        # Step 5: 写入文件
        write_file(path, standardized)

        # Step 6: 更新index.md
        self.register_in_index(source, standardized, entity_type)
```

#### 2. Self-Reflective Distillation (自反思提炼)

```python
class WikiDistiller:
    """Wiki知识提炼器 - 将Transcript层知识提炼到Entity/Concept层"""

    def distill(self, transcript_path: str) -> None:
        # 读取原文
        raw = read_file(transcript_path)

        # LLM自反思提炼
        entities = self.llm.extract(
            f"""从以下内容中提取实体和概念:

            {raw}

            输出格式:
            ## Entities
            - [entity]: [1句话描述]

            ## Concepts
            - [concep[[knowledge/Design-Toolkit]]: [核心定义]
            """
        )

        # 写入对应层
        for entity in entities:
            self.update_or_create_entity(entity)

        for concept in entities:
            self.update_or_create_concept(concept)

        # 更新使用统计
        self.record_distillation(transcript_path)
```

#### 3. Cross-Reference Maintenance (交叉引用维护)

```python
class WikiCrossRefManager:
    """Wiki交叉引用管理器 - 自动维护条目间链接"""

    def maintain_links(self, new_content: str) -> None:
        # 提取所有可能的链接候选
        candidates = self.find_link_candidates(new_content)

        for candidate in candidates:
            # 检查目标文件是否存在
            if self.entity_exists(candidate):
                # 在新内容中添加
                self.add_wiki_link(new_content, candidate)

                # 同步在目标文件中添加反向链接
                self.add_backlink(candidate, new_content)

        # 定期运行死链检测
        self.check_broken_links()
```

## Three Layers

| Layer | Path | Content | Example |
|-------|------|---------|---------|
| Concepts | `concepts/` | 概念定义（每篇一个核心概念） | `2026-05-14_concept_agent-architecture.md` |
| Entities | `entities/` | 实体记录（人/项目/工具） | `entities/ml/Transformer.md` |
| Transcripts | `transcripts/` | 对话/演讲记录 | `transcripts/2026-05-20_session.md` |

## Key Files

| File | Purpose |
|------|---------|
| `index.md` | 导航索引，全局入口 |
| `schema.md` | schema定义 (wiki_version) |
| `log.md` | 操作日志 |
| `.usage.json` | 遥测数据(tokens消耗/评分) |

## Self-Improvement

`.usage.json` 记录每次查询的tokens消耗和评分，用于：
- 识别高频访问条目
- 检测知识缺口
- 优化存储结构

## Installation

```bash
bash install.sh  # kozaksv/claude-wiki-skill
```

## Wiki Location

| Path | Description |
|------|-------------|
| Canonical | `docs/wiki/` 或 `~/.claude/skills/wiki` |
| Cross-agent exports | `~/.agents/skills/wiki`, `~/.gemini/skills/wiki` |

## Comparison with Traditional Knowledge Bases

| Feature | Traditional KB | Karpathy LLM Wiki |
|---------|---------------|------------------|
| **Knowledge Entry** | Manual import/export | AI auto-generation |
| **Update Frequency** | Periodic maintenance | Real-time incremental |
| **Retrieval** | Keyword/vector matching | Natural language understanding |
| **Organization** | Hierarchical taxonomy | Emergent self-organization |
| **Context Preservation** | Fragmented | Full conversation context |
| **Maintenance Cost** | High (human curators) | Low (AI self-maintained) |
| **Evolution** | Static snapshots | Living, growing |

## Application Scenarios

### Long-term Memory (长期记忆)

Wiki作为Agent的外部记忆：
- 跨会话持久化用户偏好
- 积累项目上下文
- 存储学习成果

```python
# Mem0对比: Mem0使用ADD-only策略
# Karpathy Wiki: 支持完整CRUD和版本历史
class AgentMemory:
    def __init__(self, wiki_path: str):
        self.wiki = WikiIngestor(wiki_path)

    def remember(self, session_content: str):
        """将对话写入Wiki作为长期记忆"""
        self.wiki.ingest("session", session_content)

    def recall(self, query: str) -> str:
        """通过自然语言检索记忆"""
        return self.wiki.search(query)
```

### Project Context (项目上下文)

在软件开发中维护项目知识：
- 代码决策记录
- 架构演进历史
- API设计 rationale

### Research Knowledge Management (研究知识管理)

- 论文阅读笔记
- 实验结果记录
- 想法迭代追踪

## Cross-refs

| Entity | Relationship |
|--------|--------------|
| [[memory/Mem0.m[[knowledge/Design-Toolkit]]] | AI记忆层，ADD-only策略 vs Wiki的CRUD |
| [[memory/Intent-Log.m[[knowledge/Design-Toolkit]]] | 意图日志，记录触发模式 |
| [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] | 25节点44边8层次结构，可与Wiki交叉引用 |
| [[ml/RAG.m[[knowledge/Design-Toolkit]]] | 检索增强生成，Wiki作为知识源 |
| [[concepts/2026-05-14_concept_memory-architecture.m[[knowledge/Design-Toolkit]]] | 记忆架构，Wiki是实现之一 |
| [[knowledge/Wiki-Evolution-Plan.m[[knowledge/Design-Toolkit]]] | Wiki自我进化方案 |
| [[research/Knowledge-Classification.m[[knowledge/Design-Toolkit]]] | 52,513 topics分类系统 |
| [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] | 模型上下文协议，工具调用机制 |

## Classic Articles

| Article | Source | Key Insight |
|---------|--------|-------------|
| A Recipe for Training Self-Playing Agents | Karpathy Blog | LLM作为知识库的原始形式 |
| Let ChatGPT Read the Internet | Karpathy Twitter | 让LLM通过阅读学习的理念 |
| State of GPT | Karpathy Talk | 训练流程与知识组织 |

## Usage Analytics

```json
{
  "wiki_version": "5.1",
  "auto_registration": true,
  "reflection_threshold": 15,
  "layers": {
    "concepts": "synthesis and rules",
    "entities": "specific things",
    "transcripts": "full binary context"
  }
}
```