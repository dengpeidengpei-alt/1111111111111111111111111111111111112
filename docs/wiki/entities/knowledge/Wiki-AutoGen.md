---
type: entity
category: knowledge
key: Wiki Auto-Generation Rules
source: Claude-Evo
date: 2026-05-20
---

# Wiki Auto-Generation Rules

## Overview
Wiki Level 3 自主化自动生成机制，支持从模板快速创建标准化条目。

---

## Template Structure Analysis

### Frontmatter Fields
```yaml
---
type: entity
category: <category/path>     # e.g., tcm/herbs, ml, tcm/formulas
key: <entity_name>           # 实体名称，唯一标识
source: <source_tag>         # 来源标签
layer: <version_number>     # 层级版本
---
```

### Section Patterns

**TCM Herbs:**
- Category
- Key Properties (药性/味/归经)
- Core Functions
- Usage
- Cross-refs

**TCM Formulas:**
- Origin
- 组成
- 功效
- 主治
- Usage
- Cross-refs

**ML Methods:**
- Overview
- 核心思想
- 与其他方法对比
- 实现示例
- 实际应用
- 提示词模板
- Cross-refs

### Cross-refs Format
```
## Cross-refs
- [[EntityNam[[Self-Healing-Loop]]] — 关联说明
```

---

## Auto-Generation Rules

### 1. 新条目生成流程

```
1. 确定category → 选择对应模板
2. 提取key → 生成filename: {key}.md
3. 填充frontmatter → type=entity, source, layer=3.0
4. 生成sections → 基于category规则
5. 添加cross-refs → 扫描相关条目建立链接
```

### 2. 字段填充规则

| 字段 | 规则 | 示例 |
|------|------|------|
| type | 固定entity | entity |
| category | 从路径推断 | tcm/herbs |
| key | 直接使用 | 当归 |
| source | 固定Claude-Evo | Claude-Evo TCM knowledge |
| layer | 默认3.0 | 3.0 |

### 3. Category对应的Section模板

#### tcm/herbs
```markdown
## Category
- 分类信息

## Key Properties
- **药性**: [寒/温/平]
- **味**: [酸/苦/甘/辛/咸]
- **归经**: [经络]

## Core Functions
- 功能1
- 功能2

## Usage
- 使用场景

## Cross-refs
- [[相关药材]] — 关联说明
```

#### tcm/formulas
```markdown
## Origin
- 出处

##组成
- 成分列表

##功效
- 功效描述

##主治
- 主治症状

## Usage
- 使用方法

## Cross-refs
- [[相关方剂]] — 关联说明
```

#### ml
```markdown
## Overview
- **全称**:
- **本质**:

## 核心思想
- 说明

## 实现示例
- 代码示例

## Cross-refs
- [[相关方法]] — 关联说明
```

### 4. Cross-refs自动发现规则
- 同category下其他条目自动建立链接
- 配伍/相反药材建立链接
- 同一方剂中的药材/方剂互相链接

---

## Demo: 示例药材X

**生成的文件**: `entities/tcm/herbs/示例药材X.md`

```markdown
---
type: entity
category: tcm/herbs
key: 示例药材X
source: Claude-Evo TCM knowledge
layer: 3.0
---

# 示例药材X

## Category
- 中品/中游 — 常用药材

## Key Properties
- **药性**: 平
- **味**: 甘
- **归经**: 脾、胃

## Core Functions
- 健脾益气
- 燥湿化痰

## Usage
- 脾胃虚弱
- 痰湿内阻

## Cross-refs
- [[tcm/herbs/人参.m[[knowledge/Design-Toolkit]]] — 补气常用
- [[tcm/herbs/白术.m[[knowledge/Design-Toolkit]]] — 健脾配伍
- [[tcm/herbs/陈皮.m[[knowledge/Design-Toolkit]]] — 理气化痰
```