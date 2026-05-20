---
type: entity
category: tcm/formulas
key: 可视化/视频知识系统学习报告
source: Claude-Evo
date: 2026-05-20
---

# 可视化/视频知识系统学习报告

# 可视化/视频知识系统学习报告

**存档时间**: 2026-05-20 18:00
**版本**: v5.0 (视频/可视化方向)
**状态**: 持续迭代中

---

## 探索成果

### 1. mmx视频生成命令 ✅
```
mmx video generate --model <model> --prompt "描述" --duration 6 --resolution 768P|1080P
```

**可用模型**:
- **T2V**: Hailuo-2.3 (6秒, 768P)
- **I2V**: Hailuo-2.3 (图片到视频)
- **SEF**: Hailuo-02 (需要首尾帧)
- **S2V**: S2V-01 (主体一致性)

### 2. mmx图片生成 ✅
```
mmx image generate --model image-01 --prompt "描述" --aspect-ratio 16:9
```
- 成功生成: `guizhi_tang_illustration.jpg` (132KB)
- 保存位置: `E:/Claude/Claude-Work/tcm-knowledge/visual_knowledge/`

### 3. 音频配额 ⚠️
- TTS和视频生成配额已耗尽
- 错误: "Token Plan Plus 5小时限额已用完，20:00重置"

---

## 视频生成测试

### 测试命令（未成功，配额耗尽）
```bash
mmx video generate --model MiniMax-Hailuo-02 --prompt "中医师把脉诊断，传统文化氛围" --duration 6 --resolution 1080P
mmx video generate --model MiniMax-Hailuo-2.3 --prompt "中医把脉，传统文化" --duration 6 --resolution 768P
```

### TCM适用场景
1. **T2V**: 经方讲解动画、名医介绍
2. **I2V**: 药材图片变动画
3. **SEF**: 针灸过程动画
4. **S2V**: 保持同一药材/人物连贯性

---

## 知识可视化Pipeline构思

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

## 待测试功能

1. **I2V模式**: `mmx video generate --model MiniMax-Hailuo-2.3 --first-frame <img> --prompt "动画描述"`
2. **SEF模式**: 首尾帧插值动画
3. **S2V模式**: 主体一致性视频

---

## 已生成的可视化知识

| 文件 | 方剂 | 药材数 | 风格 |
|------|------|--------|------|
| guizhi_tang_illustration.jpg | 桂枝汤 | 5味 | 传统医药风格 |
| mahuang_tang_illustration.jpg | 麻黄汤 | 4味 | 传统医药风格 |
| baihu_tang_illustration.jpg | 白虎汤 | 4味 | 清热生津方剂 |
| xiaoqinglong_tang_illustration.jpg | 小青龙汤 | 7味 | 散寒化饮方剂 |
| gegen_tang_illustration.jpg | 葛根汤 | 7味 | 解肌发表方剂 |
| sini_tang_illustration.jpg | 四逆汤 | 3味 | 温里祛寒古籍风 |
| buzhongyiqi_tang_illustration.jpg | 补中益气汤 | 8味 | 益气升阳方剂 |
| liuwei_dihuangwan_illustration.jpg | 六味地黄丸 | 6味 | 滋阴补肾古籍风 |
| xiaoyao_san_illustration.jpg | 逍遥散 | 8味 | 疏肝解郁古籍风 |
| xuefu_zuyu_tang_illustration.jpg | 血府逐瘀汤 | 11味 | 活血化瘀方剂 |
| wendan_tang_illustration.jpg | 温胆汤 | 6味 | 理气化痰方剂 |
| huoxiang_zhengqi_san_illustration.jpg | 藿香正气散 | 11味 | 解表化湿方剂 |
| jingui_shenqi_wan_illustration.jpg | 金匮肾气丸 | 8味 | 温补肾阳方剂 |
| tcm_bgm_01.mp3 | 中医养生BGM | - | 古风养生音乐(9MB) |

**总计**: 13个可视化知识项目(12图+1音)，约10.9MB
**今日图片配额**: 已用35/50张

---

## 文件清单

- `E:/Claude/Claude-Work/tcm-knowledge/visual_knowledge/` - 可视化知识库
- `E:/Claude/Claude-Work/tcm-knowledge/visual_knowledge/guizhi_tang_illustration.jpg` - 桂枝汤图示

---

## DESIGN.md 建设进展

### 已完成
| 知识库 | 风格 |
|--------|------|
| TCM知识库 | 古典中医美学 |
| agent-skills-repo | AI开发者工具 |
| research | AI学术论文 |
| memory | 温暖个人日记 |

### 进行中
| 知识库 | 状态 |
|--------|------|
| claude-wiki-skill | 生成中 |
| archive | 生成中 |

---

**结论**: 图片生成可用，视频/音频需等待配额重置(20:00)


## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
