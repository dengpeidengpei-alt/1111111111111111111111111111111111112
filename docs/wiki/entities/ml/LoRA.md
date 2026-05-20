---
type: entity
category: ml
key: LoRA
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# LoRA - Low-Rank Adaptation

## Overview
- **本质**: 冻结原模型权重，在旁边添加低秩矩阵
- **优势**: 可训练参数<1%，显存节省显著
- **论文**: "LoRA: Low-Rank Adaptation of Large Language Models" (2021)

## 核心原理

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LoRA 原理图                                       │
└─────────────────────────────────────────────────────────────────────────┘

原模型（冻结）：
    W₀ (d × d) — 预训练权重，冻结不训练
        ↓
        x → [W₀] → output

LoRA适配：
    W₀ (d × d) — 冻结
        ↓
    x → [W₀ + ΔW] → output
           ↑
       ΔW = B · A (d × r) × (r × d)
           ↑
       只训练A和B，r远小于d
```

## 数学推导

### 原始更新
```
更新全部权重：W' = W + ΔW
需要训练：d × d 个参数
```

### LoRA更新
```
ΔW = B · A  # 低秩分解
B: d × r
A: r × d
需要训练：2dr 个参数（r << d）

例如：d=4096, r=8
原更新：4096 × 4096 = 16M 参数
LoRA：2 × 4096 × 8 = 65K 参数
节省：99.6%
```

## 变体版本

### QLoRA (Quantized LoRA)
```python
# 核心思想：4-bit量化 + LoRA
1. 4-bit量化预训练模型（NF4格式）
2. 添加LoRA适配器
3. 梯度只通过LoRA更新

优势：单卡24GB可微调65B模型
```

### DoRA (Weight-Decomposed LoRA)
```python
# 将权重分解为模长+方向
W' = m * (W + ΔW) / ||W + ΔW||
m: 可学习的模长
方向由LoRA学习
```

### LoRA+
```python
# 改进学习率
A: lr = α/r
B: lr = 1/r
比原始LoRA收敛更快
```

## 实践代码

### Hugging Face PEFT
```python
from peft import LoraConfig, get_peft_model, LoraParameters

# 配置
config = LoraConfig(
    r=8,                    # 秩
    lora_alpha=16,          # 缩放因子
    target_modules=["q_proj", "v_proj"],  # 应用层
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# 应用到模型
model = get_peft_model(base_model, config)
model.print_trainable_parameters()
# trainable params: 8,388,608 || all params: 6,738,415,616 || trainable%: 0.124%
```

### 训练
```python
# 标准训练
trainer = Trainer(model=model, ...)
trainer.train()

# 推理时合并权重
merged_model = model.merge_and_unload()
```

## 与其他微调对比

| 方法 | 可训练参数量 | 显存需求 | 效果 |
|------|-------------|----------|------|
| 全参数微调 | 100% | 高 | 最好 |
| LoRA | <1% | 中 | 接近全参数 |
| QLoRA | <0.5% | 低 | 稍差 |
| Adapter | <1% | 中 | 接近LoRA |
| Prompt Tuning | <0.1% | 极低 | 取决于任务 |

## 适用场景

### 1. 领域适应
```python
# 金融领域
lora_config = LoraConfig(r=4, target_modules=["q_proj", "v_proj", "k_proj"])
finance_model = apply_lora(base_model, lora_config)
# 使用金融数据微调
```

### 2. 风格迁移
```python
# 角色扮演风格
lora_config = LoraConfig(r=8, target_modules=["q_proj", "v_proj"])
character_model = apply_lora(base_model, lora_config)
# 使用角色对话微调
```

### 3. 任务微调
```python
# 特定任务（如摘要）
lora_config = LoraConfig(r=16, target_modules=["q_proj", "v_proj", "fc1", "fc2"])
task_model = apply_lora(base_model, lora_config)
# 使用任务数据微调
```

##秩的选择指南

| 秩r | 适用场景 | 参数量 |
|------|----------|--------|
| r=2-4 | 简单任务/风格 | 极少 |
| r=8 | 一般任务 | 少 |
| r=16 | 复杂任务 | 中 |
| r=32-64 | 高要求任务 | 较多 |

## Cross-refs
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩技术
- [[ml/Federated-Learning.m[[knowledge/Design-Toolkit]]] — 分布式训练
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 量化LoRA
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 基于Transformer的模型