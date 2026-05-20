---
type: entity
category: knowledge
key: Self-Healing Triggers & Memory System
source: Claude-Evo
date: 2026-05-20
---

# Self-Healing Triggers & Memory System

> 事件驱动型跨Session记忆系统

## 触发规则

| 触发词 | 模式 | 代码动作 |
|--------|------|----------|
| 持续工作 | 用户说"去睡觉/睡懒觉"后接"持续工作" | 启动queue_runner.py后台运行 |
| 没说不动 | 用户说"不要只说不做" | 立即执行当前任务，不询问 |
| 不限额度 | 用户说"额度用完" | 立即启动多模态学习循环 |

---

## 触发事件

| 事件 | 触发时机 | 存储位置 |
|------|----------|----------|
| `session_end` | Session结束时 | LEARNINGS.md |
| `rule_violation` | 规则违规时 | ERRORS.md + LEARNINGS.md |
| `user_feedback` | 用户反馈时 | FEEDBACK.md + LEARNINGS.md |
| `task_complete` | 任务完成时 | accomplishments/ |
| `knowledge_new` | 发现新知识时 | LEARNINGS.md |

---

## 启动时召回 (memory_recall.py)

每次启动时自动执行，将跨Session记忆推送到上下文：

```bash
python .learnings/memory_recall.py --brief  # 简洁报告
python .learnings/memory_recall.py --json   # JSON输出
```

**输出内容**:
1. **CURRENT** - 当前工作计划（从MEMORY.md）
2. **ACCOMPLISHMENTS** - 近期成果（从accomplishments/INDEX.md）
3. **FEEDBACK** - 用户反馈（从FEEDBACK.md）
4. **LEARNINGS** - 待处理学习（从LEARNINGS.md末尾3条pending）
5. **SIGNALS** - 待处理信号（从signals/目录）

---

## Cross-refs

- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 完整学习日志
- [[ERROR[[Self-Healing-Loop]]] — 错误记录
- [[evolution/Evolution-State.m[[knowledge/Design-Toolkit]]] — 进化状态
- [[knowledge/Agent-Memory-Systems.m[[knowledge/Design-Toolkit]]] — 记忆系统