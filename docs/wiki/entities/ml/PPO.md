---
type: entity
category: ml
key: PPO — Proximal Policy Optimization
source: Claude-Evo
date: 2026-05-20
---

# PPO — Proximal Policy Optimization

> 近端策略优化，OpenAI 2017提出，现为RL领域最广泛使用的算法

## 核心原理

**核心问题**：策略梯度方法（如REINFORCE）对学习率敏感，易导致性能剧烈波动。

**CLIP目标函数**：
```
L^CLIP(θ) = E[min(r_t(θ) * A_t, clip(r_t(θ), 1-ε, 1+ε) * A_t)]
```
- r_t(θ) = π_θ(a_t|s_t) / π_θ_old(a_t|s_t) （概率比）
- A_t = 优势函数估计
- ε = clip范围（通常0.1~0.2）
- 限制策略变化幅度，避免破坏性大更新

**GAE（Generalized Advantage Estimation）**：
- 平衡偏差与方差
- λ参数控制（0.95~0.99）
- Advantage估计：Â_t = Σ_{l=0}^{∞} (γλ)^l δ_{t+l}

## 算法流程

1. 收集trajectory：使用当前策略与环境交互
2. 计算优势函数（GAE）
3. 多次epoch更新策略（通常4-8个epoch）
4. Mini-batch更新，确保信任域约束

## 代码示例

```python
import torch
import torch.nn as nn
from torch.distributions import Categorical

class PPOAgent:
    def __init__(self, state_dim, action_dim, lr=3e-4, clip_eps=0.2, k_epochs=4):
        self.actor = nn.Sequential(
            nn.Linear(state_dim, 64), nn.tanh(),
            nn.Linear(64, action_dim)
        )
        self.critic = nn.Sequential(
            nn.Linear(state_dim, 64), nn.tanh(),
            nn.Linear(64, 1)
        )
        self.optimizer = torch.optim.Adam(self.parameters(), lr=lr)
        self.clip_eps = clip_eps
        self.k_epochs = k_epochs

    def get_action(self, state):
        logits = self.actor(state)
        dist = Categorical(logits=logits)
        return dist.sample(), dist.log_prob()

    def compute_gae(self, rewards, values, dones, gamma=0.99, lam=0.95):
        advantages = [[Self-Healing-Loop]]
        gae = 0
        values = values + [0]  # terminal
        for t in reversed(range(len(rewards))):
            delta = rewards[[[knowledge/Design-Toolkit]] + gamma * values[t+1] * (1 - dones[[[knowledge/Design-Toolkit]]) - values[[[knowledge/Design-Toolkit]]
            gae = delta + gamma * lam * (1 - dones[[[knowledge/Design-Toolkit]]) * gae
            advantages.insert(0, gae)
        return torch.tensor(advantages)

    def update(self, states, actions, old_log_probs, returns, advantages):
        for _ in range(self.k_epochs):
            logits = self.actor(states)
            dist = Categorical(logits=logits)
            new_log_probs = dist.log_prob(actions)

            ratio = torch.exp(new_log_probs - old_log_probs)
            surr1 = ratio * advantages
            surr2 = torch.clamp(ratio, 1 - self.clip_eps, 1 + self.clip_eps) * advantages
            actor_loss = -torch.min(surr1, surr2).mean()

            values = self.critic(states).squeeze()
            critic_loss = nn.MSELoss()(values, returns)

            self.optimizer.zero_grad()
            (actor_loss + 0.5 * critic_loss).backward()
            self.optimizer.step()
```

## 与其他RL方法对比

| 方法 | 特点 | 适用场景 |
|------|------|----------|
| **PPO** | CLIP稳定，开源好，效果好 | 通用场景，ChatGPT/RW都是PPO |
| **TRPO** | 信任域约束，计算量大 | 学术研究 |
| **DDPG** | 连续动作，确定性策略 | 机器人控制 |
| **SAC** | 最大熵，探索好 | 机器人，异步场景 |

## Cross-refs

- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — PPO是RLHF的核心optimizer
- [[ml/GRPO.m[[knowledge/Design-Toolkit]]] — GRPO是PPO的变种，省去critic
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — DPO是PPO的离线替代
- [[ml/Reward-Model.m[[knowledge/Design-Toolkit]]] — 依赖reward model计算优势函数
- [[Reinforcement-Learnin[[Self-Healing-Loop]]] — 基础概念