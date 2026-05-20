---
type: entity
category: ml
key: Chain-of-Thought
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
---

# Chain-of-Thought (CoT) - 推理链提示

## Overview

- **全称**: Chain-of-Thought Prompting
- **本质**: 让LLM生成中间推理步骤，再得到最终答案
- **论文**: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (2022)
- **作者**: Jason Wei et al., Google
- **核心思想**: 思考过程本身是推理的组成部分

## 与普通Prompt对比

```
普通Prompt：
┌─────────────────────────────────────────────────────┐
│ Q: 小明有3个苹果，小红给了他2个，小明现在有多少个？      │
│ A: 5个                                             │
└─────────────────────────────────────────────────────┘
问题：直接给出答案，无法追溯推理过程

CoT Prompt：
┌─────────────────────────────────────────────────────┐
│ Q: 小明有3个苹果，小红给了他2个，小明现在有多少个？      │
│ A: 让我们一步步思考：                                │
│    1. 小明最初有3个苹果                              │
│    2. 小红又给了2个                                  │
│    3. 3 + 2 = 5                                     │
│    因此答案是：5个                                   │
└─────────────────────────────────────────────────────┘
优势：推理过程透明，可追溯，可纠正
```

## 核心机制

### 中间推理步骤

CoT的核心是将复杂问题分解为**逐步推理**：

```
问题 → 步骤1 → 步骤2 → 步骤3 → ... → 最终答案
         ↓        ↓        ↓              ↓
      原子子问题  中间结果  中间结果        输出
```

### 为什么有效

| 机制 | 解释 |
|------|------|
| **过程分解** | 复杂问题拆解为简单子问题，降低认知负荷 |
| **注意力转移** | 推理步骤引导模型关注关键中间变量 |
| **隐式计算** | 中间步骤承载隐性计算，减少主模型负担 |
| **错误可追溯** | 错误发生在具体步骤，便于定位和修正 |
| **涌现效应** | 思维链在足够大模型(>100B)上涌现 |

## 数学推导

### 形式化定义

设问题 $Q$，目标答案 $A$，推理链 $R = (r_1, r_2, ..., r_n)$：

$$
P(A|Q) = \sum_{R} P(A|Q, R) \cdot P(R|Q)
$$

标准 prompting 直接估计 $P(A|Q)$，而 CoT 引入中间推理 $R$：

$$
\log P(A|Q) \approx \log P(A|Q, R^*) + \lambda \cdot \underbrace{\sum_{i=1}^{n} \log P(r_i|Q, r_1, ..., r_{i-1})}_{\text{思维链损失}}
$$

### 条件概率视角

CoT有效性可通过条件概率分解理解：

$$
P(\text{答案}|\text{问题}) = \sum_{\text{推理步骤}} P(\text{答案}|\text{问题}, \text{推理步骤}) \cdot P(\text{推理步骤}|\text{问题})
$$

- **普通Prompt**: 隐式假设推理步骤是确定性的（单路径）
- **CoT**: 显式建模推理路径分布，允许多条推理链

### 缩放定律

| 模型规模 | 普通Prompt | CoT Prompt | 提升 |
|----------|------------|------------|------|
| < 10B | 差 | 差 | 无 |
| ~100B | 好 | 优异 | 显著 |
| > 100B | 好 | 涌现 | 质的飞跃 |

## 实现示例

### Zero-shot CoT

```python
# Zero-shot CoT - 无需示例
def zero_shot_cot(llm, question):
    prompt = f"""
Q: {question}
A: 让我们一步步思考。
1. """

    # 自动生成推理步骤
    reasoning = llm.generate(prompt)

    # 提取最终答案
    answer = extract_final_answer(reasoning)
    return answer
```

### Few-shot CoT

```python
# Few-shot CoT - 提供示例
few_shot_cot_prompt = """
Q: 小明有5个球，又买了3个，现在有多少个？
A: 让我们一步步思考：
   1. 小明最初有5个球
   2. 又买了3个球
   3. 5 + 3 = 8
   因此答案是：8个

Q: 书店有15本书，卖出7本，又进货5本，现在有多少本？
A: 让我们一步步思考：
   1. 书店最初有15本书
   2. 卖出7本，还剩 15 - 7 = 8 本
   3. 又进货5本，现在有 8 + 5 = 13 本
   因此答案是：13本

Q: {question}
A: """
```

### Self-Consistency + CoT

```python
# 自洽性采样
def self_consistency_cot(llm, question, n_samples=5):
    prompts = [
        f"Q: {question}\nA: 让我们一步步思考："
        for _ in range(n_samples)
   [[Self-Healing-Loop]]

    # 并行采样多条推理链
    reasoning_chains = llm.generate_batch(prompts)

    # 提取每个链的答案
    answers = [extract_answer(chain) for chain in reasoning_chain[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]

    # 投票选择最一致的答案
    return majority_vote(answers)
```

### Tree of Thought (ToT) 变体

```python
# 树状搜索推理
def tree_of_thought(llm, problem, depth=3, breadth=3):
    # 初始化根节点
    nodes = [Node(content=problem)]

    for level in range(depth):
        new_nodes = [[Self-Healing-Loop]]
        for node in nodes:
            # 生成候选下一步
            candidates = llm.generate(
                f"基于'{node.content}'，提出3个不同的思考方向："
            )
            for candidate in candidates[:breadth]:
                new_nodes.append(Node(content=candidate, parent=node))

        # 剪枝：选择最有前景的节点
        nodes = prune(new_nodes, top_k=breadth)

    # 回溯最优路径
    return backtrack(find_best_leaf(nodes))
```

## 变体

### 1. Zero-shot CoT

- **特点**: 无需示例，仅加"让我们一步步思考"
- **论文**: Kojima et al., 2022
- **优点**: 零成本prompting
- **缺点**: 推理质量不稳定

### 2. Few-shot CoT

- **特点**: 提供少量示例，包含推理过程
- **论文**: Wei et al., 2022
- **优点**: 推理质量稳定
- **缺点**: 需要人工设计示例

### 3. Self-Consistency

- **特点**: 多路径采样 + 投票
- **论文**: Wang et al., 2022
- **优点**: 显著提升推理准确率
- **缺点**: 计算成本增加n倍

### 4. Tree of Thought (ToT)

- **特点**: 树状搜索，多条推理路径
- **论文**: Yao et al., 2023
- **优点**: 探索性任务表现优异
- **缺点**: 搜索空间大，计算成本高

### 5. Graph of Thought (GoT)

- **特点**: 图状推理，节点可合并/优化
- **论文**: Besta et al., 2023
- **优点**: 支持复杂推理网络
- **缺点**: 实现复杂度高

## 对比表格

| 方法 | 特点 | 适用场景 | 计算成本 |
|------|------|----------|----------|
| **CoT** | 链式推理，逐步推导 | 数学、逻辑、代码 | 低 |
| **Zero-shot CoT** | 无示例，仅触发词 | 快速推理 | 低 |
| **Few-shot CoT** | 提供示例 | 稳定推理 | 中 |
| **Self-Consistency** | 多路径+投票 | 高准确率要求 | 中 |
| **ToT** | 树状搜索 | 探索性任务 | 高 |
| **GoT** | 图状推理 | 复杂推理网络 | 高 |
| **ReAct** | 推理+行动+观察 | 需要外部知识 | 中 |
| **Reflexion** | 自我反思 | 错误纠正 | 中 |

## 应用场景

### 数学推理

```
Q: 一个矩形长5cm，宽3cm，面积是多少？
A: 1. 矩形面积 = 长 × 宽
   2. 代入：5cm × 3cm = 15cm²
   答案是：15平方厘米
```

### 逻辑推理

```
Q: 所有猫是动物，汤姆是猫，汤姆是动物吗？
A: 1. 大前提：所有猫是动物
   2. 小前提：汤姆是猫
   3. 根据三段论，汤姆是动物
   答案是：是的
```

### 代码生成

```python
# CoT引导代码生成
code_prompt = """
Q: 写一个函数判断一个数是否是质数
A: 让我一步步思考：
   1. 质数定义：只能被1和自身整除的大于1的整数
   2. 需要检查从2到√n的所有数
   3. 如果有任何数能整除n，则n不是质数
   4. 代码实现：
"""

def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
```

## Cross-refs

- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 推理+行动模式，CoT的扩展方向之一
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 底层架构，注意力机制支撑推理链
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 声明式prompt优化，可自动编译CoT
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低秩适配，可针对CoT任务微调
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 对齐训练，可提升CoT推理质量
- [[ml/World-Models.m[[knowledge/Design-Toolkit]]] — 世界模型中的推理基础