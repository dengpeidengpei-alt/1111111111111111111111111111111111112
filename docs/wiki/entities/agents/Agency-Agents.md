---
type: entity
category: agents
key: Agency Agents
source: GitHub 85 installed agents
date: 2026-05-20
---

# Agency Agents

## Overview
- **数量**: 85 pre-built AI agent personalities
- **来源**: GitHub agency-agents framework
- **分类**: engineering, marketing, design, sales, finance

## 架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Agency Agents 架构                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│   │ Engineering │    │  Marketing  │    │   Design    │           │
│   │   (20+)     │    │    (15+)    │    │    (10+)    │           │
│   └─────────────┘    └─────────────┘    └─────────────┘           │
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│   │    Sales    │    │   Finance   │    │   Other     │           │
│   │    (15+)    │    │    (10+)    │    │    (15+)    │           │
│   └─────────────┘    └─────────────┘    └─────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 核心Agent详解

### 1. Autonomous Optimization Architect
```yaml
位置: engineering-autonomous-optimization-architect.md
功能:
  - API性能优化
  - Financial guardrails
  - Security guardrails
技术:
  - LLM-as-Judge grading
  - Semantic Routing
  - Dark Launching
  - AI FinOps
```

### 2. Security Engineer
```yaml
功能:
  - 传统app漏洞: XSS, SQLi, Auth bypass
  - LLM特定漏洞: Token-draining attacks, prompt injection
特点:
  - 专门防护AI特有攻击
  - 与Optimization Architect互补
```

### 3. Infrastructure Maintainer
```yaml
功能:
  - 服务器 uptime
  - CI/CD 维护
  - 数据库 scaling
特点:
  - 第三方API uptime监控
```

### 4. Performance Benchmarker
```yaml
功能:
  - 服务器负载测试
  - DB查询速度
特点:
  - Semantic Benchmarking
```

## 与其他Agent系统对比

| 维度 | Agency Agents | [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] | [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] |
|------|---------------|------------------|--------------|
| 数量 | 85 | 139 | 1 |
| 架构 | 分类预设 | 5+6+2+3+4分层 | 单进程+Bun |
| 用途 | 多场景 | 软件开发 | 个人助理 |
| 定制 | 可配置 | 自组织 | 完全自主 |

## 安装方式

```bash
# 通过 agency-agents framework 安装
agency-agents install

# 安装位置
~/.claude/agents/
```

## Cross-refs
- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — AI coworker架构
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 多Agent系统
- [[agents/Hermes-Agent.m[[knowledge/Design-Toolkit]]] — Agent开发教程
- [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] — 自进化方法论
- Claude-Work/agent-skills-repo/