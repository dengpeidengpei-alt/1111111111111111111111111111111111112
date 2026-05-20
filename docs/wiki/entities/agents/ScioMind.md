---
type: entity
category: agents
key: ScioMind
source: arXiv 2605.13725
date: 2026-05-20
---

# ScioMind - Cognitively Grounded Multi-Agent Social Simulation

> 认知科学锚定的多 Agent 社会模拟 | 层级记忆 × 信念锚定 × 异质人格

## 概述

| 属性 | 值 |
|------|-----|
| 论文 | arXiv 2605.13725 |
| 作者 | Yitian Yang et al. |
| 定位 | 认知 grounded 的多 Agent 社会模拟 |
| 核心贡献 | bridging structured opinion dynamics with LLM-based agent reasoning |
| 应用场景 | 政治心理分析、社会舆论模拟、群体决策研究 |

ScioMind 是一个将认知科学理论与 LLM Agent 结合的社会模拟框架。与传统 Agent 系统不同，ScioMind 强调：
1. 信念更新的认知锚定机制
2. 层级记忆架构
3. 异质人格模拟

## 核心创新

### 传统 Agent 的问题

```
┌─────────────────────────────────────────────────────────────────────┐
│                     传统 Agent 的信念更新                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   新证据 → 直接更新信念 → 信念变化过大                                │
│                                                                     │
│   问题：忽视初始信念的锚定效应，产生不真实的信念轨迹                    │
└─────────────────────────────────────────────────────────────────────┘
```

ScioMind 引入认知科学的锚定理论，使 Agent 模拟更真实。

## 三层记忆架构

### L1: Working Memory（工作记忆）

```python
class WorkingMemory:
    """
    即时推理、当前上下文
    容量有限，类似于人类的前额叶工作记忆
    """
    def __init__(self, capacity=7):
        self.capacity = capacity  # Miller's 7±2
        self.context = {}
        self.current_reasoning = [[Self-Healing-Loop]]

    def store(self, item):
        """存储到工作记忆"""
        if len(self.context) >= self.capacity:
            self.evict_least_recent()
        self.context[item.key] = item.value

    def retrieve(self, key):
        """从工作记忆检索"""
        return self.context.get(key)

    def update_reasoning(self, step):
        """更新当前推理步骤"""
        self.current_reasoning.append(step)
        # 防止无限延伸
        if len(self.current_reasoning) > self.capacity:
            self.compress()
```

### L2: Episodic Memory（情景记忆）

```python
class EpisodicMemory:
    """
    交互历史、经验积累
    类似海马体的记忆存储
    """
    def __init__(self):
        self.episodes = [[Self-Healing-Loop]]  # (timestamp, agent_id, interaction, outcome)
        self.associations = {}  # episode linking

    def store_interaction(self, agent_id, interaction, outcome):
        """存储交互经历"""
        episode = {
            "timestamp": now(),
            "agent_id": agent_id,
            "interaction": interaction,
            "outcome": outcome,
            "emotional_valence": self.evaluate_emotion(interaction, outcome)
        }
        self.episodes.append(episode)
        self.update_associations(episode)

    def retrieve_similar(self, situation):
        """检索相似情境"""
        return [e for e in self.episodes
                if self.similarity(situation, e) > threshol[[knowledge/Design-Toolkit]]

    def update_associations(self, episode):
        """更新联想网络"""
        # 事件之间的因果关联
        pass
```

### L3: Semantic Memory（语义记忆）

```python
class SemanticMemory:
    """
    共享知识、群体信念
    类似大脑皮层的结构化知识存储
    """
    def __init__(self):
        self.shared_knowledge = {}
        self.group_beliefs = {}
        self.normative_rules = {}

    def add_knowledge(self, concept, value, agent_id=None):
        """添加共享知识"""
        if concept not in self.shared_knowledge:
            self.shared_knowledge[concep[[knowledge/Design-Toolkit]] = [[Self-Healing-Loop]]
        self.shared_knowledge[concep[[knowledge/Design-Toolkit]].append({
            "value": value,
            "agent_id": agent_id,
            "timestamp": now()
        })

    def update_group_belief(self, belief_topic, new_evidence):
        """更新群体信念"""
        # 贝叶斯更新，但受锚定效应影响
        current = self.group_beliefs.get(belief_topic, 0.5)
        updated = self.bayesian_update_with_anchoring(
            current, new_evidence, anchor_strength=0.3
        )
        self.group_beliefs[belief_topic] = updated

    def get_normative_rules(self):
        """获取规范规则"""
        return self.normative_rules
```

## 认知锚定机制

### 信念更新公式

```
┌─────────────────────────────────────────────────────────────────────┐
│                 ScioMind 信念更新公式                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   信念_{t+1} =  Personality × AnchoringStrength × 新证据            │
│                                                                     │
│   其中：                                                             │
│   - Personality: 人格特质调节因子（保守型/开放型）                     │
│   - AnchoringStrength: 锚定强度（初始信念越强，锚定越大）             │
│   - 新证据: 接收到的信息                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 实现代码

```python
class CognitiveAnchoring:
    """
    认知锚定机制
    模拟人类的锚定偏差和确认偏误
    """
    def __init__(self, personality_config):
        self.personality = personality_config
        # 人格特质：开放性/保守性
        self.openness = personality_config.get("openness", 0.5)
        # 初始锚定强度
        self.anchor_strength = 0.7

    def update_belief(self, current_belief, new_evidence, anchor_strength=None):
        """
        带锚定的信念更新
        """
        # 如果未指定锚定强度，使用默认值
        if anchor_strength is None:
            anchor_strength = self.anchor_strength

        # 计算锚定调整
        anchor_adjustment = anchor_strength * current_belief

        # 计算新信念（考虑人格特质）
        # 开放型人格：更重视新证据
        # 保守型人格：更重视锚定
        openness_factor = self.openness  # 0-1
        conservatism_factor = 1 - openness_factor

        new_belief = (
            conservatism_factor * anchor_adjustment +
            openness_factor * new_evidence
        )

        # 锚定衰减：新证据越多，锚定越弱
        self.anchor_strength *= 0.95  # 每更新一次衰减

        return new_belief

    def evaluate_evidence(self, evidence):
        """
        评估证据（模拟确认偏误）
        """
        # 选择性接受：更容易接受支持现有信念的证据
        confirmation_bias = 0.2  # 确认偏误强度

        if evidence * self.current_belief > 0:
            # 同向证据：增强
            return evidence * (1 + confirmation_bias)
        else:
            # 反向证据：削弱
            return evidence * (1 - confirmation_bias)
```

### 锚定效应可视化

```
┌─────────────────────────────────────────────────────────────────────┐
│                     锚定效应示意图                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   初始信念强（锚定强度高）                                            │
│   ┌──────────────────────────────────────────┐                     │
│   │  初始信念 = 0.8    新证据 = 0.4           │                     │
│   │  结果 = 0.8 × 0.7 + 0.4 × 0.3 = 0.68    │                     │
│   │  变化小，接近初始信念                      │                     │
│   └──────────────────────────────────────────┘                     │
│                                                                     │
│   初始信念弱（锚定强度低）                                            │
│   ┌──────────────────────────────────────────┐                     │
│   │  初始信念 = 0.3    新证据 = 0.4           │                     │
│   │  结果 = 0.3 × 0.3 + 0.4 × 0.7 = 0.37    │                     │
│   │  变化大，更新更快                          │                     │
│   └──────────────────────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 动态异质人格

### 人格配置

```python
class DynamicAgentProfile:
    """
    动态 Agent 人格配置
    来源: Corpus-grounded retrieval pipeline
    """
    def __init__(self, profile_id):
        self.profile_id = profile_id
        self.personality = self.load_personality()
        self.reasoning_capability = self.load_reasoning()
        self.internal_state = self.init_internal_state()

    def load_personality(self):
        """从语料库加载人格特质"""
        # 使用大五人格模型
        return {
            "openness": random.uniform(0.3, 0.9),      # 开放性
            "conscientiousness": random.uniform(0.3, 0.9),  # 尽责性
            "extraversion": random.uniform(0.3, 0.9),  # 外向性
            "agreeableness": random.uniform(0.3, 0.9),  # 宜人性
            "neuroticism": random.uniform(0.2, 0.8)    # 神经质
        }

    def evolve_internal_state(self, experience):
        """根据经验演化内部状态"""
        # 信念更新
        # 态度变化
        # 知识积累
        pass
```

### 人格对信念更新的影响

| 人格类型 | 开放性 | 锚定强度 | 证据权重 | 典型行为 |
|----------|--------|----------|----------|----------|
| 保守型 | 低 | 高 | 低 | 坚持原有信念 |
| 开放型 | 高 | 低 | 高 | 快速更新信念 |
| 平衡型 | 中 | 中 | 中 | 审慎权衡 |

## 与其他 Agent 系统对比

| 维度 | ScioMind | [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] | [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] | [[agents/CrewAI.m[[knowledge/Design-Toolkit]]] |
|------|----------|-------------------|-------------|------------|
| 重点 | 社会模拟 | 多 Agent 协作 | 个人助理 | 任务协作 |
| 记忆 | 层级+锚定 | 共享知识库 | 三层 Qdrant | 无 |
| 人格 | 动态+异质 | 固定角色 | 配置化 | 预设角色 |
| 应用 | 政治心理 | 软件开发 | 工作助理 | 结构化任务 |
| 认知基础 | 认知科学 | 无 | 无 | 无 |
| 信念更新 | 锚定+人格 | 无 | 无 | 无 |

## 认知科学理论基础

| 概念 | 来源 | 在 ScioMind 中的应用 |
|------|------|---------------------|
| 锚定偏差 | Tversky & Kahneman | 初始信念持久化 |
| 确认偏误 | 认知心理学 | 选择性接受证据 |
| 有限理性 | Herbert Simon | 启发式推理 |
| 群体动力学 | 社会学 | 信念演化 |
| 工作记忆容量 | Miller | L1 容量限制 |
| 情景记忆 | 记忆研究 | L2 交互记录 |

## 实验验证

### 信念持久性测试

```
┌─────────────────────────────────────────────────────────────────────┐
│                     信念轨迹对比                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   传统 Agent:    ▁▂▃▄▅▆▇  → 快速跟随新证据                           │
│                                                                     │
│   ScioMind:     ▁▁▂▂▃▂▂▂  → 锚定效应保持稳定轨迹                      │
│                                                                     │
│   真实人类:     ▁▁▂▂▂▃▃▃  → 类似 ScioMind 的模式                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 群体极化测试

模拟 100 个 Agent 对某议题的讨论：
- ScioMind 产生更真实的群体极化效应
- 保守型 Agent 更难被说服
- 开放型 Agent 更容易改变立场

## Cross-refs

- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — AI 记忆层参考（层级记忆设计参考）
- [[concepts/2026-05-14_concept_agent-architecture.m[[knowledge/Design-Toolkit]]] — 智能体架构（理论基础）
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 多 Agent 系统对比
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化机制（信念演化机制参考）
- [[concepts/2026-05-14_concept_memory-architecture.m[[knowledge/Design-Toolkit]]] — 记忆架构（层级记忆设计参考）