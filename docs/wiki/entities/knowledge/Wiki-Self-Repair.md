---
type: concept
category: knowledge
key: Wiki-Self-Repair
source: Claude-Evo
date: 2026-05-20
---

# Wiki Self-Repair - Level 3 自主化

## 概述

Wiki 自我修复是 Level 3 自主化的核心功能，使 Wiki 能够自动检测并修复自身问题。

## 修复范围

### 1. 链接修复
- 检查所有 `` 是否有效
- 识别断开的链接（指向不存在的文件）
- 自动修复或标记问题链接

### 2. 格式修复
- 检查 frontmatter 格式
- 确保必要字段存在：`type`, `category`, `key`, `date`
- 修复字段缺失或格式错误

### 3. 分类修复
- 检查 `category` 与实际文件路径是否匹配
- 修复分类错误的实体

### 4. 重复检测
- 检查是否有重复条目（同名不同路径）
- 建议合并或删除

## 修复规则

### 链接检查规则
```
条件：链接指向不存在的文件
动作：标记为 broken_link

条件：链接指向同名但不同路径
动作：建议标准化链接
```

### 格式检查规则
```
必要字段：type, category, key, date
缺失任何字段 → 标记为 missing_field

type 值：entity, concept
无效值 → 标记为 invalid_type
```

### 分类检查规则
```
文件路径：entities/{category}/{slug}.md
frontmatter category 必须与路径匹配

不匹配 → 标记为 category_mismatch
```

## 触发条件

| 触发类型 | 条件 | 执行频率 |
|----------|------|----------|
| 手动触发 | 用户说"修复wiki"、"self-repair" | 按需 |
| 定时触发 | 每次重要操作后 | 每5次操作 |
| 自动触发 | 链接检查发现broken_link | 立即 |

## 执行流程

```
1. 扫描 entities/ 目录
2. 收集所有 
3. 验证每个链接的目标文件存在
4. 检查 frontmatter 格式
5. 验证 category 匹配
6. 生成修复报告
7. 执行可自动修复的问题
8. 标记需人工介入的问题
```

## 输出格式

```markdown
## Wiki Self-Repair Report

### 检查的问题
- 无效链接：[数量]
- 格式错误：[数量]
- 分类错误：[数量]
- 重复条目：[数量]

### 修复的内容
- [文件]: [修复项]

### 待处理
- [文件]: [问题] (需人工介入)
```

## 实现状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 链接检查 | ✅ 可用 | scan_links() |
| 格式检查 | ✅ 可用 | check_frontmatter() |
| 分类检查 | ✅ 可用 | verify_category() |
| 重复检测 | 🔜 待开发 | - |
| 自动修复 | 🔜 待开发 | - |

## Cross-refs
- [[knowledge/Gene_ mmx_text_chat_chinese_encoding.m[[knowledge/Design-Toolkit]]] — Gene: mmx_text_chat_chinese_encoding
- [[knowledge/Karpathy-LLM-Wiki.m[[knowledge/Design-Toolkit]]] — Karpathy LLM Wiki
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — Knowledge Graph
- [[knowledge/2026-05-19 健康检查.m[[knowledge/Design-Toolkit]]] — 2026-05-19 健康检查
- [[knowledge/Accomplishments Index.m[[knowledge/Design-Toolkit]]] — Accomplishments Index
