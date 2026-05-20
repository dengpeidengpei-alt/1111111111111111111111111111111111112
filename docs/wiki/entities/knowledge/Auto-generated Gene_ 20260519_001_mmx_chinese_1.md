---
type: concept
category: knowledge
key: Auto-generated Gene: 20260519_001_mmx_chinese
source: Claude-Evo
date: 2026-05-20
---

# Auto-generated Gene: 20260519_001_mmx_chinese

# Auto-generated Gene: 20260519_001_mmx_chinese

## 基本信息
- type: auto_promoted
- source: signal sig_20260519_001_mmx_chinese.md
- trigger: 重复出现 3 次
- timestamp: 2026-05-19T21:13:59.940911
- status: active

## 来源信号内容
```
# Signal: mmx_chinese_still_unresolved

## 基本信息
- detected: 2026-05-19
- severity: medium
- status: pending_fix

## 问题描述
mmx text chat 中文编码问题仍未完全解决。
英文消息可用，中文消息仍导致subprocess超时。

## 证据
```
测试1: mmx text chat --message "hi" --output json → 正常 (1177字节)
测试2: mmx text chat --message "桂枝汤" --output json → 超时
```

## 触发次数
- count: 3
- dates: [2026-05-19, 2026-05-19, 2026-05-19]

## 候选解决方案
1. 通过消息文件传递（--messages-file）
2. 设置环境变量强制UTF-8
3. 换用mmx search代替text chat

## 处理建议
- 优先级: medium（不影响英文功能）
- 截止日期: 2026-05-20
- 负责人: self
```

## 处理记录
从 signals/ 促进到 genes/
原因：重复出现次数超过阈值 (3)

## 相关文件
- 信号: E:\Claude\.learnings\signals\sig_20260519_001_mmx_chinese.md
- 基因: E:\Claude\.learnings\genes\gene_20260519_auto_20260519_001_mmx_chinese.md


## Cross-refs
- [[Learnings-Log]] — 学习日志
