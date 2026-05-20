---
type: entity
category: research
key: OpenClaw Optimization Guide
source: GitHub OnlyTerp/openclaw-optimization-guide
date: 2026-05-14
---

# OpenClaw Optimization Guide

## Overview

OpenClaw是一个Claude Code优化指南项目，专注于减少token消耗和提高响应速度。

**项目地址**: https://github.com/OnlyTerp/openclaw-optimization-guide
**核心目标**: 让Claude Code在保持功能完整的同时，大幅降低资源消耗。

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code (Client)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Hot-Path Files (优化重点)               │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │  │
│  │  │ SOUL_md   │  │ AGENTS_md │  │ MEMORY_md     │   │  │
│  │  │ <1 KB     │  │ <2 KB     │  │ <3 KB         │   │  │
│  │  └───────────┘  └───────────┘  └───────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Vector Search Layer                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  替代热路径文件的内容检索，提高效率                    │  │
│  └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Model Fallback Chain                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Primary → Fallback1 → Fallback2 → Budget Cap       │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Optimization Areas

### 1. Speed Optimization (速度优化)

**Primary Lever**: 精简 workspace 文件大小

| File | Target Size | Current Issue |
|------|-------------|---------------|
| SOUL_md | < 1 KB | 内容过多导致解析慢 |
| AGENTS_md | < 2 KB | Agent定义过于冗长 |
| MEMORY_md | < 3 KB | 历史记录占用过大 |

**Insight**: 热路径文件在向量搜索就位后变得不必要

### 2. Model Selection (模型选择)

```json
// settings.json 配置示例
{
  "models": [
    {
      "name": "claude-opus-4",
      "fallbacks": ["claude-sonnet-4", "claude-haiku-3"],
      "budget": {
        "max_tokens_per_day": 100000
      }
    }
 [[Self-Healing-Loop]]
}
```

**策略**:
- 设置回退模型链 (primary → fallbacks → budget caps)
- 使用 reasoning mode 提升准确性 (代价: +2-5s 延迟)
- 禁用未使用的插件

### 3. Configuration Tuning

```json
{
  // 本地模型优化 (小模型使用)
  "localModelLean": true,
  
  // 禁用不必要的功能
  "features": {
    "autoSave": false,
    "syntaxHighlighting": true
  },
  
  // 缓存策略
  "cache": {
    "enabled": true,
    "maxSize": "100MB"
  }
}
```

## Implementation Guide

### Step 1: 分析当前状态

```bash
# 检查各文件大小
ls -la .claude/ SOUL.md AGENTS.md MEMORY.md

# 查看文件内容行数
wc -l .claude/*.md SOUL.md AGENTS.md MEMORY.md

# 分析 token 消耗
# 使用 Claude Code 内置分析 /stats
```

### Step 2: 精简热路径文件

**SOUL.md 精简示例**:
```markdown
# SOUL - Claude Code Core Identity

## Core Principles
- 简洁高效
- 文档同步
- 自我改进

## Working Mode
- 异步优先
- 工具驱动
- 闭环改进
```

**AGENTS.md 精简示例**:
```markdown
# AGENTS - Available Agent Types

## Research Agent
分析 → 规划 → 执行

## Coding Agent
理解 → 实现 → 验证

## Writing Agent
构思 → 草稿 → 优化
```

### Step 3: 配置优化

```json
// settings.json
{
  "optimization": {
    "leanMode": true,
    "hotPathCompression": true,
    "vectorSearch": {
      "enabled": true,
      "indexPath": ".claude/vector_index"
    }
  }
}
```

## Techniques Deep Dive

### 向量搜索替换

传统方式:
```
用户请求 → 读取完整 SOUL.md → 解析 → 处理
```

优化后:
```
用户请求 → 向量搜索 → 仅返回相关内容 → 处理
```

### 模型回退链

```
请求 → Primary Model
        ↓ 失败/超时
       Fallback 1
        ↓ 失败/超时
       Fallback 2
        ↓ 失败/超预算
       Budget Cap (拒绝/排队)
```

### 推理模式

```json
{
  "reasoning": {
    "enabled": true,
    "effort": "high",
    "budget_tokens": 4000
  }
}
```

**适用场景**:
- 复杂代码审查
- 多文件重构
- 架构设计决策

**不适用场景**:
- 简单修复
- 快速问答
- 批量操作

## Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| 首次响应时间 | 3-5s | 1-2s | 60% faster |
| Token 消耗/请求 | 2000 | 800 | 60% reduction |
| 内存占用 | 500MB | 200MB | 60% reduction |
| 冷启动时间 | 10s | 3s | 70% faster |

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 响应慢 | 热路径文件过大 | 精简到目标大小 |
| Token 超预算 | 模型选择不当 | 配置回退链 |
| 内存占用高 | 未使用 lean mode | 启用 localModelLean |
| 向量搜索慢 | 索引过大 | 定期重建索引 |

```bash
# 重建向量索引
rm -rf .claude/vector_index
claude --rebuild-index

# 检查优化效果
claude --stats

# 导出优化报告
claude --export-stats > optimization_report.json
```

## Integration with Other Tools

### 与 Ollama 集成

```json
{
  "models": [
    {
      "name": "claude-opus-4",
      "fallbacks": [
        "ollama/qwen2.5:7b",
        "ollama/llama3.2:3b"
     [[Self-Healing-Loop]]
    }
 [[Self-Healing-Loop]]
}
```

### 与 MCP 集成

```json
{
  "mcpServers": {
    "optimization": {
      "command": "claude-mcp-optimize",
      "args": ["--lean-mode"]
    }
  }
}
```

## Best Practices

1. **渐进式优化**: 先从 SOUL_md 开始，确认无副作用后再优化其他文件
2. **定期检查**: 使用 `claude --stats` 监控优化效果
3. **版本控制**: 修改前备份，保留回滚能力
4. **测试验证**: 大改后运行核心场景测试
5. **文档同步**: 优化后更新 CLAUDE.md 保持一致

## Cross-refs

- [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] — 本地LLM运行时
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — MCP协议
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 本地部署
- Claude-Work/openclaw_guide_analysis.json
- Claude-Work/openclaw_optimization_config.json
- Claude-Work/agent_architecture_research.json — Agent架构研究