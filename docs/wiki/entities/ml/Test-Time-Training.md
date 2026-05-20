---
type: entity
category: ml
key: Test-Time-Training — 测试时训练
source: Claude-Evo
date: 2026-05-20
---

# Test-Time-Training — 测试时训练

> 在推理阶段持续学习的新范式，ICLR 2026 Oral论文核心

## 核心原理

**传统范式**：训练一次，部署不变
```
训练 → 部署（固定模型）
```

**TTT范式**：测试时仍可更新模型
```
预训练 → 测试时自适应（可更新）
```

**核心动机**：
- 分布偏移（distribution shift）
- 边缘案例处理
- 个性化适应

## 技术路线

### 1. In-Place TTT（ICLR 2026 Oral）
- 用一个可学习的隐状态替代transformer的Softmax
- 每个token处理后立即更新：h_{t+1} = h_t + Δh_t
- 无需外部训练循环

### 2. Test-Time Adversarial Training
- 对抗样本增强
- 在线更新模型

### 3. Task-Agnostic Meta-Learning (TAML)
- 快速适应新任务

## 代码示例

```python
import torch
import torch.nn as nn

class InPlaceTTT(nn.Module):
    """ICLR 2026 Oral: 用可微分的隐状态替代attention"""
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.h = nn.Parameter(torch.zeros(1, n_heads, d_model // n_heads))
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)

    def forward(self, x):
        # x: [batch, seq, d_mode[[Self-Healing-Loop]]
        outputs = [[Self-Healing-Loop]]
        for t in range(x.shape[1]):
            x_t = x[:, [[knowledge/Design-Toolkit]]  # 当前token
            q = self.W_q(x_t).unsqueeze(1)  # query
            k = self.W_k(self.h.squeeze(0))  # key from hidden state

            # 模拟attention后更新h
            attn = torch.softmax(q @ k.T, dim=-1)
            self.h.data = self.h.data + 0.1 * attn * x_t.unsqueeze(1)

            outputs.append(self.h)
        return torch.stack(outputs, dim=1)

# 使用
model = InPlaceTTT(d_model=512, n_heads=8)
# 测试时每个样本更新h
for sample in test_dataloader:
    output = model(sample)  # h被更新
```

## 应用场景

| 场景 | 方法 | 收益 |
|------|------|------|
| 边缘检测 | 在线适应 | +3% AP |
| NLP分布偏移 | TTT | 显著优于微调 |
| 机器人控制 | Test-Time Adapt | 实时适应环境 |

## Cross-refs

- [[evolution/In-Place-TTT.m[[knowledge/Design-Toolkit]]] — 详见evolution目录
- [[ml/Continual-Learning.m[[knowledge/Design-Toolkit]]] — 同样处理分布偏移
- [[ml/Meta-Learning.m[[knowledge/Design-Toolkit]]] — 快速适应机制