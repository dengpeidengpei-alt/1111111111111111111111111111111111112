---
type: entity
category: ml
key: Continual Learning
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# Continual Learning - 持续学习

## Overview
- **问题**: 灾难性遗忘（Catastrophic Forgetting）
- **定义**: 模型在学习新任务时保持旧任务能力
- **挑战**: 神经网络倾向于快速遗忘旧知识

## 灾难性遗忘现象

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    灾难性遗忘示意图                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   任务1数据 ──→ 模型 ──→ 性能: 95%                                        │
│       ↓                                                                    │
│   任务2数据 ──→ 模型 ──→ 任务1性能: 20% ❌（遗忘）                          │
│       ↓                    任务2性能: 90%                                  │
│   任务3数据 ──→ 模型 ──→ 任务1性能: 10% ❌（严重遗忘）                       │
│                          任务2性能: 30% ❌                                  │
│                          任务3性能: 88%                                    │
│                                                                             │
│   问题：每次学习新任务，旧任务性能急剧下降                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

## 核心方法分类

### 1. 基于正则化的方法

#### EWC (Elastic Weight Consolidation)
```python
# 核心思想：对重要参数添加约束
L_total = L_new(θ) + λ * Σ_important_params (θ - θ*_old)²

# Fisher Information Matrix计算重要性
F = E[(∂L/∂θ)²]  # 二阶导，表示参数重要性
```

#### LwF (Learning without Forgetting)
```python
# 核心思想：用旧任务知识作为正则化
# 1. 保存旧模型输出
old_output = old_model(inputs)
# 2. 新任务训练时保持旧输出
new_output = new_model(inputs)
loss = task_loss + λ * distillation_loss(old_output, new_output)
```

### 2. 基于架构的方法

#### Progressive Neural Networks
```
每个新任务 → 添加新参数模块
    ↓
旧参数冻结
    ↓
不遗忘旧任务
```

#### PackNet
```
1. 训练任务1 → 剪枝不重要连接
2. 训练任务2 → 使用剩余连接
3. 保留任务1的连接位置
```

### 3. 基于记忆的方法

#### Experience Replay
```python
# 保存部分旧数据
buffer = ReplayBuffer(capacity=1000)
# 训练时混入旧数据
batch = sample_from_new_data() + sample_from_buffer()
```

#### Memory-Efficient EWC
```python
# 在线估计Fisher信息
F_estimate = running_average(gradient²)
# 不需要存储整个Fisher矩阵
```

## 方法对比

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| EWC | 实现简单 | 计算量大 | 小任务数 |
| LwF | 不需存储数据 | 效果一般 | 任务相似 |
| ProgressiveNN | 不遗忘 | 参数增长 | 任务差异大 |
| PackNet | 参数共享 | 需要剪枝 | 多任务 |
| Experience Replay | 直接有效 | 存储问题 | 数据可保存 |

## 实践应用

### 增量学习场景
```python
class IncrementalLearner:
    def __init__(self):
        self.model = model
        self.ewc = EWC(self.model)

    def train_new_task(self, task_data):
        # 1. 计算旧任务Fisher
        self.ewc.compute_fisher(task_data)

        # 2. 带EWC正则的训练
        loss = cross_entropy + self.ewc.penalty()
        loss.backward()

        # 3. 更新Fisher
        self.ewc.update_fisher()
```

### 多任务机器人学习
```python
# 任务1：抓取
# 任务2：放置
# 任务3：旋转

# ProgressiveNN：每个任务独立参数
progressive = ProgressiveNN()
progressive.add_task("grasp", new_params_grasp)
progressive.add_task("place", new_params_place)
progressive.add_task("rotate", new_params_rotate)
```

## 最新研究进展

| 方法 | 年份 | 突破 |
|------|------|------|
| EWC | 2017 | 正则化基础 |
| ProgressiveNN | 2017 | 架构方法 |
| PackNet | 2018 | 剪枝+复用 |
| Online EWC | 2020 | 高效计算 |
| Mixture of Experts | 2022 | 动态路由 |

## Cross-refs
- [[concepts/2026-05-14_concept_memory-architecture.m[[knowledge/Design-Toolkit]]] — 记忆架构
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — AI记忆层
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化循环（防止遗忘）
- [[ml/Federated-Learning.m[[knowledge/Design-Toolkit]]] — 分布式持续学习