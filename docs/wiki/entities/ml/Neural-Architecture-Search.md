---
type: entity
category: ml
key: Neural-Architecture-Search — 神经网络架构搜索
source: Claude-Evo
date: 2026-05-20
---

# Neural-Architecture-Search — 神经网络架构搜索

> 自动设计神经网络架构，AutoML核心

## 核心原理

**搜索空间**：
- 操作的类型（Conv, Pool, Skip）
- 连接的拓扑结构
- 通道数、层数等超参数

**搜索策略**：
| 方法 | 特点 | 成本 |
|------|------|------|
| Random Search | 随机采样 | 低 |
| Grid Search | 遍历 | 高 |
| Bayesian Optimization | 基于模型 | 中 |
| RL (NASNet) | 控制器 | 高 |
| Evolutionary | 遗传算法 | 高 |
| DARTS | 梯度方法 | 低 |

## DARTS（可微分架构搜索）

**核心思想**：让搜索空间连续化，用梯度优化

```python
class DARTSOp(nn.Module):
    def __init__(self, C_in, C_out, stride):
        super().__init__()
        self.ops = nn.ModuleList([
            Zero(),                   # 跳过
            ReLUConvBN(C_in, C_out, 1, stride, 0, False, False),
            ConvBN(C_in, C_out, 3, stride, 1, False, False),
            AvgPoolBN(C_in, C_out, stride),
       [[Self-Healing-Loop]])
        # 可学习权重
        self.alpha = nn.Parameter(torch.zeros(len(self.ops)))

    def forward(self, x):
        # 软化选择
        weight = F.softmax(self.alpha, dim=0)
        return sum(w * op(x) for w, op in zip(weight, self.ops))
```

## 经典方法

| 方法 | 年份 | 创新点 |
|------|------|--------|
| NASNet | 2017 | RL控制器 |
| ENAS | 2018 | 权重共享 |
| DARTS | 2018 | 可微分 |
| Once-for-All | 2019 | 弹性架构 |
| AutoFormer | 2021 | Transformer NAS |

## Cross-refs

- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 架构搜索可压缩模型
- [[ml/Meta-Learning.m[[knowledge/Design-Toolkit]]] — 学习如何搜索
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化算法用于搜索