---
type: entity
category: agents
key: Garudust Agent
source: GitHub agent analysis
date: 2026-05-20
---

# Garudust Agent Analysis

## Overview
- **来源**: GitHub agent分析
- **分类**: AI Agent架构研究
- **学习日期**: 2026-05-14

## 核心洞察

### 架构特点
1. **模块化设计** — 各功能解耦，便于扩展
2. **自注册机制** — 运行时动态加载工具和技能
3. **记忆层次** — 情景+语义+程序三层分离

### 设计模式
```
┌─────────────────────────────────────────────────────────────────────┐
│                      Garudust Agent 架构                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│   │   Tools    │    │   Memory    │    │   Skills    │           │
│   │  (动态注册) │    │  (三层分离)  │    │  (自创建)   │           │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘           │
│          │                  │                  │                    │
│          └──────────────────┼──────────────────┘                    │
│                             ▼                                       │
│                    ┌─────────────────┐                                │
│                    │    Agent Core   │                                │
│                    │   (执行循环)    │                                │
│                    └────────┬────────┘                                │
│                             │                                         │
│          ┌──────────────────┼──────────────────┐                     │
│          ▼                  ▼                  ▼                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│   │  Reflection │    │   Planning  │    │  Learning   │           │
│   │   (反思)    │    │   (规划)    │    │   (学习)    │           │
│   └─────────────┘    └─────────────┘    └─────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 关键设计

| 模块 | 功能 | 特点 |
|------|------|------|
| Tools | 工具注册 | 运行时动态注册 |
| Memory | 记忆存储 | 三层分离 |
| Skills | 技能管理 | Agent自创建 |
| Core | 执行循环 | 统一调度 |
| Reflection | 自我反思 | 错误纠正 |
| Planning | 任务规划 | 分解执行 |
| Learning | 持续学习 | 模式沉淀 |

## Cross-refs
- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — AI coworker架构参考
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 多Agent系统参考
- [[agents/Hermes-Agent.m[[knowledge/Design-Toolkit]]] — 27章节Agent教程
- [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] — 自进化方法论
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化循环机制