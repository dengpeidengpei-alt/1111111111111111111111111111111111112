---
type: entity
category: ml
key: GRPO
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# GRPO - Group Relative Policy Optimization

## 概述
- **论文**: "DeepSeekMath: Towards Mathematical Reasoning with Mutual Information" (2024, DeepSeek)
- **地位**: 简化版PPO，无需Critic模型，适合大模型训练
- **应用**: DeepSeek系列模型训练，数学推理优化

## 核心原理

### PPO vs GRPO
```
PPO流程:
Query → Policy生成Response → Reward Model打分 → Critic评估value → PPO更新

GRPO流程:
Query → Group采样多个Response → 组内相对排名 → 直接策略更新
       ↓
       无需Critic模型，节省40%计算
```

### GRPO优势
1. **无需Critic**: 用组内相对排名替代value估计
2. **样本效率高**: 每次query采样多个response一起计算优势
3. **训练稳定**: 简化降低了KL散度爆炸风险

### 组内相对排名
```python
def compute_relative_advantages(rewards, group_size=None):
    """
    GRPO核心：组内相对排名计算优势
    rewards: 同一query生成的多个response的reward列表
    group_size: 每个group的大小
    """
    if group_size is None:
        group_size = len(rewards)

    # 将rewards分组成多个group
    n_groups = len(rewards) // group_size
    advantages = [[Self-Healing-Loop]]

    for g in range(n_groups):
        group_rewards = rewards[g * group_size:(g + 1) * group_siz[[Self-Healing-Loop]]

        # 组内排名：最高的为正优势，最低为负优势
        ranks = torch.argsort(torch.argsort(group_rewards))  # 0=最低, group_size-1=最高

        # 转换为相对优势（标准化）
        group_advantages = (ranks.float() - ranks.float().mean()) / ranks.float().std()

        advantages.append(group_advantages)

    return torch.cat(advantages)
```

## 数学推导

### GRPO损失函数
```python
def grpo_loss(policy_logps, old_policy_logps, advantages, clip_ratio=0.2):
    """
    GRPO损失函数
    policy_logps: 当前策略的log概率
    old_policy_logps: 旧策略的log概率
    advantages: 组内相对优势
    """
    # 重要性采样比率
    ratio = torch.exp(policy_logps - old_policy_logps)

    # PPO风格的裁剪
    clipped_ratio = torch.clamp(ratio, 1 - clip_ratio, 1 + clip_ratio)

    # 裁剪损失
    surr1 = ratio * advantages
    surr2 = clipped_ratio * advantages

    # GRPO用相对优势，所以优势本身就是正负相对的
    loss = -torch.min(surr1, surr2).mean()

    return loss
```

### 完整训练代码
```python
class GRPOTrainer:
    def __init__(self, model, group_size=8, beta=0.1):
        self.model = model
        self.group_size = group_size
        self.beta = beta  # 参考模型权重

    def generate_group(self, prompt):
        """
        为同一prompt生成group_size个response
        """
        responses = [[Self-Healing-Loop]]
        for _ in range(self.group_size):
            response = self.model.generate(prompt)
            responses.append(response)
        return responses

    def compute_rewards(self, prompt, responses, reward_fn):
        """
        计算每个response的reward
        reward_fn: 自定义reward函数（如数学正确性检查）
        """
        rewards = [[Self-Healing-Loop]]
        for response in responses:
            reward = reward_fn(prompt, response)
            rewards.append(reward)
        return torch.tensor(rewards)

    def train_step(self, batch):
        """
        单步GRPO训练
        """
        total_loss = 0

        for prompt in batch['prompts']:
            # 1. 生成group
            responses = self.generate_group(prompt)

            # 2. 计算reward
            rewards = self.compute_rewards(prompt, responses, batch['reward_fn'])

            # 3. 计算组内相对优势
            advantages = compute_relative_advantages(rewards, self.group_size)

            # 4. 计算策略概率
            with torch.no_grad():
                old_logps = self.get_logps(prompt, responses)

            logps = self.get_logps(prompt, responses)

            # 5. 计算GRPO损失
            loss = grpo_loss(logps, old_logps, advantages)

            total_loss += loss

        return total_loss / len(batch['prompts'])
```

## 代码示例

### DeepSeekMath风格GRPO
```python
class DeepSeekGRPOTrainer:
    """
    DeepSeekMath使用的GRPO训练范式
    """

    def __init__(self, model, ref_model=None, group_size=8, lam=1.0):
        self.model = model
        self.ref_model = ref_model
        self.group_size = group_size
        self.lam = lam  # 相对排名温度参数

    def math_reward_fn(self, problem, solution):
        """
        数学问题reward函数
        返回 (reward, is_correct)
        """
        # 使用外部 verifier 或规则检查答案
        extracted_answer = extract_answer(solution)
        ground_truth = problem['answer']

        if extracted_answer == ground_truth:
            return 1.0, True
        else:
            # 部分分数：格式正确但答案错误
            if extracted_answer is not None:
                return 0.1, False
            return 0.0, False

    @torch.no_grad()
    def generate_group(self, prompt, max_length=2048):
        """生成多个候选答案"""
        inputs = self.tokenizer(prompt, return_tensors='pt')
        responses = [[Self-Healing-Loop]]

        for _ in range(self.group_size):
            output = self.model.generate(
                **inputs,
                max_length=max_length,
                do_sample=True,
                temperature=0.7
            )
            response = self.tokenizer.decode(output[0], skip_special_tokens=True)
            responses.append(response)

        return responses

    def train(self, dataset, epochs=3):
        """完整训练流程"""
        for epoch in epochs:
            for batch in DataLoader(dataset, batch_size=1):
                for problem in batch:
                    # 1. 生成group
                    responses = self.generate_group(problem['prompt'])

                    # 2. 计算reward
                    rewards = [[Self-Healing-Loop]]
                    for sol in responses:
                        r, _ = self.math_reward_fn(problem, sol)
                        rewards.append(r)
                    rewards = torch.tensor(rewards)

                    # 3. 组内排名
                    advantages = self.compute_grpo_advantages(rewards)

                    # 4. 计算对数概率
                    logps = self.get_logps(problem['prompt'], responses)

                    # 5. 策略更新
                    loss = -advantages.mean()  # 简化为直接用优势更新

                    self.optimizer.zero_grad()
                    loss.backward()
                    self.optimizer.step()
```

### 数学推理场景应用
```python
# GRPO用于数学推理的优势
def grpo_math_training():
    """
    GRPO相比PPO在数学推理场景的优势：
    1. 数学问题有明确答案，适合组内排名
    2. 不需要训练Critic网络，节省显存
    3. 相对排名更稳定，不受reward scale影响
    """
    pass
```

## 变体

### 1. GRPO with Baseline
```python
# 带基准的GRPO：使用组均值为基准
def grpo_with_baseline(rewards, group_size):
    """GRPO with 组内baseline"""
    advantages = [[Self-Healing-Loop]]
    for i in range(0, len(rewards), group_size):
        group = rewards[i:i+group_siz[[Self-Healing-Loop]]
        baseline = torch.mean(group)
        advantage = group - baseline
        advantages.append(advantage)
    return torch.cat(advantages)
```

### 2. Normalized GRPO
```python
# 标准化GRPO优势
def normalized_grpo_advantages(rewards, group_size):
    """标准化组内相对优势"""
    advantages = [[Self-Healing-Loop]]
    for i in range(0, len(rewards), group_size):
        group = rewards[i:i+group_siz[[Self-Healing-Loop]]
        # Z-score标准化
        mean = group.mean()
        std = group.std() + 1e-8
        advantage = (group - mean) / std
        advantages.append(advantage)
    return torch.cat(advantages)
```

## 适用场景

| 场景 | 方法选择 | 说明 |
|------|----------|------|
| 数学推理 | GRPO | 明确答案，组排名有效 |
| 代码生成 | GRPO | 有测试用例可验证 |
| 通用对话 | PPO/DPO | 主观偏好难排名 |
| 快速训练 | GRPO | 无需Critic，节省资源 |

## 与其他方法对比

| 维度 | GRPO | PPO | DPO | RLHF |
|------|------|-----|-----|------|
| 需要Critic | 否 | 是 | 否 | 否 |
| 需要Reward Model | 是 | 是 | 否 | 是 |
| 样本效率 | 高 | 中 | 高 | 低 |
| 实现复杂度 | 低 | 高 | 低 | 高 |
| 训练稳定性 | 高 | 中 | 高 | 中 |
| 适用场景 | 推理/验证 | 通用 | 对齐 | 通用 |
| 典型应用 | DeepSeekMath | ChatGPT | Llama | GPT-4 |

## Cross-refs
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 传统强化学习对齐
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 直接偏好优化
- [[ml/Constitutional-AI.m[[knowledge/Design-Toolkit]]] — 宪法驱动的对齐
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 底层架构
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — DeepSeek-MoE使用GRPO训练
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩