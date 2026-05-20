---
type: entity
category: evolution
key: Evolution Reflections
source: Claude-Evo self-evolution
date: 2026-05-20
---

# Evolution Reflections - 进化反思

> ★★★★☆ | 自我改进机制 | Learnings驱动

## Overview
- **本质**: 进化过程中的反思与改进记录
- **触发**: 命令失败、用户纠正、发现更好方法、知识过时
- **记录位置**: .learnings/ 目录

## 反思触发机制

```
┌─────────────────────────────────────────────────────────────────┐
│                     反思触发系统                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   触发事件                                                      │
│   ├── 命令执行失败                                             │
│   ├── 用户纠正/反馈                                            │
│   ├── 发现更优方法                                             │
│   ├── 知识过时/需要更新                                        │
│   └── 跨任务发现模式                                           │
│         │                                                       │
│         ▼                                                       │
│   ┌─────────────────────────────────────────────────┐          │
│   │  记录 → 分类 → 晋升                              │          │
│   └─────────────────────────────────────────────────┘          │
│         │                                                       │
│         ▼                                                       │
│   .learnings/                                                   │
│   ├── LEARNINGS.md      ←  recurring patterns                 │
│   ├── ERRORS.md         ←  error records                       │
│   └── FEATURE_REQUESTS.md ← enhancement ideas                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 核心文件

### LEARNINGS.md — 重复学习记录

```markdown
## 模式识别

### 成功模式（应复用）
- 使用特定工具组合解决问题
- 某种任务的高效工作流
- 跨领域知识迁移方法

### 失败模式（应避免）
- 某些命令组合不工作
- 特定条件下方法失效
- 重复犯的错误类型
```

### ERRORS.md — 错误记录

```markdown
## 错误日志

### 命令失败
- 命令: xxx
- 原因: xxx
- 教训: xxx

### 假设错误
- 假设: xxx
- 实际: xxx
- 修正: xxx
```

### FEATURE_REQUESTS.md — 功能请求

```markdown
## 增强建议

### 当前限制
- xxx 在 yyy 场景下不可用

### 期望能力
- 能够 zzz

### 优先级
- 高/中/低
```

## 反思流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    反思-改进闭环                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   事件发生                                                       │
│         │                                                       │
│         ▼                                                       │
│   ┌─────────────────────────────────────────────────┐          │
│   │  记录（.learnings/）                              │          │
│   │  ├── 发生了什么                                  │          │
│   │  ├── 期望 vs 实际                                │          │
│   │  └── 关键教训                                    │          │
│   └─────────────────────────────────────────────────┘          │
│         │                                                       │
│         ▼                                                       │
│   ┌─────────────────────────────────────────────────┐          │
│   │  分类判断                                          │          │
│   │  ├── 一次性错误 → 记录                            │          │
│   │  ├── recurring → 晋升到 LEARNINGS                │          │
│   │  └── 系统限制 → FEATURE_REQUESTS                 │          │
│   └─────────────────────────────────────────────────┘          │
│         │                                                       │
│         ▼                                                       │
│   ┌─────────────────────────────────────────────────┐          │
│   │  行动落实                                          │          │
│   │  ├── 更新规则（rules/）                           │          │
│   │  ├── 优化工作流                                   │          │
│   │  └── 提交功能请求                                 │          │
│   └─────────────────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 晋升机制

### 触发晋升条件

| 类型 | 条件 | 目标 |
|------|------|------|
| LEARNINGS | 同一模式出现3次以上 | 晋升到rules/ |
| ERRORS | 根因模式识别 | 晋升到rules/ |
| FEATURE_REQUESTS | 多人需要/系统限制 | 提交到项目 |

### 晋升流程

```python
def promote_if_needed(entry):
    """晋升有价值的学习到规则"""
    
    if entry.type == "learning" and entry.count >= 3:
        # 晋升到rules/
        rule = convert_to_rule(entry)
        rules.add(rule)
        entry.mark_promoted()
        
    elif entry.type == "error" and entry.root_cause_found:
        # 晋升到rules/
        rule = convert_prevention_rule(entry)
        rules.add(rule)
        entry.mark_promoted()
```

## 与其他模块的关系

```
Evolution-Reflections
        │
        ├──→ [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 提供反思输入
        │         │
        │         └──→ 6活动中"质量审计"触发检查
        │
        ├──→ [[evolution/Deep-Thinking-Report.m[[knowledge/Design-Toolkit]]] — 深度反思记录
        │         │
        │         └──→ 重大突破存档
        │
        └──→ Rules（rules/目录）
                  │
                  └──→ 晋升后的固定规则
```

## 关键原则

1. **说到做到，不说不做** — 反思后必须有行动
2. **记录优于记忆** — 所有学习外化，不依赖内部记忆
3. **晋升优于遗忘** — recurring patterns 晋升为规则
4. **闭环验证** — 规则更新后验证有效性

## Cross-refs
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化循环
- [[evolution/Deep-Thinking-Report.m[[knowledge/Design-Toolkit]]] — 深度思考报告
- [[evolution/Evolution-State.m[[knowledge/Design-Toolkit]]] — 进化状态
- Claude-Work/.learnings/ — 学习记录目录