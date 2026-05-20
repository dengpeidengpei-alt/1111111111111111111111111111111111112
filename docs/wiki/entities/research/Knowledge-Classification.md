---
type: entity
category: research
key: Knowledge Classification
source: Claude-Evo internal
date: 2026-05-14
rating: 4
---

# Knowledge Classification - 知识分类系统

> 52,513 Topics | 26核心节点 | 148连接 | v1.1 | 2026-05-20

## Overview

| Metric | Value |
|--------|-------|
| 总Topics | 52,513 |
| 核心节点 | 26个 |
| 概念连接 | 148条 |
| 学习迭代 | 2,636次 |

## 4-Layer Architecture

### Layer 1: 核心概念（最深层理解）

| 概念 | Topics数 | 理解深度 | 核心理解 |
|------|---------|---------|---------|
| **LLM** | 9,935 | ★★★★★ | Transformer架构，预训练+微调，涌现能力 |
| **Agent** | 5,700 | ★★★★★ | 自主执行，多步骤规划，工具调用，自我改进 |
| **Memory** | 1,466 | ★★★★☆ | 三层记忆架构(LanceDB向量+文档+Guide压缩) |
| **Multi-Agent** | 821 | ★★★★☆ | 协作通信，分工协调，群体智能 |
| **Reasoning** | 2,140 | ★★★★☆ | 链式推理，规划分解，MCTS搜索 |
| **Architecture** | 723 | ★★★★☆ | 系统设计，模块化，可扩展性 |

### Layer 2: 支撑概念

| 概念 | Topics数 | 核心理解 |
|------|---------|---------|
| **RL** | 3,691 | 强化学习，RLHF，PPO，DPO，reward modeling |
| **Vision** | 3,901 | 视觉理解，目标检测，图像生成 |
| **Diffusion** | 2,022 | 扩散模型，生成模型，score-based |
| **Optimization** | 1,960 | 模型压缩，量化，剪枝，推理优化 |
| **Evaluation** | 1,328 | 评估指标，benchmark，SOTA对比 |
| **Efficiency** | 27 | KV cache，FlashAttention，内存优化 |

### Layer 3: 专精概念

| 概念 | Topics数 | 核心理解 |
|------|---------|---------|
| **Transformer** | 1,996 | 注意力机制，位置编码，scaling |
| **Alignment** | 93 | AI对齐，RLHF，Constitutional AI |
| **Embodied** | 1,416 | 具身智能，机器人，Tactile感知 |
| **MoE** | 622 | 混合专家模型，稀疏激活 |
| **World-Model** | 3 | 世界模型，POMDP，规划 |
| **Multimodal** | 673 | 多模态融合，视觉-语言 |

### Layer 4: 基础/其他

| 概念 | Topics数 | 说明 |
|------|---------|------|
| **Theory** | 729 | 理论基础，算法分析 |
| **Continual** | 153 | 持续学习，灾难性遗忘 |
| **GAN** | 652 | 生成对抗网络 |
| **Other** | 644 | 未分类知识 |
| **Self-Supervised** | 28 | 自监督学习，contrastive |
| **VAE** | 14 | 变分自编码器 |
| **Meta-Learning** | 19 | 元学习，迁移学习 |

## Knowledge Distribution

```
                    Knowledge Mass Distribution
LLM           ████████████████████████████████ 9,935 (18.9%)
Agent         █████████████░░░░░░░░░░░░░░░░░░ 5,700 (10.9%)
Vision        ████████░░░░░░░░░░░░░░░░░░░░░░░ 3,901 (7.4%)
RL            ███████░░░░░░░░░░░░░░░░░░░░░░░░ 3,691 (7.0%)
Diffusion     ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2,022 (3.8%)
Reasoning     ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2,140 (4.1%)
Transformer   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1,996 (3.8%)
Optimization   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1,960 (3.7%)
Evaluation    ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1,328 (2.5%)
Embodied      ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1,416 (2.7%)
Memory        █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1,466 (2.8%)
Multi-Agent   █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 821 (1.6%)
```

## Top Connections (by weight)

| Edge | Weight | Interpretation |
|------|--------|----------------|
| LLM → Memory | 775 | 语言模型依赖持久记忆系统 |
| Agent → Multi-Agent | 582 | 单体Agent涌现多体协作 |
| Architecture → Multi-Agent | 565 | 架构设计决定多体能力上限 |
| LLM → Optimization | 540 | 优化目标驱动LLM性能 |
| Architecture → Diffusion | 540 | 架构创新推动生成模型 |
| Efficiency → Memory | 513 | 效率优化依赖记忆机制 |
| Efficiency → RL | 513 | 效率提升通过强化学习 |
| Embodied → Reasoning | 507 | 具身智能需要推理支撑 |
| Evaluation → Multi-Agent | 507 | 多Agent需要评估驱动 |
| Evaluation → Optimization | 501 | 评估指导优化方向 |

## Category Distribution

| Category | Topics | Share |
|----------|--------|-------|
| LLM/Transformer | 9,084 | 17.3% |
| 多Agent系统 | 4,195 | 8.0% |
| 视觉/生成模型 | 2,669 | 5.1% |
| 强化学习 | 1,455 | 2.8% |
| 优化/效率 | 1,331 | 2.5% |
| GitHub项目 | 78 | 0.15% |
| 其他 | 32,007 | 61.0% |

## GitHub Projects (深度知识)

| Project | Stars | Architecture |
|---------|-------|-------------|
| ruflo | 50K+ | 100+Agent编排+自学习memory+federation |
| phantom | 1,417 | AI同事+持久记忆+MCP服务器 |
| 724-office | 1,024 | 三层记忆+LanceDB+nudge激励+AI Mirror |
| vibecosystem | 485 | 138 Agent+295技能+73钩子 |
| SE-Agent | 271 | 3R轨迹演化(SWE-bench 80%) |
| memov | 188 | Git版本控制记忆 |

## Key Insights

### Self-Evolution Architecture
- **In-Place TTT**: 推理时权重更新
- **JitRL**: 即时RL
- **轨迹级演化**: Revision/Recombination/Refinement

### Memory System
- **三层架构**: 向量(LanceDB) → 文档 → Guide压缩
- **ADD-only**: 不覆盖，只累积
- **多信号检索**: 语义 + BM25 + 实体匹配

### Multi-Agent Collaboration
- **5阶段workflow**: scout → architect → dev → review → verify
- **Hook机制**: 上下文注入
- **自学习pipeline**: error → rule

### AI Safety/Alignment
- **RLHF**: SFT → reward model → PPO
- **Constitutional AI**: 原则驱动
- **DPO**: 直接偏好优化

## Knowledge Gaps

| Domain | Gap | Priority |
|--------|-----|---------|
| World-Model | 仅3条相关，薄弱 | 高 |
| Alignment | 仅93条，需深入 | 高 |
| Reasoning2 | 0条，需探索 | 中 |
| Meta-Learning | 仅19条，需加强 | 中 |
| Self-Supervised | 仅28条，需扩展 | 低 |

## Implementation

```python
class KnowledgeClassificationAnalyzer:
    """分析知识分类系统"""

    def get_layer_distribution(self) -> dict:
        """各层分布统计"""
        return {
            'layer1_core': sum([9935, 5700, 1466, 821, 2140, 723]),
            'layer2_support': sum([3691, 3901, 2022, 1960, 1328, 27]),
            'layer3_specialized': sum([1996, 93, 1416, 622, 3, 673]),
            'layer4_foundation': sum([729, 153, 28, 14, 19, 652, 644])
        }

    def identify_gaps(self) -> list:
        """识别知识缺口"""
        gaps = [[Self-Healing-Loop]]
        if self.topics['World-Model'] < 10:
            gaps.append(('World-Model', 'high'))
        if self.topics['Alignment'] < 100:
            gaps.append(('Alignment', 'high'))
        return gaps

    def find_weak_connections(self) -> list:
        """找到弱连接的概念对"""
        return sorted(
            self.connections,
            key=lambda x: x['weight']
        )[:10]
```

## Cross-refs

| Entity | Relationship |
|--------|--------------|
| [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] | 25节点44边结构化图谱 |
| [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] | 148条因果链 |
| [[knowledge/Karpathy-LLM-Wiki.m[[knowledge/Design-Toolkit]]] | Wiki模式的知识自组织 |
| [[concepts/2026-05-20_concept_knowledge-base.m[[knowledge/Design-Toolkit]]] | 311条知识总览 |
| [[memory/Mem0.m[[knowledge/Design-Toolkit]]] | 三层记忆架构实现 |
| [[ai/Agent-Economy.m[[knowledge/Design-Toolkit]]] | Agent经济发展研究 |

## Data Source

- `Claude-Work/knowledge_classification.md` — 52,513 topics原始分类