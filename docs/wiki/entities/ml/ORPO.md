---
type: entity
category: ml
key: ORPO — Odds Ratio Preference Optimization
source: Claude-Evo
date: 2026-05-20
---

# ORPO — Odds Ratio Preference Optimization

> 2024年提出的单阶段对齐方法，同时优化偏好和风格

## 核心原理

**问题**：DPO需要两阶段（SFT + 偏好学习），KTO需要超参数tuning

**ORPO创新**：单阶段直接优化
```
L_ORPO = L_SFT + λ * L_OR
```

**Odds Ratio定义**：
```
odds(y|x) = P(y|x) / (1 - P(y|x))
OR(y_chosen, y_rejected|x) = odds(y_chosen|x) / odds(y_rejected|x)
```

**损失函数**：
```
L_OR = -log σ(log OR(y_chosen, y_rejected|x) - β * log(odds(y_rejected|x)))
```

## 核心优势

1. **单阶段**：无需先SFT再对齐
2. **同时优化**：语言建模 + 偏好学习
3. **实现简单**：无需ref model

## 代码示例

```python
import torch
import torch.nn.functional as F

def orpo_loss(logits_chosen, logits_rejected, beta=0.5, lambda_or=1.0):
    """
    ORPO loss
    logits_chosen: chosen response的logits
    logits_rejected: rejected response的logits
    """
    # SFT part (standard language modeling)
    loss_sft = F.cross_entropy(logits_chosen, torch.zeros_like(logits_chosen.argmax(dim=-1)))

    # Odds Ratio part
    # 计算概率
    p_chosen = F.softmax(logits_chosen, dim=-1).max(dim=-1).values
    p_rejected = F.softmax(logits_rejected, dim=-1).max(dim=-1).values

    # Odds
    odds_chosen = p_chosen / (1 - p_chosen + 1e-8)
    odds_rejected = p_rejected / (1 - p_rejected + 1e-8)

    # Odds Ratio loss
    log_or = torch.log(odds_chosen / (odds_rejected + 1e-8))
    log_or -= beta * torch.log(odds_rejected + 1e-8)
    loss_or = -torch.log(torch.sigmoid(log_or)).mean()

    return loss_sft + lambda_or * loss_or

# 使用
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b")
# 训练数据: (prompt, chosen_response, rejected_response)
```

## Cross-refs

- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 同样是离线对齐
- [[ml/SFT.m[[knowledge/Design-Toolkit]]] — 可作为前置阶段
- [[ml/KTO.m[[knowledge/Design-Toolkit]]] — 不同的偏好建模