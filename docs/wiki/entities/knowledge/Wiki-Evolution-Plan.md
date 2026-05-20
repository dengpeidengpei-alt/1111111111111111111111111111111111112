---
type: entity
category: knowledge
key: Wiki 自我进化方案
source: Claude-Evo
date: 2026-05-20
---

# Wiki 自我进化方案

> v1.1 | 2026-05-20 | Wiki自我进化路线图

## 现状分析

| Dimension | Current | Gap |
|-----------|---------|-----|
| Files | 95+ | - |
| Categories | 15 | Need consolidation |
| TCM Knowledge | 13 books / 17 formulas / 15 herbs / 7 conditions | Can expand more |
| AI Research | 22 research entries | Can go deeper |
| Self-Monitoring | .usage.json | Can enhance |

## Evolution Goals

1. **Knowledge Completion** — Fill gaps in domain coverage
2. **Quality Enhancement** — Deepen existing entries
3. **Structure Adaptation** — Auto-adjust categories
4. **Sustainable Growth** — Establish passive ingestion

---

## Quality Tier Definitions

| Tier | Requirement | Current Status |
|------|-------------|----------------|
| ★★☆☆☆ | Basic intro | Most entries |
| ★★★☆☆ | Notes + core content | Partial |
| ★★★★☆ | Full content + cross-refs | Minority |
| ★★★★★ | Deep analysis + cases + extensions | Very few |

**Target**: Bring top 20 entries to ★★★★☆

---

## Knowledge Completion Plan

### TCM Formulas (Current: 17 → Target: 25+)

Source from 13 classical texts:

| Text | Formulas to Add |
|------|-----------------|
| 金匮要略 | 肾气丸, 半夏泻心汤, 桂枝茯苓丸 |
| 温病条辨 | 桑菊饮, 白虎汤, 承气汤, 复脉汤, 大定风珠 |
| Others | 八珍汤, 血府逐瘀汤, 补中益气汤, 归脾汤 |

### TCM Herbs (Current: 15 → Target: 50+)

Upper grade has 120 herbs, massive room for expansion.

### AI/ML Methods (Current: 17 → Target: 25+)

Add more from:
- RLVF (RL from Valued Feedback)
- Test-Time Training
- Neural Architecture Search
- Contrastive Learning

---

## Quality Enhancement Plan

### Deepening Strategy

1. **Core Entry Deepening** — Select top 20 entries, expand to ★★★★☆
2. **Cross-reference Activation** — Each entry: minimum 3 
3. **Example Injection** — Add practical cases for algorithms/methods

### Entry Depth Comparison

```
Before (★★☆☆☆):
# Method Name
Basic description of method.

After (★★★★☆):
# Method Name
## Overview
Comprehensive description

## Key Concepts
- Concept 1
- Concept 2

## Implementation
```python
# Code example
```

## Variants
- Variant A
- Variant B

## Cross-refs
- 
- 
```

---

## Automated Monitoring

### Weekly Check Metrics

```bash
# Check script
- File count per category
- Orphan entries (no cross-refs)
- Stale entries (not updated)
- New entry frequency
```

### Trigger Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Single category files | >30 | Consider split |
| Orphan entries | >10% | Trigger link check |
| No cross-refs | Any | Force add |
| New frequency | >10/week | Trigger optimization |

---

## Passive Ingestion Mechanism

### Knowledge Inflow Channels

1. **Claude Learning Loop** → Auto-enter wiki
2. **Research Results** → Auto-archive
3. **User Commands** → Trigger ingest
4. **External Tools** → doc-extract results

### Automated Workflow

```
User Command → Claude Understand → Wiki Execute → Log Record → Index Update
```

---

## Recommended Priority

| # | Task | Status | Value |
|---|------|--------|-------|
| 1 | TCM formulas (5→17) | ✅ Done | High |
| 2 | TCM herbs (3→15) | ✅ Done | High |
| 3 | AI methods (+8) | ✅ Done | High |
| 4 | Core entry deepening | 🔲 Pending | High |
| 5 | Quality check script | 🔲 Pending | Medium |
| 6 | Structure monitoring | 🔲 Pending | Medium |
| 7 | TCM conditions expansion | 🔲 Pending | Medium |

---

## Current Progress (2026-05-20)

### Completed

| Category | Before | After | Delta |
|----------|--------|-------|-------|
| TCM formulas | 5 | 17 | +12 |
| TCM herbs | 3 | 15 | +12 |
| ML methods | 11 | 19 | +8 |

**Newly added**: Diffusion-Models, MoE, LoRA, DPO, Constitutional-AI, GRPO, Transformer, Agentic-RAG

**Deepened**: DSPy, RAG, RLHF, 小柴胡汤, 黄帝内经, Transformer, Phantom, 四物汤, Evolution-Loop, Agentic-RAG

### Pending

- More core entries deepending (★★★★☆)
- Quality check script
- Structure adaptive monitoring
- TCM conditions expansion (more)

---

## Level 1: Automation Enhancement (v5.1 Implemented)

### 1. Reflection Auto-Trigger

- **Mechanism**: Trigger when operation count reaches 15
- **Storage**: `.wiki_state.json` records operation count
- **Trigger**: `tool_calls % auto_reflection_threshold == 0`

### 2. Index Auto-Registration

- **Mechanism**: New entity auto-registers to index.md
- **Rule**: New file needs `type: entity` + `category:` fields
- **Implementation**: Auto-append to index.md on creation

### 3. Usage Analysis Report

- **Mechanism**: Regular analysis of `.usage.json`
- **Rule**: Weekly report generation
- **Content**: Most accessed entries, missing cross-refs, orphan entries

### 4. Knowledge Ingestion Trigger

- **Mechanism**: New knowledge auto-routes to correct category
- **Rule**: Auto-route by content type to concepts/ or entities/
- **Implementation**: New entry template auto-judgment

---

## Level 2: Intelligent Enhancement (Planned)

### 5. Missing Detection

- Auto-scan inter-entity relationships
- Flag missing links

### 6. Cross-ref Auto-Completion

- Analyze entry content
- Auto-supplement related 

### 7. Stale Content Detection

- Mark entries not updated for long time

### 8. Structure Monitoring

- Detect category imbalance
- Auto-alert

---

## Level 3: Autonomous (Long-term Goal)

### 9. Auto-Generation

- Wiki auto-expands new entries from templates

### 10. Self-Repair

- Errors auto-corrected

### 11. Adaptive Structure

- Usage frequency drives category adjustment

---

## Implementation Code

### Reflection Trigger

```python
class WikiReflectionTrigger:
    """自动反思触发器"""

    def __init__(self, state_file: str = ".wiki_state.json"):
        self.state_file = state_file
        self.threshold = 15

    def should_trigger(self, tool_call_count: int) -> bool:
        """是否应该触发反思"""
        return tool_call_count % self.threshold == 0

    def emit_reflection(self) -> str:
        """生成反思块"""
        return f"""
## Reflection (Tool Calls: {self.get_count()})

### Recent Learning
- {self.get_recent_additions()}

### Quality Assessment
- High-value entries needing deepending
- Cross-ref gaps detected

### Action Items
- {self.get_next_actions()}
"""
```

### Index Auto-Registrar

```python
class WikiIndexRegistrar:
    """自动索引注册器"""

    def register_entity(self, entity_path: str) -> None:
        """注册新实体到索引"""
        with open(entity_path) as f:
            content = f.read()

        # Extract metadata
        category = self.extract_category(content)
        key = self.extract_key(content)

        # Read index
        with open("index.md") as f:
            index = f.read()

        # Add entry
        new_entry = f"-  — description"

        # Insert at correct category
        category_header = f"### {category}/"
        if category_header in index:
            # Insert under category
            index = index.replace(
                category_header,
                f"{category_header}\n- "
            )

        # Write back
        with open("index.md", "w") as f:
            f.write(index)
```

### Quality Checker

```python
class WikiQualityChecker:
    """Wiki质量检查器"""

    def check_entry(self, path: str) -> dict:
        """检查单个条目质量"""
        with open(path) as f:
            content = f.read()

        return {
            'has_crossrefs': content.count('[[') >= 3,
            'has_code': '```' in content,
            'has_examples': 'Example' in content or '例如' in content,
            'word_count': len(content),
            'rating': self.estimate_rating(content)
        }

    def find_orphans(self) -> list:
        """找出孤立条目（无交叉引用）"""
        entities = Path("entities").glob("**/*.md")
        orphans = [[Self-Healing-Loop]]
        for e in entities:
            with open(e) as f:
                content = f.read()
            if content.count('[[') < 1:
                orphans.append(e.stem)
        return orphans

    def report_quality_gaps(self) -> str:
        """生成质量差距报告"""
        gaps = [[Self-Healing-Loop]]
        for category in Path("entities").iterdir():
            if category.is_dir():
                for entry in category.glob("*.md"):
                    quality = self.check_entry(entry)
                    if quality['rating'] < 4:
                        gaps.append((entry.stem, quality))
        return format_gap_report(gaps)
```

---

## Cross-refs

| Entity | Relationship |
|--------|--------------|
| [[schema.m[[knowledge/Design-Toolkit]]] | Wiki schema v4.2 |
| [[knowledge/Accomplishments Index.m[[knowledge/Design-Toolkit]]] | Wiki navigation index |
| [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] | 25-node structured graph |
| [[research/Knowledge-Classification.m[[knowledge/Design-Toolkit]]] | 52,513 topics classification |
| [[knowledge/Wiki-Automation-Guide.m[[knowledge/Design-Toolkit]]] | v5.1 automation guide |
| [[evolution/Evolution-State.m[[knowledge/Design-Toolkit]]] | Evolution state (21,812+ iterations) |