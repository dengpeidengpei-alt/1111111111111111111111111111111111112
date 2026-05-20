---
type: entity
category: ml
key: KTO — Kahneman-Tversky Optimization
source: Claude-Evo
date: 2026-05-20
---

# KTO — Kahneman-Tversky Optimization

> 基于前景理论的偏好对齐方法，HyperWrite 2024提出

## 核心原理

**动机**：DPO假设人类偏好满足Bradley-Tyler model，但人类决策存在偏差

**KTO引入**：
- 损失函数基于Kahneman-Tversky价值函数
- 不需要对比数据（chosen/rejected pair）
- 只需判断输出是否"可接受"

**价值函数**：
```
v(x) = x^α if x >= 0 (收益)
v(x) = -λ(-x)^β if x < 0 (损失)
```
- α, β ∈ (0, 1)，通常=0.88
- λ > 1，通常=2.25（损失厌恶）

**Loss**：
```
L_KTO = -log σ(β * (r_D - r_U) - log σ(r_D))
```
其中D是desired（正面），U是undesired（负面）

## 与DPO对比

| 维度 | DPO | KTO |
|------|-----|-----|
| 数据需求 | 必须成对 | 单样本判断 |
| 标注成本 | 高（需成对） | 低 |
| 损失厌恶建模 | 无 | 有 |
| 理论依据 | BT模型 | 前景理论 |

## 代码示例

```python
import torch
import torch.nn.functional as F

def kto_loss(reward_chosen, reward_rejected, beta=0.1):
    """
    KTO loss
    reward_chosen: 可接受输出的reward
    reward_rejected: 不可接受输出的reward
    """
    # Kahneman-Tversky value function
    # 正向: v(x) = x^alpha, 负向: v(x) = -lambda * (-x)^beta
    alpha, beta_tversky, lam = 0.88, 0.88, 2.25

    # 价值转换
    def value(r):
        return torch.where(r >= 0, r.pow(alpha), -lam * (-r).pow(beta_tversky))

    v_chosen = value(reward_chosen)
    v_rejected = value(reward_rejected)

    # KTO loss
    loss = -F.logsigmoid(beta * (v_chosen - v_rejected) - torch.log1p(torch.exp(v_chosen)))
    return loss.mean()

# 使用
model = RewardModel()
output = model(input_ids)
# 简化版：不需要rejected样本
loss = kto_loss(output, torch.zeros_like(output))
loss.backward()
```

## Cross-refs

- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 同样是离线对齐方法
- [[ml/Reward-Model.m[[knowledge/Design-Toolkit]]] — 依赖reward model
- [[ml/GRPO.m[[knowledge/Design-Toolkit]]] — 在线版本
- [[ml/Constitutional-AI.m[[knowledge/Design-Toolkit]]] — 对齐理论