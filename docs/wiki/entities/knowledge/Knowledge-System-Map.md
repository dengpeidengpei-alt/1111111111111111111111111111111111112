---
type: entity
category: knowledge
key: Wiki 知识体系图
source: Claude-Evo
date: 2026-05-20
---

# Wiki 知识体系图

> 可视化知识架构 | v1.1 | 2026-05-20

## Overview

| Metric | Value |
|--------|-------|
| 总分类 | 15个 |
| 总实体 | 95+ |
| TCM实体 | 52 (书籍13 + 方剂17 + 药材15 + 病证7) |
| ML方法 | 17个 |
| AI/Agent | 11个 |

## 总览图

```
                          ┌─────────────────────────────────────────┐
                          │              AI 与 Agent                │
                          └─────────────────────────────────────────┘
                                               │
         ┌────────────────┬────────────────────┼────────────────────┬────────────────┐
         ▼                ▼                    ▼                    ▼                ▼
    ┌─────────┐      ┌─────────┐         ┌─────────┐         ┌─────────┐      ┌─────────┐
    │ Agents  │      │   AI    │         │Evolution│         │Knowledge│      │ Memory  │
    │ (11个)  │      │  (3个)  │         │  (7个)  │         │  (4个)  │      │  (3个)  │
    └─────────┘      └─────────┘         └─────────┘         └─────────┘      └─────────┘
         │                │                    │                    │                │
    Phantom         Agentic-RAG          Evolution-           Knowledge-       Mem0
    Vibecosystem    Agent-Economy        Loop               Graph            Memov
    Hermes          AgentLab             State              Karpathy-        Intent-
                                       Manual              Wiki             Log
    ...                ...                 ...                 ...             ...

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               机器学习 (ML) — 17个方法                                │
│  CLIP · Continual-Learning · DSPy · Federated-Learning · GNN · Model-Compression    │
│  Prompt-Engineering · RAG · RLHF · ReAct · World-Models                            │
│  Diffusion-Models · MoE · LoRA · DPO · Constitutional-AI · GRPO                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              基础设施                                                │
│       Ollama · MCP · MiniMax · Local-LLM-Deployment · OpenClaw                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              分析与对齐                                              │
│       AI-Alignment · Alignment-Research · Embodied-AI · Understanding-Graph        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 层级结构

```
第一层：核心理念 (Concepts)
│
├── AI/Agent 架构
│   ├── Agent Architecture (智能体架构)
│   ├── Self-Evolution (自我进化)
│   ├── AI Safety (AI安全)
│   ├── Multimodal Learning (多模态学习)
│   ├── Memory Architecture (记忆架构)
│   └── Quant Trading (量化交易)
│
├── TCM 知识体系
│   ├── TCM Knowledge System (中医知识总览)
│   └── Nine Constitutions (九种体质分类)
│
└── Knowledge Base (311条知识总览)
```

---

## 中医知识体系 (TCM)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              中医知识体系 (TCM)                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
    │  经典书籍    │      │    方剂      │      │    药材      │      │    病证      │
    │  (14本)     │      │   (17个)     │      │   (15个)     │      │   (7个)     │
    └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
           │                    │                    │                    │
    ┌──────┴──────┐      ┌──────┴──────┐      ┌──────┴──────┐      ┌──────┴──────┐
    │             │      │             │      │             │      │             │
 黄帝内经    伤寒论      桂枝汤     麻黄汤       人参        当归       气血不足    痰湿体质
 金匮要略    温病条辨      小柴胡汤   银翘散       黄芪                  气阴两虚    肾阴虚
 神农本草经  本草纲目      肾气丸     半夏泻心汤   川芎/地黄    补中益气汤
 针灸甲乙经  难经脉学      白虎汤     承气汤       白术/茯苓    归脾汤
 中医基础理论 中医诊断    桑菊饮     复脉汤       陈皮/柴胡    血府逐瘀汤
 中医内科学  千金方        八珍汤     大定风珠     黄芩/黄连    (15+药材)
    ...

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TCM 经典书籍 (13本)                                      │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────────┤
│ 黄帝内经│ 伤寒论  │ 金匮要略│ 温病条辨│ 神农本草经│ 本草纲目│ 针灸甲乙经│ 难经脉学     │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────────┤
│ 中医基础│ 中医诊断│ 中医内科学│ 千金方  │ 脉经     │ 诸病源候论│           │             │
│ 理论   │ 学      │         │         │         │         │           │             │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────────┘
```

---

## AI/Agent 知识体系

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            AI Agent 全景图                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────────┐
                              │   Self-Evolution  │
                              │   (自我进化)       │
                              └───────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
      ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
      │  Evolution    │          │   Memory     │          │  Reasoning   │
      │  Loop/State   │          │  Mem0/Memov  │          │  ReAct/CoT   │
      └───────────────┘          └───────────────┘          └───────────────┘
              │                         │                         │
              ▼                         ▼                         ▼
      ┌─────────────────────────────────────────────────────────────────────────┐
      │                         Agents (11个)                                   │
      ├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬───────────┤
      │ Phantom │Vibecosys│Hermes   │ 724-Offi│Garudust │ FARA-7B │ SE-Agent  │
      │(1417★) │tem(485★)│-Agent   │ce(1024★)│-Agent   │         │ -3R/Code  │
      └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴───────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            ML 方法论 (17个)                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  CLIP · Continual-Learning · DSPy · Federated-Learning · Graph-Neural-Networks     │
│  Model-Compression · Prompt-Engineering · RAG · RLHF · ReAct · World-Models         │
│  Diffusion-Models · MoE · LoRA · DPO · Constitutional-AI · GRPO                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            基础设施 (6个)                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│            Ollama · MCP · MiniMax · Local-LLM · OpenClaw                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 量化交易

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              A股技术分析策略                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  技术指标: MACD · KDJ · RSI · MA · 布林带                                            │
│  蜡烛图: 吞没 · 锤子 · 十字星                                                         │
│  量价关系分析                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 实体关系矩阵

| Category | Count | Examples | Connection Pattern |
|----------|-------|----------|-------------------|
| AI/Agent | 6 | Agent-Economy, AgentLaboratory | → ML methods |
| Evolution | 7 | Evolution-Loop, Evolution-State | → Agents |
| Knowledge | 4 | Knowledge-Graph, Karpathy-Wiki | ↔ All |
| Memory | 3 | Mem0, Memov, Intent-Log | → Agents |
| ML | 17 | RAG, DSPy, Transformer | Core infrastructure |
| Infrastructure | 6 | Ollama, MCP, vLLM | Support ML |
| TCM Books | 13 | 黄帝内经, 伤寒论 | → TCM formulas |
| TCM Formulas | 17 | 桂枝汤, 小柴胡汤 | ← TCM books |
| TCM Herbs | 15 | 人参, 当归 | Used by formulas |
| TCM Conditions | 7 | 气血不足, 痰湿体质 | ← TCM theory |

---

## Visual Pattern Language

| Symbol | Meaning | Example |
|--------|---------|---------|
| ★ | GitHub stars | Phantom (1417★) |
| (数字) | Entity count | Agents (11个) |
| → | Dependency | TCM books → formulas |
| ↔ | Bidirectional | Knowledge ↔ All |
| ██████ | Relative size | LLM mass bar |
| ★★★★☆ | Rating | Target depth level |

---

## Implementation

### Generate System Map

```python
import os
from pathlib import Path

class WikiSystemMapGenerator:
    """生成Wiki知识体系图"""

    def __init__(self, wiki_root: str):
        self.wiki_root = Path(wiki_root)
        self.categories = {}

    def scan_entities(self) -> dict:
        """扫描所有实体"""
        entities_dir = self.wiki_root / "entities"
        for category in entities_dir.iterdir():
            if category.is_dir():
                self.categories[category.nam[[Self-Healing-Loop]] = [
                    f.stem for f in category.glob("*.md")
               [[Self-Healing-Loop]]
        return self.categories

    def generate_tree(self, max_depth: int = 3) -> str:
        """生成树状结构"""
        lines = [[Self-Healing-Loop]]
        for cat, entities in sorted(self.categories.items()):
            lines.append(f"### {cat}")
            for e in entities[:10]:  # Top 10 per category
                lines.append(f"- ")
            if len(entities) > 10:
                lines.append(f"- ... ({len(entities)-10} more)")
            lines.append("")
        return "\n".join(lines)

    def count_entities(self) -> dict:
        """统计实体数量"""
        return {cat: len(ents) for cat, ents in self.categories.items()}
```

### Analyze Entity Distribution

```python
def entity_distribution(wiki_root: str) -> dict:
    """分析实体分布"""
    dist = {}
    entities = Path(wiki_root) / "entities"
    for category in entities.iterdir():
        if category.is_dir():
            md_files = list(category.glob("*.md"))
            dist[category.nam[[Self-Healing-Loop]] = {
                'count': len(md_files),
                'files': [f.stem for f in md_files[:5]]
            }
    return dist

# Output:
# {
#   'ml': {'count': 17, 'files': ['RAG', 'DSPy', 'Transformer', ...]},
#   'tcm/books': {'count': 13, 'files': ['黄帝内经', '伤寒论', ...]},
#   ...
# }
```

---

## Cross-refs

| Entity | Relationship |
|--------|--------------|
| [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] | 25节点结构化图谱 |
| [[research/Knowledge-Classification.m[[knowledge/Design-Toolkit]]] | 52,513 Topics分类系统 |
| [[knowledge/Karpathy-LLM-Wiki.m[[knowledge/Design-Toolkit]]] | Wiki模式的自组织机制 |
| [[knowledge/Wiki-Evolution-Plan.m[[knowledge/Design-Toolkit]]] | Wiki自我进化方案 |
| [[knowledge/Accomplishments Index.m[[knowledge/Design-Toolkit]]] | Wiki导航索引 |
| [[concepts/2026-05-20_concept_knowledge-base.m[[knowledge/Design-Toolkit]]] | 311条知识总览 |