---
type: entity
category: knowledge
key: Wiki Automation Guide (v5.1)
source: Claude-Evo
date: 2026-05-20
---

# Wiki Automation Guide (v5.1)

## ⚠️ 绝对承诺

**所有learnings必须进入Wiki，不允许只留在.learnings/目录。**

违反此承诺 = 犯罪。

---

## 🔄 持续迭代承诺

**说到做到，不说不做。**

| 承诺 | 执行标准 | 验证方式 |
|------|----------|----------|
| 继续迭代 | 不停止，直到用户叫停 | 每轮迭代产出现在线可验证的代码 |
| 持续自学 | 每天有新知识入库wiki | Wiki-Automation-Guide.md记录 |
| 不空分析 | 分析→方案→代码，缺一不可 | 代码在E:/Claude/内可运行 |
| Wiki同步 | 所有learnings必须入wiki | dual_track_generator.py验证 |

**触发条件**：用户说"继续" → 立即执行迭代，不等待确认

**停止条件**：用户明确说"停"或"暂停汇报"

---

## Level 1 Automation Status

| Feature | Status | Implementation |
|---------|--------|----------------|
| Reflection Auto-Trigger | ✅ Configured | `tool_calls % 15 == 0` |
| Index Auto-Registration | ✅ Configured | On entity Write |
| Usage Tracking | ✅ Configured | `.usage.json` structure |
| Design Toolkit Automation | ✅ Implemented | 5 tools in E:/Claude/ |
| Knowledge Ingestion | ✅ Implemented | dual_track_generator + visual_knowledge |
| Learnings → Wiki Rule | ✅ Enforced | All .learnings must enter wiki |

---

## Implemented Tools (v5.1)

### Design System Toolkit

| Tool | Path | Function |
|------|------|----------|
| design_preview.py | E:/Claude/design_preview.py | DESIGN.md → HTML preview |
| design_to_component.py | E:/Claude/design_to_component.py | DESIGN.md → React components |
| dual_track_generator.py | E:/Claude/dual_track_generator.py | AGENTS.md + DESIGN.md generation |
| visual_knowledge_gallery.py | E:/Claude/visual_knowledge_gallery.py | Visual gallery HTML generator |
| tcm_visual_generator.py | E:/Claude/tcm_visual_generator.py | TCM formula illustration generator |

**Wiki Entry**: [[knowledge/Design-Toolkit.m[[knowledge/Design-Toolkit]]] — 完整工具链文档

### Knowledge Entries Ingested (v5.1)

| Entry | Source | Location |
|-------|--------|----------|
| Design-Systems-Comparison.md | .learnings/DESIGN_SYSTEMS_COMPARISON.md | entities/knowledge/ |
| Image-Text-Synthesis.md | .learnings/IMAGE_TEXT_SYNTHESIS.md | entities/knowledge/ |
| Music-Generation-Guide.md | .learnings/MUSIC_GENERATION_TIPS.md | entities/knowledge/ |
| Evolution-Report-2026-05-20.md | .learnings/EVOLUTION-REPORT-2026-05-20.md | entities/evolution/ |
| Design-Toolkit.md | Created from .learnings | entities/knowledge/ |
| Evolution-v5-Summary.md | Created from EVOLUTION-v5.1-STASH | entities/evolution/ |

**Rule**: 所有learnings必须入wiki，不允许只留.local/.learnings

### Additional Learnings Ingested

| Entry | Source | Status |
|-------|--------|--------|
| Visual-Video-Learning.md | .learnings/VISUAL_VIDEO_LEARNING.md | ✅ |
| LightRAG-TCM-Integration.md | .learnings/lightrag_research_20260519.md | ✅ |
| Learning-Mode-System.md | .learnings/MODE.md | ✅ |
| MiniMax-API-Rate-Limits.md | .learnings/minimax-api-rate-limits.md | ✅ |
| Self-Heal-Triggers.md | .learnings/SELF_HEAL_TRIGGERS.md | ✅ |
| learnings-Log.md | .learnings/LEARNINGS.md | ✅ |
| ERRORS.md | .learnings/ERRORS.md | ✅ |
| Gene-mmx-chinese-encoding.md | .learnings/genes/gene_20260519_001_mmx_chinese_encoding.md | ✅ |
| Gene-prevent-shallow-research.md | .learnings/genes/gene_20260519_002_prevent_shallow_research.md | ✅ |
| Violations-Log.md | .learnings/violations/violation_1779096229913.md | ✅ |
| AI-Agent-Trends-2025.md | mmx search (2026-05-20) | ✅ |
| Agentic-Workflows-RAG.md | mmx search (2026-05-20) | ✅ |
| Self-Improving-Agent-Patterns.md | mmx search (2026-05-20) | ✅ |
| MiniMax-M2-Update.md | mmx search (2026-05-20) | ✅ |

**Total entries in wiki/knowledge**: 22+

### 6 Knowledge Bases Covered

| Knowledge Base | AGENTS.md | DESIGN.md | Preview |
|----------------|-----------|-----------|---------|
| TCM | ✅ | ✅ (古典中医) | ✅ |
| agent-skills | ✅ | ✅ (AI开发) | ✅ |
| research | ✅ | ✅ (学术) | ✅ |
| memory | ✅ | ✅ (温暖日记) | ✅ |
| archive | ✅ | ✅ (复古档案) | ✅ |
| wiki | ✅ | ✅ (文档百科) | ✅ |

---

## How It Works

### 1. Reflection Auto-Trigger

```python
# Pseudo-code for reflection trigger
if tool_calls % auto_reflection_threshold == 0:
    emit_reflection_block()
```

**Current state**: `tool_calls: 0` in `.wiki_state.json`
**Threshold**: 15 tool calls

### 2. Index Auto-Registration

When creating a new entity file:

```markdown
---
type: entity
category: ml
key: New-Method
---
```

1. File is saved
2. Wiki operator adds entry to `index.md`:
```markdown
### ml/
- [[New-Metho[[knowledge/Design-Toolkit]]] — New method description
```

### 3. Usage Tracking

Each interaction updates `.usage.json`:

```json
{
  "entries": {
    "伤寒论": {
      "access_count": 5,
      "last_access": "2026-05-20",
      "modifications": ["2026-05-20"]
    }
  }
}
```

---

## Manual Trigger Commands

| Action | Command | Description |
|--------|---------|-------------|
| Reflection | `wiki reflect` | Force emit reflection block |
| Index rebuild | `wiki sync-index` | Re-sync all entities to index.md |
| Usage report | `wiki usage` | Generate usage analysis |
| Ingest | `wiki ingest <path>` | Ingest external file |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.wiki_state.json` | Operation count, thresholds |
| `.usage.json` | Access tracking per entity |
| `schema.md` | Rules and automation config |

---

## Next Steps

Level 2 features (planned):
- Automatic cross-reference completion
- Stale content detection
- Structure imbalance monitoring

Level 3 features (future):
- Auto-generation from templates
- Self-correction
- Adaptive structure

---

## Cross-refs

- [[knowledge/Wiki-Evolution-Plan.m[[knowledge/Design-Toolkit]]] — Full evolution roadmap
- [[schema.m[[knowledge/Design-Toolkit]]] — Technical specification
- [[knowledge/Violations-Log.m[[knowledge/Design-Toolkit]]] — Change history