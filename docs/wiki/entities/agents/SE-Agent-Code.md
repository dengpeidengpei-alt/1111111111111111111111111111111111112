---
type: entity
category: agents
key: SE-Agent Code Implementation
source: GitHub JARVIS-Xs/SE-Agent
date: 2026-05-20
---

# SE-Agent Code Implementation

## Overview
- **仓库**: JARVIS-Xs/SE-Agent
- **内容**: SE-Agent的3R方法论代码实现
- **日期**: 2026-05-14

## 3R Methodology 实现

### Revision (AlternativeStrategyOperator)
```python
# 文件: SE/operators/alternative_strategy.py

class AlternativeStrategyOperator:
    """
    分析 traj.pool 中最近一次 FAILED 尝试，
    生成正交策略避免重复错误
    """

    def _load_traj_pool(self):
        """加载轨迹池数据"""

    def _get_latest_failed_approach(self):
        """获取最近失败尝试详情"""

    def _generate_alternative_strategy(self):
        """LLM生成替代策略"""
```

### Recombination (CrossoverOperator)
```python
# 文件: SE/operators/crossover.py

class CrossoverOperator:
    """
    结合两条轨迹特性生成混合策略
    """

    def select_parents(self):
        """选择最后两条轨迹进行交叉"""
        return valid_iterations[-2], valid_iterations[-1]

    def crossover(self, parent1, parent2):
        """生成混合策略"""
```

### Refinement (TrajPoolSummaryOperator)
```python
# 文件: SE/operators/traj_pool_summary.py

class TrajPoolSummaryOperator:
    """
    跨迭代分析识别系统性风险和盲区，
    生成简洁的风险感知指导
    """
```

## 架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SE-Agent 3R 循环                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────────┐                                                │
│   │   Trajectory   │                                                │
│   │     Pool       │                                                │
│   └───────┬───────┘                                                │
│           │                                                         │
│           ▼                                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │   Revision ←→ Recombination ←→ Refinement                  │   │
│   │   (替代策略)    (轨迹交叉)       (风险感知)                  │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│           │                                                         │
│           ▼                                                         │
│   ┌───────────────┐                                                │
│   │   Next        │                                                │
│   │   Attempt     │                                                │
│   └───────────────┘                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 3R 详解

| 操作 | 输入 | 输出 | 目的 |
|------|------|------|------|
| **Revision** | FAILED轨迹 | 替代策略 | 避免重复错误 |
| **Recombination** | 两条轨迹 | 混合策略 | 融合优点 |
| **Refinement** | 全量轨迹 | 风险指导 | 系统性改进 |

## 与 [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] 的关系

| 维度 | [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] (理论) | [[agents/SE-Agent-Code.m[[knowledge/Design-Toolkit]]] (实现) |
|------|------------------------|--------------------------|
| 内容 | 3R框架论文 | 代码实现 |
| 重点 | 方法论 | 具体operator |
| 深度 | 学术研究 | 工程项目 |

## Cross-refs
- [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] — 3R理论框架
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化循环
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 多Agent系统
- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — AI coworker