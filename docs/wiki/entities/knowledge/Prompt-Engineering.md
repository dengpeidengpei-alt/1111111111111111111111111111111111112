---
type: entity
category: knowledge
key: Prompt Engineering 2025
source: Claude-Evo
date: 2026-05-20
---

# Prompt Engineering 2025

**学习时间**: 2026-05-20 20:15
**来源**: 互联网搜索 + GitHub 4.3k Star资源库

---

## Prompt Engineering 核心原则

### 原则一: 编写清晰具体的指令

| 策略 | 说明 |
|------|------|
| **使用分隔符** | 清晰表示输入的不同部分 |
| **结构化输出** | JSON / Markdown / HTML / XML |
| **限制输出长度** | 50 words / 280 characters |
| **Few-shot提示** | 提供示例 |

### 原则二: 给模型思考的时间

| 策略 | 说明 |
|------|------|
| **指定步骤** | 明确完成任务所需的步骤 |
| **Chain-of-Thought** | Let's think step by step |

---

## 主要Prompt技术

| 技术 | 说明 |
|------|------|
| **CoT** | Chain-of-Thought 思维链 |
| **ToT** | Tree-of-Thoughts 多路径探索 |
| **ReAct** | Reasoning + Acting 协同 |
| **Few-shot** | 少样本提示 |
| **SC** | Self-Consistency 自一致性 |

---

## 2025新突破: DnD (Drag & Drop)

**论文**: arxiv.org/abs/2506.16406

**功能**: 基于提示词的参数生成器，无需训练的自适应微调

**方法**:
- 轻量级文本编码器
- 级联超卷积解码器
- 数秒内生成针对任务的LoRA权重矩阵

**效率**: 提升12000倍

---

## 关键资源

### 学术论文
- 《ReAct: Synergizing Reasoning and Acting in Language Models》(2022)
- 《Multimodal Chain-of-Thought Reasoning in Language Models》(2023)
- 《Synthetic Prompting: Generating CoT Demonstrations》(2023)

### 工具
- BLOOM (多语言开源)
- Meta OPT-175B
- Mixtral-84B (专家混合)

### 课程
- DeepLearning.ai《ChatGPT Prompt Engineering for Developers》

---

## Cross-refs

- [[knowledge/Function-Calling.m[[knowledge/Design-Toolkit]]] — 函数调用
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — Agentic工作流
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志