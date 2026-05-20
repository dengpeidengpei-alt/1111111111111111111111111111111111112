---
type: entity
category: knowledge
key: LLM Reasoning & Test-Time Compute
source: Claude-Evo
date: 2026-05-20
---

# LLM Reasoning & Test-Time Compute

**学习时间**: 2026-05-20 19:45
**来源**: 互联网搜索 + NeurIPS 2025

---

## Test-Time Compute Scaling (测试时计算缩放)

**核心发现** (o1, DeepSeek-R1):
模型生成的token越多，性能越好

```
思考长度 ↑ = 性能 ↑
```

---

## 四种推理时计算技术

| 技术 | 方向 | 说明 |
|------|------|------|
| **Chain-of-Thought** | 深度 | 增加思维链长度 |
| **Self-Consistency** | 宽度 | 多次采样投票 |
| **Tree-of-Thoughts** | 搜索 | 多路径探索 |
| **Reflexion/Self-Refine** | 迭代 | 自我改进 |

---

## NeurIPS 2025 突破

### 1024层网络强化学习
**团队**: 普林斯顿大学 + OpenAI

**成果**: RL网络深度扩展至1024层，性能提升2-50倍

**意义**: 展示深度scaling在强化学习中的可扩展性

---

## Reasoning Models的挑战

1. **幻觉问题** - 推理模型更容易产生幻觉
2. **过度思考** - 思考越长不一定越好
3. **事实性** - 需要强化学习增强事实性

---

## 2025 Transformer演进

### 位置编码进化

```
正弦函数(原始) → RoPE(旋转) → 三线性体积编码(2025 Meta)
```

---

## Cross-refs

- [[knowledge/AI-Agent-Trends-2025.m[[knowledge/Design-Toolkit]]] — AI Agent六大趋势
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — Agentic工作流
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志