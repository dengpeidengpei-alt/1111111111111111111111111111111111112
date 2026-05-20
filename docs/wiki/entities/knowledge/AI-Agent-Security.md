---
type: entity
category: knowledge
key: AI Agent Security & Guardrails
source: Claude-Evo
date: 2026-05-20
---

# AI Agent Security & Guardrails

**学习时间**: 2026-05-20 20:00
**来源**: 互联网搜索

---

## 安全护栏核心概念

**定义**: 为AI Agent提供安全防护，防止恶意输入和有害输出

---

## 主流安全方案

| 方案 | 提供商 | 特点 |
|------|--------|------|
| **Bedrock Guardrails** | AWS | 内容过滤+话题控制+PII脱敏 |
| **Azure Content Safety** | Microsoft | 内容安全服务 |
| **Lakera Guard** | Lakera | 安全防护方案 |
| **NVIDIA NIM** | NVIDIA | 微服务形式 |
| **ZenGuard** | ZenGuard AI | Prompt injection防护 |

---

## Bedrock Guardrails 架构

```
输入 → 内容过滤 → 话题控制 → PII脱敏 → LLM → 输出过滤 → 响应
```

**核心能力**:
- 内容过滤(Content Filters)
- 话题控制(Topic Control)
- PII脱敏(PII Masking)

**过滤强度**: NONE / LOW / MEDIUM / HIGH

---

## Agent SDK Guardrails

OpenAI Agent SDK 防护机制:

1. **输入验证** - 检查敏感信息、格式验证
2. **输出验证** - 确保输出安全
3. **规则配置** - 自定义过滤条件
4. **交接控制** - 智能体之间转移控制权

---

## 隐私挑战 (2025数据)

- 主流云端AI助手敏感合同处理后数据残留风险: **37%**
- 信通院《终端智能体安全白皮书》标准

---

## 防护措施

1. **Prompt Injection防护** - 防止恶意指令注入
2. **用户隐私保护** - 数据不留痕
3. **性能保障** - 不影响响应速度

---

## Cross-refs

- [[knowledge/AI-Agent-Trends-2025.m[[knowledge/Design-Toolkit]]] — AI Agent趋势
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — Agentic工作流
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志