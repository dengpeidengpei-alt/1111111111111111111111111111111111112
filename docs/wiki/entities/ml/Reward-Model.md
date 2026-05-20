---
type: entity
category: ml
key: Reward-Model — 奖励模型 ★★★★☆
source: Claude-Evo
date: 2026-05-20
---

# Reward-Model — 奖励模型 ★★★★☆

> 用于预测人类偏好的模型，是RLHF系统的"标尺"

## 核心原理

**问题**：人类无法实时标注亿级生成的token

**解决方案**：训练一个reward model模拟人类偏好
```
chosen_response → 高分
rejected_response → 低分
```

**Bradley-Terry模型**：
$$
P(\text{prefer } A \succ B) = \sigma(r(A) - r(B)) = \frac{1}{1 + e^{-(r(A) - r(B))}}
$$

**损失函数**：
$$
\mathcal{L}_{RM} = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \log \sigma(r(x, y_w) - r(x, y_l))
$$

其中$x$为prompt，$y_w$为preferred响应，$y_l$为rejected响应。

## 训练流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Reward Model 训练流程                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. 数据收集
   prompt + [response_A, response_B] → 人类偏好标注 → (chosen, rejected)

2. SFT模型生成
   使用SFT后的模型对每个prompt生成多个候选响应

3. 偏好标注
   人类或AI对候选响应排序/评分

4. Reward Model训练
   训练模型预测: P(preferred > rejected)

5. 部署
   替换人工标注，用于PPO强化学习
```

## 代码实现

### 完整训练代码

```python
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer

class RewardModel(nn.Module):
    """Reward Model: 将LLM的隐状态映射为标量分数"""

    def __init__(self, backbone_name, pad_token_id=0):
        super().__init__()
        self.backbone = AutoModel.from_pretrained(backbone_name)
        self.pad_token_id = pad_token_id

        hidden_size = self.backbone.config.hidden_size
        self.reward_head = nn.Linear(hidden_size, 1)

        # 初始化奖励头
        nn.init.xavier_uniform_(self.reward_head.weight)
        nn.init.zeros_(self.reward_head.bias)

    def forward(self, input_ids, attention_mask=None):
        """返回每个样本的奖励分数"""
        outputs = self.backbone(input_ids=input_ids, attention_mask=attention_mask)

        # 方案1：使用[CL[[Self-Healing-Loop]]token
        pooled = outputs.last_hidden_state[:, 0]

        # 方案2：使用最后hidden states的均值（更稳定）
        # pooled = (outputs.last_hidden_state * attention_mask.unsqueeze(-1)).sum(1) / attention_mask.sum(1).unsqueeze(-1)

        reward = self.reward_head(pooled).squeeze(-1)
        return reward

    def forward_pair(self, chosen_ids, rejected_ids, attention_mask=None):
        """同时处理chosen和rejected，计算pairwise损失"""
        reward_chosen = self.forward(chosen_ids, attention_mask)
        reward_rejected = self.forward(rejected_ids, attention_mask)
        return reward_chosen, reward_rejected


def compute_reward_loss(reward_chosen, reward_rejected):
    """
    Bradley-Terry pairwise损失
    最大化 preferred - rejected 的差距
    """
    diff = reward_chosen - reward_rejected
    loss = -torch.log(torch.sigmoid(diff)).mean()
    return loss


def compute_kl_loss(reward_model, prompt_ids, response_ids, reference_logps):
    """
    KL散度损失：确保reward model不会过度偏离reference
    """
    with torch.no_grad():
        reference_reward = reward_model(prompt_ids, response_ids).mean()

    current_reward = reward_model(prompt_ids, response_ids).mean()
    kl_loss = (current_reward - reference_reward).clamp(min=0).mean()

    return kl_loss
```

### 训练循环

```python
def train_reward_model(model, train_loader, optimizer, config):
    """Reward Model训练循环"""
    for epoch in range(config.num_epochs):
        total_loss = 0

        for batch in tqdm(train_loader):
            chosen_ids = batch["chosen_ids"]
            rejected_ids = batch["rejected_ids"]

            # 前向传播
            reward_chosen, reward_rejected = model.forward_pair(
                chosen_ids, rejected_ids
            )

            # 计算损失
            loss = compute_reward_loss(reward_chosen, reward_rejected)

            # 反向传播
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), config.max_grad_norm)
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch}: Loss = {avg_loss:.4f}")
```

## Reward Hacking与应对

### 问题分类

| 类型 | 表现 | 原因 |
|------|------|------|
| **长度作弊** | 越长分数越高 | 模型发现长文本被奖励 |
| **关键词堆砌** | 特定词出现多次 | 格式偏好而非内容偏好 |
| **表面流畅** | 语法正确但事实错 | 奖励模型被表面特征欺骗 |
| **格式操纵** | 按特定格式输出 | 训练数据格式偏差 |

### 缓解策略

```python
class RewardHackingMitigator:
    """Reward Hacking缓解器"""

    def __init__(self, reward_model):
        self.rm = reward_model
        self对抗_samples = [[Self-Healing-Loop]]

    def add_length_penalty(self, reward, response, target_length=200):
        """添加长度惩罚，防止过长输出"""
        length = len(response)
        # 偏离目标长度越多，惩罚越大
        length_diff = abs(length - target_length)
        penalty = -0.01 * length_diff
        return reward + penalty

    def add_quality_filter(self, reward, response):
        """添加质量过滤器"""
        quality_score = self.evaluate_quality(response)

        # 低质量响应降权
        if quality_score < 0.5:
            reward *= quality_score

        return reward

    def add_fact_check(self, response, claims):
        """事实性检查"""
        factual_errors = self.check_facts(claims)
        penalty = -0.2 * factual_errors
        return reward + penalty

    def detect_hacking(self, responses):
        """检测Reward Hacking模式"""
        patterns = {
            "excessive_length": self.detect_length_anomaly(responses),
            "keyword_stuffing": self.detect_keyword_pattern(responses),
            "format_manipulation": self.detect_format_pattern(responses)
        }
        return patterns
```

### 对抗性训练

```python
def adversarial_training(reward_model,对抗_data, epochs=5):
    """
    使用对抗样本增强reward model，减少hacking
    """
    for epoch in range(epochs):
        for batch in对抗_data:
            # 识别reward model的弱点
            weak_responses = reward_model.find_weaknesses(batch)

            # 降低这些响应的分数
            for response in weak_responses:
                response.reward = -1.0  # 明确标记为低质量

            # 重新训练
            reward_model.train_on(batch)
```

## 评估指标

```python
def evaluate_reward_model(rm, eval_dataset):
    """评估Reward Model质量"""

    metrics = {}

    # 1. 准确率 (Preference Prediction Accuracy)
    correct = 0
    total = 0
    for item in eval_dataset:
        chosen_reward = rm(item["chosen_ids"])
        rejected_reward = rm(item["rejected_ids"])
        if chosen_reward > rejected_reward:
            correct += 1
        total += 1
    metrics["accuracy"] = correct / total

    # 2. 排序相关系数 (Spearman Correlation)
    predictions = [[Self-Healing-Loop]]
    labels = [[Self-Healing-Loop]]
    for item in eval_dataset:
        predictions.append(rm(item["response_ids"]))
        labels.append(item["human_rating"])
    metrics["spearman"] = spearman_correlation(predictions, labels)

    # 3. 对抗成功率 (Adversarial Success Rate)
    adversarial_correct = 0
    for item in对抗_eval:
        if item["is_adversarial"]:
            if rm(item["adversarial_response"]) < rm(item["clean_response"]):
                adversarial_correct += 1
    metrics["adversarial_success"] = adversarial_correct / len(对抗_eval)

    return metrics
```

## Reward Model的演进

### 1. 早期方法：人工标注

```
传统RLHF:
prompt → SFT模型 → 多个response → 人类标注偏好 → Reward Model

问题：人工标注成本高、速度慢、一致性难保证
```

### 2. 增强方法：AI反馈 (RLAIF)

```
RLAIF:
prompt → SFT模型 → 多个response → AI评估偏好 → Reward Model

优势：成本低、速度快
挑战：需要高质量的AI评估器
```

### 3. Constitutional AI方法

```
Constitutional AI:
1. 初始响应 + 宪法原则 → AI自评
2. 违反宪法 → 修改响应
3. 改进后的响应训练Reward Model

优势：减少人工标注依赖
```

### 对比表格

| 方法 | 标注来源 | 成本 | 质量 |
|------|----------|------|------|
| 纯人工 | 人类 | 高 | 高但不一致 |
| RLAIF | AI | 低 | 取决于AI评估器 |
| Constitutional AI | AI+规则 | 中 | 较高 |
| 混合 | 人类+AI | 中 | 高 |

## Cross-refs

- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 核心组件，RM用于PPO训练
- [[ml/PPO.m[[knowledge/Design-Toolkit]]] — 使用reward model计算优势函数
- [[ml/KTO.m[[knowledge/Design-Toolkit]]] — 用不同的偏好建模方式（基于人类真实偏好）
- [[ml/Constitutional-AI.m[[knowledge/Design-Toolkit]]] — 另一种对齐方法，AI自评替代人类标注
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 无需reward model的直接偏好优化