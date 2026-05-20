---
type: entity
category: knowledge
key: Self-Improving Agent Patterns
source: Claude-Evo
date: 2026-05-20
---

# Self-Improving Agent Patterns

**学习时间**: 2026-05-20 19:05
**来源**: 互联网搜索

---

## Self-Improving Agent 核心概念

**定义**: AI Agent具备自我反思、自我批评、自我学习和自我组织记忆的能力

**目标**: 让Agent从错误中学习，持续优化执行质量

---

## 四大子系统

| 子系统 | 功能 |
|--------|------|
| **Memory** | 记录用户偏好和经验 |
| **Skill** | 提炼操作经验为可复用技能 |
| **Nudge Engine** | 定时复盘，形成闭环学习 |
| **Error Detector** | 自动捕获错误并记录 |

---

## 触发学习的4种情况

### 1. 用户纠正时
触发词: "不对"、"应该是..."、"你理解错了"、"这个方法已经废弃了"

记录内容:
- 错误的认知
- 正确的做法
- 适用范围

### 2. 命令执行失败时
通过 `error-detector.sh` 脚本自动检测

### 3. 反思触发
定时或按次数触发自我复盘

### 4. 知识过时检测
发现新方法时自动更新

---

## OpenClaw Self-Improving 架构

```
用户交互 → Hook机制 → 错误检测 → 记录 learnings
    ↓
下次执行 → 检索记忆 → 应用正确方法 → 持续优化
```

**特点**:
- 零依赖
- 分层记忆
- 自动学习
- 自我反思

---

## Hermes Agent Self-Improving

**参考**: https://github.com/NousResearch/hermes-agent

### 核心闭环

```
Memory → Skill → Nudge Engine → 闭环学习
  ↑                                    ↓
  ←←←←←←← 持续优化 ←←←←←←←←←←←←←←←←←←
```

### vs OpenClaw

| 方案 | 特点 |
|------|------|
| OpenClaw | 手写配置 |
| Hermes | 自动积累经验，优化执行流程 |

---

## elfmem - Adaptive Memory System

**参考**: https://github.com/emson/elfmem

**核心理念**: Agents don't need a database of facts. They need memory that adapts.

**自适应原则**:
- 成功的策略 → 强化记忆
- 误导的信息 → 衰减淡化

---

## Self-Improving 工作流

```python
# 伪代码
after_task:
    if user_corrected:
        record(error_type, correct_approach, scope)
    elif command_failed:
        record(failed_command, error_reason)
    elif reflection_triggered:
        analyze_recent_performance()
        update_skills()
```

---

## 持续改进机制

| 阶段 | 动作 |
|------|------|
| 捕获 | 自动记录错误和学习点 |
| 分析 | 反思根因和模式 |
| 固化 | 更新到skills/rules |
| 验证 | 下次执行验证改进 |

---

## 与我的自改进机制对比

| 我当前的 | 描述 |
|---------|------|
| LEARNINGS.md | 新知识、新方法记录 |
| ERRORS.md | 错误记录 |
| rules/ | 晋升的规则 |
| 反思块 | 每15次工具调用触发 |

**差距**: 我的系统是手动的，需要代码化为自动触发

---

## Cross-refs

- [[knowledge/Self-Heal-Triggers.m[[knowledge/Design-Toolkit]]] — 自改进触发器
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
- [[knowledge/AI-Agent-Trends-2025.m[[knowledge/Design-Toolkit]]] — AI Agent趋势
- [[knowledge/Wiki-Automation-Guide.m[[knowledge/Design-Toolkit]]] — Wiki自动化