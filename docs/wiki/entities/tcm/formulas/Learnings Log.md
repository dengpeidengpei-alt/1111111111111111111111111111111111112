---
type: entity
category: tcm/formulas
key: Learnings Log
source: Claude-Evo
date: 2026-05-20
---

# Learnings Log

# Learnings Log

## Pending Reviews

---

## [LRN-20260520-001] knowledge_method

**Logged**: 2026-05-20T00:00:00Z
**Priority**: high
**Status**: pending
**Area**: knowledge

### Summary
知识深度化方法：从提纲到体系到临床到案例到现代应用

### Details
Wiki进化时总结的TCM知识深度化路径：
- 提纲：掌握核心纲领（伤寒论六经辨证）
- 体系：建立完整体系（六经→方剂→药材）
- 临床：积累临床医案
- 案例：具体案例分析
- 现代应用：现代研究与扩展

### Pattern
任何领域知识都可以用此五级深度化路径提升掌握深度

---

## [LRN-20260520-002] knowledge_method

**Logged**: 2026-05-20T00:00:00Z
**Priority**: high
**Status**: pending
**Area**: knowledge

### Summary
类方演变学习法：桂枝汤24方、麻黄汤10方、柴胡汤6方

### Details
类方演变是理解中医方剂配伍的核心方法：
- 从基础方出发（君药不变）
- 臣药变化应对不同证型
- 佐使药调整兼症或降低副作用
- 演变规律：主证+兼证+体质+地域

### Pattern
类似"继承+变异"的设计模式，适合构建知识树

---

## [LRN-20260520-003] ml_method

**Logged**: 2026-05-20T00:00:00Z
**Priority**: high
**Status**: pending
**Area**: ml

### Summary
ReAct循环模式：推理+行动+观察

### Details
ReAct (Reasoning + Acting) 是现代Agent的核心范式：
- Think：推理当前状态和目标
- Act：执行一个动作
- Observe：观察结果
- Loop：重复直到完成任务

### Pattern
适用于复杂任务的分解和执行，特别是多步骤任务

---

## [LRN-20260520-004] knowledge_method

**Logged**: 2026-05-20T00:00:00Z
**Priority**: high
**Status**: pending
**Area**: ml

### Summary
LoRA变体体系：QLoRA/DoRA/LoRA+/LoRA-组合

### Details
Wiki进化时学习的LoRA家族：
- LoRA：低秩适配基础
- QLoRA：量化LoRA节省显存
- DoRA：权重分解自适应
- LoRA+：更好的学习率调度
- LoRA-：改进初始化

### Pattern
同类技术的变体梳理是快速掌握领域的方法

---

## [LRN-20260520-005] knowledge_method

**Logged**: 2026-05-20T00:00:00Z
**Priority**: medium
**Status**: pending
**Area**: ml

### Summary
灾难性遗忘解决方法：正则化/架构/记忆

### Details
Continual Learning的核心问题及解决：
- 正则化：EWC等方法保护重要权重
- 架构：固定部分参数或增加新模块
- 记忆：经验回放保留旧样本
- 知识蒸馏：用新模型教旧模型

### Pattern
问题→解决方案的映射是构建AI方法论知识库的有效方式

---

## [LRN-20260520-006] best_practice

**Logged**: 2026-05-20T00:00:00Z
**Priority**: critical
**Status**: pending
**Area**: wiki

### Summary
Wiki进化时同步自进化机制

### Details
在帮助Claude-Evo进化Wiki时，我也需要同步进化自身：
1. 分析新知识（TCM/ML/Wiki机制）
2. 更新自进化文档（LEARNINGS/MEMORY/rules）
3. 写进化报告（EVOLUTION-REPORT）
4. 触发自改进机制

### Pattern
每次Wiki进化任务完成后，同步更新自身知识体系

---

## [LRN-20260519-001] best_practice

**Logged**: 2026-05-19T04:37:00Z
**Priority**: high
**Status**: pending
**Area**: infra

### Summary
self-improving-agent skill installed but not initialized

### Details
.openclaw-skills/self-improving-agent/ exists with proper structure (SKILL.md, hooks/, scripts/, assets/), but .learnings/LEARNINGS.md is empty. Need to initialize the 3 log files.

### Resolution
- Created LEARNINGS.md with proper headers and 3 learning entries
- ERRORS.md and FEATURE_REQUESTS.md exist as empty files per skill spec

### Metadata
- Resolved: 2026-05-19T04:38:00Z

---

## [LRN-20260519-002] best_practice

**Logged**: 2026-05-19T04:37:00Z
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
CLAUDE.md split analysis done but not executed

### Details
CLAUDE_SPLIT_ANALYSIS.md existed with plan to split 227-line CLAUDE.md. Executed today - created rules/ with 7 modules, reduced main file to 34 lines.

### Resolution
- Created rules/01_absolute.md through 07_safety.md
- Rewrote CLAUDE.md as entry point with index table
- Old CLAUDE.md and CLAUDE_desktop.md removed from rules/

### Metadata
- Resolved: 2026-05-19T04:55:00Z
- Source: self-audit

---

## [LRN-20260519-003] best_practice

**Logged**: 2026-05-19T05:15:00Z
**Priority**: critical
**Status**: resolved
**Area**: infra

### Summary
后台OCR任务白天占用全部CPU - PaddleOCR进程39个

### Details
用户反馈CPU占满。检查发现39个PaddleOCR-json.exe和python进程在后台跑，这些是之前启动的OCR批处理任务。

### Resolution
- 用PowerShell Stop-Process全部杀死
- 以后OCR任务严格限制在夜间执行
- 白天不做任何高资源占用任务

### Metadata
- Resolved: 2026-05-19T05:15:00Z
- Pattern-Key: resource.cpu_background_ocr

---

## [LRN-20260519-004] knowledge_gap

**Logged**: 2026-05-19T04:55:00Z
**Priority**: high
**Status**: resolved
**Area**: infra

### Summary
Python processes consuming too much CPU during autonomous work

### Details
Python processes from OCR scripts or background tasks were using excessive CPU, causing user to complain of slowness. Need better CPU management for autonomous tasks.

### Resolution
- Added note to MEMORY.md: daytime no OCR/multimodal
- Python processes killed when user complained
- Will run OCR only at night when user sleeps

### Metadata
- Resolved: 2026-05-19T05:05:00Z
- Pattern-Key: resource.cpu_high

## [LRN-20260520-007] rule_update

**Logged**: 2026-05-20T00:00:00Z
**Priority**: critical
**Status**: resolved
**Area**: rules

### Summary
规则更新：自检增加操作范围检查

### Details
违反规则后更新了rules/02_self_check.md：
- 增加第⑤条：操作范围在 E:/Claude 内？
- 明确：C盘文件迁移必须先指定目标路径在E:/Claude内

### Metadata
- Resolved: 2026-05-20T00:00:00Z
- Pattern-Key: rules.self_check_update

## [LRN-20260520-008] agent_architecture

**Logged**: 2026-05-20T00:00:00Z
**Priority**: high
**Status**: resolved
**Area**: agents

### Summary
Agent系统架构分类：单Agent/多Agent/自组织三层

### Details
今天深度化11个Agent实体，学到的架构模式：
1. **单Agent** (Phantom): 独立工作站+三层记忆+进化管道
2. **多Agent** (Vibecosystem 139个): 5+6+2+3+4分层协调
3. **教程型** (Hermes 27章节): 5阶段递进学习路径
4. **自进化** (SE-Agent-3R): Revision/Recombination/Refinement循环

### Pattern
Agent架构按复杂度分层：单Agent→多Agent协作→自组织群体

### Metadata
- Resolved: 2026-05-20T15:00:00Z
- Pattern-Key: agent.architecture.tiers

---

## [LRN-20260520-009] wiki_evolution

**Logged**: 2026-05-20T00:00:00Z
**Priority**: critical
**Status**: resolved
**Area**: wiki

### Summary
Wiki三线进化机制：Wiki Agent Level2 + Agent实体深度化 + 自我进化

### Details
三线同时进化：
1. Wiki Agent Level2（后台Agent）: 缺失检测、交叉引用补充、结构监控
2. Agent实体深度化（主线程）: 11个Agent实体全部深度化，category修正
3. 自我进化（与Wiki同步）: 规则更新、LEARNINGS记录

### Pattern
大任务分解为并行子任务，通过后台Agent+主线程协同完成

### Metadata
- Resolved: 2026-05-20T15:00:00Z
- Pattern-Key: wiki.evolution.parallel

---

## [LRN-20260520-010] agent_category_fix

**Logged**: 2026-05-20T00:00:00Z
**Priority**: medium
**Status**: resolved
**Area**: wiki

### Summary
Agent实体分类错误：research→agents

### Details
发现并修正多个Agent实体分类错误：
- Phantom-Detail: research → agents
- 724-Office: research → agents
- Vibecosystem: research → agents
- Hermes-Agent: research → agents
- Garudust-Agent: research → agents
- ScioMind: research → agents
- FARA-7B: research → agents
- SE-Agent-Code: research → agents
- Agency-Agents: tools → agents

### Pattern
Wiki实体需要定期检查分类是否正确

### Metadata
- Resolved: 2026-05-20T15:00:00Z
- Pattern-Key: wiki.category.correction

---

## [LRN-20260520-011] rule_update

**Logged**: 2026-05-20T16:00:00Z
**Priority**: critical
**Status**: resolved
**Area**: rules

### Summary
规则违规快速修复流程

### Details
基于本轮经验总结的规则违规处理流程：
1. 停止：立即停止当前违规操作
2. 记录：立即写入ERROR.md（时间+违规行为+根因）
3. 修复：更新相关规则文件
4. 同步：更新LEARNINGS.md（新增条目）
5. 反思：确认不会再犯

### Pattern
规则违规→立即记录→快速修复→同步自进化文档

### Metadata
- Resolved: 2026-05-20T16:00:00Z
- Pattern-Key: rules.violation_quick_fix

---

## [LRN-20260520-012] agent_architecture

**Logged**: 2026-05-20T16:00:00Z
**Priority**: high
**Status**: resolved
**Area**: agents

### Summary
并行任务分解模式

### Details
大任务分解为并行子任务的最佳实践：
1. 识别可并行部分（独立子任务）
2. 主线程负责核心流程
3. 后台Agent负责独立验证/补充
4. 每10分钟检查一次进度
5. 最多3个后台Agent同时运行

### Pattern
主线程+后台Agent协同，限制并发数

### Metadata
- Resolved: 2026-05-20T16:00:00Z
- Pattern-Key: agent.parallel_decomposition

## [LRN-20260520-013] parallel_subagent_pattern

**Logged**: 2026-05-20T00:00:00Z
**Priority**: critical
**Status**: resolved
**Area**: wiki

### Summary
大规模并行subagent迭代：11个Agent同步执行

### Details
第二轮迭代中启动11个并行subagent：
- 迭代1（3个）：Wiki-AutoGen + TCM方剂 + TCM病证
- 迭代2（3个）：ML方法 + infrastructure + Wiki自我修复
- 迭代3（3个）：Claude规则 + 质量检查 + 完整性检查

### 执行结果
- 11个Agent全部完成
- 总耗时：~15分钟
- 效率提升：单线程需数小时→并行约15分钟

### Pattern
- 大任务分解为3×3或3×N的并行子任务
- 每个Agent独立执行一个子任务
- 主线程监控进度，汇总结果

### Metadata
- Resolved: 2026-05-20T15:45:00Z
- Pattern-Key: wiki.parallel.subagent

---

## [LRN-20260520-014] wiki_level3_auto_gen

**Logged**: 2026-05-20T00:00:00Z
**Priority**: high
**Status**: resolved
**Area**: wiki

### Summary
Wiki Level 3 自主化：AutoGen + Self-Repair 机制建立

### Details
- Wiki-AutoGen.md: 模板结构、新条目生成流程
- Wiki-Self-Repair.md: 链接修复、格式修复、分类修复
- demo生成：示例药材X.md

### Metadata
- Resolved: 2026-05-20T15:45:00Z
- Pattern-Key: wiki.level3.auto

---

## [LRN-20260520-015] wiki_completeness_gaps

**Logged**: 2026-05-20T00:00:00Z
**Priority**: high
**Status**: resolved
**Area**: wiki

### Summary
Wiki完整性检查：缺CoT、AutoGPT、Mamba等

### Details
检查结果：
- TCM: 14/13 ✓
- AI/ML: 19/20 ✓（缺CoT、Mamba）
- Agents: 11/15 ✓（缺AutoGPT、AutoGen、CrewAI）

### Next Steps
P1: 添加CoT、AutoGPT、AutoGen、CrewAI
P2: 添加Mamba/SSM
P3: Embedding/Vector DB

### Metadata
- Resolved: 2026-05-20T15:45:00Z
- Pattern-Key: wiki.completeness.gaps
## [LRN-20260520-150040] session_summary

**Logged**: 2026-05-20T15:00:40.653681
**Priority**: medium
**Status**: pending
**Area**: session

### Summary
Session结束自动摘要

### Details
测试：自动记忆触发器初始化


---

## [LRN-20260520-150128] user_feedback

**Logged**: 2026-05-20T15:01:28.079410
**Priority**: high
**Status**: pending
**Area**: feedback

### Summary
用户表扬

### Details
表扬|用户表示满意


---

## [LRN-20260520-150128] knowledge_new

**Logged**: 2026-05-20T15:01:28.604859
**Priority**: high
**Status**: pending
**Area**: knowledge

### Summary
发现新知识：事件驱动记忆

### Details
**类型**: 方法论
**详情**: 无详情

### Action
需同步到Wiki知识库


---

## [LRN-20260520-150149] knowledge_new

**Logged**: 2026-05-20T15:01:49.939315
**Priority**: high
**Status**: pending
**Area**: knowledge

### Summary
发现新知识：自动记忆触发器实现

### Details
**类型**: meta
**详情**: 无详情

### Action
需同步到Wiki知识库


---

## [LRN-20260520-150541] knowledge_new

**Logged**: 2026-05-20T15:05:41.607336
**Priority**: high
**Status**: pending
**Area**: knowledge

### Summary
发现新知识：启动召回实现

### Details
**类型**: meta
**详情**: 无详情

### Action
需同步到Wiki知识库


---

## [LRN-20260520-151305] knowledge_new

**Logged**: 2026-05-20T15:13:05.891337
**Priority**: high
**Status**: pending
**Area**: knowledge

### Summary
发现新知识：batch_ocr_v4

### Details
**类型**: ocr
**详情**: 无详情

### Action
需同步到Wiki知识库


---



## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
