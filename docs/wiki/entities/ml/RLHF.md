---
type: entity
category: ml
key: RLHF
source: Claude-Evo research
date: 2026-05-20
layer: 4.0
stars: 5
---

# RLHF - 人类反馈强化学习

## Overview
- **全称**: Reinforcement Learning from Human Feedback
- **目的**: 将人类偏好注入LLM，使输出符合人类价值观
- **应用**: ChatGPT, Claude, Llama等对齐

## 三阶段流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RLHF 三阶段                                          │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────────────────────┐
                    │  Stage 1: SFT (监督微调)              │
                    │  高质量人类标注数据微调预训练模型       │
                    └───────────────────────────────────────┘
                                        │
                                        ▼
                    ┌───────────────────────────────────────┐
                    │  Stage 2: Reward Model (奖励模型)    │
                    │  人类排序偏好 → 奖励模型学习           │
                    └───────────────────────────────────────┘
                                        │
                                        ▼
                    ┌───────────────────────────────────────┐
                    │  Stage 3: PPO (强化学习)            │
                    │  奖励模型信号 → 优化LLM              │
                    └───────────────────────────────────────┘
```

## Stage 1: SFT

### 目的
- 使用高质量人类标注的指令-响应对数据集微调预训练LLM

### 数据格式
```json
{
  "instruction": "解释量子纠缠",
  "response": "量子纠缠是..."
}
```

### 常用数据集
- Anthropic HH-RLHF
- OpenAI Summarization
- FLAN Collection

## Stage 2: Reward Model

### 目的
- 训练奖励模型评估LLM生成的响应质量

### 训练方式
```
人类排序多个响应 → Bradley-Terry模型 → 奖励模型
```

### 损失函数
```
L = -log(σ(r_preferred - r_rejected))
```

## Stage 3: PPO

### 目的
- 使用PPO算法将奖励模型输出作为奖励信号微调LLM

### 目标函数
```
max E[r(x, y)] - β * KL[π_θ || π_re[[Self-Healing-Loop]]
```

其中:
- `r(x, y)` = 奖励模型分数
- `KL[π_θ || π_re[[Self-Healing-Loop]]` = 与原始模型的KL散度
- `β` = 控制偏离强度的系数

## PPO算法细节

### 裁剪机制
```python
ratio = π_θ(a|s) / π_θ_old(a|s)
clamped_ratio = clip(ratio, 1-ε, 1+ε)
advantage = reward - baseline
policy_loss = -min(ratio * advantage, clamped_ratio * advantage)
```

### 优势函数
```python
advantage = GAE(returns, values)
returns = reward + γ * next_value
```

## 替代方法对比

| 方法 | 原理 | 优势 | 劣势 |
|------|------|------|------|
| RLHF | 强化学习+人类反馈 | 成熟稳定 | 需要PPO，计算量大 |
| DPO | 直接优化偏好 | 无需RM，简化 | 需要偏好数据 |
| Constitutional AI | AI自我改进 | 减少人工标注 | 依赖宪法质量 |
| GRPO | 组内相对排名 | 无需Critic | 较新 |

## 实践中的挑战

### 1. 人类标注成本
- 高质量偏好数据稀缺
- 标注一致性难保证

### 2. Reward Hacking
- 模型找到奖励模型的漏洞
- 输出看起来好但实际不对

### 3. 分布偏移
- RL训练后模型分布变化
- 需要周期性重新训练

## 应用案例

### ChatGPT (InstructGPT)
```python
# 简化流程
1. SFT: GPT-3 → InstructGPT (人类标注微调)
2. RM: 训练奖励模型预测人类偏好
3. PPO: 强化学习优化输出
```

### Claude
```python
# Constitutional AI方法
1. 初始响应 + 宪法原则
2. AI自评是否违反宪法
3. RLAIF训练
```

## PPO算法详解

### 完整损失函数

PPO在RLHF中的完整损失函数为：

```
L = -E[r + γV(s') - V(s)] + βH(π)
```

其中：
- `r`: 即时奖励 (reward model给出的分数)
- `V(s)`: 价值函数，预测期望累积奖励
- `γV(s')`: 下一状态的价值估计（bootstrap）
- `βH(π)`: 熵正则项，防止策略崩溃
- `β`: 超参数，控制熵惩罚强度

### PPO-Clip目标

标准PPO使用裁剪目标防止策略过大更新：

```python
ratio = π_θ(a|s) / π_θ_old(a|s)  # 概率比
clamped_ratio = clip(ratio, 1-ε, 1+ε)  # 裁剪到[1-ε, 1+ε]
policy_loss = -min(ratio * advantage, clamped_ratio * advantage)
```

- `ε`: 裁剪参数，通常0.1-0.2
- `advantage`: 优势函数，估计动作相对平均的好坏

### GAE (Generalized Advantage Estimation)

```python
def gae(values, rewards, gamma=0.99, lam=0.95):
    advantages = [[Self-Healing-Loop]]
    gae_acc = 0
    for t in reversed(range(len(rewards))):
        if t == len(rewards) - 1:
            next_value = 0
        else:
            next_value = values[t + 1]
        delta = rewards[[[knowledge/Design-Toolkit]] + gamma * next_value - values[[[knowledge/Design-Toolkit]]
        gae_acc = delta + gamma * lam * gae_acc
        advantages.insert(0, gae_acc)
    return advantages
```

## Reward Model训练流程

### 训练目标

Reward Model学习预测人类偏好，使用Bradley-Terry模型：

```python
class RewardModel(nn.Module):
    def __init__(self, base_model):
        super().__init__()
        self.base_model = base_model
        self.value_head = nn.Linear(hidden_size, 1)

    def forward(self, input_ids, attention_mask):
        outputs = self.base_model(input_ids, attention_mask=attention_mask)
        # 使用最后一层hidden state
        hidden = outputs.last_hidden_state[:, -1, :]
        reward = self.value_head(hidden)
        return reward.squeeze(-1)

def reward_model_trainer(prompts, responses, labels):
    """
    Args:
        prompts: 输入提示
        responses: 模型生成的响应对
        labels: 偏好标签 (preferred=1, rejected=0)
    Returns:
        训练好的Reward Model
    """
    reward_model = RewardModel(base_model)

    for batch in dataloader:
        # Pairwise comparison: preferred - rejected
        r_preferred = reward_model(batch.preferred_input_ids)
        r_rejected = reward_model(batch.rejected_input_ids)

        # 损失: 鼓励preferred分数高于rejected
        loss = -torch.log(torch.sigmoid(r_preferred - r_rejected)).mean()
        loss.backward()
        optimizer.step()
    return reward_model
```

### 损失函数详解

```
L = -log(σ(r_preferred - r_rejected))
```

这等价于二元交叉熵，其中：
- `σ(r_preferred - r_rejected) > 0.5` 当 preferred 更优
- 最小化损失使 preferred 分数高于 rejected

## 人类反馈收集方法

### 1. Pairwise Comparison (成对比较)
```
用户看到: [Promp[[knowledge/Design-Toolkit]] + [Response A] + [Response B]
用户选择: A更好 / B更好 / 差不多
```
- **优点**: 直接反映相对偏好
- **缺点**: 只知道相对顺序，不知道差异大小

### 2. Human Ranking (人类排序)
```
用户看到: [Promp[[knowledge/Design-Toolkit]] + [Response 1, 2, 3, 4, 5]
用户排序: 3 > 1 > 5 > 2 > 4
```
- **优点**: 更多信息量
- **缺点**: 标注成本高，一致性难保证

### 3. Star Rating (星级评分)
```
用户看到: [Promp[[knowledge/Design-Toolkit]] + [Respons[[Self-Healing-Loop]]
用户评分: ★★★☆☆
```
- **优点**: 简单直观
- **缺点**: 主观性强，跨用户不可比

### 4. Natural Language Feedback (自然语言反馈)
```
用户看到: [Promp[[knowledge/Design-Toolkit]] + [Respons[[Self-Healing-Loop]]
用户反馈: "这个回答太technical了，新手可能看不懂"
```
- **优点**: 最丰富的信息，可用于微调
- **缺点**: 处理成本高，需要LLM辅助总结

## RLHF vs DPO对比

| 维度 | RLHF | DPO |
|------|------|-----|
| **核心算法** | PPO强化学习 | 直接偏好优化 |
| **样本效率** | 低（需要RM+PPO） | 高（无需RM） |
| **计算复杂度** | 高（PPO+价值网络） | 低（简单对比损失） |
| **内存占用** | 大（多个模型） | 小（只需policy model） |
| **训练稳定性** | 中等 | 较高 |
| **偏好数据利用** | 间接（通过RM） | 直接 |
| **效果** | 成熟稳定 | 接近RLHF |
| **典型场景** | ChatGPT, Claude | 小型模型快速对齐 |

### DPO损失函数

```python
def dpo_loss(policy_logps, reference_logps, chosen_rewards, rejected_rewards, beta=0.1):
    """
    DPO: 直接在偏好数据上优化策略
    """
    # 计算隐式reward (直接从策略概率得出)
    chosen_logps = policy_logps(chosen_response)
    rejected_logps = policy_logps(rejected_response)

    # DPO损失
    policy_loss = -torch.log(torch.sigmoid(
        beta * (chosen_logps - rejected_logps)
    ))

    # 同时惩罚偏离reference
    ref_chosen = reference_logps(chosen_response)
    ref_rejected = reference_logps(rejected_response)
    KL_loss = (chosen_logps - ref_chosen) + (rejected_logps - ref_rejected)

    return (policy_loss + beta * KL_loss).mean()
```

## RLHF训练代码示例

```python
import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer

class RLHFTrainer:
    def __init__(self, policy_model, ref_model, reward_model):
        self.policy = policy_model
        self.ref = ref_model  # frozen reference
        self.reward = reward_model
        self.optimizer = torch.optim.Adam(self.policy.parameters(), lr=1e-6)

    def generate_response(self, prompt):
        """使用当前策略生成响应"""
        inputs = tokenizer(prompt, return_tensors="pt").to(policy.device)
        with torch.no_grad():
            outputs = self.policy.generate(
                **inputs,
                max_new_tokens=256,
                do_sample=True,
                temperature=0.7
            )
        return tokenizer.decode(outputs[0], skip_special_tokens=True)

    def ppo_update(self, prompt, response, reward):
        """PPO单步更新"""
        # 计算概率比
        log_probs = self.policy(response).log_probs
        ref_log_probs = self.ref(response).log_probs

        ratio = torch.exp(log_probs - ref_log_probs)

        # 裁剪
        clipped_ratio = torch.clamp(ratio, 1-0.2, 1+0.2)

        # 优势函数 (这里简化处理)
        advantage = reward

        # PPO损失
        policy_loss = -torch.min(
            ratio * advantage,
            clipped_ratio * advantage
        ).mean()

        # KL散度惩罚
        KL_penalty = (log_probs - ref_log_probs).mean()

        total_loss = policy_loss + 0.1 * KL_penalty

        self.optimizer.zero_grad()
        total_loss.backward()
        self.optimizer.step()

        return total_loss.item()

    def train_epoch(self, dataloader):
        """完整训练循环"""
        for batch in dataloader:
            prompts = batch["prompt"]

            # 1. 生成response
            responses = [self.generate_response(p) for p in prompt[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]

            # 2. 获取reward
            rewards = [self.reward(p, r) for p, r in zip(prompts, responses)]

            # 3. PPO更新
            for p, r in zip(prompts, rewards):
                self.ppo_update(p, r)

# 训练启动
trainer = RLHFTrainer(policy_model, ref_model, reward_model)
for epoch in range(num_epochs):
    trainer.train_epoch(dataloader)
```

## 实践技巧与注意事项

### 奖励塑形 (Reward Shaping)
```python
# 原始reward可能有很大方差，进行归一化
def shape_reward(raw_reward, baseline, std):
    return (raw_reward - baseline) / (std + 1e-8)

# 添加长度惩罚防止冗长输出
def reward_with_length_penalty(reward, response, target_length=200):
    length = len(response)
    penalty = -0.1 * abs(length - target_length)
    return reward + penalty
```

### 早期停止策略
```python
# 监控KL散度，当策略偏离过大时停止
if kl_divergence > max_kl:
    print("Policy drifted too far, stopping training")
    break
```

### Reward Hacking应对
1. **混合奖励**: 结合多个RM减少单一漏洞
2. **对抗采样**: 针对性测试模型漏洞
3. **红队测试**: 人工寻找奖励模型的失败案例

## Cross-refs
- [[ml/PPO.m[[knowledge/Design-Toolkit]]] — 核心强化学习算法
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 直接偏好优化，RLHF替代方案
- [[ml/Constitutional-AI.m[[knowledge/Design-Toolkit]]] — 宪法AI，AI对齐方法
- [[ml/GRPO.m[[knowledge/Design-Toolkit]]] — 群体相对策略优化
- [[analysis/AI-Alignment.m[[knowledge/Design-Toolkit]]] — AI对齐研究综述
- [[ml/Prompt-Engineering.m[[knowledge/Design-Toolkit]]] — 提示工程基础
- [[ml/Reward-Model.m[[knowledge/Design-Toolkit]]] — 奖励模型训练专题