---
type: entity
category: research
key: Mem0
source: GitHub mem0ai/mem0
date: 2026-05-14
---

# Mem0 - AI记忆层

## Overview
Mem0是面向AI应用的可扩展记忆层，通过动态提取、整合和检索机制实现跨会话个性化记忆。

## Core定位
- **Description**: AI应用的可扩展记忆层，实现个性化AI交互
- **Problem**: AI助手缺乏持久化上下文和用户偏好记忆能力
- **Use Cases**: AI助手对话、客户支持、医疗健康、生产力工具/游戏

## Architecture

### Deployment Modes
| Mode | Description | Storage |
|------|-------------|---------|
| Library | Python/Node.js嵌入式，轻量级本地运行 | SQLite + Qdrant |
| SelfHosted | Docker部署，自托管完整堆栈 | Postgres + pgvector |
| Cloud | 全托管服务，零运维 | Managed |

### Core Components
- **LLM**: 可配置，默认 OpenAI gpt-5-mini
- **Embeddings**: OpenAI text-embedding-3-small

## Key Difference from RAG
- **RAG**: 静态检索
- **Mem0**: ADD-only策略累积记忆，支持多信号检索（语义+BM25+实体匹配）和时序推理

## Cross-refs
- [[concepts/2026-05-14_concept_memory-architecture.m[[knowledge/Design-Toolkit]]] — 记忆架构
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 检索增强
- Claude-Work/mem0_analysis.json