---
type: entity
category: tcm/formulas
key: 图片文字合成 (Image Text Synthesis) 实践指南
source: Claude-Evo
date: 2026-05-20
---

# 图片文字合成 (Image Text Synthesis) 实践指南

# 图片文字合成 (Image Text Synthesis) 实践指南

## 核心问题

AI 直接生成的图片中文字会乱码（如 `???` 或方块 `■`），原因：
- AI 模型无法精确渲染文字符号，文字区域被当作纹理生成
- 解决思路：生成图片后，用 PIL 后处理添加文字水印

## 方案：Pillow 后处理添加文字

### 关键要点

| 要点 | 说明 |
|------|------|
| 字体格式 | 必须用 `.ttf` / `.ttc`，不能是 `.fon` |
| 字体来源 | Windows: `C:/Windows/Fonts/` 下找中文字体 |
| 编码 | Python3 默认 UTF-8，字符串用普通引号即可 |
| 描边 | 深色/复杂背景上加描边（stroke）大幅提升可读性 |
| 字号 | 建议 20-60px，太小模糊，太大遮挡主体 |
| 颜色 | (R, G, B) 元组，不是颜色名字符串 |

### Windows 常用中文字体路径

```
C:/Windows/Fonts/msyh.ttc     - 微软雅黑 (推荐)
C:/Windows/Fonts/simsun.ttc   - 宋体
C:/Windows/Fonts/simhei.ttf   - 黑体
C:/Windows/Fonts/STSONG.TTF   - 华文宋体
C:/Windows/Fonts/simkai.ttf   - 楷体
C:/Windows/Fonts/simfang.ttf  - 仿宋
C:/Windows/Fonts/ARIALUNI.TTF - Arial Unicode MS（英文系统备用）
```

### 最简示例

```python
from PIL import Image, ImageDraw, ImageFont

# 加载字体（必须 .ttf/.ttc）
font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 40)

# 打开图片
img = Image.open("input.jpg").convert("RGBA")
draw = ImageDraw.Draw(img)

# 写字（中文直接写字符串即可）
draw.text((50, 50), "葛根汤", font=font, fill=(255, 255, 255))

img.convert("RGB").save("output.jpg")
```

### 带描边的完整示例

```python
from PIL import Image, ImageDraw, ImageFont

def add_title(img_path, out_path, text, font_size=36):
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", font_size)
    img = Image.open(img_path).convert("RGBA")
    draw = ImageDraw.Draw(img)

    # 位置：顶部居中
    x, y = 50, 20
    stroke_w = 2

    # 先画描边，再画文字
    draw.text((x, y), text, font=font, fill=(0, 0, 0),
              stroke_width=stroke_w)
    draw.text((x, y), text, font=font, fill=(255, 255, 255))

    img.convert("RGB").save(out_path, quality=95)
```

## 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| `UnicodeEncodeError` | 字体文件不支持中文 | 换用中文字体如 msyh.ttc |
| 文字显示为方块 `■` | 字体文件中没有该汉字 | 换用更完整的中文字体 |
| 字体加载失败 | 路径有反斜杠转义 | 用正斜杠或 `r"C:\..."` |
| 文字位置偏移 | 没有考虑 baseline | 用 `textbbox()` 计算精确边界 |

## 代码位置

**可运行脚本**：`E:/Claude/Claude-Work/tcm-knowledge/visual_knowledge/add_text_to_image.py`

包含：
- `get_font()` - 自动查找可用中文字体
- `add_title_to_image()` - 在指定位置添加标题（顶部/底部/居中）
- 示例用法

## 适用场景

- AI 生图后添加中药方剂名称标题
- 给科普图片加水印/署名
- 批量给图片添加统一风格的标题文字

## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
