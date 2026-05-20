---
type: entity
category: evolution
key: Evolution Manual
source: Claude-Evo self-evolution
date: 2026-05-20
---

# Evolution Manual - 进化手册

## Overview
进化学习工作流程

## Core Process
查找索引 → 调用工具 → 开始工作 → 总结整理建立索引

## Standard Steps

### 1. 查找索引（先做这个）
```
MEMORY.md                          → 记忆指针索引
research/research_index_*.md      → 已有研究成果
.learnings/                       → Learnings错误记录
evolution_state.json              → 当前状态
evolution_log.md                 → 历史轨迹
```

**原则**：先看已有什么，不从零开始。不确定时先查索引。

### 2. 调用有用的工具
- Skills（已有skill直接用，不重复创建）
- 已有研究成果（在已有基础上工作）
- 工具（rtk、agent等）

**原则**：优先复用已有的，不重复造轮子。

## Cross-refs
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化循环
- Claude-Work/evolution_manual.md