---
type: entity
category: ml
key: Multi-Task-Learning — 多任务学习
source: Claude-Evo
date: 2026-05-20
---

# Multi-Task-Learning — 多任务学习

> 一个模型解决多个任务，共享表征

## 核心原理

**共享表征**：
```
Input → 共享Encoder → 任务特定Head
                         ↓
              Task1 Head / Task2 Head / ...
```

**好处**：
- 知识迁移（正迁移）
- 共享参数，部署成本低
- 正则化效果（防止过拟合单一任务）

**挑战**：
- 任务冲突（负迁移）
- 任务不平衡（有的任务学不好）

## 解决方案

### Hard Parameter Sharing
- 底层共享，高层任务特定
- 最常用

### Soft Parameter Sharing
- 每任务有自己的参数，但加正则化约束相似
- 如：Cross-Stitch, Sluice Networks

### Learning Loss Weighting
- 不平衡任务：自动调整损失权重
- 如：GradNorm, Dynamic Weight Average

## 代码示例

```python
class MultiTaskModel(torch.nn.Module):
    def __init__(self, shared_encoder, task_heads):
        super().__init__()
        self.shared_encoder = shared_encoder
        self.task_heads = torch.nn.ModuleDict(task_heads)

    def forward(self, x, task_name):
        features = self.shared_encoder(x)
        return self.task_heads[task_nam[[Self-Healing-Loop]](features)

# 训练
def multitask_loss(model, batch, task_weights=None):
    if task_weights is None:
        task_weights = {t: 1.0 for t in model.task_names}

    total_loss = 0
    for task_name in batch:
        logits = model(batch[task_nam[[Self-Healing-Loop]]['x'], task_name)
        loss = F.cross_entropy(logits, batch[task_nam[[Self-Healing-Loop]]['y'])
        total_loss += task_weights[task_nam[[Self-Healing-Loop]] * loss
    return total_loss
```

## Cross-refs

- [[ml/Continual-Learning.m[[knowledge/Design-Toolkit]]] — 持续学习新任务
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — 混合专家处理任务冲突
- [[ml/Meta-Learning.m[[knowledge/Design-Toolkit]]] — 多任务泛化