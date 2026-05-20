---
type: entity
category: knowledge
key: Design System Toolkit (v5.1)
source: Claude-Evo
date: 2026-05-20
---

# Design System Toolkit (v5.1)

## 概述

从 DESIGN.md 生成预览和组件的工具集，用于将设计规范快速转化为可执行代码。

**工具路径**: `E:/Claude/`

## 工具列表

### 1. design_preview.py - HTML预览生成器

根据 DESIGN.md 规范生成可浏览的 HTML 预览页面。

```bash
python design_preview.py tcm          # 生成单个知识库的预览
python design_preview.py all          # 生成所有知识库的预览
python design_preview.py serve        # 启动本地服务器预览
```

**输出**: `<knowledge-base>/design_preview.html`

### 2. design_to_component.py - React组件生成器

从 DESIGN.md 规范生成 React/styled-components 组件代码。

```bash
python design_to_component.py Claude-Work/tcm-knowledge/DESIGN.md tcm_components.jsx
```

**输出**: `<knowledge-base>/<name>_components.jsx`

### 3. dual_track_generator.py - 双轨规范生成器

同时生成 AGENTS.md + DESIGN.md 双轨规范。

```bash
python dual_track_generator.py tcm          # 单个知识库
python dual_track_generator.py all          # 全部6个知识库
```

**输出**:
- AGENTS.md (项目指南)
- DESIGN.md (设计规范，如不存在)

### 4. visual_knowledge_gallery.py - 图库索引生成器

扫描 visual_knowledge 目录，生成HTML图库页面。

```bash
python visual_knowledge_gallery.py
```

**输出**: `Claude-Work/tcm-knowledge/visual_gallery.html`

### 5. tcm_visual_generator.py - 方剂图示生成器

生成中医方剂的视觉图示，避免AI文字乱码问题。

```bash
python tcm_visual_generator.py           # 生成所有方剂
python tcm_visual_generator.py 桂枝汤    # 生成单个方剂
```

**核心技巧**: 使用纯视觉prompt（无中文） + PIL后处理添加标题

---

## 支持的知识库

| 知识库 | 路径 | 风格 |
|--------|------|------|
| tcm | Claude-Work/tcm-knowledge/DESIGN.md | 古典中医美学 |
| agent-skills | Claude-Work/agent-skills-repo/DESIGN.md | AI开发者工具 |
| research | Claude-Work/research/DESIGN.md | AI学术论文 |
| memory | Claude-Work/memory/DESIGN.md | 温暖个人日记 |
| archive | Claude-Work/archive/DESIGN.md | 档案复古风 |
| wiki | claude-wiki-skill/DESIGN.md | 文档百科风 |

---

## DESIGN.md 格式

```yaml
---
version: alpha
name: Design-Name
description: 设计描述
colors:
  primary: "#xxx"
  accent: "#yyy"
typography:
  display-xl:
    fontFamily: "Font Name"
    fontSize: 56px
    fontWeight: 700
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
---
```

**Token引用格式**: `{colors.primary}`, `{rounded.md}`, `{typography.display-xl}`

---

## 生成的组件类型

- **Buttons**: Primary, Secondary, Ghost, Icon
- **Cards**: BaseCard, PaperCard, ElevatedCard
- **Nav**: TopNav, SideNav
- **Inputs**: TextInput, SearchInput
- **Tags**: Badge, Pill, Status

---

## 流程

```
DESIGN.md (规范定义)
    ↓
design_preview.py → design_preview.html (视觉预览)
    ↓
design_to_component.py → *_components.jsx (React代码)
    ↓
开发者基于生成的代码构建UI
```

---

## 参考

- 规范来源: [VoltAgent/awesome-design-m[[knowledge/Design-Toolkit]](https://github.com/VoltAgent/awesome-design-md) (73个品牌设计规范)
- 字体: Inter, Noto Serif SC, system-ui
- 颜色系统: primary/accent/canvas 三层

---

## 衍生工具

| 工具 | 功能 | 输出 |
|------|------|------|
| add_text_to_image.py | 图片添加中文标题 | *_with_title.jpg |

**位置**: `Claude-Work/tcm-knowledge/visual_knowledge/add_text_to_image.py`

**使用方法**:
```python
from add_text_to_image import add_text_overlay
add_text_overlay("input.jpg", "方剂名称", "output.jpg")
```

---

## Cross-refs

- [[knowledge/Wiki-Automation-Guide]] — Wiki自动化等级
- [[EVOLUTION-v5.1-STASH]] — 进化存档