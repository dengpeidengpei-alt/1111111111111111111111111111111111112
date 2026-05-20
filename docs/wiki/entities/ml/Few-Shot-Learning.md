---
type: entity
category: ml
key: Few-Shot-Learning — 小样本学习
source: Claude-Evo
date: 2026-05-20
---

# Few-Shot-Learning — 小样本学习

> 用极少样本（1-5个）完成分类/生成任务

## 核心原理

**挑战**：传统CNN需要成千上万样本才能泛化

**解决方案**：
1. 迁移学习（Pre-train → Fine-tune）
2. 度量学习（Learn to compare）
3. 元学习（Learn to learn）

## 核心技术

### Prototypical Networks
- 每个类用support set的prototype表示
- Query分类用最近邻

### Matching Networks
- 注意力加权看support set

### Relation Networks
- 学习relation module判断相似度

## 代码示例

```python
import torch
import torch.nn.functional as F

class PrototypicalNetwork(torch.nn.Module):
    def __init__(self, encoder):
        super().__init__()
        self.encoder = encoder  # 特征提取器

    def forward(self, support_x, support_y, query_x, n_way, k_shot):
        """
        support_x: [n_way * k_shot, *img_shap[[Self-Healing-Loop]]
        query_x: [n_way * q_shot, *img_shap[[Self-Healing-Loop]]
        """
        # 编码
        support_emb = self.encoder(support_x)
        query_emb = self.encoder(query_x)

        # 计算prototype
        classes = support_y.unique()
        prototypes = torch.stack([
            support_emb[support_y == c].mean(0) for c in classes
       [[Self-Healing-Loop]])  # [n_way, embedding_dim]

        # Query分类
        dists = torch.cdist(query_emb, prototypes)  # [n_query, n_way]
        logits = -dists

        return logits

def episodic_training(model, dataset, n_way=5, k_shot=1, q_query=5):
    """Episodes: 模拟小样本场景训练"""
    episode = dataset.sample_episode(n_way, k_shot, q_query)
    support_x, support_y, query_x, query_y = episode

    logits = model(support_x, support_y, query_x, n_way, k_shot)
    loss = F.cross_entropy(logits, query_y)
    return loss
```

## N-way K-shot

| 任务 | N | K |
|------|---|---|
| 1-shot | 5 | 1 |
| 5-shot | 5 | 5 |
| 极小样本 | 10 | 1 |

## Cross-refs

- [[ml/Meta-Learning.m[[knowledge/Design-Toolkit]]] — 学习如何学习
- [[Zero-Shot-Learnin[[Self-Healing-Loop]]] — 零样本场景
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 表征学习
- [[ml/Contrastive-Learning.m[[knowledge/Design-Toolkit]]] — 对比学习