---
type: concept
category: knowledge
key: Signal: mmx_chinese_still_unresolved
source: Claude-Evo
date: 2026-05-20
---

# Signal: mmx_chinese_still_unresolved

# Signal: mmx_chinese_still_unresolved

## 基本信息
- detected: 2026-05-19
- severity: medium
- status: resolved

## 问题描述
mmx text chat 中文编码问题仍未完全解决。
英文消息可用，中文消息仍导致subprocess超时。

## 证据
```
测试1: mmx text chat --message "hi" --output json → 正常 (1177字节)
测试2: mmx text chat --message "桂枝汤" --output json → 超时
```

## 解决记录
- 解决时间: 2026-05-19T21:20:00
- 解决方法: 使用 --quiet 标志解决中文挂起问题
- 验证: mmx text chat --message "桂枝汤" --output json --quiet 成功返回

## 触发次数
- count: 4
- dates: [2026-05-19, 2026-05-19, 2026-05-19, 2026-05-19]

## 候选解决方案
1. 通过消息文件传递（--messages-file）
2. 设置环境变量强制UTF-8
3. 换用mmx search代替text chat

## 处理建议
- 优先级: medium（不影响英文功能）
- 截止日期: 2026-05-20
- 负责人: self

## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
