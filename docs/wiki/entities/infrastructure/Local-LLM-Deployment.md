---
type: entity
category: research
key: Local LLM Deployment
source: Claude-Evo research
date: 2026-05-20
layer: 2.0
rating: ★★★★☆
---

# Local LLM Deployment - 本地LLM部署

## Overview

完全本地化的AI解决方案，数据不上云、离线可用、自定义灵活、成本可控。2026年本地部署进入实用化阶段，7B模型仅需8GB VRAM即可流畅运行。

**核心优势**:
- 数据隐私 (不上传云端，敏感数据不出域)
- 离线可用 (无网络依赖)
- 自定义模型 (微调、量化、角色定制)
- 成本可控 (一次性硬件投入 vs 按量付费API)
- 低延迟 (本地网络，无API调用开销)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│  │ Claude Code   │  │  Custom App   │  │  API Server   │    │
│  │ (Agent IDE)   │  │  (Python SDK) │  │  (REST/gRPC)  │    │
│  └───────────────┘  └───────────────┘  └───────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Runtime Layer                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│  │    Ollama     │  │   llama.cpp   │  │   vLLM        │    │
│  │  (易用CLI)    │  │   (CPU优化)   │  │  (高吞吐)     │    │
│  │  ★推荐新手    │  │  (嵌入式)      │  │  (生产级)     │    │
│  └───────────────┘  └───────────────┘  └───────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Model Layer                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Qwen2.5 / Llama3.2 / DeepSeek / Phi / Gemma        │   │
│  │  (支持GGUF/FP16/AWQ/GPTQ量化格式)                    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Hardware Layer                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│  │  NVIDIA GPU   │  │     CPU       │  │    Apple      │    │
│  │  (CUDA)       │  │  (AVX2/NEON)  │  │  (Metal)      │    │
│  └───────────────┘  └───────────────┘  └───────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Model Specifications

### Qwen2.5 Series (通识能力强，中文优秀)

| Model | Parameters | Min RAM | Disk | VRAM | Use Case |
|-------|-----------|---------|------|------|----------|
| Qwen2.5-0.5B | 5亿 | 1GB | <500MB | 1GB | 轻量对话、嵌入式 |
| Qwen2.5-1.5B | 15亿 | 2GB | ~1GB | 2GB | 代码补全、快速响应 |
| Qwen2.5-3B | 30亿 | 4GB | ~2GB | 4GB | 中等推理、多轮对话 |
| Qwen2.5-7B | 70亿 | 8GB | ~4GB | 8GB | 高质量生成 ★推荐 |
| Qwen2.5-14B | 140亿 | 16GB | ~8GB | 16GB | 复杂推理、代码生成 |
| Qwen2.5-32B | 320亿 | 32GB | ~16GB | 32GB | 高级推理、研究 |

### Llama 3.2 Series (通用能力强)

| Model | Parameters | Min RAM | Disk | VRAM | Use Case |
|-------|-----------|---------|------|------|----------|
| Llama3.2-1B | 10亿 | 2GB | ~1GB | 2GB | 轻量通用 |
| Llama3.2-3B | 30亿 | 4GB | ~2GB | 4GB | 中等通用 |
| Llama3.2-11B | 110亿 | 16GB | ~7GB | 16GB | 高质量生成 (Vision) |
| Llama3.2-90B | 900亿 | 64GB | ~45GB | 64GB | 顶级质量 |

### DeepSeek R1 Series (推理能力强)

| Model | Parameters | Min RAM | Disk | VRAM | Use Case |
|-------|-----------|---------|------|------|----------|
| DeepSeek-R1-Distill-Qwen-1.5B | 15亿 | 2GB | ~1GB | 2GB | 蒸馏轻量 |
| DeepSeek-R1-Distill-Qwen-7B | 70亿 | 8GB | ~4GB | 8GB | 深度推理 ★ |
| DeepSeek-R1-Distill-Llama-8B | 80亿 | 10GB | ~5GB | 10GB | 通用深度 |
| DeepSeek-R1-70B | 700亿 | 64GB | ~40GB | 64GB | 超强推理 |

### 多模态模型

| Model | Parameters | VRAM | Capabilities |
|-------|-----------|------|-------------|
| llama3.2-vision:11b | 110亿 | 16GB | 图像理解、OCR |
| qwen2.5-vl:7b | 70亿 | 8GB | 图像理解、图表分析 |
| llava:7b | 70亿 | 8GB | 图像对话 |
| qwen2.5:7b (纯文本) | 70亿 | 8GB | 文本生成 |

### Embedding模型

| Model | Size | Dim | Use Case |
|-------|------|-----|----------|
| nomic-embed-text | ~275MB | 768 | 文本向量化、RAG ★ |
| maidalun-embed | ~350MB | 1024 | 中文embedding |
| bge-base | ~400MB | 768 | 中英双语 |

## Deployment Tools Comparison

| Feature | Ollama | llama.cpp | vLLM |
|---------|--------|-----------|------|
| 学习曲线 | ★★★★★ (简单) | ★★☆☆☆ (复杂) | ★★★☆☆ (中等) |
| API兼容性 | OpenAI兼容 | 私有CLI | OpenAI兼容 ★ |
| 吞吐量 | ~50 tok/s | ~40 tok/s | ~200 tok/s ★ |
| 多模态 | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ |
| 量化支持 | GGUF | GGUF (全部) | AWQ/GPTQ |
| GPU调度 | 基础 | 基础 | 高级 ★ |
| 生产部署 | 开发/小规模 | 嵌入式 | 大规模 ★ |

### Ollama (推荐新手)

```bash
# 安装
winget install Ollama.Ollama

# 启动服务 (后台自动)
ollama serve

# 运行模型
ollama run qwen2.5:7b

# 模型管理
ollama list
ollama pull llama3.2:3b
ollama rm qwen2.5:1.5b
```

### llama.cpp (CPU优化/嵌入式)

```bash
# 编译
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
mkdir build && cd build
cmake ..
cmake --build . --config Release

# 量化 (FP16 → INT4)
python ../quantize ../models/qwen2.5-7b/ggml-model-f16.gguf \
       qwen2.5-7b-q4_0.gguf Q4_0

# 运行
./llama-cli -m ../models/qwen2.5-7b-q4_0.gguf -n 128 -p "Hello"
```

### vLLM (高吞吐量生产级)

```bash
# 安装
pip install vllm

# 启动 (OpenAI兼容)
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --gpu-memory-utilization 0.9

# API调用
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Hardware Selection Guide

### GPU配置推荐

| GPU | VRAM | RAM | 推荐模型 | 并发数 | 典型场景 |
|-----|------|-----|---------|--------|---------|
| RTX 3060 | 12GB | 16GB | qwen2.5:7b | 2-3 | 轻量开发 |
| RTX 4060 Ti | 16GB | 32GB | qwen2.5:14b | 3-4 | 专业开发 |
| RTX 4090 | 24GB | 32GB | qwen2.5:14b | 6-8 | 高性能开发 |
| A100 40GB | 40GB | 64GB | qwen2.5:32b | 10-15 | 研究用途 |
| A100 80GB x2 | 160GB | 128GB | qwen2.5:32b (多卡) | 20+ | 大规模部署 |

### 无GPU配置 (CPU推理)

```bash
# 设置CPU模式
export OLLAMA_GPU_LAYERS=0
export OLLAMA_NUM_GPU=0

# 使用量化模型减少内存
ollama pull qwen2.5:1.5b  # 最轻量，约2GB RAM

# 或使用llama.cpp纯CPU
./llama-cli -m qwen2.5-1b-q4_0.gguf -t 8
```

### 多卡配置

```bash
# vLLM多卡并行 (2卡)
vllm serve Qwen/Qwen2.5-14B-Instruct \
  --tensor-parallel-size 2 \
  --gpu-memory-utilization 0.85

# 4卡 (A100 80GB x4)
vllm serve meta-llama/Llama-3.1-70B-Instruct \
  --tensor-parallel-size 4
```

## Advanced Configuration

### Ollama Modelfile (自定义角色)

```
FROM qwen2.5:7b

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER stop "###"

SYSTEM """
You are an expert Python programmer.
Focus on clean, efficient, well-documented code.
Always explain your reasoning before coding.
"""
```

```bash
# 创建自定义模型
ollama create my-coder -f Modelfile

# 使用
ollama run my-coder

# 复制/删除
ollama cp my-coder my-coder-v2
ollama rm my-coder
```

### vLLM生产配置

```yaml
# config.yaml
model: Qwen/Qwen2.5-7B-Instruct
tensor_parallel_size: 2
gpu_memory_utilization: 0.9
max_model_len: 8192
trust_remote_code: true
quantization: awq  # 显存节省75%
```

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --config config.yaml \
  --max-model-len 16384
```

## Quantization Guide

量化减少模型体积和显存占用，平衡速度和精度。

| 格式 | 体积减少 | 精度损失 | 推荐场景 |
|------|---------|---------|---------|
| FP16 | 基准 | 无 | 研发、精度优先 |
| INT8 | ~50% | 极小 | 生产平衡 |
| INT4 (Q4_0) | ~75% | 5-10% | 轻量部署 |
| Q5_K_M | ~65% | 2-5% | ★推荐平衡 |
| Q8_0 | ~50% | <2% | 精度优先的量化 |

```bash
# Ollama自动处理量化
ollama run qwen2.5:7b  # 自动选择合适量化

# llama.cpp手动量化
python quantize models/qwen2.5-7b/ggml-model-f16.gguf \
              qwen2.5-7b-q4_k_m.gguf Q4_K_M
```

## Performance Benchmarking

### 性能参考 (RTX 4090, qwen2.5:7b)

| Runtime | TTFT | 吞吐 | VRAM |
|---------|------|------|------|
| Ollama | ~50ms | ~45 tok/s | ~6GB |
| vLLM | ~30ms | ~150 tok/s | ~5GB |
| llama.cpp | ~80ms | ~35 tok/s | ~6GB |

### 测试脚本

```bash
# 单请求延迟测试
time curl -s -X POST http://localhost:11434/api/generate \
  -d '{"model":"qwen2.5:7b","prompt":"Hello","stream":false}'

# 吞吐量测试 (10并发)
for i in {1..10}; do
  curl -s -X POST http://localhost:11434/api/generate \
    -d '{"model":"qwen2.5:7b","prompt":"Hello"}' &
done
wait

# GPU监控
watch -n 1 nvidia-smi
```

## Integration Patterns

### MCP (Model Context Protocol)

```json
// settings.json - Ollama作为MCP工具
{
  "mcpServers": {
    "ollama": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-ollama", "--port", "11434"]
    }
  }
}
```

### OpenAI SDK调用本地模型

```python
from openai import OpenAI

# Ollama
client = OpenAI(base_url="http://localhost:11434/v1")
response = client.chat.completions.create(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "Hello"}]
)

# vLLM
client = OpenAI(base_url="http://localhost:8000/v1")
response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Hello"}]
)
```

### Docker Compose (完整部署)

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

## Security Considerations

1. **网络隔离**: 本地模型不暴露公网，敏感数据不出域
2. **API认证**: 远程访问加API Key保护
   ```bash
   # Nginx反向代理 + 认证
   location / {
     auth_basic "Local LLM";
     auth_basic_user_file /etc/nginx/.htpasswd;
     proxy_pass http://localhost:11434;
   }
   ```
3. **文件权限**: 限制模型文件的访问权限
4. **更新策略**: 定期更新运行时修复漏洞

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| OOM | 模型过大/并发过高 | 减小模型或降低并发 |
| 启动失败 | 端口占用 | `netstat -ano \| findstr :11434` 杀进程 |
| GPU不识别 | CUDA驱动问题 | `nvidia-smi` 检查驱动 |
| 模型下载慢 | 网络问题 | 使用代理或镜像 |
| 响应慢 | 上下文过长/并发 | 减小`num_ctx`，限并发 |

```bash
# 日志查看
# Linux
journalctl -u ollama

# macOS
cat ~/.ollama/logs/server.log

# 重置
pkill ollama
rm -rf ~/.ollama
ollama serve
```

## Decision Matrix: When to Use What

| Scenario | Recommended | Alternative |
|----------|-------------|-------------|
| 快速原型/学习 | Ollama | - |
| 中等规模生产 | vLLM | Ollama |
| 高吞吐要求 | vLLM | - |
| CPU优先 | llama.cpp | Ollama |
| 嵌入式/轻量 | llama.cpp | - |
| 多模态 | Ollama | - |

## Best Practices

1. **模型选择**: 根据硬件选型，避免OOM
   - 8GB VRAM → qwen2.5:7b
   - 16GB VRAM → qwen2.5:14b
   - 24GB VRAM → qwen2.5:14b或更大

2. **量化选择**: Q5_K_M平衡速度和精度

3. **并发控制**: 生产环境限制并发
   ```bash
   export OLLAMA_NUM_PARALLEL=2
   ```

4. **监控**: 定期检查GPU/内存
   ```bash
   nvidia-smi
   ollama ps
   ```

5. **模型更新**: 定期更新获取最新能力
   ```bash
   ollama pull qwen2.5:7b
   ```

## Cross-refs

- [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] — 本地部署工具，详细命令
- [[infrastructure/vLLM.m[[knowledge/Design-Toolkit]]] — 高吞吐量推理引擎
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — MCP协议集成
- [[infrastructure/OpenClaw.m[[knowledge/Design-Toolkit]]] — OpenClaw优化
- [[infrastructure/Docker.m[[knowledge/Design-Toolkit]]] — 容器化部署
- [[infrastructure/Kubernetes.m[[knowledge/Design-Toolkit]]] — K8s集群部署
- Claude-Work/local_llm_deployment.json
- Claude-Work/ollama_local_deployment.json