---
type: entity
category: ml
key: MoE
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# MoE - Mixture of Experts

## 概述
- **论文**: "Outrageously Large Neural Networks" (2017, Shazeer et al.)
- **地位**: Sparse激活的大模型效率优化方案
- **代表**: Mixtral 8x7B, DeepSeek-MoE, GLaM, Switch Transformer

## 核心原理

### 稀疏激活机制
```python
class MoELayer(torch.nn.Module):
    def __init__(self, d_model, n_experts, top_k):
        super().__init__()
        self.n_experts = n_experts
        self.top_k = top_k

        # 门控网络 (Router)
        self.gate = torch.nn.Linear(d_model, n_experts, bias=False)

        # 专家网络
        self.experts = torch.nn.ModuleList([
            FeedForwardNetwork(d_model, d_ff) for _ in range(n_experts)
       [[Self-Healing-Loop]])

    def forward(self, x):
        """
        x: [batch, seq_len, d_mode[[Self-Healing-Loop]]
        """
        # 1. 门控计算
        gate_logits = self.gate(x)  # [batch, seq_len, n_expert[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]

        # 2. Top-K选择
        weights, indices = torch.topk(gate_logits, self.top_k, dim=-1)
        weights = torch.softmax(weights, dim=-1)

        # 3. 稀疏激活
        output = torch.zeros_like(x)
        for i, expert in enumerate(self.experts):
            # 每个expert只处理被选中的token
            mask = (indices == i)
            if mask.any():
                batch_idx, seq_idx = mask.nonzero(as_tuple=True)
                expert_output = expert(x[batch_idx, seq_idx])
                output[batch_idx, seq_idx] = expert_output * weights[batch_idx, seq_idx, :self.top_k].gather(1, (indices[batch_idx, seq_idx] == i).long().unsqueeze(-1)).squeeze(-1)

        return output
```

### 关键数学

**门控函数**:
```
G(x) = TopK(Softmax(W_g x))
```

**输出计算**:
```
MoE(x) = Σ_{i=1}^{K} G_i(x) · E_i(x)
```
其中 K 是激活的专家数，E_i 是第 i 个专家网络。

## 代码示例

### Switch Transformer (Google, 2022)
```python
class SwitchLayer(torch.nn.Module):
    """
    Switch Transformer: 简化版，每个token只路由到一个专家
    极度稀疏激活，节省计算
    """

    def __init__(self, d_model=768, n_experts=8, capacity_factor=1.0):
        super().__init__()
        self.gate = torch.nn.Linear(d_model, n_experts)
        self.experts = torch.nn.ModuleList([FeedForwardNetwork() for _ in range(n_experts)])
        self.capacity_factor = capacity_factor

    def forward(self, x):
        # 门控分数
        gate_logits = self.gate(x)
        weights = torch.softmax(gate_logits, dim=-1)

        # 每个token选择最可能的专家
        route = torch.argmax(weights, dim=-1)

        # 容量检查
        capacity = int(len(x) * self.capacity_factor)
        output = torch.zeros_like(x)

        for expert_id in range(len(self.experts)):
            expert_mask = (route == expert_id)
            expert_tokens = expert_mask.sum().item()

            if expert_tokens == 0:
                continue

            # 容量溢出处理
            if expert_tokens > capacity:
                indices = expert_mask.nonzero(as_tuple=True)[0][:capacity]
                expert_mask.zero_()
                expert_mask[indice[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] = True

            if expert_mask.any():
                output[expert_mask] = self.experts[expert_i[[knowledge/Design-Toolkit]](x[expert_mask])

        return output
```

### Mixtral 8x7B 实现
```python
class MixtralBlock(torch.nn.Module):
    """
    Mixtral 8x7B: 8个专家，激活2个
    类似于MoE但每个token只激活top-2专家
    """

    def __init__(self, d_model=4096, n_heads=32, n_experts=8, top_k=2):
        super().__init__()
        self.attn = MultiHeadAttention(d_model, n_heads)
        self.moe = MoELayer(d_model, n_experts, top_k)

    def forward(self, x):
        # Self-attention
        x = x + self.attn(self.norm(x))
        # MoE FFN
        x = x + self.moe(self.norm(x))
        return x
```

### DeepSeek-MoE 细粒度专家
```python
class DeepSeekMoE(torch.nn.Module):
    """
    DeepSeek-MoE: 细粒度专家划分 + 共享专家
    """

    def __init__(self, d_model=4096, n_experts=64, n_shared=2, top_k=2):
        super().__init__()
        # 细粒度专家：更多小专家
        self.experts = torch.nn.ModuleList([
            SmallFeedForwardNetwork(d_model, d_ff//n_experts)
            for _ in range(n_experts)
       [[Self-Healing-Loop]])
        # 共享专家：始终激活
        self.shared_experts = torch.nn.ModuleList([
            FeedForwardNetwork(d_model, d_ff)
            for _ in range(n_shared)
       [[Self-Healing-Loop]])

    def forward(self, x):
        # 共享专家始终参与
        output = sum(expert(x) for expert in self.shared_experts)

        # 细粒度专家选择
        gate_logits = self.gate(x)
        weights, indices = torch.topk(gate_logits, self.top_k, dim=-1)

        for i in range(self.top_k):
            expert_id = indices[:, :, [[Self-Healing-Loop]]
            expert_weight = weights[:, :, [[Self-Healing-Loop]]
            output += self.experts[expert_i[[knowledge/Design-Toolkit]](x) * expert_weight.unsqueeze(-1)

        return output
```

## 变体

### 1. GShard (Google)
- Expert Parallelism: 专家跨设备分布
- Auxiliary-loss-free负载均衡

### 2. ST-MoE
- Stable Training: 用ROUTING-BALANCE解决负载不均
- Freeze and DExperts: 部分层用密集模型

### 3. Mixtral vs DeepSeek
| 特性 | Mixtral | DeepSeek-MoE |
|------|---------|--------------|
| 专家数 | 8 | 64细粒度+2共享 |
| 激活数 | 2 | 2 |
| 专家结构 | 标准FFN | 小FFN+共享FFN |
| 负载均衡 | Auxiliary Loss | Auxiliary-loss-free |

## 适用场景

| 场景 | 模型 | 优势 |
|------|------|------|
| 预训练大模型 | Switch Transformer | 参数量大但计算量小 |
| 微调 | LoRA+MoE | 多任务专家 |
| 推理加速 | Mixtral | 高效稀疏激活 |
| 多任务 | DeepSeek-MoE | 专家专业化 |

## 与其他方法对比

| 维度 | MoE | Dense | LoRA | Model Compression |
|------|-----|-------|------|-------------------|
| 参数量 | 大 | 等效大 | 小 | 小 |
| 计算量 | 稀疏激活 | 全激活 | 少量 | 量化/剪枝 |
| 显存 | 中 | 高 | 低 | 低 |
| 训练效率 | 高 | 低 | 高 | 高 |
| 微调成本 | 中 | 高 | 低 | 低 |
| 适用场景 | 大模型基础 | 小模型 | 微调 | 部署 |

## Cross-refs
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — MoE通常基于Transformer
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩技术
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低成本微调方法
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — MoE模型对齐
- [[ml/Continual-Learning.m[[knowledge/Design-Toolkit]]] — MoE用于持续学习
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 专家选择可编程