---
type: entity
category: tools
key: MiniMax Setup
source: Claude-Evo tool setup
date: 2026-05-14
---

# MiniMax Setup - MiniMax配置

## Overview

MiniMax是国内领先的多模态AI平台，本文档涵盖配置、API使用和工具调用。

**官方文档**: https://www.minimaxi.com/docs

## Configuration

### 环境变量配置

```bash
# .env 文件 (E:/Claude/.env)
MINIMAX_API_KEY=your_api_key_here
MINIMAX_GROUP_ID=your_group_id_here
MINIMAX_BASE_URL=https://api.minimaxi.com
MINIMAX_REGION=cn
```

### Claude Code MCP 配置

在 `settings.json` 中配置:

```json
{
  "mcpServers": {
    "minimax": {
      "command": "mmx",
      "args": ["search"],
      "env": {
        "MINIMAX_API_KEY": "your-api-key",
        "MINIMAX_GROUP_ID": "your-group-id",
        "MINIMAX_BASE_URL": "https://api.minimaxi.com"
      }
    }
  }
}
```

### 配置验证

```bash
# 验证API Key
curl -X GET https://api.minimaxi.com/v1/user/info \
  -H "Authorization: Bearer $MINIMAX_API_KEY"

# 预期响应
# {"code": 0, "msg": "success", "data": {...}}
```

## Tools (mmx CLI)

### 基础命令

```bash
# 搜索查询
mmx search query "什么是量子计算"

# 图像理解
mmx vision describe --image_path "E:/Claude/1.jpg" --prompt "描述图片"

# 图像生成
mmx image GenImage \
  --prompt "未来城市天际线" \
  --aspect_ratio "16:9" \
  --output_directory "E:/Claude/output"

# 文本对话
mmx text chat --message "你好，请介绍一下自己"

# 额度查询
mmx quota

# 视频生成
mmx video generate \
  --model "MiniMax-Hailuo-02" \
  --prompt "海浪日出" \
  --duration 10

# 查询视频生成状态
mmx query_video_generation --task_id "task-xxx"

# 语音合成
mmx text_to_audio \
  --text "欢迎使用" \
  --voice_id "female-shaonv" \
  --output_path "E:/Claude/output/welcome.mp3"

# 声音列表
mmx list_voices

# 语音克隆
mmx voice_clone \
  --voice_id "my-voice" \
  --file "E:/Claude/samples/voice.wav" \
  --text "测试文本"
```

### 音乐生成

```bash
# 音乐生成 (最长1分钟)
mmx music_generation \
  --prompt "流行音乐，欢快，适合跑步" \
  --lyrics "[Vers[[Self-Healing-Loop]]\n阳光照耀\n[Hook]\n向前奔跑" \
  --output_directory "E:/Claude/output"

# 参数说明
# prompt: 风格描述 (10-300字符)
# lyrics: 歌词，可用\n分隔段落 (10-600字符)
# format: mp3/wav/pcm
# sample_rate: 16000/24000/32000/44100
# bitrate: 32000/64000/128000/256000
```

## API Reference

### 基础信息

| Item | Value |
|------|-------|
| Base URL | https://api.minimaxi.com |
| API Version | v1 |
| Auth | Bearer Token |
| Content-Type | application/json |

### 端点列表

```
# 用户信息
GET /v1/user/info

# 模型列表
GET /v1/models

# 文本对话
POST /v1/text/chat

# 图像生成
POST /v1/image/gen

# 图像理解
POST /v1/vision/describe

# 语音合成
POST /v1/speech/tts

# 视频生成
POST /v1/video/generate

# 查询视频任务
GET /v1/video/query/{task_id}

# 搜索
POST /v1/search
```

### Python SDK 示例

```python
from minimax import MiniMax

# 初始化
mmx = MiniMax(
    api_key=os.getenv("MINIMAX_API_KEY"),
    group_id=os.getenv("MINIMAX_GROUP_ID")
)

# 文本对话
chat_result = mmx.chat.completions(
    model="abab6.5s-chat",
    messages=[
        {"role": "user", "content": "你好"}
   [[Self-Healing-Loop]]
)

# 图像生成
img_result = mmx.image.generate(
    model="image-01",
    prompt="宁静的湖泊，倒映雪山",
    aspect_ratio="16:9"
)

# 语音合成
speech_result = mmx.speech.synthesize(
    text="今天天气真好",
    voice_id="female-shaonv",
    speed=1.0
)
```

### curl 完整示例

```bash
# 搜索
curl -X POST https://api.minimaxi.com/v1/search \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "emb-01",
    "query": "人工智能发展趋势",
    "num_results": 5
  }'

# 文本对话
curl -X POST https://api.minimaxi.com/v1/text/chat \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "abab6.5s-chat",
    "messages": [
      {"role": "user", "content": "解释一下什么是机器学习"}
   [[Self-Healing-Loop]],
    "temperature": 0.7,
    "max_tokens": 1024
  }'
```

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 10001 | Invalid API key | 检查 MINIMAX_API_KEY |
| 10002 | Token rate limit | 降低请求频率 |
| 10003 | Quota exceeded | 等待重置或升级 |
| 10004 | Invalid parameter | 检查请求参数 |
| 10005 | Model not found | 确认模型名称 |
| 20001 | Internal server error | 重试或联系支持 |

## Best Practices

1. **API Key安全**: 不要硬编码，使用环境变量
2. **错误处理**: 实现重试机制，exponential backoff
3. **额度监控**: 定期检查 `mmx quota`，避免突发限额
4. **异步操作**: 视频生成等用异步模式，轮询状态
5. **资源释放**: 生成的内容及时下载，URL有时效

## Cross-refs

- [[infrastructure/MiniMax-Multimodal.m[[knowledge/Design-Toolkit]]] — MiniMax多模态能力详解
- Claude-Work/minimax-mmx-setup.md
- Claude-Work/minimax_api_reference.md
- Claude-Work/a_stock_quant_system/ — 量化系统中的MiniMax应用
- Claude-Work/mcp_ecosystem_research.json — MCP与MiniMax集成