---
type: entity
category: ml
key: Contrastive-Learning — 对比学习
source: Claude-Evo
date: 2026-05-20
---

# Contrastive-Learning — 对比学习

> 通过比较样本对学习表示，SimCLR/MoCo/CPC核心

## 核心原理

**核心思想**：相似的样本应该距离近，不相似的距离远

**对比损失（NT-Xent）**：
```
L = -log exp(sim(z_i, z_j) / τ) / Σ_k exp(sim(z_i, z_k) / τ)
```
- z_i, z_j：同一图像的两个增强view（正样本对）
- τ：温度参数
- sim：余弦相似度

## 技术演进

| 方法 | 核心创新 | 备注 |
|------|----------|------|
| CPC | 预测未来表征 | 2018 |
| InstDisc |个体歧视 | DeepCluster |
| SimCLR | 简单框架+大batch | 2020 |
| MoCo | 动量编码器 | 2019 |
| MoCo-v2 | 改进版 | 超越SimCLR |
| SwAV | 聚类约束 | 无需负样本 |

## 代码示例

```python
import torch
import torch.nn.functional as F

class SimCLR(torch.nn.Module):
    def __init__(self, encoder, projection_dim=128):
        super().__init__()
        self.encoder = encoder
        self.projection_head = torch.nn.Sequential(
            torch.nn.Linear(512, 256),
            torch.nn.ReLU(),
            torch.nn.Linear(256, projection_dim)
        )

    def forward(self, x1, x2):
        # 同一图像的两个增强view
        h1 = self.encoder(x1)  # 表征
        h2 = self.encoder(x2)

        z1 = self.projection_head(h1)  # 投影
        z2 = self.projection_head(h2)

        # 对比损失
        z = torch.cat([z1, z2], dim=0)  # [2N, projection_dim]
        labels = torch.arange(len(z1), len(z) + len(z1)).to(z.device)

        sim = torch.mm(z, z.T) / 0.07  # 温度
        sim = sim - sim.diag().diag()

        loss = F.cross_entropy(sim, labels)
        return loss

# Data augmentation for SimCLR
class SimCLRTransform:
    def __call__(self, x):
        return [
            self.augment(x),  # view 1
            self.augment(x)   # view 2
       [[Self-Healing-Loop]]
```

## MoCo关键思想

```python
class MoCoQueue:
    """维护负样本队列，动量更新编码器"""
    def __init__(self, K=65536, m=0.999):
        self.queue = torch.randn(K, dim)
        self.m = m
        self.ptr = 0

    @torch.no_grad()
    def update(self, keys):
        # 动量更新队列
        self.queue[self.ptr:self.ptr+len(keys)] = keys
        self.ptr = (self.ptr + len(keys)) % K

    def dequeue_and_enqueue(self, keys):
        self.update(keys)
```

## Cross-refs

- [[ml/CLIP.m[[knowledge/Design-Toolkit]]] — 对比学习用于图文对齐
- [[ml/Self-Supervised-Learning.m[[knowledge/Design-Toolkit]]] — 自监督的子领域
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 表征学习