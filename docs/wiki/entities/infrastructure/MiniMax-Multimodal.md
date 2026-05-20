---
type: entity
category: tools
key: MiniMax Multimodal
source: Claude-Evo research
date: 2026-05-14
---

# MiniMax 多模态能力

## Overview

MiniMax 是国内领先的AI多模态平台，提供图像生成、图像理解、视频生成、语音合成等能力。

**核心优势**:
- 超长上下文 (400万token)
- 中文场景优化
- 每日重置的免费额度

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MiniMax API Layer                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Image Gen    │  │  Vision       │  │  T2V          │  │
│  │  (Image-01)   │  │  Understand   │  │  (视频生成)    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    MiniMax SDK (mmx)                       │
├─────────────────────────────────────────────────────────────┤
│              API: api.minimaxi.com                         │
└─────────────────────────────────────────────────────────────┘
```

## Image Generation (图像生成)

### Image-01 Model

| Property | Value |
|----------|-------|
| Context Window | 400万token (业界20倍以上) |
| Architecture | 线性注意力机制 + 01系列开源技术 |
| Key Features | 精确提示控制、保真度高 |
| Aspect Ratios | 1:1, 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9 |

### API Usage

```bash
# 使用 mmx 工具 (Claude Code MCP)
mmx image GenImage \
  --prompt "中国古典山水画，云雾缭绕，瀑布飞流" \
  --aspect_ratio "16:9" \
  --output_directory "E:/Claude/output"

# 或使用 text_to_image API
curl -X POST https://api.minimaxi.com/v1/image/gen \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -d '{
    "model": "image-01",
    "prompt": "未来城市，赛博朋克风格",
    "aspect_ratio": "16:9"
  }'
```

### Python SDK

```python
from minimax import MiniMax

mmx = MiniMax(api_key="your-api-key")

# 生成图片
result = mmx.image.generate(
    model="image-01",
    prompt="宁静的日本庭院，樱花盛开",
    aspect_ratio="16:9"
)
print(result["data"]["url"])
```

## Image Understanding (图像理解)

### 额度说明
| 额度 | 限制 |
|------|------|
| 每日限制 | 150次/5小时 |
| 重置时间 | 每日0点 |

### API Usage

```bash
# 使用 mmx vision describe
mmx vision describe \
  --image_path "E:/Claude/1.jpg" \
  --prompt "描述这张图片的内容"

# Claude Code中直接使用
# !describe image
```

### Python SDK

```python
from minimax import MiniMax

mmx = MiniMax(api_key="your-api-key")

# 图像理解
result = mmx.vision.describe(
    image="path/to/image.jpg",
    prompt="详细描述图片中的场景、人物、物品"
)
print(result["description"])
```

## Video Generation (视频生成)

### 支持模型

| Model | Description |
|-------|-------------|
| T2V-01 | 文本转视频基础版 |
| T2V-01-Director | 支持15种摄像机控制指令 |
| MiniMax-Hailuo-02 | 最新模型，最佳效果，支持超清 |

### Hailuo-02 规格

| Property | Value |
|----------|-------|
| Duration | 6秒或10秒 |
| Resolution | 768P 或 1080P |
| Camera Controls | Truck, Pan, Push, Pedestal, Tilt, Zoom, Shake, Follow, Static |

### API Usage

```bash
# 文本转视频 (异步)
mmx video generate \
  --model "MiniMax-Hailuo-02" \
  --prompt "日出时分，海浪拍打礁石，金色阳光洒满海面" \
  --duration 10 \
  --resolution "1080P" \
  --output_directory "E:/Claude/videos"

# 查询任务状态
mmx query_video_generation --task_id "task-12345"
```

### Camera Movement Instructions (Director模式)

```bash
# 推近镜头
mmx video generate \
  --model "T2V-01-Director" \
  --prompt "街道场景 [Push i[[Self-Healing-Loop]]" \
  --camera "Push in"
```

支持的15种指令:
- Truck: [Truck lef[[knowledge/Design-Toolkit]], [Truck righ[[knowledge/Design-Toolkit]]
- Pan: [Pan lef[[knowledge/Design-Toolkit]], [Pan righ[[knowledge/Design-Toolkit]]
- Push: [Push i[[Self-Healing-Loop]], [Pull ou[[knowledge/Design-Toolkit]]
- Pedestal: [Pedestal u[[Self-Healing-Loop]], [Pedestal dow[[Self-Healing-Loop]]
- Tilt: [Tilt u[[Self-Healing-Loop]], [Tilt dow[[Self-Healing-Loop]]
- Zoom: [Zoom i[[Self-Healing-Loop]], [Zoom ou[[knowledge/Design-Toolkit]]
- Shake: [Shak[[Self-Healing-Loop]]
- Follow: [Tracking sho[[knowledge/Design-Toolkit]]
- Static: [Static sho[[knowledge/Design-Toolkit]]

## Audio & Speech (语音合成)

### 额度说明
| 额度 | 限制 |
|------|------|
| 每日限制 | 4000次/天 |
| 重置时间 | 每日0点 |

### Voice List

```bash
# 查看可用声音
mmx list_voices

# 声音类型
# - male-qn-qingse: 青年男性
# - female-shaonv: 少女
# - audiobook_female_1: 有声书女声
# - cute_boy: 可爱男孩
# - Charming_Lady: 魅力女声
```

### API Usage

```bash
# 文本转语音
mmx text_to_audio \
  --text "欢迎使用MiniMax语音合成服务" \
  --voice_id "female-shaonv" \
  --output_path "E:/Claude/output/welcome.mp3"

# 指定参数
mmx text_to_audio \
  --text "今天天气真好" \
  --voice_id "male-qn-qingse" \
  --speed 1.0 \
  --volume 1.0 \
  --format "mp3" \
  --bitrate 128000
```

### Python SDK

```python
from minimax import MiniMax

mmx = MiniMax(api_key="your-api-key")

# 语音合成
result = mmx.speech.synthesize(
    text="你好，欢迎使用MiniMax",
    voice_id="female-shaonv",
    speed=1.0,
    emotion="happy"
)
print(result["audio_url"])
```

## Configuration

### 环境变量

```bash
# .env 文件
MINIMAX_API_KEY=your-api-key-here
MINIMAX_GROUP_ID=your-group-id

# 或直接配置
export MINIMAX_API_KEY="your-key"
export MINIMAX_GROUP_ID="your-group"
```

### Claude Code 配置 (settings.json)

```json
{
  "mcpServers": {
    "minimax": {
      "command": "mmx",
      "args": ["search"],
      "env": {
        "MINIMAX_API_KEY": "your-key",
        "MINIMAX_GROUP_ID": "your-group"
      }
    }
  }
}
```

## Quota Management

```bash
# 查询额度
mmx quota

# 输出示例
# Image Generation: 50/day
# Vision: 150/5h
# Speech: 4000/day
# Video: 10/month
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API Key 无效 | 检查 .env 中的 MINIMAX_API_KEY |
| 额度超限 | 等待次日0点重置，或升级套餐 |
| 视频生成慢 | 使用异步模式，查询 task_id 获取结果 |
| 图片生成失败 | 检查 prompt 长度和 aspect_ratio 格式 |

## Best Practices

1. **额度管理**: 语音合成4000次/天，图像理解150次/5h，注意分配
2. **异步处理**: 视频生成等长时间任务用异步模式
3. **Prompt优化**: 使用英文或详细描述可提高生成质量
4. **缓存结果**: 生成的内容URL有时效，及时下载
5. **错误重试**: 网络问题时 exponential backoff 重试

## Cross-refs

- [[infrastructure/MiniMax-Setup.m[[knowledge/Design-Toolkit]]] — MiniMax配置
- [[concepts/2026-05-14_concept_multimodal-learning.m[[knowledge/Design-Toolkit]]] — 多模态学习概念
- Claude-Work/minimax_image_capabilities.md
- Claude-Work/minimax-mmx-setup.md
- Claude-Work/minimax_video_generation.md
- Claude-Work/a_stock_quant_system/ — 量化中的多模态应用