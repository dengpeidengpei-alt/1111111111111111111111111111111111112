---
type: entity
category: knowledge
key: Design Systems Comparison (设计系统对比分析)
source: Claude-Evo
date: 2026-05-20
---

# Design Systems Comparison (设计系统对比分析)

**创建时间**: 2026-05-20
**来源**: VoltAgent/awesome-design-md (73个品牌DESIGN.md)

---

## 设计系统对比矩阵

| 品牌 | 主色 | 背景色 | 强调色 | 字体(Display) | 圆角风格 |
|------|------|--------|--------|----------------|----------|
| **Claude** | 珊瑚红 #cc785c | 奶油白 #faf9f5 | 青色/琥珀 | Copernicus serif | 8-12px |
| **Linear** | 薰衣草蓝 #5e6ad2 | 近黑 #010102 | 单一 | Linear Display | 极小/无 |
| **Notion** | 紫 #5645d4 | 白 #ffffff | 多彩标签 | Notion Sans | 6-14px |
| **Stripe** | 电蓝 #533afd | 白 #ffffff | 渐变mesh | Sohne | 药丸形 |
| **Vercel** | 黑 #171717 | 白 #ffffff | 多彩渐变 | Geist | 100px药丸 |
| **Airbnb** | Rausch红 #ff385c | 白 #ffffff | 粉色 | Cereal | 8-20px |
| **Cursor** | 橙 #f54e00 | 暖白 #f7f7f4 | 单一 | CursorGothic | 最小 |
| **Figma** | 黑 #000000 | 白 #ffffff | 彩色色块 | figmaSans | 多变 |
| **Supabase** | 翡翠绿 #3ecf8e | 白 #ffffff | 多彩 | Circular | 最小 |
| **Mintlify** | 黑 #0a0a0a | 白 #ffffff | 薄荷绿 | Inter | 药丸形 |
| **Sanity** | 近黑 #0b0b0b | 近黑 #0b0b0b | 霓虹绿/蓝 | waldenburgNormal | 极小 |
| **Raycast** | 白 #ffffff | 近黑 #07080a | 彩色 | Inter | 6-10px |

---

## 设计系统分类

### 1. 深色系 (Dark-mode First)
| 品牌 | 背景 | 文字 | 特点 |
|------|------|------|------|
| Linear | #010102 | #f7f8f8 | 最深的黑 |
| Sanity | #0b0b0b | #ffffff | 纯色阶 |
| Raycast | #07080a | #f4f4f6 | 表面层级 |

### 2. 亮色系 (Light-mode First)
| 品牌 | 背景 | 文字 | 特点 |
|------|------|------|------|
| Stripe | #ffffff | #0d253f | 渐变mesh |
| Airbnb | #ffffff | #222222 | 单一强调色 |
| Notion | #ffffff | #1a1a1a | 多彩标签 |

### 3. 暖色系 (Warm Tones)
| 品牌 | 背景 | 主色 | 特点 |
|------|------|------|------|
| Claude | #faf9f5 | #cc785c | 温暖文学感 |
| Cursor | #f7f7f4 | #f54e00 | 暖橙点缀 |

### 4. 专业文档系 (Documentation)
| 品牌 | 背景 | 强调色 | 特点 |
|------|------|--------|------|
| Mintlify | #ffffff | #00d4a4 | 文档绿 |
| Vercel | #ffffff | 渐变 | 几何无衬线 |

---

## 字体使用模式

| 类型 | 品牌 | 适用场景 |
|------|------|----------|
| 全衬线 (Editorial) | Claude, Cursor | 文学感、品牌感 |
| 全无衬线 (Modern) | Linear, Vercel, Mintlify, Stripe | 科技、开发者工具 |
| 混合 (Dual) | — | 大标题衬线+正文无衬线 |

---

## 圆角使用模式

| 风格 | 品牌 | 典型值 |
|------|------|--------|
| 极小/无 | Linear, Sanity, Cursor | 0-4px |
| 小-中 | Claude, Notion, Airbnb | 6-12px |
| 药丸形 | Vercel, Stripe | 100px+ |

---

## 关键洞察

1. **品牌差异化**: 大多数品牌用单一强调色+中性色实现差异化
2. **字体层级**: Display字体用weight 400(regular)而非bold，负字间距是标志
3. **表面层级**: 通过颜色区分而非阴影(hairline替代shadow)
4. **圆角**: 开发者工具倾向小圆角，消费产品倾向药丸形
5. **spacing**: 4px是主流基准，section在64-96px之间

---

## DESIGN.md 完整度检查清单

每个DESIGN.md应包含:
- [x] colors (primary, on-primary, canvas, surface, hairline, semantic)
- [x] typography (display-xl → caption, 共10-15级)
- [x] rounded (xs → full, 6-8级)
- [x] spacing (xxs → section, 8-10级)
- [x] components (至少20+组件)
- [x] Do's and Don'ts (5-10条)
- [x] Responsive breakpoints

---

## Cross-refs

- [[knowledge/Design-Toolkit]] — 设计工具包完整文档
- [[knowledge/Wiki-Automation-Guide]] — Wiki自动化等级
- [[evolution/Evolution-v5-Summary]] — v5进化总结