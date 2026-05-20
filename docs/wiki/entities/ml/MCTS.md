---
type: entity
category: ml
key: MCTS — Monte Carlo Tree Search
source: Claude-Evo
date: 2026-05-20
---

# MCTS — Monte Carlo Tree Search

> 蒙特卡洛树搜索，AlphaGo/AlphaZero的核心算法

## 核心原理

**四步循环**：
```
1. Selection（选择）
   UCT = Q(s,a) + c * sqrt(ln(N(s)) / N(s,a))
   选择最大UCT值的节点

2. Expansion（扩展）
   添加一个或多个子节点

3. Simulation（模拟）
   随机 rollout 到终止状态

4. Backpropagation（回传）
   更新路径上所有节点的统计量
```

**UCT公式**：
- Q(s,a)：节点(s,a)的平均价值
- N(s)：访问次数
- N(s,a)：边(s,a)的访问次数
- c：探索常数（通常√2）

## 与传统搜索对比

| 方法 | 复杂度 | 适用性 |
|------|--------|--------|
| Minimax + Alpha-Beta | O(b^d) | 确定性、规则明确 |
| MCTS | O(b * log(b) * d) | 大分支、弱规则 |
| AlphaZero MCTS | 深度学习引导 | 大状态空间 |

## 代码示例

```python
import math
import random
from collections import defaultdict

class MCTSNode:
    def __init__(self, state, parent=None, action=None):
        self.state = state
        self.parent = parent
        self.action = action
        self.children = {}
        self.N = 0  # 访问次数
        self.Q = 0  # 平均价值
        self.is_terminal = state.is_terminal()

    def UCT(self, c=math.sqrt(2)):
        if self.parent is None:
            return float('inf')
        return self.Q + c * math.sqrt(math.log(self.parent.N) / (self.N + 1e-8))

    def select(self):
        """Selection: 选择UCT最大的子节点"""
        if not self.children:
            return self
        return max(self.children.values(), key=lambda n: n.UCT()).select()

    def expand(self):
        """Expansion: 添加子节点"""
        if self.is_terminal:
            return self
        for action in self.state.get_legal_actions():
            if action not in self.children:
                new_state = self.state.take_action(action)
                self.children[actio[[Self-Healing-Loop]] = MCTSNode(new_state, self, action)
        return self

    def simulate(self):
        """Simulation: 随机 rollout"""
        state = self.state.copy()
        while not state.is_terminal():
            action = random.choice(state.get_legal_actions())
            state = state.take_action(action)
        return state.get_reward()

    def backpropagate(self, reward):
        """Backpropagation: 更新统计量"""
        self.N += 1
        self.Q += (reward - self.Q) / self.N
        if self.parent:
            self.parent.backpropagate(reward)

def mcts_search(root_state, n_simulations=1000):
    root = MCTSNode(root_state)
    for _ in range(n_simulations):
        node = root.select()
        if not node.is_terminal:
            node = node.expand()
        reward = node.simulate()
        node.backpropagate(reward)
    return max(root.children.items(), key=lambda x: x[1].N)[0]
```

## 应用场景

| 场景 | 典型应用 |
|------|----------|
| 游戏AI | AlphaGo, AlphaZero, Stockfish |
| 代码生成 | AlphaCode |
| LLM推理 | Tree-of-Thoughts, ReAct |
| 规划 | 机器人路径规划 |

## Cross-refs

- [[ml/Tree-of-Thoughts.m[[knowledge/Design-Toolkit]]] — MCTS用于LLM推理
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 结合推理和行动
- [[ml/World-Models.m[[knowledge/Design-Toolkit]]] — MCTS依赖环境模型