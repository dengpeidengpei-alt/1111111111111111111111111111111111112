---
type: entity
category: knowledge
key: Knowledge Graph
source: Claude-Evo internal
date: 2026-05-14
rating: 4
---

# Knowledge Graph - 知识图谱

> 25节点44边8层次结构 | v1.1 | 2026-05-20

## Overview

| Metric | Value |
|--------|-------|
| Nodes | 25+ 核心概念节点 |
| Edges | 44+ 连接关系 |
| Layers | 8层次结构 |
| TCM Nodes | 245+ nodes (6 connections) |

## Node Categories (from knowledge_graph.json)

| Layer | Nodes | Description |
|------|-------|-------------|
| Layer 1 | Architecture, LLM, Reasoning, Multi-Agent, Agent, Memory | 核心理论层 |
| Layer 2 | RL, Evaluation, Optimization, Efficiency, Vision, Diffusion | 方法论层 |
| Layer 3 | Transformer, Alignment, World-Model, MoE, Embodied, Multimodal | 架构技术层 |
| Layer 4 | Other, Continual, Theory, Reasoning2, Self-Supervised, GAN, VAE, Meta-Learning | 专项技术层 |

## Top Nodes by Knowledge Mass

```
LLM           ████████████████████████████████ 9,935 (16.85%)
Architecture   ███████████████████░░░░░░░░░░░ 2,253 (10.10%)
Evaluation    █████████████████░░░░░░░░░░░░░░ 2,199 (9.86%)
Reasoning     ██████████████░░░░░░░░░░░░░░░░░ 1,581 (7.09%)
Multi-Agent   ██████████████░░░░░░░░░░░░░░░░░ 1,782 (7.99%)
Memory        ████████████░░░░░░░░░░░░░░░░░░░░ 1,499 (6.72%)
Agent         ███████████░░░░░░░░░░░░░░░░░░░░ 1,359 (6.09%)
Efficiency    ██████████░░░░░░░░░░░░░░░░░░░░░░ 1,352 (6.06%)
Vision        █████████░░░░░░░░░░░░░░░░░░░░░░ 1,937 (8.68%)
Embodied      █████████░░░░░░░░░░░░░░░░░░░░░░░ 1,812 (8.12%)
```

## Top Edges by Weight

| Edge | Weight | Relationship |
|------|--------|-------------|
| LLM → Memory | 775 | 语言模型依赖记忆系统 |
| Agent → Multi-Agent | 582 | 单体到多体的涌现 |
| Architecture → Multi-Agent | 565 | 架构设计决定多体能力 |
| LLM → Optimization | 540 | 优化目标影响LLM性能 |
| Architecture → Diffusion | 540 | 架构创新推动Diffusion |
| Efficiency → Memory | 513 | 效率优化依赖记忆机制 |
| Efficiency → RL | 513 | 效率与强化学习相互促进 |
| Embodied → Reasoning | 507 | 具身智能支撑推理能力 |
| Evaluation → Multi-Agent | 507 | 评估驱动多体协作 |
| Evaluation → Optimization | 501 | 评估指导优化方向 |

## TCM Subgraph

```
TCM-Theory (245 nodes, 6 connections)
    │
    ├── TCM-Diagnosis (189 nodes, 5 connections)
    │       │
    │       ├── TCM-Formula (156 nodes, 4 connections)
    │       │
    │       └── TCM-Pulse (72 nodes, 3 connections)
    │
    ├── TCM-Herbs (134 nodes, 4 connections)
    │
    └── TCM-Acupuncture (98 nodes, 3 connections)
```

## Layer Architecture Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                         Layer 1: 核心理论                        │
│         [LLM] [Agen[[knowledge/Design-Toolkit]] [Memory] [Reasonin[[Self-Healing-Loop]] [Architectur[[Self-Healing-Loop]]       │
│                        [Multi-Agen[[knowledge/Design-Toolkit]]                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Layer 2: 方法论                          │
│    [R[[Self-Healing-Loop]] [Evaluatio[[Self-Healing-Loop]] [Optimizatio[[Self-Healing-Loop]] [Efficiency] [Visio[[Self-Healing-Loop]]      │
│                        [Diffusio[[Self-Healing-Loop]]                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Layer 3: 架构技术                        │
│ [Transforme[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] [Alignmen[[knowledge/Design-Toolkit]] [World-Mode[[Self-Healing-Loop]] [MoE] [Embodie[[knowledge/Design-Toolkit]]       │
│                      [Multimoda[[Self-Healing-Loop]]                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Layer 4: 专项技术                        │
│     [Continua[[Self-Healing-Loop]] [Theory] [GAN] [VAE] [Meta-Learnin[[Self-Healing-Loop]]             │
│                     [Self-Supervise[[knowledge/Design-Toolkit]]                           │
└─────────────────────────────────────────────────────────────────┘
```

## Causal Relations (from causal_knowledge_graph.json)

| Cause | → Effect | Mechanism |
|-------|----------|-----------|
| Transformer | → LLM | Self-attention处理长距离依赖 |
| Pre-training | → Emergence | 规模增大导致质变涌现 |
| RLHF | → Alignment | 人类反馈注入价值观 |
| Memory | → Context | 存储中间结果理解对话历史 |
| Agent | → Multi-Agent | 个体能力涌现多体协作 |
| World-Model | → Planning | 内部表示支撑长序列规划 |
| Diffusion | → Quality | 迭代去噪逐步精炼 |
| Attention | → Context | 直接建模任意token关系 |
| Continual | → Forgetting | 学习新任务覆盖旧权重 |
| Multi-Agent | → Collective | 通信产生协同效应 |
| Reasoning | → CoT | 显式推理步骤分步思考 |

## Implementation

### Build Knowledge Graph

```python
import json

class KnowledgeGraphBuilder:
    """从JSON数据构建知识图谱"""

    def __init__(self, kg_file: str, ckg_file: str):
        with open(kg_file) as f:
            self.kg = json.load(f)
        with open(ckg_file) as f:
            self.ckg = json.load(f)

    def get_node_stats(self) -> dict:
        """节点统计"""
        nodes = self.kg['nodes']
        return {
            'total': len(nodes),
            'by_layer': self._group_by_layer(nodes),
            'top_by_count': sorted(
                [(k, v['count']) for k, v in nodes.items()],
                key=lambda x: -x[1]
            )[:10]
        }

    def get_edge_stats(self) -> dict:
        """边统计"""
        edges = self.kg['edges']
        return {
            'total': len(edges),
            'top_by_weight': sorted(
                edges, key=lambda x: -x['weight']
            )[:10]
        }

    def get_causal_chains(self) -> list:
        """因果链分析"""
        return [
            f"{e['source']} → {e['target']}: {e['cause']}"
            for e in self.ckg['edges']
       [[Self-Healing-Loop]]
```

### Query Pattern

```python
# 查找节点的所有连接
def find_connections(node: str, kg: dict) -> list:
    edges = kg['edges']
    connections = [[Self-Healing-Loop]]
    for e in edges:
        if e['source'] == node:
            connections.append((e['target'], e['weight'], 'outgoing'))
        elif e['target'] == node:
            connections.append((e['source'], e['weight'], 'incoming'))
    return sorted(connections, key=lambda x: -x[1])

# 示例: 查找LLM的所有连接
llm_conns = find_connections('LLM', kg_data)
# [('Memory', 775, 'outgoing'), ('Optimization', 540, 'outgoing'), ...]
```

## Cross-refs

| Entity | Relationship |
|--------|--------------|
| [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] | 因果知识图谱，含44条因果链 |
| [[research/Knowledge-Classification.m[[knowledge/Design-Toolkit]]] | 52,513 topics分类系统 |
| [[knowledge/Knowledge-System-Map.m[[knowledge/Design-Toolkit]]] | Wiki知识体系的可视化 |
| [[knowledge/Karpathy-LLM-Wiki.m[[knowledge/Design-Toolkit]]] | Wiki模式的知识自组织 |
| [[ml/RAG.m[[knowledge/Design-Toolkit]]] | RAG使用知识图谱增强检索 |
| [[ml/Embedding.m[[knowledge/Design-Toolkit]]] | 向量化是图谱检索的基础 |
| [[ml/Transformer.m[[knowledge/Design-Toolkit]]] | Transformer是LLM的架构基础 |
| [[memory/Mem0.m[[knowledge/Design-Toolkit]]] | Mem0是记忆系统的实现 |

## Data Sources

- `Claude-Work/knowledge_graph.json` — 结构化知识图谱
- `Claude-Work/causal_knowledge_graph.json` — 因果关系图谱
- `Claude-Work/knowledge_classification.md` — 52,513 topics分类