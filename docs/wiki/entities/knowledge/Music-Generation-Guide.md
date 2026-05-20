---
type: entity
category: knowledge
key: Music Generation Guide (AI音乐生成)
source: Claude-Evo
date: 2026-05-20
---

# Music Generation Guide (AI音乐生成)

**更新时间**: 2026-05-20

## 一、mmx music generate 命令用法

### 基础命令格式

```bash
mmx music_generation \
  --prompt "音乐风格描述" \
  --lyrics "歌词内容" \
  --output "output.mp3"
```

### 参数说明

| 参数 | 范围 | 说明 |
|------|------|------|
| prompt | 10-300字符 | 音乐风格文本描述 |
| lyrics | 10-600字符 | 歌词，可用\n分隔段落 |
| format | mp3/wav/pcm | 输出格式 |
| sample_rate | 16000/24000/32000/44100 | 采样率 |
| bitrate | 32000/64000/128000/256000 | 比特率 |

### 示例

```bash
# 纯音乐（无歌词）
mmx music_generation \
  --prompt "ambient synthwave, inspiring, AI learning atmosphere" \
  --output "E:/Claude/output/music.mp3"

# 带歌词的歌曲
mmx music_generation \
  --prompt "流行音乐，欢快，适合跑步" \
  --lyrics "[Vers[[Self-Healing-Loop]]\n阳光照耀\n[Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]\n向前奔跑" \
  --output "E:/Claude/output/song.mp3"
```

---

## 二、Prompt优化技巧

### 2.1 Prompt结构公式

```
[情绪] + [风格] + [乐器] + [ BPM/节奏[[Self-Healing-Loop]] + [用途]
```

### 2.2 关键要素

| 要素 | 描述 | 示例 |
|------|------|------|
| 情绪 | 欢快/悲伤/平静/紧张 | happy, sad, calm, tense |
| 风格 | 音乐流派 | jazz, rock, classical, electronic |
| 乐器 | 特定乐器 | piano, guitar, strings, synth |
| 节奏 | 速度描述 | uptempo, slow, medium |
| 用途 | 应用场景 | background, cinematic, game |

---

## 三、知识视频背景音乐模板

| 类型 | Prompt | 用途 |
|------|--------|------|
| 知识讲解 | "ambient background music, soft piano, subtle strings, calm and focused" | 教程、科普 |
| 纪录片 | "cinematic orchestral, grand strings, brass section, documentary narration" | 历史、科学 |
| 科技未来 | "futuristic synthwave, electronic ambient, AI atmosphere, glowing pads" | AI讲解、技术 |
| 古风中医 | "古风轻音乐，悠扬笛子，古筝，舒缓节奏，中国传统乐器" | 中医、传统文化 |

---

## 四、Lyrics格式写法

```
[Intr[[Self-Healing-Loop]]        # 前奏（可选）
[Vers[[Self-Healing-Loop]]        # 主歌
[Pre-Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]   # 预副歌（可选）
[Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]       # 副歌/高潮
[Hook]         # 钩子
[Bridg[[Self-Healing-Loop]]       # 桥段
[Outr[[Self-Healing-Loop]]        # 尾奏
```

---

## 五、额度与限制

| 限制 | 说明 |
|------|------|
| 每日额度 | 100次/天 |
| 最大时长 | 1分钟 |
| Prompt长度 | 10-300字符 |
| Lyrics长度 | 10-600字符 |

---

## Cross-refs

- [[knowledge/Image-Text-Synthesis.m[[knowledge/Design-Toolkit]]] — 图片文字合成（解决AI生图中文乱码）
- [[knowledge/Design-Toolkit.m[[knowledge/Design-Toolkit]]] — 设计工具包完整文档
- [[evolution/Evolution-v5-Summary.m[[knowledge/Design-Toolkit]]] — v5进化总结