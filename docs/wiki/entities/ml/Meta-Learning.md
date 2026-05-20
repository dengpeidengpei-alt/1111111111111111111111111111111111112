---
type: entity
category: ml
key: Meta-Learning — 元学习 ★★★★☆
source: Claude-Evo
date: 2026-05-20
---

# Meta-Learning — 元学习 ★★★★☆

> "学会学习"，让模型快速适应新任务

## 核心原理

**问题**：传统ML需要大量数据+长时间训练适应新任务

**元学习目标**：用少量样本快速适应
```
任务分布 p(T) → 学会如何学习 → 新任务T'
```

**MAML核心思想**：
- 找到一个好的初始化参数θ
- 使得在任意新任务上只需几步梯度下降就能适应

**MAML目标**：
```
min_θ Σ_T∈p(T) L_T(θ - α∇_θL_T(θ))
```

## 三大范式

| 范式 | 方法 | 核心思想 |
|------|------|----------|
| **Metric-based** | Prototypical Networks, Matching Networks | 学习相似度度量 |
| **Model-based** | MANN, Meta-LSTM | 用外部/内部记忆快速适应 |
| **Optimization-based** | MAML, Reptile | 改进优化器/初始化 |

## 代码示例

```python
import torch
import torch.nn.functional as F

class MAML(torch.nn.Module):
    def __init__(self, model, inner_lr=0.01, outer_lr=0.001):
        super().__init__()
        self.model = model
        self.inner_lr = inner_lr
        self.optimizer = torch.optim.Adam(model.parameters(), lr=outer_lr)

    def forward(self, support_x, support_y, query_x, query_y, num_inner_steps=5):
        """
        MAML inner loop adaptation
        """
        # 克隆参数用于inner loop
        adapted_params = {k: v.clone() for k, v in self.model.named_parameters()}

        # Inner loop：对support set做几步梯度下降
        for _ in range(num_inner_steps):
            logits = self.model.forward_with_params(support_x, adapted_params)
            loss = F.cross_entropy(logits, support_y)
            grads = torch.autograd.grad(loss, adapted_params.values(), create_graph=True)
            adapted_params = {k: v - self.inner_lr * g for (k, v), g in zip(adapted_params.items(), grads)}

        # Outer loop：对query set评估
        query_logits = self.model.forward_with_params(query_x, adapted_params)
        query_loss = F.cross_entropy(query_logits, query_y)

        # 更新原始参数
        self.optimizer.zero_grad()
        query_loss.backward()
        self.optimizer.step()

        return query_loss.item()
```

## Prototypical Networks（少样本分类）

```python
def prototypical_loss(embeddings, labels, n_way, k_shot):
    """
    Prototypical Networks for few-shot learning
    """
    classes = torch.unique(labels)
    # 计算每个类的prototype（center of support set）
    prototypes = torch.stack([
        embeddings[labels == c][:k_sho[[knowledge/Design-Toolkit]].mean(0) for c in classes
   [[Self-Healing-Loop]])

    # Query到prototype的距离
    distances = torch.cdist(embeddings, prototypes)
    # 负距离作为logits（距离越小越可能是该类）
    log_p = F.log_softmax(-distances, dim=-1)

    # 计算loss
    target_idx = torch.arange(n_way).unsqueeze(1).expand(n_way, k_shot).flatten()
    return F.nll_loss(log_p, target_idx)
```

## MAML数学推导

### 目标函数

MAML寻找最优初始化参数θ*，使得在任务T上新任务适应最快：

$$
\theta^* = \arg\min_\theta \sum_{\mathcal{T}_i \sim p(\mathcal{T})} \mathcal{L}_{\mathcal{T}_i}(f_{\theta - \alpha \nabla_\theta \mathcal{L}_{\mathcal{T}_i}(f_\theta)})
$$

其中：
- $f_\theta$：参数为θ的模型
- $\mathcal{T}_i$：从任务分布采样的任务
- $\alpha$：内循环学习率
- $\nabla_\theta \mathcal{L}$：任务损失的梯度

### 两层优化结构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MAML 双层优化结构                                    │
└─────────────────────────────────────────────────────────────────────────────┘

外循环 (Outer loop) - 更新初始化参数θ
   │
   │ 每Task采样
   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 内循环 (Inner loop) - 快速适应                                            │
│                                                                             │
│   Task 1: θ → θ'₁ = θ - α∇L₁(θ)                                          │
│   Task 2: θ → θ'₂ = θ - α∇L₂(θ)                                           │
│   Task 3: θ → θ'₃ = θ - α∇L₃(θ)                                           │
│   ...                                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
   │
   │ 在各Task的adapted参数上评估loss
   ▼
   θ_new = θ - β * Σ∇L_i(θ'_i)  // β是外循环学习率
```

### 与多任务学习的区别

| 维度 | 多任务学习 | MAML |
|------|-----------|------|
| 目标 | 共享参数直接优化 | 学习初始化参数 |
| 适应方式 | 固定参数 | 每个任务快速微调 |
| 新任务 | 需要重新训练 | 只需几步梯度 |
| 泛化能力 | 受限于共享表示 | 更强的任务迁移 |

## Reptile算法

Reptile是MAML的简化版，不需要二阶导数：

```python
def reptile(model, tasks, inner_steps=5, outer_lr=0.001):
    """
    Reptile: 简化版MAML
    核心思想：反复对任务做梯度下降，方向指向所有任务的平均最优
    """
    optimizer = torch.optim.Adam(model.parameters(), lr=outer_lr)

    for _ in range(num_iterations):
        # 采样任务
        task = random.choice(tasks)

        # 多次内循环梯度下降
        adapted_params = model.state_dict()
        for _ in range(inner_steps):
            # 在task上计算梯度并更新
            loss = task.compute_loss(model)
            grads = torch.autograd.grad(loss, model.parameters())
            adapted_params = {
                k: v - 0.1 * g for k, v, g in zip(adapted_params.values(), grads)
            }

        # 外循环：朝adapted方向移动
        current_params = model.state_dict()
        for k in current_params:
            current_params[k] = current_params[k] + outer_lr * (adapted_params[k] - current_params[k])

        model.load_state_dict(current_params)
```

## Meta-Learning在LLM中的应用

### 1. 模型无关的元学习 (MAML for LLMs)

```python
class LLM_MAML:
    """将MAML应用于LLM的微调"""

    def __init__(self, model, inner_lr=0.01, outer_lr=1e-5):
        self.model = model
        self.inner_lr = inner_lr
        self.optimizer = torch.optim.Adam(model.parameters(), lr=outer_lr)

    def adapt_to_task(self, support_set, num_steps=5):
        """在support set上快速适应"""
        adapted_params = {k: v.clone() for k, v in self.model.named_parameters()}

        for _ in range(num_steps):
            # 计算语言建模损失
            loss = self.compute_lm_loss(support_set, adapted_params)
            grads = torch.autograd.grad(loss, adapted_params.values())
            adapted_params = {
                k: v - self.inner_lr * g
                for (k, v), g in zip(adapted_params.items(), grads)
            }

        return adapted_params

    def meta_train(self, tasks):
        """元训练：在多个任务上学习好初始化"""
        total_loss = 0

        for task in tasks:
            # 1. 在support set上快速适应
            adapted_params = self.adapt_to_task(task.support)

            # 2. 在query set上评估
            query_loss = self.compute_lm_loss(task.query, adapted_params)
            total_loss += query_loss

        # 3. 更新初始化参数
        self.optimizer.zero_grad()
        total_loss.backward()
        self.optimizer.step()
```

### 2. LLM提示优化 (Meta-Learning for Prompts)

```python
class MetaPromptOptimization:
    """用元学习优化提示模板"""

    def __init__(self, llm):
        self.llm = llm

    def meta_learn_prompt(self, task_distribution, num_iterations=100):
        """
        学习一个通用提示模板
        """
        prompt_template = "请回答以下问题：{question}"

        for i in range(num_iterations):
            # 在任务分布上评估当前模板
            losses = [[Self-Healing-Loop]]
            for task in sample_tasks(task_distribution, batch_size=16):
                response = self.llm.generate(prompt_template.format(question=task.question))
                loss = task.evaluate(response)
                losses.append(loss)

            # 梯度更新prompt模板（离散优化，需用RL或梯度估计）
            prompt_gradient = estimate_prompt_gradient(losses)
            prompt_template = update_prompt(prompt_template, prompt_gradient)

        return prompt_template
```

### 3. 测试时提示适应 (Test-Time Prompt Adaptation)

```python
class TestTimePromptAdaptation:
    """测试时动态调整提示"""

    def __init__(self, llm):
        self.llm = llm
        self.prompt_cache = {}

    def adapt_prompt(self, task_example, query):
        """
        根据任务示例自适应调整提示
        """
        # 提取任务特征
        task_type = classify_task(task_example)
        difficulty = estimate_difficulty(task_example)

        # 选择/组合提示模板
        if task_type in self.prompt_cache:
            base_prompt = self.prompt_cache[task_typ[[Self-Healing-Loop]]
        else:
            base_prompt = self.get_default_prompt(task_type)

        # 根据难度调整
        if difficulty == "high":
            # 增加示例数量
            prompt = base_prompt.replace("{n_shots}", "10")
        else:
            prompt = base_prompt.replace("{n_shots}", "3")

        return prompt.format(question=query)
```

## 少样本分类实战

### Omniglot实验

```python
class OmniglotFewShot:
    """Omniglot少样本分类实验框架"""

    def __init__(self, model, n_way=5, k_shot=1, query_size=1):
        self.model = model
        self.n_way = n_way
        self.k_shot = k_shot
        self.query_size = query_size

    def episode_train(self, support_images, support_labels, query_images, query_labels):
        """单episode训练"""

        # 1. 计算support set的prototype
        support_embeddings = self.model(support_images)
        prototypes = compute_prototypes(support_embeddings, support_labels, self.n_way)

        # 2. 计算query set的embedding
        query_embeddings = self.model(query_images)

        # 3. 计算距离并分类
        distances = cdist(query_embeddings, prototypes)
        log_probs = F.log_softmax(-distances, dim=-1)

        # 4. 计算loss
        targets = torch.arange(self.n_way).unsqueeze(1).expand(self.n_way, self.query_size).flatten()
        loss = F.nll_loss(log_probs, targets)

        # 5. 更新（元学习外循环）
        loss.backward()
        self.optimizer.step()
        self.optimizer.zero_grad()

        # 返回准确率
        predictions = log_probs.argmax(dim=-1)
        accuracy = (predictions == targets).float().mean()

        return loss.item(), accuracy.item()
```

### N-way K-shot配置

| 配置 | 典型应用 | 难度 |
|------|----------|------|
| 5-way 1-shot | 少样本基线 | 简单 |
| 5-way 5-shot | 标准评估 | 中等 |
| 20-way 1-shot | 困难分类 | 难 |
| 20-way 5-shot | 挑战极限 | 很难 |

## 持续学习中的元学习

```python
class MetaContinualLearning:
    """元学习 + 持续学习结合"""

    def __init__(self, model):
        self.model = model
        self.meta_optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

    def learn_task(self, task, prev_tasks):
        """
        学习新任务同时保持对旧任务的性能
        """
        # 1. 在新任务上快速适应
        adapted_params = self.meta_adapt(task.support)

        # 2. 检查旧任务性能是否下降
        for prev_task in prev_tasks:
            old_performance = prev_task.accuracy

            # 在旧任务上测试adapt后的模型
            new_performance = self.evaluate(prev_task.query, adapted_params)

            # 如果下降太多，进行补救
            if old_performance - new_performance > threshold:
                # 复习旧任务
                self.review(prev_task, adapted_params)

        # 3. 更新元学习器
        self.meta_optimizer.step()

    def meta_adapt(self, support_set):
        """元学习快速适应"""
        params = {k: v.clone() for k, v in self.model.named_parameters()}

        for _ in range(5):  # inner loop steps
            loss = self.compute_loss(support_set, params)
            grads = torch.autograd.grad(loss, params.values())
            params = {k: v - 0.01 * g for k, v, g in zip(params.items(), grads)}

        return params
```

## Cross-refs

- [[ml/Few-Shot-Learning.m[[knowledge/Design-Toolkit]]] — 具体应用场景
- [[ml/Test-Time-Training.m[[knowledge/Design-Toolkit]]] — 测试时继续学习，TTT是Meta-Learning的扩展
- [[ml/Continual-Learning.m[[knowledge/Design-Toolkit]]] — 持续适应，与元学习结合
- [[MAM[[Self-Healing-Loop]]] — Model-Agnostic Meta-Learning，核心算法
- [[Reptil[[Self-Healing-Loop]]] — MAML的简化版本
- [[ml/Meta-Learning.m[[knowledge/Design-Toolkit]]] — 元学习基础概念