---
type: concept
category: knowledge
key: Gene: mmx_text_chat_chinese_encoding
source: Claude-Evo
date: 2026-05-20
---

# Gene: mmx_text_chat_chinese_encoding

# Gene: mmx_text_chat_chinese_encoding

## 基本信息
- type: bug_fix
- trigger: mmx text chat在Python subprocess中传递中文消息时挂起
- timestamp: 2026-05-19
- status: resolved

## 问题描述
调用 `mmx text chat --message "中文"` 时，subprocess.run 挂起无输出。
英文消息正常，中文消息超时。

## 根因分析
1. mmx 在非 TTY 环境下默认尝试流式输出
2. 中文编码通过 shell 传递时损坏
3. subprocess 阻塞等待输入

## 解决方案
### 最终方案: 使用 --quiet 标志
```bash
mmx text chat --message "桂枝汤" --output json --quiet
```
注意：必须同时使用 `--quiet` 和 `--output json` 才能避免流式输出阻塞。

### 方法1: 使用 --quiet 标志（已验证有效）
```python
cmd_str = ' '.join(['mmx', '--quiet'] + args)
result = subprocess.run(cmd_str, shell=True, ...)
```

### 方法2: 通过文件传递消息（无效）
```python
# 写消息到临时文件
# mmx --messages-file temp.txt - 报错"m is not iterable"
```

## 验证状态
- [x] 英文消息: 正常
- [x] 中文消息: 正常（2026-05-19验证）

## 相关文件
- multimodal_engine.py: mmx_run函数
- LRN-20260519-007.md: 详细记录

## 继承规则
如果未来有新方案解决此问题，更新此Gene而非创建新文件。

## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
