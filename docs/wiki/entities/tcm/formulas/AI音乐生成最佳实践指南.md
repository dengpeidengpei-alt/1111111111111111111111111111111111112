---
type: entity
category: tcm/formulas
key: AI音乐生成最佳实践指南
source: Claude-Evo
date: 2026-05-20
---

# AI音乐生成最佳实践指南

# AI音乐生成最佳实践指南

**更新时间**: 2026-05-20
**覆盖领域**: Prompt优化、知识视频BGM、Lyrics格式、风格分类

---

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

**示例**:
- "ambient synthwave, inspiring, 100 BPM, background music for study"
- "古风轻音乐，悠扬笛声，舒缓节奏，知识讲解配乐"

### 2.2 关键要素

| 要素 | 描述 | 示例 |
|------|------|------|
| 情绪 | 欢快/悲伤/平静/紧张 | happy, sad, calm, tense |
| 风格 | 音乐流派 | jazz, rock, classical, electronic |
| 乐器 | 特定乐器 | piano, guitar, strings, synth |
| 节奏 | 速度描述 | uptempo, slow, medium |
| 用途 | 应用场景 | background, cinematic, game |

### 2.3 优化建议

1. **具体化描述**: "calm piano" 优于 "music"
2. **组合风格**: "jazz + electronic fusion" 产生独特效果
3. **添加氛围词**: atmospheric, ethereal, dreamy
4. **指定年代感**: 80s synth, 90s R&B, vintage
5. **避免过于笼统**: 不要只写 "good music"

### 2.4 反面示例

```
❌ "music"           # 太宽泛
❌ "nice song"       # 不具体
❌ "make me happy"   # 主观性太强
```

### 正面示例

```
✓ "upbeat electronic, synth lead, 120 BPM, motivational"
✓ "calm acoustic guitar, fingerpicking, peaceful morning"
✓ "cinematic strings, dramatic, film score style"
```

---

## 三、知识视频背景音乐模板

### 3.1 知识讲解类

```
安静、专注、轻微背景音 - 不干扰讲解

Prompt: "ambient background music, soft piano, subtle strings,
         calm and focused, library atmosphere, no heavy beats"

Lyrics: (通常无需歌词，纯音乐更合适)
```

### 3.2 教程演示类

```
清晰、有节奏、引导注意力

Prompt: "clean electronic, gentle beat, light synth pad,
         professional tutorial music, unobtrusive"

用途: 软件教程、技能演示
```

### 3.3 纪录片风格

```
宏大、有深度、启发思考

Prompt: "cinematic orchestral, grand strings, brass section,
         documentary narration, inspiring, film score quality"

用途: 历史纪录片、科学视频
```

### 3.4 科技未来感

```
现代、技术感、智能氛围

Prompt: "futuristic synthwave, electronic ambient, AI atmosphere,
         glowing pads, modern technology feel, subtle arpeggios"

用途: AI讲解、技术趋势、未来展望
```

### 3.5 古风/传统文化

```
古典、韵味、悠远

Prompt: "古风轻音乐，悠扬笛子，古筝，舒缓节奏，
         中国传统乐器，宁静祥和"

Lyrics: "[Vers[[Self-Healing-Loop]]\n山水之间\n云雾缭绕\n\n[Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]\n古韵悠长"
```

---

## 四、Lyrics格式写法

### 4.1 基础结构

```
[Intr[[Self-Healing-Loop]]        # 前奏（可选）
[Vers[[Self-Healing-Loop]]        # 主歌
[Pre-Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]   # 预副歌（可选）
[Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]       # 副歌/高潮
[Hook]         # 钩子（重复性强的段落）
[Bridg[[Self-Healing-Loop]]       # 桥段（转折）
[Outr[[Self-Healing-Loop]]        # 尾奏（可选）
```

### 4.2 格式示例

```
[Intr[[Self-Healing-Loop]]
轻柔的钢琴声响起

[Vers[[Self-Healing-Loop]]
晨光穿过窗帘
知识的光芒闪烁
学习的旅程开始

[Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
探索未知
永不停歇
在AI的世界里
发现无限可能

[Hook]
学习 学习 永不止步
进化 进化 超越自我
```

### 4.3 注意事项

- 每段歌词控制在 4-8 句
- 句与句之间用换行分隔
- 可以加韵脚增强节奏感
- 避免过于复杂的押韵系统
- 中文歌词使用中文标点

### 4.4 纯音乐写法

如果不需要人声歌词，可以：

```
# 不提供lyrics参数，生成纯音乐
mmx music_generation \
  --prompt "ambient synth, atmospheric, relaxing study music" \
  --output "music.mp3"
```

---

## 五、风格分类指南

### 5.1 安静/放松类

| 风格 | Prompt | 场景 |
|------|--------|------|
| Ambient | "ambient pads, ethereal, calm, meditation" | 冥想、放松 |
| Piano | "soft piano, gentle melody, peaceful" | 阅读、学习 |
| Nature | "nature sounds, flowing water, birds, peaceful" | 瑜伽、SPA |
| Lo-Fi | "lo-fi hip hop, chill, study beats" | 工作、学习 |

### 5.2 动感/激励类

| 风格 | Prompt | 场景 |
|------|--------|------|
| Upbeat | "upbeat pop, energetic, motivational" | 运动、健身 |
| Electronic | "electronic dance, 128 BPM, festival" | 短视频、vlog |
| Rock | "driving rock, electric guitar, powerful" | 极限运动 |
| Workout | "workout music, high energy, intense" | 健身、跑步 |

### 5.3 古典/优雅类

| 风格 | Prompt | 场景 |
|------|--------|------|
| Classical | "orchestral, classical symphony, elegant" | 纪录片、讲座 |
| Cinematic | "cinematic film score, epic, dramatic" | 电影、剧情视频 |
| Jazz | "smooth jazz, saxophone, sophisticated" | 咖啡厅、高端场所 |
| Baroque | "baroque classical, harpsichord, refined" | 历史、教育 |

### 5.4 现代/科技类

| 风格 | Prompt | 场景 |
|------|--------|------|
| Synthwave | "synthwave, 80s retro, neon, futuristic" | 科技、游戏 |
| Cyberpunk | "cyberpunk atmosphere, dark synth, tech" | 科技、赛博朋克 |
| AI Theme | "AI atmosphere, digital, intelligent, synthetic" | AI讲解、技术 |
| Space | "space ambient, cosmic, stars, exploration" | 航天、科学 |

### 5.5 中国风

| 风格 | Prompt | 场景 |
|------|--------|------|
| 古风 | "古风音乐，笛子，古筝，琵琶，悠然" | 传统文化、历史 |
| 民族 | "中国民族音乐，二胡，葫芦丝，山水" | 风景、旅游 |
| 禅意 | "禅意音乐，古琴，木鱼，宁静，冥想" | 冥想、茶道 |

---

## 六、实战案例

### 案例1: AI学习博客背景音乐

```bash
mmx music_generation \
  --prompt "ambient synthwave, AI learning atmosphere, inspiring,
            electronic pads, subtle beats, modern technology feel" \
  --lyrics "[Vers[[Self-Healing-Loop]]\n人工智能 在此刻觉醒\n算法迭代 永不停止\n\n[Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]\n学习进化 超越自我\n在数据海洋 探索真理" \
  --output "E:/Claude/audio/ai_learning.mp3"
```

### 案例2: 知识科普视频

```bash
# 纯音乐更适合知识类视频，不干扰讲解
mmx music_generation \
  --prompt "soft ambient, educational background, calm piano,
            subtle strings, no heavy beats, professional,
            knowledge video music" \
  --output "E:/Claude/audio/knowledge_video.mp3"
```

### 案例3: 中医养生视频

```bash
mmx music_generation \
  --prompt "古风轻音乐，悠扬笛子，古筝，舒缓节奏，
            传统中医养生氛围，宁静祥和" \
  --lyrics "[Vers[[Self-Healing-Loop]]\n天地人和\n阴阳平衡\n草本精华\n养生之道\n\n[Choru[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]\n气血调和\n经络畅通\n顺应自然\n健康长久" \
  --output "E:/Claude/audio/tcm_health.mp3"
```

### 案例4: 科技数码评测

```bash
mmx music_generation \
  --prompt "modern electronic, tech review background, clean synth,
            120 BPM, professional, gadget showcase music,
            sleek and contemporary" \
  --output "E:/Claude/audio/tech_review.mp3"
```

---

## 七、实用技巧

### 7.1 提升质量技巧

1. **描述具体乐器**: "acoustic guitar" 而非 "guitar"
2. **添加情绪词**: "melancholic piano" vs "piano"
3. **指定场景**: "cinematic" 暗示高质量管弦乐
4. **组合风格**: "jazz + electronic fusion" 产生独特效果

### 7.2 常见问题解决

| 问题 | 解决方案 |
|------|----------|
| 音乐太吵 | 添加 "quiet, subtle, background" |
| 节拍太快 | 添加 "slow tempo, 70 BPM" |
| 太单调 | 添加 "layered, rich texture" |
| 风格不对 | 指定 "in the style of [artist/genr[[Self-Healing-Loop]]" |

### 7.3 创意技巧

1. **参考电影配乐**: "Hans Zimmer style, cinematic"
2. **指定年代**: "80s synthwave, retro"
3. **添加地理标签**: "Tokyo ambient, Japanese city night"
4. **混合流派**: "Classical + Electronic crossover"

---

## 八、额度与限制

| 限制 | 说明 |
|------|------|
| 每日额度 | 100次/天 |
| 最大时长 | 1分钟 |
| Prompt长度 | 10-300字符 |
| Lyrics长度 | 10-600字符 |

---

**文档版本**: v1.0
**下次更新**: 2026-08-20

## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
