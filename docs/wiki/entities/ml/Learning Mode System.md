---
type: concept
category: ml
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

mode_history:
  - mode: research
    since: 2026-05-19T20:35:00
    reason: 学习Evolver自我进化机制
```

## 使用方法

在学习任务开始时，在MEMORY.md或任务开头声明：
```
# 学习任务：Evolver评估
MODE: research
...
```

这样可以明确知道当前是在什么模式下，避免混状态。

## 模式对应的动作

### research 模式
- [x] 快速验证功能
- [x] 评估对系统的价值
- [x] 产出：research report
- [x] 完成标准：判断"有用"或"放弃"

### integrate 模式
- [x] 设计整合方案
- [x] 编写适配代码
- [x] 更新规则系统
- [x] 完成标准：生产系统可用

### repair 模式
- [x] 定位问题根因
- [x] 实施修复
- [x] 验证修复有效
- [x] 完成标准：问题消失

### harden 模式
- [x] 检查薄弱环节
- [x] 添加防御性规则
- [x] 测试边界情况
- [x] 完成标准：系统稳定

## Cross-refs
- [[knowledge/Learnings-Log]] — 学习日志
- [[knowledge/Self-Healing-Loop]] — 自我修复机制