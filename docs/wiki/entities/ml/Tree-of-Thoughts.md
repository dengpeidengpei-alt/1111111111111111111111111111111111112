---
type: entity
category: ml
key: Tree-of-Thoughts
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
---

# Tree-of-Thoughts (ToT) - 思维树搜索

## Overview

- **全称**: Tree of Thoughts Prompting
- **本质**: 在解决问题时探索多条可能的推理路径，形成树状结构，通过评估和剪枝找到最优解
- **论文**: "Tree of Thoughts: Deliberative Problem Solving with Thought Search" (Yao et al., 2023)
- **核心思想**: 思维不是单一链条，而是多分支的树状探索过程

## 核心概念

| 概念 | 说明 |
|------|------|
| **思维树** | 问题解决过程中的多分支推理结构 |
| **探索** | 同时考虑多个可能的解决路径 |
| **回溯** | 当某路径失败时，返回并尝试其他路径 |
| **剪枝** | 评估后淘汰低质量分支，保留最优路径 |

## 与Chain-of-Thought对比

| 维度 | CoT | ToT |
|------|-----|-----|
| **结构** | 链式，单一路径 | 树状，多分支 |
| **探索方式** | 顺序推理 | 并行探索 |
| **回溯能力** | 无，线性进行 | 有，可返回上一层 |
| **剪枝** | 无 | 有，评估后淘汰 |
| **适用场景** | 简单推理任务 | 复杂探索性问题 |
| **计算成本** | 低 | 中高 |

## 思维流程图

```
问题 → 根节点
         │
    ┌────┼────┐
    ↓    ↓    ↓
 [分支1] [分支2] [分支3]  ← 第一层探索：生成多个候选思维
    │    │    │
    ↓    ↓    ↓
 [子节点A] [子节点B] [子节点C] ← 第二层探索：每个分支继续扩展
    │    │    │
    ↓    ↓    ↓
   评估 → 剪枝 → 选择最佳路径
    │    │    │
    └────┼────┘
         ↓
    最终解决方案
```

### 流程详解

1. **问题分解**: 将初始问题作为根节点
2. **分支生成**: 每个节点生成多个可能的"下一步"思考
3. **递归探索**: 向下扩展形成树的层次
4. **状态评估**: 评估每个节点的质量/可行性
5. **剪枝决策**: 淘汰低分节点，保留高分节点
6. **回溯搜索**: 失败路径回溯，尝试其他分支
7. **最优选择**: 最终选择得分最高的完整路径

## 核心机制

### 树状探索

```python
# 树状探索示意
class ToTNode:
    def __init__(self, content, parent=None):
        self.content = content      # 当前思维内容
        self.parent = parent       # 父节点
        self.children = [[Self-Healing-Loop]]         # 子节点
        self.value = None          # 评估值

def explore(node, depth=3, breadth=3):
    """递归探索树"""
    if depth == 0:
        return node

    # 生成候选子节点
    candidates = generate_candidates(node.content, n=breadth)
    for candidate in candidates:
        child = ToTNode(candidate, parent=node)
        node.children.append(child)

        # 递归探索
        explore(child, depth-1, breadth)

    return node
```

### 候选生成

```python
def generate_candidates(thought, n=3):
    """生成多个候选下一步思考"""
    prompt = f"""
基于当前思维："{thought}"
请提出{n}个不同的下一步思考方向。

考虑：
1. 不同的解决策略
2. 不同的验证方法
3. 不同的切入角度

输出每个方向的简短描述：
"""
    responses = llm.generate(prompt).split('\n')
    return [r.strip() for r in responses if r.strip()]
```

### 评估与剪枝

```python
def evaluate_node(node):
    """评估节点质量"""
    prompt = f"""
评估以下思维节点的质量：

内容：{node.content}
父节点：{node.parent.content if node.parent else "根节点"}

请从以下维度评分（1-10）：
1. 可行性 — 这个方向是否可行？
2. 前景 — 这个方向距离解决目标有多近？
3. 多样性 — 这个方向是否与其他方向不同？

总分："""

    score = llm.generate(prompt)
    node.value = parse_score(score)
    return node.value

def prune(tree, threshold=5):
    """剪枝：移除低分节点"""
    for node in tree.all_nodes():
        if node.value and node.value < threshold:
            # 将低分节点的子节点合并到父节点
            parent = node.parent
            if parent:
                for child in node.children:
                    child.parent = parent
                    parent.children.append(child)
                parent.children.remove(node)
```

## 算法实现

### 完整ToT Agent

```python
class ToTAgent:
    def __init__(self, llm, max_depth=3, breadth=3):
        self.llm = llm
        self.max_depth = max_depth
        self.breadth = breadth

    def solve(self, problem):
        # 初始化思维树
        tree = Tree()
        tree.root = ToTNode(problem)

        # 迭代搜索
        while not self.is_finished(tree):
            # 获取前沿节点（最深层未探索节点）
            frontier = tree.get_frontier()

            # 对每个前沿节点进行探索
            for node in frontier:
                # 生成候选
                children = self.explore(node)
                tree.add(children)

            # 评估所有节点
            for node in tree.all_nodes():
                if node.value is None:
                    self.evaluate(node)

            # 剪枝
            tree.prune(threshold=self.prune_threshold())

        # 返回最优解
        return tree.best_solution()

    def explore(self, node):
        """探索一个节点，生成子节点"""
        candidates = generate_candidates(node.content, n=self.breadth)
        children = [[Self-Healing-Loop]]
        for cand in candidates:
            child = ToTNode(cand, parent=node)
            children.append(child)
        return children

    def evaluate(self, node):
        """评估节点"""
        node.value = evaluate_node(node)
        return node.value

    def prune_threshold(self):
        """动态计算剪枝阈值"""
        # 基于树的当前状态计算阈值
        return 5  # 默认值

    def is_finished(self, tree):
        """检查搜索是否完成"""
        # 条件：达到深度限制 or 找到足够好的解
        return tree.depth >= self.max_depth or tree.has_good_solution()

    def best_solution(self):
        """获取最优解"""
        # 回溯得分最高的叶节点
        pass
```

### DFS回溯搜索

```python
def dfs_search(node, depth, max_depth, breadth):
    """深度优先搜索 + 回溯"""
    if depth == max_depth:
        return evaluate(node)

    best_value = -float('inf')

    # 生成候选
    candidates = generate_candidates(node.content, n=breadth)

    for candidate in candidates:
        child = ToTNode(candidate, parent=node)

        # 递归搜索
        value = dfs_search(child, depth + 1, max_depth, breadth)

        # 更新最优
        if value > best_value:
            best_value = value
            node.best_child = child

        # 回溯：尝试其他分支
        if value < best_value * 0.8:  # 阈值
            continue  # 放弃这个分支

    return best_value
```

## 变体

### 1. BFS ToT (广度优先)

- **特点**: 按层次遍历，先扩展所有同一层节点
- **优点**: 保证找到最短最优路径
- **缺点**: 内存消耗大

### 2. DFS ToT (深度优先)

- **特点**: 先深入一条路径，再回溯
- **优点**: 内存效率高
- **缺点**: 可能错过更短的解

### 3. Beam ToT (束搜索)

- **特点**: 每层只保留top-k节点
- **优点**: 平衡探索与效率
- **缺点**: 可能漏掉隐藏的优秀路径

### 4. Monte Carlo ToT (蒙特卡洛)

- **特点**: 随机采样 + 评估
- **优点**: 避免局部最优
- **缺点**: 不保证最优解

## 应用场景

### 复杂推理问题

```
问题：解决一个需要多步推理的数学证明

ToT探索：
Level 0: 初始问题
Level 1: 提出三种证明策略（直接证明/反证法/归纳法）
Level 2: 每种策略进一步展开具体步骤
Level 3: 评估每个分支的可行性

最终选择可证明路径
```

### 创意写作

```
问题：写一个解决复杂冲突的故事

ToT探索：
Level 0: 故事主题
Level 1: 三种不同的故事走向
Level 2: 每种走向的三个情节点
Level 3: 每个情节点的细节

回溯找到最有趣的故事线
```

### 代码调试

```
问题：找出并修复一个bug

ToT探索：
Level 0: bug描述
Level 1: 可能的原因（逻辑错误/边界条件/并发问题）
Level 2: 每个原因的验证方法
Level 3: 每个验证的预期结果

剪枝排除不可能的原因，保留真实原因
```

## 与其他方法对比

| 方法 | 结构 | 探索 | 回溯 | 适用场景 |
|------|------|------|------|----------|
| **CoT** | 链式 | 单路径 | 无 | 简单推理 |
| **ToT** | 树状 | 多路径 | 有 | 复杂探索 |
| **GoT** | 图状 | 网状 | 有 | 复杂推理 |
| **ReAct** | 循环 | 迭代 | 有 | 外部交互 |
| **Self-RAG** | 链式+反思 | 条件触发 | 有 | RAG任务 |

## 优缺点

### 优点

- **探索多样性**: 同时考虑多个解决路径
- **回溯能力**: 失败路径可回溯，不陷入死胡同
- **系统性**: 结构化思考，避免遗漏
- **可解释性**: 思维过程清晰可见

### 缺点

- **计算成本**: 多路径探索消耗更多token
- **复杂度**: 实现比CoT更复杂
- **剪枝难度**: 评估函数设计困难
- **不适用于简单问题**: 杀鸡用牛刀

## Cross-refs

- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — ToT基础，单路径推理
- [[ml/Graph-of-Thoughts.m[[knowledge/Design-Toolkit]]] — ToT进阶，图状结构
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 推理+行动结合ToT探索
- [[ml/Self-RAG.m[[knowledge/Design-Toolkit]]] — 自我反思增强ToT评估
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 底层注意力机制支撑多路径推理
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 大语言模型是ToT的载体
- [[Problem-Solvin[[Self-Healing-Loop]]] — ToT是问题解决的一种范式