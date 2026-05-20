---
type: concept
category: ml
key: 2026-05-19 LightRAG × TCM 自学迭代成果
source: Claude-Evo
date: 2026-05-20
---

# 2026-05-19 LightRAG × TCM 自学迭代成果

# 2026-05-19 LightRAG × TCM 自学迭代成果

## 阶段进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| Phase 1: 测试 | ✅ 完成 | entity extraction 验证通过 |
| Phase 2: 整合 | ✅ 完成 | dual retrieval 集成到 search_ocr.py |
| Phase 3: 自动化 | 🔄 待推进 | 分批索引 + 夜间pipeline |

## 代码产出

| 文件 | 状态 | 说明 |
|------|------|------|
| `agent-skills-repo/tcm_entity_extractor.py` | ✅ 可用 | 实体提取器（mmx text chat） |
| `tcm-knowledge/search_ocr.py` | ✅ 增强 | 双模式搜索（keyword + entity） |
| `scripts/multimodal_engine.py` | ✅ 更新 | 新增text_search/entity_extract函数 |
| `entity_index/` | 🔄 部分完成 | 4文件/373节点/139边 |

## 技术方案

- **MiniMax API**: `mmx text chat` (1500次/5小时)
- **实体类型**: herb、formula、pattern、person、text、method
- **输出格式**: 兼容 knowledge_graph.json

## 自改进触发记录

| 时间 | 事件 | 处理 |
|------|------|------|
| 2026-05-19 | 发现 api_bridge.py 模型名错误 | 修正为 MiniMax-M2.7 |
| 2026-05-19 | API 402 错误（模型不支持） | 改用 mmx text chat |
| 2026-05-19 | 规则更新 | 05_learning.md 新增反思触发器 |

## 剩余问题

| 问题 | 状态 | 方案 |
|------|------|------|
| Phase 3 未完成 | 🔄 待办 | 夜间批量处理pipeline |
| entity_index 只索引了4个文件 | 🔄 待办 | 继续批量索引剩余OCR文件 |

## 关键发现

1. **mmx text chat** 可直接用于实体提取，绕过直接API调用问题
2. **MiniMax-M2.7** 是正确的模型名（非 MiniMax-Text-01）
3. **Windows编码问题** - 控制台输出乱码，但JSON文件保存正常
4. **额度充足**: 1500次/5小时，当前剩余895次

## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
