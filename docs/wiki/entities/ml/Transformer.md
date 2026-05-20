---
type: entity
category: ml
key: Transformer
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# Transformer - 注意力机制架构

## Overview
- **论文**: "Attention Is All You Need" (2017)
- **作者**: Vaswani et al., Google
- **地位**: 现代NLP基石，GPT/LLaMA/BERT基础

## 核心架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Transformer 编码器                           │
└─────────────────────────────────────────────────────────────────┘

输入Embedding + 位置编码
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    多头自注意力层 (Multi-Head Attention)        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │ Head 1  │ │ Head 2  │ │ Head h  │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
│         ↓            ↓            ↓                           │
│         └────────────┼────────────┘                          │
│                      ↓                                          │
│               线性 + 残差 + LayerNorm                          │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      前馈网络 (FFN)                            │
│         Linear → ReLU → Linear → 残差 + LayerNorm            │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
    输出 (N层堆叠)
```

## 核心组件

### 1. 自注意力机制 (Self-Attention)

```python
# 缩放点积注意力
def attention(Q, K, V, d_k):
    scores = torch.matmul(Q, K.transpose(-2, -1)) / sqrt(d_k)
    weights = softmax(scores, dim=-1)
    return torch.matmul(weights, V)

# Q, K, V 来源
Q = X @ W_q  # 查询
K = X @ W_k  # 键
V = X @ W_v  # 值
```

### 2. 多头注意力 (Multi-Head Attention)

```python
class MultiHeadAttention:
    def __init__(self, h=8, d_model=512):
        self.h = h
        self.d_k = d_model // h

        self.W_q = Linear(d_model, d_model)
        self.W_k = Linear(d_model, d_model)
        self.W_v = Linear(d_model, d_model)
        self.W_o = Linear(d_model, d_model)

    def forward(self, X):
        # 分头计算
        Q = self.split_heads(self.W_q(X))
        K = self.split_heads(self.W_k(X))
        V = self.split_heads(self.W_v(X))

        # 注意力
        attn = attention(Q, K, K, self.d_k)

        # 合并输出
        output = self.W_o(self.merge_heads(attn))
        return output
```

### 3. 位置编码 (Positional Encoding)

| 类型 | 方法 | 说明 |
|------|------|------|
| 绝对位置 | Sin/Cos正弦编码 | 原始Transformer |
| 相对位置 | Relative Position Embedding | BERT使用 |
| RoPE | Rotary Position Embedding | LLaMA/GPT使用 |
| ALiBi | 线性偏置 | 无需显式编码 |

```python
# 绝对位置编码 (Transformer原始)
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

### 4. 前馈网络 (FFN)

```python
class FeedForward:
    def __init__(self, d_model=512, d_ff=2048):
        self.linear1 = Linear(d_model, d_ff)
        self.linear2 = Linear(d_ff, d_model)

    def forward(self, x):
        return self.linear2(F.gelu(self.linear1(x)))
```

## 变体架构

### Encoder-Only (BERT)
```
Input → [CL[[Self-Healing-Loop]] Token → Encoder × N → Classifier
```
- 适合: 分类、序列标注
- 代表: BERT, RoBERTa, ALBERT

### Decoder-Only (GPT)
```
Input → Token → Decoder × N → Output
```
- 适合: 生成任务
- 代表: GPT-2/3/4, LLaMA, ChatGPT

### Encoder-Decoder (T5)
```
Input → Encoder × N → Decoder × N → Output
```
- 适合: 序列到序列
- 代表: T5, BART, FLAN-T5

## 关键技术

### 残差连接 (Residual Connection)
```python
output = LayerNorm(x + Attention(x))
output = LayerNorm(output + FFN(output))
```

### Layer Normalization
```python
# 原始
LayerNorm(x) = γ * (x - μ) / σ + β

# RMSNorm (更高效)
RMSNorm(x) = γ * x / RMS(x)
```

### 注意力变体

| 类型 | 复杂度 | 适用场景 |
|------|--------|----------|
| 完整注意力 | O(n²) | 标准场景 |
| Flash Attention | O(n²) 但高效 | 长序列 |
| Sparse Attention | O(n√n) | 超长序列 |
| Linear Attention | O(n) | 超长生成 |

## 现代大模型架构

### GPT系列
```
Token Embedding → LayerNorm → Transformer Block × N → LM Head
                                              ↑
                                     旋转位置编码 (RoPE)
```

### LLaMA创新
- RoPE (旋转位置编码)
- RMSNorm
- SwiGLU激活函数
- 注意力机制优化

### MoE扩展
```
┌─────────────────────────────────────┐
│          MoE Transformer            │
├─────────────────────────────────────┤
│  Gate Network → Top-K Expert Selection│
│                                     │
│  Expert 1 ──→                     │
│  Expert 2 ──┼──→ Output           │
│  Expert 3 ──→                     │
│  ...                                │
└─────────────────────────────────────┘
```

## 训练技巧

| 技术 | 作用 |
|------|------|
| 混合精度 | 减少显存 |
| 梯度累积 | 增加有效batch |
| Flash Attention | 加速+省显存 |
| ZeRO优化 | 分布式训练 |

## Cross-refs
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — 混合专家模型
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低秩适配微调
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 基于Transformer的对齐
- [[ml/World-Models.m[[knowledge/Design-Toolkit]]] — Transformer用于世界模型
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Transformer架构支撑RAG
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 向量检索与Transformer结合