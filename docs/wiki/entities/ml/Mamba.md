---
type: entity
category: ml
key: Mamba
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
---

# Mamba - 选择性状态空间模型

## Overview
- **论文**: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces" (2023/2024)
- **作者**: Albert Gu, Tri Dao, CMU
- **地位**: Transformer的高效替代品，线性时间复杂度处理长序列
- **开源**: https://github.com/state-spaces/mamba

## 核心机制

### 1. 状态空间模型 (SSM)

```
┌─────────────────────────────────────────────────────────────┐
│                    状态空间模型流程                          │
└─────────────────────────────────────────────────────────────┘

输入序列 u(t) ──→ [ B[[Self-Healing-Loop]] ──→ ┌────────────────────┐
                           │  x'(t) = A·x(t) + B·u(t)  │
                           │  y(t) = C·x(t) + D·u(t)  │
                           └────────────────────┘
                                         │
                                         ▼
                                   输出序列 y(t)

其中:
A: 状态转移矩阵 (n×n)
B: 输入矩阵 (n×1)
C: 输出矩阵 (1×n)
D: 直通矩阵 (skip connection)
```

### 2. 连续形式到离散形式

**连续微分方程:**
```
x'(t) = A · x(t) + B · u(t)
y(t) = C · x(t) + D · u(t)
```

**离散化 (Zero-Order Hold):**
```
Δ: 离散时间步长
A_k = exp(A · Δ)
B_k = (exp(A · Δ) - I) · A^{-1} · B

x_k = A_k · x_{k-1} + B_k · u_{k-1}
y_k = C_k · x_k + D_k · u_k
```

### 3. 选择性扫描机制 (Selective Scan)

Mamba的核心创新：让B、C、Δ变成输入依赖的函数，而不是固定参数。

```python
# 选择性SSM vs 标准SSM

# 标准SSM (无选择性)
B = W_b  # 固定参数
C = W_c  # 固定参数

# 选择性SSM (Mamba)
B = Linear(X)  # 输入依赖
C = Linear(X)  # 输入依赖
Δ = σ(Linear(X))  # 动态时间步长
```

**选择机制的作用:**
| 机制 | 功能 | 效果 |
|------|------|------|
| 选择性B | 决定当前输入对状态的影响程度 | 过滤无关信息 |
| 选择性C | 决定从状态中提取什么信息 | 自适应输出 |
| 选择性Δ | 动态调整离散化步长 | 长短Token差异处理 |

### 4. 硬件感知算法

通过并行扫描 (Parallel Scan) 在GPU上高效执行SSM：

```
传统RNN: x_k = A_k · x_{k-1} + B_k · u_{k-1}
         ↓ 顺序计算，无法并行

Mamba并行扫描:
    初始化: 隐藏状态分割为多个chunk
    并行扫描: 多个chunk同时计算
    时间复杂度: O(L/seq_par) 而不是 O(L)
```

## 数学推导

### 完整前向传播

```python
def mamba_block(x):
    # 1. 输入投影
    xb = Linear(x)           # 局部响应
    xz = Linear(x)           # 门控信号

    # 2. 选择性参数
    B = Linear(xb)           # (batch, seq, d_state)
    C = Linear(xb)           # (batch, seq, d_state)
    Δ = softplus(Linear(xz)) # (batch, seq, d_model)

    # 3. 离散化
    A = -exp(Linear(x))      # 确保稳定
    B = B * Δ
    y = selective_scan(x, A, B, C, Δ)

    # 4. 输出投影
    return Linear(y)
```

### 选择性扫描伪代码

```python
def selective_scan(u, A, B, C, Δ):
    """
    u: (batch, seq, d_model) - 输入
    A: (d_state, d_state)    - 状态转移矩阵
    B: (batch, seq, d_state) - 输入矩阵 (选择性)
    C: (batch, seq, d_state) - 输出矩阵 (选择性)
    Δ: (batch, seq)          - 时间步长 (选择性)
    """
    batch, seq, d_model = u.shape
    d_state = A.shape[0]

    # 离散化
    A_bar = exp(A * Δ)       # (d_state, d_state) per step
    B_bar = B * Δ.unsqueeze(-1)  # (batch, seq, d_state)

    # 并行扫描 (类似前缀和)
    # 将递归转换为并行计算
    x = zeros((batch, d_state))
    ys = [[Self-Healing-Loop]]

    for i in range(seq):
        x = A_bar[[[Self-Healing-Loop]] @ x + B_bar[[[Self-Healing-Loop]] @ u[:, [[Self-Healing-Loop]]
        y = C[:, [[Self-Healing-Loop]] @ x
        ys.append(y)

    return stack(ys, dim=1)
```

## 与Transformer对比

| 维度 | Mamba | Transformer | 说明 |
|------|-------|-------------|------|
| 时间复杂度 | O(n) | O(n²) | Mamba对长序列更友好 |
| 空间复杂度 | O(n) | O(n²) | 注意力矩阵存储 |
| 推理速度 | 快 | 慢 | Mamba无KV-cache瓶颈 |
| 长序列处理 | 原生支持 | 需要优化 | Mamba线性增长 |
| 表达能力 | 略低 | 更高 | Transformer全局注意力 |
| 硬件利用率 | 高 | 中等 | Mamba利用并行扫描 |

### Mamba优势场景

```
长序列处理 (L > 10k):
  Transformer: O(n²) → 内存爆炸
  Mamba: O(n) → 可处理百万Token

生成任务:
  Transformer: 需要KV-cache，内存随生成长度增长
  Mamba: 固定状态大小，推理更快

资源受限场景:
  Mamba: 只需少量内存
  Transformer: 需要大量GPU显存
```

## 代码示例

### 基础使用

```python
# 安装: pip install mamba-ssm

from mamba_ssm import MambaLM

# 加载预训练模型
model = MambaLM.from_pretrained("state-spaces/mamba-1.4b")

# 生成
output = model.generate(
    input_ids,
    max_new_tokens=100,
    temperature=0.9,
    top_p=0.9
)
```

### 自定义SSM层

```python
import torch
from mamba_ssm.ops.selective_scan import selective_scan

class CustomMambaBlock(torch.nn.Module):
    def __init__(self, d_model, d_state=16):
        super().__init__()
        self.d_model = d_model
        self.d_state = d_state

        # 输入投影
        self.x_proj = torch.nn.Linear(d_model, d_model * 2)
        self.dt_proj = torch.nn.Linear(d_model, d_model)

        # SSM参数
        self.A = torch.nn.Parameter(torch.randn(d_state, d_model))
        self.D = torch.nn.Parameter(torch.ones(d_model))

        # 输出投影
        self.output_proj = torch.nn.Linear(d_model, d_model)

    def forward(self, x):
        batch, seq, dim = x.shape

        # 投影
        xz = self.x_proj(x)
        x_inner, x_gate = xz.chunk(2, dim=-1)

        # 选择性参数
        B = x_inner[:, :, :self.d_stat[[Self-Healing-Loop]]
        C = x_inner[:, :, self.d_state:]
        Δ = torch.softplus(self.dt_proj(x_gate))

        # SSM
        y = selective_scan(x, self.A, B, C, Δ)

        # 门控 + 残差
        y = y * torch.nn.functional.silu(x_gate)
        y = self.output_proj(y)

        return y + x  # 残差连接
```

### 训练示例

```python
from mamba_ssm import MambaLM, MambaConfig

config = MambaConfig(
    d_model=768,
    n_layers=24,
    d_state=16,
    expand=2,
)

model = MambaLM(config)

# 训练
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)

for batch in dataloader:
    logits = model(batch.input_ids)
    loss = F.cross_entropy(
        logits.view(-1, logits.size(-1)),
        batch.labels.view(-1)
    )
    loss.backward()
    optimizer.step()
```

## 变体与扩展

### 1. Mamba-2 (2024)

- 状态空间对偶 (SSD) 框架
- 注意力机制与SSM统一
- 更高效的矩阵计算

### 2. Mamba架构变体

| 变体 | 特点 | 适用场景 |
|------|------|----------|
| Mamba-LM | 语言模型预训练 | 通用NLP |
| Mamba-Mixer | 多模态混合 | 视觉+语言 |
| Jamba | Mamba+Transformer混合 | 平衡效率与效果 |
| Mamba-NLP | 特定任务微调 | 分类/生成 |

### 3. 与其他高效架构对比

```
┌────────────────────────────────────────────────────────┐
│              高效序列建模架构对比                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Transformer ──→ O(n²) ──→ 全局注意力                  │
│       │                                                │
│       ↓                                                │
│  Linear Attention ──→ O(n) ──→ 核函数近似               │
│       │                                                │
│       ↓                                                │
│  Mamba ──→ O(n) ──→ 选择性状态空间                      │
│       │                                                │
│       ↓                                                │
│  S4 (Structured SSM) ──→ O(n) ──→ 无选择性              │
│       │                                                │
│       ↓                                                │
│  Mamba-2 ──→ O(n) ──→ 状态空间对偶                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## 应用场景

### 1. 长序列建模
- 文档理解 (>100k tokens)
- 基因组分析
- 时间序列预测

### 2. 资源受限部署
- 移动端模型
- 边缘计算
- 嵌入式系统

### 3. 生成式AI
- 高效语言模型
- 多模态生成
- 视频生成

## Cross-refs
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — Mamba替代的高效架构
- [[ml/Diffusion-Models.m[[knowledge/Design-Toolkit]]] — 另一条生成式技术路线
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — 另一个高效Transformer变体
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — Mamba模型的高效微调
- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — Mamba可结合的推理技术
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — Mamba模型的对齐训练