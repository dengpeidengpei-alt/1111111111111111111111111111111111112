---
type: entity
category: knowledge
key: Learning Mode System
source: Claude-Evo
date: 2026-05-20
---

# Learning Mode System

基于 Evolver Strategy Presets 借鉴

## 模式说明

每次学习任务开始前，明确选择哪种模式。

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| **research** | 快速验证，不深入整合 | 探索新方向、评估工具价值 |
| **integrate** | 深入整合，确保稳定 | 验证有用后需要集成到生产系统 |
| **repair** | 紧急修复模式 | 发现错误立即修复，不扩展 |
| **harden** | 聚焦稳定性 | 确保系统健壮，防守为主 |

## 切换规则

### 默认模式
- 新工具评估 → `research`
- 验证通过后 → `integrate`
- 发现错误 → `repair`
- 系统稳定期 → `harden`

### 触发条件

```
当满足以下条件时，模式自动切换：
- research 模式：3次验证成功后 → integrate
- integrate 模式：整合完成并验证 → harden
- repair 模式：问题修复后 → 回到之前模式
- harden 模式：新威胁出现 → repair
```

## 当前模式状态

```
mode: research
timestamp: 2026-05-19T20:35:00
note: 正在学习Evolver，评估对系统的价值
```

## 模式对应的动作

| 模式 | 动作 |
|------|------|
| research | 快速验证功能、评估系统价值、产出research report |
| integrate | 设计整合方案、编写适配代码、更新规则系统 |
| repair | 定位问题根因、实施修复、验证修复有效 |
| harden | 检查薄弱环节、添加防御性规则、测试边界情况 |

---

## Cross-refs

- [[knowledge/Self-Heal-Triggers.m[[knowledge/Design-Toolkit]]] — 自改进触发器
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
- [[knowledge/Wiki-Automation-Guide.m[[knowledge/Design-Toolkit]]] — Wiki自动化等级