---
type: entity
category: ml
key: Knowledge-Distillation — 知识蒸馏
source: Claude-Evo
date: 2026-05-20
---

# Knowledge-Distillation — 知识蒸馏

> 将大模型知识压缩到小模型

## 核心原理

** Teacher-Student架构**：
```
Teacher: 大模型（高能力，推理慢）
Student: 小模型（低能力，推理快）
```

**软标签**：
```python
# 硬标签 vs 软标签
hard: 2  # 正确答案的概率为1
soft: [0.05, 0.95, 0.00, 0.00, ...]  # 概率分布
```

**蒸馏损失**：
```
L_distill = α * KL(student_logits / T, teacher_logits / T) + (1-α) * CE(student_logits, hard_labels)
```
- T：温度（软化分布，通常2-10）
- α：平衡系数

## 蒸馏类型

| 类型 | 方法 | 效果 |
|------|------|------|
| Response-based | 模仿输出分布 | 简单有效 |
| Feature-based | 匹配中间层 | 保留知识 |
| Relation-based | 匹配样本关系 | 深层语义 |

## 代码示例

```python
import torch
import torch.nn.functional as F
import torch.nn as nn

class DistillationLoss(nn.Module):
    def __init__(self, temperature=4.0, alpha=0.7):
        super().__init__()
        self.T = temperature
        self.alpha = alpha

    def forward(self, student_logits, teacher_logits, labels):
        # 硬标签损失
        ce_loss = F.cross_entropy(student_logits, labels)

        # 软标签损失（KL散度）
        soft_teacher = F.softmax(teacher_logits / self.T, dim=-1)
        soft_student = F.log_softmax(student_logits / self.T, dim=-1)
        distill_loss = F.kl_div(soft_student, soft_teacher, reduction='batchmean') * (self.T ** 2)

        return self.alpha * distill_loss + (1 - self.alpha) * ce_loss

# 使用
teacher = load_teacher_model()
student = load_student_model()
criterion = DistillationLoss(temperature=4.0, alpha=0.7)

for batch in dataloader:
    with torch.no_grad():
        teacher_logits = teacher(batch)
    student_logits = student(batch)
    loss = criterion(student_logits, teacher_logits, batch['labels'])
    loss.backward()
```

## 典型应用

| 场景 | Teacher | Student | 压缩比 |
|------|---------|---------|--------|
| BERT蒸馏 | BERT-base | DistilBERT | 40%更小，97%能力 |
| GPT-4蒸馏 | GPT-4 | 小模型 | 成本降低 |
| 移动端 | ResNet50 | MobileNet | 10x加速 |

## Cross-refs

- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 综合压缩技术
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 另一种高效微调
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 知识表示