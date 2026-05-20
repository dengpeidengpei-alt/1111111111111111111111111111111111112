---
type: entity
category: tools
key: Ollama
source: https://ollama.com
date: 2026-05-20
layer: 2.0
rating: ★★★★☆
---

# Ollama - 本地LLM运行平台

## Overview

Ollama是本地方便使用的LLM运行时，支持模型管理、API服务、多模态和函数调用。截至2026年5月，GitHub 165k+ stars，macOS/Windows/Linux全平台支持。

**核心能力**:
- 模型库管理 (qwen2.5, llama3.2, deepseek-r1, phi4, mistral, etc.)
- OpenAI兼容API
- 多模态支持 (Vision, Embeddings)
- 函数调用 (Function Calling)
- GPU加速 (CUDA/Metal)
- Docker部署

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Ollama CLI/API                      │
├─────────────────────────────────────────────────────────┤
│                   Ollama Server Process                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Model Loader│  │ Context Mgr │  │  Prompt Engine  │  │
│  │  (GGUF)     │  │  (KV Cache) │  │  (Template)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│              Inference Engine (llama.cpp)               │
│  - Paged Attention (K/V Cache)                         │
│  - Quantization (Q4_0, Q5_K_M, Q8_0)                   │
│  - SIMD Optimizations (AVX2, NEON, Metal)              │
├─────────────────────────────────────────────────────────┤
│            Hardware (GPU/CPU via CUDA/Metal)            │
└─────────────────────────────────────────────────────────┘
```

**请求流程**:
```
Client Request → REST API → Scheduler → Model Loader → Inference Engine → Response
                     ↓              ↓
                 Modelfile      KV Cache
```

## Model Registry (精选)

| Model | Size | RAM | Disk | Strengths |
|-------|------|-----|------|-----------|
| qwen2.5:0.5b | ~500MB | 1GB | <500MB | 轻量任务、嵌入式 |
| qwen2.5:1.5b | ~1GB | 2GB | ~1GB | 代码补全、快速响应 |
| qwen2.5:3b | ~2GB | 4GB | ~2GB | 中等推理、多轮对话 |
| qwen2.5:7b | ~4GB | 8GB | ~4GB | 高质量生成、专业任务 ★推荐 |
| qwen2.5:14b | ~8GB | 16GB | ~8GB | 复杂推理、代码生成 |
| qwen2.5:32b | ~16GB | 32GB | ~16GB | 高级推理、研究用途 |
| llama3.2:1b | ~1GB | 2GB | ~1GB | 轻量通用 |
| llama3.2:3b | ~2GB | 4GB | ~2GB | 中等通用 |
| deepseek-r1:7b | ~4.5GB | 8GB | ~4.5GB | 深度推理、数学 ★ |
| phi4:3.8b | ~2.5GB | 4GB | ~2.5GB | 轻量高效、安全过滤 |

**多模态模型**:
| Model | Size | Capabilities |
|-------|------|-------------|
| llama3.2-vision:11b | ~7GB | 图像理解、OCR |
| qwen2.5-vl:7b | ~4GB | 图像理解、图表分析 |
| llava:7b | ~4GB | 图像对话 |

**Embedding模型**:
| Model | Size | Use Case |
|-------|------|----------|
| nomic-embed-text | ~275MB | 文本向量化、RAG |
| maidalun-embed | ~350MB | 中文embedding |

## Installation & Configuration

### Windows
```powershell
# 方法1: 下载安装
# 访问 https://ollama.com/download 下载 OllamaSetup.exe

# 方法2: Winget (管理员PowerShell)
winget install Ollama.Ollama

# 验证
ollama --version

# 启动服务 (后台自动运行)
ollama serve
```

### Linux/macOS
```bash
# 一键安装
curl -fsSL https://ollama.com/install.sh | sh

# 启动服务
ollama serve

# 开机自启 (macOS)
brew services start ollama
```

### Docker
```bash
# 运行 Ollama 容器
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# 进入容器运行模型
docker exec -it ollama ollama run qwen2.5:3b

# GPU支持 (NVIDIA)
docker run -d --gpus all -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
```

### 环境变量配置

```bash
# 模型存储路径
OLLAMA_MODELS=/mnt/data/models

# 上下文窗口大小 (默认4096)
OLLAMA_NUM_CTX=8192

# GPU层数 (0=全部用CPU, -1=全部用GPU)
OLLAMA_GPU_LAYERS=35

# 最大并发请求 (默认1)
OLLAMA_NUM_PARALLEL=4

# 请求超时时间 (默认300s)
OLLAMA_TIMEOUT=120

# 主机绑定 (默认127.0.0.1)
OLLAMA_HOST=0.0.0.0
```

## API Usage

### REST API

```bash
# 对话补全
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:3b",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain Docker containers"}
   [[Self-Healing-Loop]],
    "stream": false
  }'

# 生成补全
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:3b",
    "prompt": "Write a Python function to reverse a string",
    "stream": false
  }'

# Embeddings
curl -X POST http://localhost:11434/api/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nomic-embed-text",
    "prompt": "Text to embed"
  }'

# 模型列表
curl http://localhost:11434/api/tags
```

### Python SDK

```python
from ollama import chat, embeddings, options

# 对话
response = chat(model='qwen2.5:7b', messages=[
    {'role': 'user', 'content': 'Explain quantum computing'}
])
print(response['message']['content'])

# 带参数
response = chat(model='qwen2.5:7b', messages=[
    {'role': 'user', 'content': 'Write a function'}
], options={
    'temperature': 0.7,
    'top_p': 0.9,
    'num_ctx': 8192,
})

# Embeddings
emb = embeddings(model='nomic-embed-text', prompt='Hello world')
print(f"Embedding dim: {len(emb['embedding'])}")
```

### JavaScript/Node.js SDK

```javascript
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://localhost:11434' })

// 对话
const response = await ollama.chat({
    model: 'qwen2.5:3b',
    messages: [{ role: 'user', content: 'Hello' }]
})
console.log(response.message.content)

// 流式响应
const stream = await ollama.chat({
    model: 'qwen2.5:3b',
    messages: [{ role: 'user', content: 'Write a story' }],
    stream: true
})

for await (const chunk of stream) {
    process.stdout.write(chunk.message.content)
}
```

## Modelfile - 自定义模型

Modelfile允许通过FROM基模型自定义角色、参数、系统提示。

### 基础模板
```
FROM qwen2.5:7b
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096
PARAMETER stop "###"
SYSTEM """
You are an expert Python programmer.
Focus on clean, efficient, well-documented code.
Always explain your reasoning.
"""
```

### 专业角色模板
```
FROM qwen2.5:7b

PARAMETER temperature 0.3
PARAMETER num_ctx 8192

SYSTEM """
You are a senior code reviewer.
Focus on:
- Performance issues
- Security vulnerabilities
- Best practices
- Documentation quality

Provide specific suggestions with examples.
"""
```

```bash
# 创建自定义模型
ollama create my-coder -f Modelfile

# 使用
ollama run my-coder

# 列出所有模型
ollama list

# 复制模型
ollama cp my-coder my-coder-v2

# 删除
ollama rm my-coder
```

## Function Calling (函数调用)

Ollama支持结构化函数调用，用于Agent和工作流。

```bash
# 可用模型: qwen2.5:7b, llama3.2, mistral等
ollama pull qwen2.5:7b
```

```python
from ollama import chat

response = chat(model='qwen2.5:7b', messages=[
    {'role': 'user', 'content': 'What is the weather in Beijing?'}
], tools=[
    {
        'type': 'function',
        'function': {
            'name': 'get_weather',
            'description': 'Get current weather for a city',
            'parameters': {
                'type': 'object',
                'properties': {
                    'city': {'type': 'string'}
                }
            }
        }
    }
])

# 如果模型决定调用函数
if response['message']['tool_calls']:
    for tool in response['message']['tool_calls']:
        print(f"Calling: {tool['function']['name']}")
        print(f"Args: {tool['function']['arguments']}")
```

## Vision (多模态)

```python
from ollama import chat

# 图像理解
response = chat(model='llama3.2-vision:11b', messages=[
    {
        'role': 'user',
        'content': 'Describe this image',
        'images': ['./screenshot.png']
    }
])
print(response['message']['content'])
```

```bash
# 命令行方式
ollama run llama3.2-vision:11b
>>> What's in this image? (paste image path or URL)
```

## Performance Benchmarking

### 吞吐量测试
```bash
# 单请求延迟
time curl -s -X POST http://localhost:11434/api/generate \
  -d '{"model":"qwen2.5:7b","prompt":"Hello","stream":false}'

# 并发测试 (10个并发请求)
for i in {1..10}; do
  curl -s -X POST http://localhost:11434/api/generate \
    -d '{"model":"qwen2.5:7b","prompt":"Hello"}' &
done
wait
```

### 性能参考 (RTX 4090, qwen2.5:7b)

| Metric | Value |
|--------|-------|
| 首Token延迟 (TTFT) | ~50ms |
| 吞吐量 (tokens/s) | ~45 tok/s |
| 内存占用 | ~6GB VRAM |
| 上下文长度 | 8K tokens |

### 硬件配置推荐

| GPU | RAM | 推荐模型 | 并发 |
|-----|-----|---------|------|
| RTX 3060 (12GB) | 16GB | qwen2.5:7b | 2-3 |
| RTX 4090 (24GB) | 32GB | qwen2.5:14b | 4-6 |
| A100 (40GB) | 64GB | qwen2.5:32b | 8-10 |
| A100 80GB x2 | 128GB | qwen2.5:32b (多卡) | 15+ |

## Ollama vs Alternatives

| Feature | Ollama | llama.cpp | LM Studio | vLLM |
|---------|--------|-----------|-----------|------|
| 易用性 | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ |
| 吞吐量 | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| API兼容性 | OpenAI | 私有 | 私有 | OpenAI |
| 多模态 | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ |
| GPU调度 | 基础 | 基础 | 高级 | 高级 |
| 量化支持 | GGUF | GGUF | GGUF | AWQ/GPTQ |

**选择建议**:
- **快速原型/开发**: Ollama (即装即用)
- **CPU优先**: llama.cpp (更灵活)
- **高性能推理**: vLLM (吞吐量最高)
- **桌面应用**: LM Studio (GUI友好)

## Troubleshooting

### 诊断流程
```
问题 → 检查点 → 解决方案
```

| 问题 | 检查 | 解决 |
|------|------|------|
| 启动失败 "port in use" | `netstat -ano \| findstr :11434` | 杀进程或改端口 `OLLAMA_HOST=0.0.0.0:11435` |
| 模型加载慢 | 网络/磁盘 | 首次下载耐心等待，或换镜像 |
| GPU不生效 | `nvidia-smi` / CUDA驱动 | 更新驱动，重启服务 |
| 内存不足 OOM | `ollama ps` 查看负载 | 减小模型或降低并发 `OLLAMA_NUM_PARALLEL=1` |
| API超时 | `OLLAMA_TIMEOUT` | 增大超时或减小 `num_ctx` |
| 响应质量差 | temperature/top_p | 调整参数或换模型 |

### 日志查看
```bash
# Linux
journalctl -u ollama

# macOS
cat ~/.ollama/logs/server.log

# Windows
# 事件查看器 > 应用程序日志
```

### 重置Ollama
```bash
# 停止服务
pkill ollama

# 清除所有模型和缓存
rm -rf ~/.ollama

# 重启
ollama serve
```

## Best Practices

1. **模型选择**: 8GB VRAM → qwen2.5:7b; 16GB → qwen2.5:14b
2. **并发控制**: 生产环境 `OLLAMA_NUM_PARALLEL=2-4`
3. **监控**: 定期 `ollama ps` 检查GPU/内存
4. **模型更新**: 定期 `ollama pull` 获取更新
5. **安全**: API默认无认证，局域网暴露需防火墙

## Integration Ecosystem

### MCP (Model Context Protocol)
```json
// settings.json
{
  "mcpServers": {
    "ollama": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-ollama", "--port", "11434"]
    }
  }
}
```

### OpenClaw
```json
{
  "models": [
    {
      "name": "claude-opus-4",
      "fallbacks": ["ollama/qwen2.5:7b"]
    }
 [[Self-Healing-Loop]]
}
```

### Docker Compose (完整LLM服务)
```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gp[[knowledge/Design-Toolkit]]
volumes:
  ollama_data:
```

## Cross-refs

- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 本地部署方案
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — MCP协议集成
- [[infrastructure/OpenClaw.m[[knowledge/Design-Toolkit]]] — OpenClaw优化
- [[infrastructure/vLLM.m[[knowledge/Design-Toolkit]]] — vLLM vs Ollama选择
- Claude-Work/ollama_local_deployment.json
- Claude-Work/local_llm_deployment.json