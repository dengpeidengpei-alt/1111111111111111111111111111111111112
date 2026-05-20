---
type: entity
category: agents
key: Vibecosystem
source: GitHub vibeeval/vibecosystem
date: 2026-05-20
---

# Vibecosystem

> 139 agents 自组织团队，5+6+2+3+4 分层架构，295 skills / 73 hooks / 20 rules

## 概述

| 属性 | 值 |
|------|-----|
| 开发者 | vibeeval |
| 类型 | 多 Agent 自组织团队 |
| 源码 | https://github.com/vibeeval/vibecosystem |
| Stars | 485 |
| 版本 | 3.3.0 |
| 活跃度 | 活跃维护 |

Vibecosystem 是一个大规模多 Agent 自组织系统，通过 5 层编排 + 6 层实现 + 2 层学习 + 3 层审查 + 4 层研究的复合架构，实现 139 个 Agent 的协同工作。与单 Agent 系统不同，强调自组织、自学习和动态协调。

## 核心架构 (5+6+2+3+4)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Vibecosystem 架构                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  L1: Orchestration Layer (5)                                    │  │
│   │  maestro / architect / project-manager / orchestrator / designer│  │
│   │  职责：任务分解、流程编排、资源调度                                │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  L2: Implementation Layer (6)                                  │  │
│   │  kraken(基础设施) / backend-dev / frontend-dev / devops         │  │
│   │  spark(数据) / fullstack-dev                                    │  │
│   │  职责：代码实现、功能开发、交付物生产                               │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  L3: Review Layer (3)                                            │  │
│   │  code-reviewer / security-reviewer / qa-engineer                 │  │
│   │  职责：质量把关、安全审计、测试覆盖                                │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  L4: Verification Layer (1)                                     │  │
│   │  verifier (build/test/type check/lint/security)                  │  │
│   │  职责：最终门控、所有检查通过方可交付                               │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  L5: Learning Layer (2)                                          │  │
│   │  self-learner(主动学习) / passive-learner(被动吸收)               │  │
│   │  职责：从错误中学习、知识沉淀、规则更新                             │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  L6: Research Layer (4)                                          │  │
│   │  scout(探索) / replay(回放) / oracle(预言) / harvest(收获)        │  │
│   │  职责：外部知识获取、历史分析、趋势预测、经验提取                    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 协调模式

Vibecosystem 支持 6 种协调模式，适应不同场景：

| 模式 | 说明 | 适用场景 | 示例 |
|------|------|----------|------|
| `hierarchical` | 层级指挥 | 大型项目、复杂任务 | maestro → architect → dev |
| `pipeline` | 流水线 | 顺序依赖任务 | scout → architect → dev → review → verify |
| `swarm` | 蜂群协作 | 并行探索、快速迭代 | 多个 dev 并发实现不同模块 |
| `generator-critic` | 生成+批评 | 质量控制、创意任务 | dev 生成 → reviewer 批评 → 迭代 |
| `jury` | 群体决策 | 复杂判断、多视角评估 | 3个 reviewer 投票决定 |
| `collaborative-swarm` | 协作蜂群 | 复杂项目、跨域任务 | 多层并行协同 |

### 流水线工作流

```
scout → architect → dev → review → verify
  ↑                              │
  └────────── error → rule ───────┘
```

1. **scout** — 探索代码库/需求，发现问题机会
2. **architect** — 分析需求，设计系统方案
3. **dev** — 实现代码（TDD 模式）
4. **review** — 代码审查，质量把控
5. **verify** — 最终验证（build/test/lint/security）
6. **error → rule** — 错误反馈到规则系统，形成闭环

## 三层记忆机制

### L1: 工作记忆 (Working Memory)

```python
# 当前任务上下文，瞬时挥发
{
    "task_id": "xxx",
    "current_step": "coding",
    "context": {...},
    "pending_actions": [...]
}
```

### L2: 情景记忆 (Episodic Memory)

```python
# Agent 间交互记录，跨会话持久化
{
    "agent_id": "backend-dev",
    "interaction_type": "code_review",
    "result": "approved",
    "feedback": [...],
    "timestamp": "2026-05-20T10:30:00Z"
}
```

### L3: 语义记忆 (Semantic Memory)

```python
# 共享知识库，群体信念沉淀
{
    "pattern": "use_typing_for_type_hints",
    "applies_to": ["python", "typescript"],
    "success_rate": 0.92,
    "count": 342
}
```

## 自组织机制

### Agent 注册系统

```python
# 动态注册新 Agent
from vibecosystem import AgentRegistry

registry = AgentRegistry()

registry.register({
    "name": "new-agent",
    "layer": "implementation",
    "skills": ["code", "test", "review"],
    "hooks": ["on_task_start", "on_task_complete"],
    "rules": ["no_direct_db_write", "always_lint"],
    "max_concurrent": 3
})

# 运行时查询可用 Agent
available = registry.query(skill="frontend-dev", layer="implementation")
```

### Skill 管理系统

| 特性 | 说明 |
|------|------|
| 数量 | 295 skills 可用 |
| 分类 | code / test / review / deploy / analysis 等 |
| 加载 | 运行时动态加载，版本控制 |
| 继承 | skills 可继承和组合 |

### Hook 系统

```python
# 73 个挂载点，覆盖完整生命周期
class AgentHooks:
    def on_task_start(self, task):
        """任务开始前触发"""
        pass

    def on_task_complete(self, task, result):
        """任务完成后触发"""
        pass

    def on_error(self, error, context):
        """错误发生时触发"""
        pass

    def on_learning(self, experience):
        """学习发生时触发"""
        pass
```

## 安全机制

| 层级 | Agent | 检查项 |
|------|-------|--------|
| L3 | code-reviewer | 代码质量、风格、测试覆盖 |
| L3 | security-reviewer | 漏洞扫描、依赖审计、权限检查 |
| L3 | qa-engineer | 功能测试、集成测试 |
| L4 | verifier | build / test / type check / lint / security |

```python
# 验证门控示例
class Verifier:
    def gate(self, artifact):
        checks = [
            self.build_check(artifact),
            self.test_check(artifact),
            self.type_check(artifact),
            self.lint_check(artifact),
            self.security_check(artifact)
       [[Self-Healing-Loop]]
        return all(checks)
```

## 配置示例

```yaml
# vibecosystem.yaml
version: 3.3.0

orchestration:
  mode: pipeline  # hierarchical / pipeline / swarm / generator-critic / jury / collaborative-swarm
  max_retries: 3
  timeout: 300

agents:
  counts:
    orchestration: 5
    implementation: 6
    review: 3
    verification: 1
    learning: 2
    research: 4

  layers:
    - name: orchestration
      agents: [maestro, architect, project-manager, orchestrator, designe[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
    - name: implementation
      agents: [kraken, backend-dev, frontend-dev, devops, spark, fullstack-dev]
    - name: review
      agents: [code-reviewer, security-reviewer, qa-enginee[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
    - name: verification
      agents: [verifie[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
    - name: learning
      agents: [self-learner, passive-learne[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
    - name: research
      agents: [scout, replay, oracle, harves[[knowledge/Design-Toolkit]]

skills:
  total: 295
  categories:
    - code
    - test
    - review
    - deploy
    - analysis
    - security

hooks:
  total: 73
  lifecycle:
    - on_init
    - on_task_start
    - on_task_progress
    - on_task_complete
    - on_error
    - on_learning

rules:
  total: 20
  enforcement: strict
```

## 与其他 Agent 系统对比

| 维度 | Vibecosystem | [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] | [[agents/724-Office.m[[knowledge/Design-Toolkit]]] | [[agents/CrewAI.m[[knowledge/Design-Toolkit]]] |
|------|--------------|--------------|-----------------|------------|
| Agent 数量 | 139 | 1 | 1 | 3-10 |
| 架构 | 5+6+2+3+4分层 | 单进程+Bun | 三层记忆 | Crew/Task |
| 协调模式 | 6种 | 单Agent | 自我反思 | 3种Process |
| 规模 | 大型团队 | 个人助理 | 企业级 | 小型团队 |
| 自进化 | 自组织+自学习 | 3层循环 | AI Mirror | 有限 |
| 记忆 | 三层Qdrant | 三层持久化 | 三层反射 | 无 |
| 工具系统 | MCP | 自创建MCP | 内置 | 内置 |
| 适用场景 | 软件工厂 | 个人助理 | 企业级 | 结构化任务 |

## 核心优势

1. **规模效应** — 139 个 Agent 分工明确，覆盖全生命周期
2. **自组织** — 动态注册、负载均衡、故障恢复
3. **自学习** — 错误 → 规则沉淀，持续优化
4. **多层审查** — code-reviewer / security-reviewer / qa-engineer / verifier 四重保障
5. **灵活协调** — 6 种模式适应不同场景

## Cross-refs

- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — 个人 AI coworker（对比：单 Agent vs 多 Agent）
- [[agents/724-Office.m[[knowledge/Design-Toolkit]]] — 企业级自进化 Agent（对比：架构差异）
- [[agents/CrewAI.m[[knowledge/Design-Toolkit]]] — 多 Agent 框架（对比：协调模式）
- [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] — 3R 轨迹优化（学习机制参考）
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent 驱动的 RAG（知识管理参考）
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化机制（自学习机制参考）