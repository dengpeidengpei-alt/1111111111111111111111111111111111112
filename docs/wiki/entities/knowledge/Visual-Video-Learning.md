---
type: entity
category: knowledge
key: Visual/Video Learning System (可视化/视频知识系统)
source: Claude-Evo
date: 2026-05-20
---

# Visual/Video Learning System (可视化/视频知识系统)

**存档时间**: 2026-05-20 18:00
**版本**: v5.0 (视频/可视化方向)

---

## 探索成果

### 1. mmx视频生成命令

```
mmx video generate --model <model> --prompt "描述" --duration 6 --resolution 768P|1080P
```

**可用模型**:
| 模型 | 用途 | 说明 |
|------|------|------|
| Hailuo-2.3 | T2V/I2V | 6秒, 768P |
| MiniMax-Hailuo-02 | SEF | 需要首尾帧 |
| S2V-01 | S2V | 主体一致性 |

### 2. mmx图片生成

```
mmx image generate --model image-01 --prompt "描述" --aspect-ratio 16:9
```

### 3. 音频配额状态

| 资源 | 状态 | 重置时间 |
|------|------|----------|
| TTS | ⚠️ 耗尽 | 20:00 |
| 视频生成 | ⚠️ 耗尽 | 20:00 |
| 图片生成 | ✅ 可用 | — |
| 音乐生成 | ✅ 可用 | 100次/天 |

---

## TCM适用场景

| 模式 | 用途 |
|------|------|
| T2V | 经方讲解动画、名医介绍 |
| I2V | 药材图片变动画 |
| SEF | 针灸过程动画 |
| S2V | 保持同一药材/人物连贯性 |

---

## 知识可视化Pipeline

```
文字知识(KG)
    ↓
生成图片(image-01) → 保存visual_knowledge/
    ↓
生成视频(待配额恢复)
    ↓
添加语音旁白(TTS)
```

---

## Cross-refs

- [[knowledge/Image-Text-Synthesis.m[[knowledge/Design-Toolkit]]] — 解决AI生图中文乱码
- [[knowledge/Music-Generation-Guide.m[[knowledge/Design-Toolkit]]] — 背景音乐生成
- [[knowledge/Design-Toolkit.m[[knowledge/Design-Toolkit]]] — 设计工具完整文档
- [[evolution/Evolution-v5-Summary.m[[knowledge/Design-Toolkit]]] — v5进化总结