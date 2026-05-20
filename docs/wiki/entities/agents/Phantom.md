---
type: entity
category: agents
key: Phantom AI Coworker
source: GitHub 1417 stars
date: 2026-05-20
---

# Phantom AI Coworker

## Overview
- **GitHub**: 1417 stars
- **定位**: 个人AI同事，自动化工作流
- **核心**: 多通道通信 + 三层记忆 + 自我进化

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Phantom 架构                                    │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │                      通信通道 (Channels)                         │
    │   Slack  │  Telegram  │  Email  │  Webhook  │  CLI            │
    └─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Prompt Assembler (分层组装)                    │
    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
    │  │  Base   │→│  Role   │→│Onboard- │→│ Evolved │→│  Inst-  │ │
    │  │Identity │ │         │ │  ing    │ │ Config  │ │ ructions │ │
    │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
    │                                     │                             │
    │                              ┌──────┴──────┐                   │
    │                              │ Memory Context │                   │
    │                              └──────────────┘                   │
    └─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                      Agent Runtime (Bun)                         │
    │  ┌─────────────────────────────────────────────────────────┐  │
    │  │               Evolution Pipeline (三层循环)                  │  │
    │  │                                                          │  │
    │  │  ┌─────────────────┐                                      │  │
    │  │  │ Conditional Gate │ → Haiku判断是否触发学习              │  │   │
    │  │  └────────┬────────┘                                      │  │
    │  │           ▼                                               │  │
    │  │  ┌─────────────────┐                                      │  │
    │  │  │ Persistent Queue │ → SQLite + 180分钟cron              │  │
    │  │  └────────┬────────┘                                      │  │
    │  │           ▼                                               │  │
    │  │  ┌─────────────────┐                                      │  │
    │  │  │ Reflection      │ → Agent SDK沙箱运行                  │  │
    │  │  │ Subprocess      │                                      │  │
    │  │  └─────────────────┘                                      │  │
    │  └─────────────────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                     Memory (Qdrant 三层)                          │
    │  ┌───────────┐ ┌───────────┐ ┌───────────┐                     │
    │  │ Episodic  │ │ Semantic  │ │Procedural │                     │
    │  │  情景记忆 │ │  语义记忆 │ │ 程序记忆  │                     │
    │  └───────────┘ └───────────┘ └───────────┘                     │
    └─────────────────────────────────────────────────────────────────┘
```

## 通信通道

| 通道 | 用途 | 特点 |
|------|------|------|
| Slack | 团队协作 | 即时消息 |
| Telegram | 个人助理 | 私密安全 |
| Email | 正式沟通 | 文档记录 |
| Webhook | 自动化 | 集成能力强 |
| CLI | 开发者 | 快速调试 |

## 三层记忆系统

### 1. Episodic Memory (情景记忆)
- 最近对话/事件
- 短期上下文
- 快速检索

### 2. Semantic Memory (语义记忆)
- 长期知识
- 用户偏好
- 事实信息

### 3. Procedural Memory (程序记忆)
- 工作流程
- 技能方法
- 自动化规则

## 进化管道 (Evolution Pipeline)

### 第一层: Conditional Gate
```python
# Haiku模型判断是否需要学习
should_evolve = haiku.classify(event)
if should_evolve:
    queue.add(event)
```

### 第二层: Persistent Queue
```sql
-- SQLite持久化
CREATE TABLE evolution_queue (
    id INTEGER PRIMARY KEY,
    event TEXT,
    timestamp DATETIME,
    status TEXT
);
-- 180分钟cron触发
```

### 第三层: Reflection Subprocess
```python
# Agent SDK沙箱运行
result = agent_sdk.run("""
    分析: {event}
    反思: {context}
    进化: {improvement}
""")
```

## Prompt Assembler (分层组装)

```
Layer 1: Base Identity
  "你是一个有帮助的AI助手"

Layer 2: Role Definition
  "你的角色是[用户设定]"

Layer 3: Onboarding Context
  用户具体信息/偏好

Layer 4: Evolved Configuration
  之前进化的改进点

Layer 5: Instructions
  当前任务指令

Layer 6: Memory Context
  检索到的相关记忆
    ↓
最终Prompt → LLM → Response
```

## 安全机制 (Constitution.md三层保护)

| 层级 | 机制 | 作用 |
|------|------|------|
| 1 | SDK deny list | 阻断危险操作 |
| 2 | Teaching prompt | 教给模型边界 |
| 3 | Post-write compare | 输出后检查 |

## MCP集成

### 工具类型
```python
# 8个通用工具
- file_operations  # 文件读写
- web_search      # 网络搜索
- code_execute    # 代码执行
- ...

# 角色工具
- [角色设定]专属工具

# 运行时注册
- agent.register_tool(dynamic_tool)
```

## 与其他Agent对比

| 维度 | Phantom | Vibecosystem | Hermes |
|------|---------|---------------|--------|
| 架构 | 单进程+Bun | 多Agent自组织 | 27章节教程 |
| 记忆 | 三层Qdrant | 共享知识库 | 外部RAG |
| 进化 | 3层循环 | 群体进化 | 无 |
| 通道 | 多通道 | 单通道 | CLI |

## 关键洞察

1. **Haiku作为Gatekeeper**
   - 轻量级判断是否需要进化
   - 节省计算资源

2. **SQLite持久化**
   - 保证进化任务不丢失
   - 支持分布式

3. **三层Prompt组装**
   - 模块化可配置
   - 支持上下文扩展

4. **安全先于功能**
   - constitution三层保护
   - 输出前/后双重检查

## Cross-refs
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 138个Agent自组织团队
- [[agents/Hermes-Agent.m[[knowledge/Design-Toolkit]]] — 27章节教程
- [[agents/Agency-Agents.m[[knowledge/Design-Toolkit]]] — 通用Agent框架
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 类似的记忆层设计