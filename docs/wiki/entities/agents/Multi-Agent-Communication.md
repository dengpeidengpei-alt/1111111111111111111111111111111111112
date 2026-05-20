---
type: entity
category: agents
key: Multi-Agent-Communication
source: Claude-Evo
date: 2026-05-20
---

# Multi-Agent Communication

> 多Agent通信协议与协调机制

## Overview

Multi-Agent系统中的通信协议设计是实现有效协作的关键。

## 通信模式

### 1. 直接通信
- Agent间点对点消息传递
- 适用于确定性交互

### 2. 广播通信
- 一对多消息广播
- 适用于状态同步

### 3. 黑板模式
- 共享知识空间
- 适用于复杂协调

## 协调机制

| 机制 | 适用场景 | 示例 |
|------|----------|------|
| 中央协调 | 简单任务 | Master-Agent |
| 分布式协调 | 复杂任务 | 共识算法 |
| 层级协调 | 多级任务 | 组织结构 |

## Cross-refs

- [[agents/Multi-Agent-Orchestration]] — 多Agent编排
- [[agents/SE-Agent-3R]] — 自我进化Agent
- [[knowledge/Agentic-Workflows-RAG]] — Agentic工作流
- [[knowledge/Self-Healing-Loop]] — 自我修复机制