---
type: entity
category: ml
key: Graph-of-Thoughts
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
---

# Graph-of-Thoughts (GoT) - 思维图

## Overview

- **全称**: Graph-of-Thoughts Reasoning
- **本质**: 将推理过程建模为图结构，节点=思维单元，边=推理关系
- **论文**: "Graph of Thoughts: Reasoning with LLMs" (Besta et al., 2023)
- **核心思想**: 思维不是链，而是网 — 支持聚合、变换、循环

## 概念对比

### 思维演进路径

```
Chain-of-Thought (线性链)
    ↓
Tree-of-Thoughts (树状分支)
    ↓
Graph-of-Thoughts (图状网络)
```

| 维度 | CoT | ToT | GoT |
|------|-----|-----|-----|
| **结构** | 线性链 | 树状分支 | 图状网络 |
| **灵活性** | 固定顺序 | 每步多选 | 任意连接 |
| **适用场景** | 简单推理 | 探索决策 | 复杂推理网络 |
| **聚合能力** | 无 | 有限 | 强大 |
| **循环支持** | 无 | 无 | 支持 |

## 核心机制

### 图结构要素

```
┌─────────────────────────────────────────────────────────────┐
│                      Graph of Thoughts                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│       [Idea1] ──→ [Idea2]                                   │
│           │           │                                      │
│           ↓           ↓                                      │
│       [Idea3] ←── [Idea4] ←── [Idea5]                        │
│           │                                               │
│           ↓                                                │
│       [Idea6] ──→ [Idea7]                                   │
│                                                              │
│   聚合(Aggregation): 融合多个输入的想法                      │
│   变换(Transform): 状态转换/深化                             │
│   评分(Evaluation): 节点质量评估                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 节点类型

| 节点类型 | 符号 | 说明 |
|----------|------|------|
| **Thought Node** | `[T]` | 思维单元，承载推理内容 |
| **Aggregation Node** | `[Σ]` | 聚合多个输入思维 |
| **Transform Node** | `[→]` | 状态转换/深化 |
| **Judgment Node** | `[★]` | 质量评估/打分 |

### 边类型

| 边类型 | 符号 | 说明 |
|--------|------|------|
| **推理边** | `─→` | 因果推导关系 |
| **聚合边** | `─+─` | 合并多个输入 |
| **反馈边** | `←──` | 回溯/反思循环 |
| **并行边** | `═` | 同时处理多个分支 |

## 操作原语

### 1. 聚合 (Aggregation)

将多个思维节点合并为一个：

```python
def aggregate(thoughts: List[Though[[knowledge/Design-Toolkit]], strategy: str = "concat") -> Thought:
    """
    聚合多个思维节点
    
    strategies:
    - concat: 直接拼接
    - weighted: 加权融合
    - consensus: 共识提炼
    """
    if strategy == "concat":
        return Thought(content=" + ".join(t.content for t in thoughts))
    elif strategy == "consensus":
        # 提取共同点
        common = extract_common_pattern(thoughts)
        return Thought(content=common)
```

### 2. 变换 (Transform)

状态转换与深化：

```python
def transform(thought: Thought, operation: str) -> Thought:
    """
    思维状态变换
    
    operations:
    - expand: 展开细节
    - compress: 提炼精华
    - deepen: 深入分析
    - lateral: 横向联想
    """
    if operation == "expand":
        return Thought(content=expand_details(thought.content))
    elif operation == "deepen":
        return Thought(content=deeper_analysis(thought.content))
```

### 3. 评分 (Evaluation)

节点质量评估：

```python
def evaluate(thought: Thought, criteria: Dict) -> float:
    """
    评估思维节点质量
    
    criteria:
    - coherence: 连贯性
    - novelty: 创新性
    - relevance: 相关性
    - completeness: 完整性
    """
    score = 0.0
    for key, weight in criteria.items():
        score += weight * score_dimension(thought, key)
    return score
```

## 架构图

### 完整GoT推理流程

```
问题输入
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    初始思维生成                             │
│              [Root Thought - 问题理解]                       │
└─────────────────────────────────────────────────────────────┘
    │
    ├──→ [分解] ──→ [子思维1] ──→ [聚合] ──→ [深化]
    │                    │                    │
    │                    └─→ [子思维2] ──┘    │
    │                    │                    │
    │                    └─→ [子思维3] ──┘    ▼
    │                                      [评分节点]
    │                                           │
    ├──→ [探索] ──→ [新方向1] ──→ [反馈] ──→ [循环优化]
    │                    │
    │                    └─→ [新方向2]
    │
    └──→ [回溯] ──→ [修正] ──→ [整合]
                              │
                              ▼
                    ┌─────────────────┐
                    │   最终答案输出   │
                    └─────────────────┘
```

## 实现代码

### 基础GoT推理器

```python
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum

class NodeType(Enum):
    THOUGHT = "thought"
    AGGREGATION = "aggregation"
    TRANSFORM = "transform"
    EVALUATION = "evaluation"

@dataclass
class ThoughtNode:
    id: str
    content: str
    node_type: NodeType
    score: float = 0.0
    parent_ids: List[st[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] = field(default_factory=list)
    child_ids: List[st[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)

class GraphOfThoughts:
    def __init__(self):
        self.nodes: Dict[str, ThoughtNod[[Self-Healing-Loop]] = {}
        self.edges: List[tupl[[Self-Healing-Loop]] = [[Self-Healing-Loop]]
    
    def add_node(self, node: ThoughtNode):
        self.nodes[node.i[[knowledge/Design-Toolkit]] = node
    
    def add_edge(self, from_id: str, to_id: str, edge_type: str = "reasoning"):
        self.nodes[from_i[[knowledge/Design-Toolkit]].child_ids.append(to_id)
        self.nodes[to_i[[knowledge/Design-Toolkit]].parent_ids.append(from_id)
        self.edges.append((from_id, to_id, edge_type))
    
    def aggregate(self, node_ids: List[st[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]], strategy: str = "concat") -> ThoughtNode:
        """聚合多个节点"""
        source_nodes = [self.nodes[ni[[knowledge/Design-Toolkit]] for nid in node_id[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
        
        if strategy == "concat":
            content = " | ".join(n.content for n in source_nodes)
        elif strategy == "consensus":
            content = self._extract_consensus(source_nodes)
        else:
            content = " | ".join(n.content for n in source_nodes)
        
        new_node = ThoughtNode(
            id=f"agg_{len(self.nodes)}",
            content=content,
            node_type=NodeType.AGGREGATION
        )
        for nid in node_ids:
            self.add_edge(nid, new_node.id)
        self.add_node(new_node)
        return new_node
    
    def transform(self, node_id: str, operation: str) -> ThoughtNode:
        """变换节点状态"""
        source = self.nodes[node_i[[knowledge/Design-Toolkit]]
        
        if operation == "expand":
            content = f"展开: {source.content}"
        elif operation == "deepen":
            content = f"深入分析: {source.content}"
        else:
            content = source.content
        
        new_node = ThoughtNode(
            id=f"tra_{len(self.nodes)}",
            content=content,
            node_type=NodeType.TRANSFORM
        )
        self.add_edge(node_id, new_node.id)
        self.add_node(new_node)
        return new_node
    
    def evaluate(self, node_id: str) -> float:
        """评估节点质量"""
        node = self.nodes[node_i[[knowledge/Design-Toolkit]]
        # 简单评分：内容长度 + 子节点数量
        score = len(node.content) / 100 + len(node.child_ids) * 0.1
        node.score = min(score, 1.0)
        return node.score
    
    def get_best_path(self, root_id: str) -> List[st[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]:
        """回溯最优路径"""
        path = [[Self-Healing-Loop]]
        current = root_id
        while current:
            path.append(current)
            children = self.nodes[curren[[knowledge/Design-Toolkit]].child_ids
            if not children:
                break
            # 选择评分最高的子节点
            current = max(children, key=lambda x: self.nodes[x].score)
        return path
```

### GoT推理示例

```python
def solve_with_got(llm, problem: str):
    got = GraphOfThoughts()
    
    # 1. 初始化根节点
    root = got.add_node(ThoughtNode(
        id="root",
        content=problem,
        node_type=NodeType.THOUGHT
    ))
    
    # 2. 分解问题
    sub_thoughts = llm.generate(f"将以下问题分解为3个子问题:\n{problem}")
    for i, sub in enumerate(sub_thoughts.split("\n")):
        got.add_node(ThoughtNode(
            id=f"sub_{i}",
            content=sub,
            node_type=NodeType.THOUGHT
        ))
        got.add_edge("root", f"sub_{i}")
    
    # 3. 并行求解子问题
    for i in range(3):
        result = llm.generate(f"分析: {got.nodes[f'sub_{i}'].content}")
        got.add_node(ThoughtNode(
            id=f"result_{i}",
            content=result,
            node_type=NodeType.THOUGHT
        ))
        got.add_edge(f"sub_{i}", f"result_{i}")
    
    # 4. 聚合结果
    agg = got.aggregate([f"result_{i}" for i in range(3)], strategy="consensus")
    
    # 5. 变换深化
    final = got.transform(agg.id, operation="deepen")
    
    # 6. 评分选择
    best_path = got.get_best_path("root")
    
    return got.nodes[best_path[-1]].content
```

## 与ToT对比

### 核心差异

| 维度 | Tree-of-Thoughts | Graph-of-Thoughts |
|------|-------------------|-------------------|
| **结构** | 树状分层 | 图状网络 |
| **分支** | 每步固定分支数 | 动态分支 |
| **合并** | 无法合并分支 | 支持多路聚合 |
| **循环** | 单向无回溯 | 支持反馈循环 |
| **适用** | 探索性决策 | 复杂推理网络 |
| **实现** | 相对简单 | 复杂度高 |

### ToT局限性与GoT优势

```
ToT问题:
- 分支无法合并，造成信息冗余
- 无法表达"多路汇聚"的推理模式
- 缺乏回溯机制，错误无法修正

GoT优势:
- 聚合节点支持多路输入合并
- 反馈边支持循环优化
- 图结构更灵活表达复杂推理
```

## 应用场景

### 1. 复杂问题分解

```
问题: 分析2024年新能源汽车市场趋势

GoT推理:
[市场分析] ──→ [政策环境] ──→ [聚合] ──→ [趋势预测]
                │                              │
                ├──→ [技术发展] ──┤              │
                │                │              │
                ├──→ [竞争格局] ──┴──[深度分析]─→ [结论]
                │                              │
                └──→ [消费者行为] ──┘
```

### 2. 多角度分析

```
问题: 评估AI对就业的影响

GoT推理:
[就业影响] ──→ [正面: 新岗位创造]
                │
                ├──→ [负面: 岗位替代] ──→ [聚合] ──→ [综合评估]
                │                              ↑
                ├──→ [中性: 转型需求] ─────────┘
                │
                └──→ [长期: 技能重塑] ───────────┘
```

### 3. 代码调试

```python
# GoT辅助代码调试
debug_graph = GraphOfThoughts()

# 节点: 错误分析
debug_graph.add_node(ThoughtNode(
    id="error",
    content="IndexError in line 42",
    node_type=NodeType.THOUGHT
))

# 分解: 可能原因
debug_graph.add_node(ThoughtNode(
    id="cause_1",
    content="数组越界访问",
    node_type=NodeType.THOUGHT
))
debug_graph.add_node(ThoughtNode(
    id="cause_2",
    content="索引计算错误",
    node_type=NodeType.THOUGHT
))

# 验证: 添加测试假设
debug_graph.add_node(ThoughtNode(
    id="test_1",
    content="添加边界检查后错误消失",
    node_type=NodeType.THOUGHT
))

# 聚合验证结果
debug_graph.aggregate(["cause_1", "test_1"], strategy="consensus")
```

## 变体

### 1. Reasoning on Graphs (RoG)

- **特点**: 在图上进行推理传播
- **论文**: Fang et al., 2024
- **优势**: 显式建模实体关系

### 2. Omni-Grounded GoT

- **特点**: 多模态思维图
- **应用**: 图文联合推理

### 3. Spiral of Thought

- **特点**: 螺旋上升式推理
- **应用**: 创造性问题解决

## Cross-refs

- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — CoT是GoT的基础，线性链式思维
- [[ml/Tree-of-Thoughts.m[[knowledge/Design-Toolkit]]] — ToT是GoT的简化版本，树状分支思维
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 推理+行动模式，可与GoT结合
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent驱动RAG中的多跳推理
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 底层架构支撑复杂推理
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 声明式prompt优化，可编译GoT
- [[ml/Self-RAG.m[[knowledge/Design-Toolkit]]] — 自我反思RAG，与GoT的反馈机制相通