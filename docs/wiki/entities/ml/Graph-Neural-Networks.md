---
type: entity
category: ml
key: Graph Neural Networks
source: Claude-Evo ML research
date: 2026-05-17
layer: 4.0
---

# Graph Neural Networks - 图神经网络

## Overview
- **本质**: 直接在图结构数据上进行学习的神经网络
- **核心**: 节点表示学习、边预测、图级别任务
- **应用**: 社交网络、分子结构、知识图谱、推荐系统

## 核心模型

### 1. GCN (Graph Convolutional Network)
**论文**: "Semi-Supervised Classification with Graph Convolutional Networks" (2017) - Kipf & Welling

```python
import torch
import torch.nn.functional as F

class GraphConvLayer(torch.nn.Module):
    def __init__(self, in_features, out_features):
        super().__init__()
        self.linear = torch.nn.Linear(in_features, out_features)

    def forward(self, x, adj):
        # 邻接矩阵 + 自环
        adj = adj + torch.eye(adj.size(0), device=adj.device)
        # 度矩阵归一化
        d = adj.sum(dim=1)
        d_inv_sqrt = d ** -0.5
        d_inv_sqrt[d_inv_sqrt == float('inf')] = 0
        norm_adj = d_inv_sqrt.unsqueeze(-1) * adj * d_inv_sqrt.unsqueeze(-2)

        # 图卷积: H' = ReLU(D^-1/2 A D^-1/2 H W)
        x = self.linear(torch.matmul(norm_adj, x))
        return F.relu(x)

class GCN(torch.nn.Module):
    def __init__(self, in_features, hidden_features, out_features):
        super().__init__()
        self.conv1 = GraphConvLayer(in_features, hidden_features)
        self.conv2 = GraphConvLayer(hidden_features, out_features)

    def forward(self, x, adj):
        x = self.conv1(x, adj)
        x = self.conv2(x, adj)
        return x
```

### 2. GAT (Graph Attention Network)
**论文**: "Graph Attention Networks" (2018) - Veličković et al.

```python
import torch
import torch.nn.functional as F

class GraphAttentionLayer(torch.nn.Module):
    def __init__(self, in_features, out_features, heads=8, dropout=0.1):
        super().__init__()
        self.heads = heads
        self.out_features = out_features
        self.head_dim = out_features // heads

        self.W = torch.nn.Linear(in_features, heads * self.head_dim)
        self.attn = torch.nn.Parameter(torch.Tensor(1, heads, 2 * self.head_dim))
        self.dropout = dropout

        torch.nn.init.xavier_uniform_(self.attn)

    def forward(self, x, adj):
        # 线性变换
        x = self.W(x)  # (N, H * d_k)
        x = x.view(x.size(0), self.heads, self.head_dim)  # (N, H, d_k)

        # 扩展以计算成对注意力
        x_repeat = x.unsqueeze(2).repeat(1, 1, x.size(1), 1)  # (N, H, N, d_k)
        x_repeat_transpose = x_repeat.transpose(1, 2)         # (N, N, H, d_k)

        # 注意力分数
        concat = torch.cat([x_repeat, x_repeat_transpos[[Self-Healing-Loop]], dim=-1)  # (N, N, H, 2*d_k)
        attn_scores = torch.matmul(concat, self.attn).squeeze(-2)   # (N, N, H)
        attn_scores = F.leaky_relu(attn_scores, 0.2)

        # Mask填充位置
        masked = attn_scores.masked_fill(adj == 0, float('-inf'))
        attn_weights = F.softmax(masked, dim=2)  # (N, N, H)
        attn_weights = F.dropout(attn_weights, p=self.dropout, training=self.training)

        # 聚合邻居
        output = torch.matmul(attn_weights, x.transpose(1, 2)).transpose(1, 2)
        return output.reshape(x.size(0), -1)

class GAT(torch.nn.Module):
    def __init__(self, in_features, hidden_features, out_features, heads=8):
        super().__init__()
        self.attn1 = GraphAttentionLayer(in_features, hidden_features, heads=heads)
        self.attn2 = GraphAttentionLayer(hidden_features, out_features, heads=1)

    def forward(self, x, adj):
        x = self.attn1(x, adj)
        x = F.elu(x)
        x = self.attn2(x, adj)
        return x
```

### 3. GraphSAGE (Inductive Learning)
**论文**: "Inductive Representation Learning on Large Graphs" (2017) - Hamilton et al.

```python
class GraphSAGE(torch.nn.Module):
    def __init__(self, in_features, hidden_features, out_features):
        super().__init__()
        self.sage1 = SAGEConv(in_features, hidden_features, agg='mean')
        self.sage2 = SAGEConv(hidden_features, out_features, agg='mean')

    def forward(self, x, adj):
        x = self.sage1(x, adj)
        x = F.relu(x)
        x = self.sage2(x, adj)
        return x

# 核心: 邻居聚合方式
class SAGEConv(torch.nn.Module):
    def __init__(self, in_features, out_features, agg='mean'):
        super().__init__()
        self.agg = agg
        self.linear = torch.nn.Linear(in_features, out_features)

    def forward(self, x, adj):
        # 聚合邻居表示
        neighbor_repr = torch.matmul(adj.float(), x)  # (N, N) @ (N, F) -> (N, F)
        degree = adj.sum(dim=1, keepdim=True)          # (N, 1)
        neighbor_repr = neighbor_repr / degree.clamp(min=1)  # 归一化

        # 拼接 + 线性变换
        combined = torch.cat([x, neighbor_rep[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]], dim=1)
        return self.linear(combined)
```

## 消息传递机制

```
┌─────────────────────────────────────────────────────────────┐
│                  GNN 消息传递框架                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  节点 v 的表示更新:                                          │
│                                                             │
│  1. Message: m_v^(l) = f_msg(h_v^(l), h_u^(l), e_uv)      │
│                      ↑                                     │
│                  聚合邻居信息                                │
│                                                             │
│  2. Aggregate: m_v^(l+1) = f_agg(m_v^(l) for u in N(v))   │
│                      ↑                                     │
│                  聚合多个邻居                                │
│                                                             │
│  3. Update:   h_v^(l+1) = f_update(h_v^(l), m_v^(l+1))    │
│                      ↑                                     │
│                  更新中心节点                                │
│                                                             │
│  图级别输出:                                                │
│  4. Readout:  y = f_readout(h_v^(L) for v in V)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 聚合方式 | 方法 | 适用场景 |
|----------|------|----------|
| Mean | 取邻居均值 | 同构图 |
| Max | 取邻居最大值 | 特征选择 |
| Add | 邻居求和 | 表达能力更强 |
| Attention | 加权聚合 | 异构图/异构边 |
| LSTM | 序列聚合 | 有序邻居 |

## 模型对比

| 模型 | 复杂度 | 特点 | 适用场景 |
|------|--------|------|----------|
| GCN | O(K·E·F) | 谱域方法，需要全局图 | 小型同构图 |
| GAT | O(K·E·h·d) | 注意力机制 | 异构图/重要节点 |
| GraphSAGE | O(K·E·F) | 归纳式，可扩展 | 大规模图/新节点 |
| GIN | O(K·E·F) | 1-WL test表达能力 | 分类任务 |

## 应用场景

### 1. 知识图谱
- **任务**: 链接预测、实体分类
- **代表模型**: R-GCN, CompGCN, KBGAN
- **应用**: 问答系统、推荐

### 2. 分子结构 (化学)
- **任务**: 分子属性预测、药物发现
- **数据**: SMILES、MoleculeNet
- **代表**: Chemprop, NIPS

### 3. 社交网络
- **任务**: 用户分类、社区检测
- **特征**: 社交图谱、交互行为
- **应用**: 好友推荐、虚假账号检测

### 4. 推荐系统
- **任务**: 用户-物品交互建模
- **代表**: NGCF, LightGCN, IGCCF
- **应用**: 电商、视频平台

## 经典论文引用

| 论文 | 年份 | 引用 | 贡献 |
|------|------|------|------|
| Semi-Supervised Classification with GCN | 2017 | 45k+ | 谱域GCN基础 |
| Graph Attention Networks | 2018 | 25k+ | 注意力机制引入 |
| Inductive Representation Learning on Large Graphs | 2017 | 18k+ | GraphSAGE归纳学习 |
| How Powerful are Graph Neural Networks? | 2019 | 8k+ | GIN, WL test |
| Message Passing Neural Networks | 2020 | 5k+ | 统一框架 |
| GNN for Large-Scale Recommender Systems | 2021 | 2k+ | LightGCN |

## Cross-refs
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 知识图谱嵌入与GNN结合
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 图嵌入是节点向量化表示
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — GNN用于知识图谱增强RAG
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — 智能RAG中的图结构检索
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 因果图神经网络
- [[ml/Vector-DB.m[[knowledge/Design-Toolkit]]] — 图数据可存储于向量数据库
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — Transformers vs GNNs架构对比
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — MoE与GNN的结合探索