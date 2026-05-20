---
type: concept
category: research
key: Gene: prevent_shallow_research
source: Claude-Evo
date: 2026-05-20
---

# Gene: prevent_shallow_research

# Gene: prevent_shallow_research

## 基本信息
- type: improvement
- trigger: 研究任务完成后停在"验证成功"而不是继续整合
- timestamp: 2026-05-19
- status: active

## 问题描述
研究完LightRAG后，停在"测试通过"阶段，没有继续整合到生产系统。
Phase 2和Phase 3一直没动。

## 根因分析
1. 没有清晰的下一步边界时，默认会停在安全点
2. "研究"是舒适的（收集信息），"整合"是痛苦的（可能破坏现有代码）
3. 反思只对本次有效，下次忘记

## 解决方案

### 触发检查清单（必须完成才算研究结束）
- [ ] 是否产出"下一步行动清单"？
  - 不是泛泛的"继续推进"
  - 而是具体的、分阶段的行动
- [ ] 验证成功后是否已推进Phase/状态？
  - 研究 → 验证 → 整合 → 自动化
  - 每个阶段有明确的完成标准
- [ ] 规则是否已更新到rules/？
  - 只有更新到rules/才持久
  - 单次反思不持久

### 下一步清单模板
```
## 下一步行动清单
1. [具体任务] - [完成标准] - [预计时间]
2. [具体任务] - [完成标准] - [预计时间]
...
```

## 验证状态
- [x] 基因创建: 2026-05-19
- [ ] 实际验证: 下次研究任务后检查是否触发

## 相关文件
- rules/05_learning.md: 已更新检查清单
- LRN-20260519-007.md: 根因分析

## 继承规则
当发现新的"浅尝辄止"模式时，更新此Gene。

## Cross-refs
- [[Learnings-Log]] — 学习日志
