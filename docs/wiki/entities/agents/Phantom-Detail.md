---
type: entity
category: agents
key: Phantom Detail
source: GitHub ghostwright/phantom
date: 2026-05-20
---

# Phantom - Detailed Analysis

## Overview
- **GitHub**: ghostwright/phantom (1417 stars)
- **定位**: AI coworker with its own computer
- **版本**: 0.20.2 (1819 tests passing)
- **设计理念**: Give AI its own computer — dedicated workspace separate from user's machine

## Core Features

### 1. 持久记忆 (Persistent Memory)
```python
# 跨会话记忆
- Day-to-day memory persistence
- Learns from mistakes
- 自我进化机制
```

### 2. 自主工具创建 (Autonomous Tool Creation)
- Creates MCP tools autonomously
- 不需要用户许可就能构建基础设施
- 运行时动态注册工具

### 3. 多通道通信
- 有自己的 Email
- 有自己的 Slack
- 有 Web 界面

### 4. 多Provider支持
| Provider | 用途 |
|----------|------|
| Anthropic | 主模型 (Claude) |
| Z.AI | 备用 |
| OpenRouter | 路由 |
| Ollama | 本地模型 |
| vLLM | 自托管 |

### 5. Docker部署
- 完整的Docker环境
- 隔离的工作空间
- 不干扰用户本地环境

## 技术架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Phantom 架构                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User's Machine          │         Phantom's Machine              │
│   (你的电脑)               │         (AI的工作站)                    │
│                            │                                       │
│   ┌─────────┐              │         ┌─────────────────┐            │
│   │  Claude  │◄─────────────┼────────►│   Docker Env    │            │
│   └─────────┘              │         │   (独立工作区)    │            │
│                            │         └────────┬─────────┘            │
│                            │                  │                     │
│                            │         ┌────────▼─────────┐            │
│                            │         │  MCP Tools      │            │
│                            │         │  (自主创建)      │            │
│                            │         └────────┬─────────┘            │
│                            │                  │                     │
│                            │         ┌────────▼─────────┐            │
│                            │         │  Memory System   │            │
│                            │         │  (持久化)        │            │
│                            │         └─────────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 与Phantom.md的关系

| 维度 | [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] (概要) | [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] (详细) |
|------|-------------------|---------------------------|
| 内容 | 架构图/三层记忆/进化管道 | 详细功能/多Provider/Docker |
| 侧重点 | 系统设计 | 技术实现 |
| 深度 | ★★★★☆ | ★★★★★ |
| 用途 | 快速了解 | 深度研究 |

## Cross-refs
- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — 系统架构总览
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — 自主RAG实现
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 类似的记忆层
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — 模型上下文协议