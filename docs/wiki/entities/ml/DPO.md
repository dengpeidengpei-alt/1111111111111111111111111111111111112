---
type: entity
category: ml
key: DPO
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# DPO - Direct Preference Optimization

## 概述
- **论文**: "Direct Preference Optimization: Your Language Model is a Hidden Reward Model" (2023, Rafailov et al.)
- **地位**: 替代RLHF的对齐方法，无需显式Reward Model
- **代表应用**: Llama 2/3 对齐, GPT-4 对齐

## 核心原理

### RLHF vs DPO
```
RLHF流程:
Prompt → Policy(π) → Response → Reward Model → PPO优化 → 更新Policy

DPO流程:
Prompt → 分别用π_ref和π_θ生成Response → 直接用偏好损失优化
```

### DPO损失函数
```python
def dpo_loss(pi_logps, ref_logps, chosen_logps, rejected_logps, beta=0.1):
    """
    pi_logps: 待优化模型log概率
    ref_logps: 参考模型log概率
    chosen_logps: 偏好response的logps
    rejected_logps: 非偏好response的logps
    beta: KL散度温度系数
    """
    # 隐式reward计算
    chosen_rewards = beta * (chosen_logps - ref_logps)
    rejected_rewards = beta * (rejected_logps - ref_logps)

    # 偏好差距 (margin)
    reward_margin = chosen_rewards - rejected_rewards

    # Sigmoid损失
    loss = -F.logsigmoid(reward_margin)

    # KL正则化 (隐式包含在reward计算中)
    # 不需要额外的KL惩罚项

    return loss.mean()
```

### 数学推导
```python
# DPO的隐式Reward
# 给定偏好对 (y_w, y_l)，DPO优化目标是:
# min_θ - E_{(x,y_w,y_l)~D}[log σ(β · (r_θ(x,y_w) - r_θ(x,y_l)))]

# 其中隐式reward r_θ 通过下式与log概率关联:
# r_θ(x,y) = β · (log π_θ(y|x) - log π_ref(y|x))
#           ≈ β · (π_θ(y|x) / π_ref(y|x))的对数

# 这意味着DPO同时:
# 1. 提升偏好response的概率
# 2. 降低非偏好response的概率
# 3. 保持与参考模型的KL约束
```

### 完整训练代码
```python
class DPO Trainer:
    def __init__(self, model, ref_model, beta=0.1):
        self.model = model
        self.ref_model = ref_model
        self.beta = beta

    def forward(self, batch):
        """
        batch包含:
        - prompt: 输入提示
        - chosen: 偏好response
        - rejected: 非偏好response
        """
        # 1. 计算待优化模型log概率
        pi_chosen_logps = self.get_logps(self.model, batch['prompt'], batch['chosen'])
        pi_rejected_logps = self.get_logps(self.model, batch['prompt'], batch['rejected'])

        # 2. 计算参考模型log概率
        with torch.no_grad():
            ref_chosen_logps = self.get_logps(self.ref_model, batch['prompt'], batch['chosen'])
            ref_rejected_logps = self.get_logps(self.ref_model, batch['prompt'], batch['rejected'])

        # 3. DPO损失
        loss = dpo_loss(pi_chosen_logps, ref_chosen_logps,
                        pi_rejected_logps, ref_rejected_logps,
                        self.beta)

        return loss

    def get_logps(self, model, prompts, responses):
        """计算log概率"""
        inputs = tokenizer(prompts, responses, padding=True, return_tensors='pt')
        outputs = model(**inputs)
        logps = outputs.logits.log_softmax(-1)
        return logps
```

## 代码示例

### 使用trl库实现DPO
```python
from trl import DPOTrainer

trainer = DPOTrainer(
    model=self.model,
    ref_model=self.ref_model,
    beta=0.1,  # KL温度系数
    loss_type="sigmoid",  # 或 "hinge", "ipo"
)

trainer.train()
```

### 手动实现完整DPO流程
```python
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM

class DPOConfig:
    def __init__(self):
        self.model_name = "meta-llama/Llama-2-7b"
        self.beta = 0.1
        self.lr = 1e-6
        self.batch_size = 8
        self.epochs = 3

class PreferenceDataset(torch.utils.data.Dataset):
    """偏好数据集"""
    def __init__(self, data):
        self.data = data

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return {
            'prompt': self.data[idx]['prompt'],
            'chosen': self.data[idx]['chosen'],
            'rejected': self.data[idx]['rejected']
        }

def train_dpo():
    config = DPOConfig()
    tokenizer = AutoTokenizer.from_pretrained(config.model_name)
    model = AutoModelForCausalLM.from_pretrained(config.model_name)
    ref_model = AutoModelForCausalLM.from_pretrained(config.model_name)
    ref_model.eval()

    dataset = PreferenceDataset(preference_data)
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=config.batch_size)

    optimizer = torch.optim.AdamW(model.parameters(), lr=config.lr)

    for epoch in range(config.epochs):
        for batch in dataloader:
            # 计算DPO损失
            loss = dpo_loss(model, ref_model, batch, config.beta)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

    return model
```

## 变体

### 1. IPO (Identity Preference Optimization)
```python
# IPO损失：无Sigmoid，直接用差距
def ipo_loss(chosen_logps, rejected_logps, beta=0.1):
    """IPO: 恒等式偏好优化"""
    margin = beta * (chosen_logps - rejected_logps)
    loss = -margin + torch.log(torch.exp(margin) + 1)
    return loss.mean()
```

### 2. KTO (Kahneman-Tverky Optimization)
```python
# KTO: 基于前景理论，更注重负面偏好
def kto_loss(chosen_logps, rejected_logps, beta=0.1):
    """KTO: 前景理论对齐"""
    # 简化版
    chosen_gain = torch.log(torch.exp(chosen_logps / beta) + 1)
    rejected_loss = torch.log(torch.exp(-rejected_logps / beta) + 1)
    return (chosen_gain + rejected_loss).mean()
```

### 3. SimPO (Simple Preference Optimization)
```python
# SimPO: 去除参考模型，简化流程
def simpo_loss(logits, labels, beta=0.1, gamma=0.5):
    """
    SimPO: 不需要参考模型
    直接用logits计算偏好差距
    """
    chosen_logits = logits[labels == 1]
    rejected_logits = logits[labels == 0]

    margin = chosen_logits.mean() - rejected_logits.mean() - gamma
    loss = -F.logsigmoid(margin / beta)
    return loss.mean()
```

## 适用场景

| 场景 | 方法选择 | 说明 |
|------|----------|------|
| LLM对齐 | DPO | 最常用 |
| 快速迭代 | SimPO | 无需参考模型 |
| 复杂偏好 | KTO | 前景理论 |
| 离线训练 | IPO | 恒等式优化 |

## 与其他方法对比

| 维度 | DPO | RLHF | PPO | Constitutional-AI |
|------|-----|------|-----|-------------------|
| 需要Reward Model | 否 | 是 | 是 | 否 |
| 训练稳定性 | 高 | 中 | 低 | 高 |
| 样本效率 | 高 | 低 | 低 | 中 |
| 实现复杂度 | 低 | 高 | 高 | 中 |
| 需要参考模型 | 是 | 是 | 是 | 否 |
| 典型应用 | Llama对齐 | GPT-4 | ChatGPT | Claude |

## Cross-refs
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 传统对齐方法
- [[ml/GRPO.m[[knowledge/Design-Toolkit]]] — DeepSeek的强化学习优化
- [[ml/Constitutional-AI.m[[knowledge/Design-Toolkit]]] — 宪法驱动的对齐
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — DPO通常用于Transformer模型
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 量化后模型的DPO微调
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — DPO+LoRA高效微调