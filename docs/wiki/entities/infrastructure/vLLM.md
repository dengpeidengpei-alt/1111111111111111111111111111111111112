---
type: entity
category: tools
key: vLLM
source: Claude-Evo research
date: 2026-05-20
layer: 2.0
rating: ★★★★☆
---

# vLLM - 高吞吐量LLM推理

## Overview

vLLM是开源LLM推理引擎，PagedAttention技术实现KV缓存高效管理，吞吐量比HuggingFace Transformers提升24倍。支持OpenAI兼容API、微秒级延迟、生产级稳定性。

**核心特性**:
- PagedAttention (vRAM节省60%)
- Continuous Batching (动态批处理)
- Tensor Parallelism (多卡并行)
- OpenAI兼容API
- 支持AWQ/GPTQ量化
- Beam Search解码优化
- Speculative Decoding

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      vLLM Engine                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  API Layer (OpenAI compat)              ││
│  │           /v1/chat/completions  /v1/completions       ││
│  │           /v1/embeddings  /metrics  /health          ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Scheduler (Continuous Batching)           ││
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐               ││
│  │   │ Request │  │ Request │  │ Request │  ...          ││
│  │   │   1     │  │   2     │  │   3     │               ││
│  │   │ (prefill)│  │ (decode)│  │ (wait)  │               ││
│  │   └────┬────┘  └────┬────┘  └────┬────┘               ││
│  └────────┼────────────┼────────────┼────────────────────┘│
│           │            │            │                      │
│  ┌────────▼────────────▼────────────▼────────────────────┐│
│  │              PagedAttention Engine                      ││
│  │   ┌──────────────────────────────────────────────┐     ││
│  │   │           KV Cache (Paged)                   │     ││
│  │   │   Block 0 │ Block 1 │ Block 2 │ Block 3 │ ...│     ││
│  │   │   (4KB)   │ (4KB)   │ (4KB)   │ (4KB)   │     │     ││
│  │   └──────────────────────────────────────────────┘     ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │            Transformer Layers (Tensor Parallel)         ││
│  │   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      ││
│  │   │ Layer1 │  │ Layer2 │  │ Layer3 │  │ LayerN │      ││
│  │   └────────┘  └────────┘  └────────┘  └────────┘      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### PagedAttention Mechanism

传统KV Cache问题:
```
一次性分配 (pre-allocated):
┌──────────────────────────────────────────────────────────┐
│ Cache [0]      Cache [1]      Cache [2]      Cache [3]    │
│ 固定4GB       固定4GB        固定4GB        固定4GB       │
│ (可能浪费)     (可能浪费)     (可能浪费)     (可能浪费)     │
└──────────────────────────────────────────────────────────┘
```

PagedAttention (vLLM):
```
按页分配 (Paged):
┌──────────────────────────────────────────────────────────┐
│ Cache Page 0 │ Cache Page 1 │ Cache Page 2 │ Cache Page 3│
│    4KB        │    4KB        │    4KB        │    4KB       │
│ (按需分配)    │ (按需分配)    │ (按需分配)    │ (按需分配)    │
└──────────────────────────────────────────────────────────┘
- 无内存碎片
- 共享前缀 (Prefix Caching)
- 动态调整
```

## Quick Start

### 安装

```bash
pip install vllm

# 或从源码编译 (获取最新优化)
git clone https://github.com/vllm-project/vllm.git
cd vllm
pip install -e .
```

### 单卡启动

```bash
# Qwen2.5-7B
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --gpu-memory-utilization 0.9

# 验证
curl http://localhost:8000/health
```

### 多卡并行

```bash
# 2卡 (Qwen2.5-14B)
vllm serve Qwen/Qwen2.5-14B-Instruct \
  --tensor-parallel-size 2 \
  --gpu-memory-utilization 0.85

# 4卡 (Llama-3.1-70B)
vllm serve meta-llama/Llama-3.1-70B-Instruct \
  --tensor-parallel-size 4 \
  --gpu-memory-utilization 0.9
```

### API调用

```bash
# Chat Completion
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is quantum entanglement?"}
   [[Self-Healing-Loop]],
    "max_tokens": 512,
    "temperature": 0.7,
    "stream": false
  }'

# Streaming
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Write a haiku about AI"}],
    "stream": true,
    "max_tokens": 100
  }'
```

## Quantization Deployment

量化显著减少显存占用，使更大模型能在有限硬件上运行。

### AWQ (Activation-aware Weight Quantization)

```bash
# AWQ量化 (75%显存节省)
vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ \
  --quantization awq \
  --gpu-memory-utilization 0.9

# 可用AWQ模型 (HuggingFace)
# Qwen/Qwen2.5-7B-Instruct-AWQ
# Qwen/Qwen2.5-14B-Instruct-AWQ
```

### GPTQ

```bash
# GPTQ量化
vllm serve Qwen/Qwen2.5-7B-Instruct-GPTQ \
  --quantization gptq \
  --gpu-memory-utilization 0.9
```

### FP8 (最新)

```bash
# FP8量化 (实验性)
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --quantization fp8 \
  --kv-cache-dtype fp8
```

### 量化对比

| Quantization | VRAM (7B) | 精度损失 | 适用场景 |
|--------------|-----------|---------|---------|
| FP16 | ~14GB | 无 | 研发 |
| INT8 | ~7GB | <2% | 平衡 |
| AWQ INT4 | ~3.5GB | 5-8% | 轻量部署 |
| GPTQ INT4 | ~3.5GB | 5-8% | 轻量部署 |
| FP8 | ~7GB | <1% | ★推荐 |

## Advanced Configuration

### 长上下文配置

```bash
# 32K上下文
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.85

# 128K上下文 (需要Ring Attention)
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --max-model-len 131072 \
  --enable-chunked-prefill \
  --max-num-batched-tokens 8192
```

### Prefill/Decode优化

```bash
# 启用Chunked Prefill (长序列优化)
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --enable-chunked-prefill \
  --max-num-batched-tokens 4096

# 禁用Prefix Caching
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --disable-prefix-caching
```

### Speculative Decoding

```bash
# 投机解码 (加速生成，降低延迟)
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --num-speculative-tokens 3 \
  --speculative-model qwen2.5:3b
```

### Batch配置

```bash
# 最大批处理token数
vllm serve ... --max-num-batched-tokens 32768

# 最大序列数
vllm serve ... --max-num-seqs 256

# Block大小
vllm serve ... --block-size 16
```

## Python API

### 基础使用

```python
from vllm import LLM, SamplingParam

# 初始化
llm = LLM(
    model="Qwen/Qwen2.5-7B-Instruct",
    quantization="awq",           # 量化
    tensor_parallel_size=1,        # 单卡
    gpu_memory_utilization=0.9,    # 90%显存
    max_model_len=8192,            # 上下文长度
)

# 推理参数
sampling_params = SamplingParam(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
    stop=["###", "User:"],
)

# 批量推理
outputs = llm.generate(
    ["Hello, how are you?", "What is AI?"],
    sampling_params
)

for output in outputs:
    print(f"Output: {output.outputs[0].text}")
    print(f"Tokens: {output.outputs[0].token_ids}")
```

### Async API

```python
import asyncio
from vllm import AsyncLLM, SamplingParam

llm = AsyncLLM(model="Qwen/Qwen2.5-7B-Instruct")

async def generate():
    sampling_params = SamplingParam(max_tokens=100)
    outputs = await llm.agenerate(
        ["Hello", "World"],
        sampling_params
    )
    for output in outputs:
        print(output.outputs[0].text)

asyncio.run(generate())
```

### Streaming

```python
from vllm import LLM, SamplingParam

llm = LLM(model="Qwen/Qwen2.5-7B-Instruct")
sampling_params = SamplingParam(max_tokens=200)

# 生成器模式
outputs = llm.generate(["Write a story"], sampling_params)

for output in outputs:
    for new_token in output.outputs[0].token_ids:
        print(token, end="", flush=True)
```

## OpenAI SDK Integration

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"  # vLLM不需要真实API Key
)

# Chat Completion
chat_response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"}
   [[Self-Healing-Loop]],
    max_tokens=256,
    temperature=0.7,
)
print(chat_response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Write a haiku about AI"}],
    stream=True,
    max_tokens=100,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()

# Embeddings
embed_response = client.embeddings.create(
    model="BAAI/bge-small",
    input="Text to embed"
)
print(f"Embedding dim: {len(embed_response.data[0].embedding)}")
```

## Performance Tuning

### Memory Management

```bash
# OOM时降低显存使用
--gpu-memory-utilization 0.7

# 禁用投机解码
--num-speculative-tokens 0

# 启用KV Cache FP8量化 (实验性)
--kv-cache-dtype fp8
```

### Throughput Optimization

```bash
# 增大批处理
--max-num-batched-tokens 65536
--max-num-seqs 512

# 启用Prefix Caching
--enable-prefix-caching

# 调整Block大小
--block-size 32
```

### Latency Optimization

```bash
# 减少预填充延迟
--enable-chunked-prefill
--max-num-batched-tokens 4096

# 投机解码
--num-speculative-tokens 5
--speculative-model qwen2.5:3b
```

## Monitoring

```bash
# 健康检查
curl http://localhost:8000/health

# Prometheus指标
curl http://localhost:8000/metrics

# 模型信息
curl http://localhost:8000/v1/models

# 服务日志
curl http://localhost:8000/logs
```

### 关键指标解读

```
# metrics输出示例
vllm:num_tokens_total 1234567
vllm:num_requests_total 98765
vllm:gpu_cache_usage_ratio 0.92
vllm:avg_prefill_throughput 150.5
vllm:avg_decode_throughput 45.2
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| OOM during inference | 显存不足 | 降低`--gpu-memory-utilization`，使用量化 |
| Slow first token | 预填充过慢 | 减少`--max-num-batched-tokens` |
| Low throughput | batch太小 | 增大`--max-num-seqs`，增加batch |
| Model not found | model id错误 | 检查`--trust-remote-code` |
| Connection refused | 端口占用/未启动 | 确认服务启动 `ps aux \| grep vllm` |

### 诊断流程

```bash
# 1. 检查服务状态
curl http://localhost:8000/health

# 2. 检查GPU使用
nvidia-smi

# 3. 查看日志
curl http://localhost:8000/logs

# 4. 检查模型
curl http://localhost:8000/v1/models
```

### 常见错误

```
# CUDA out of memory
# → 减小 gpu-memory-utilization 或使用量化

# ValueError: Unknown quantization
# → 确认量化方法支持该模型

# RuntimeError: CUDA error
# → 重启服务或检查CUDA版本
```

## Ollama vs vLLM

| Aspect | Ollama | vLLM |
|--------|--------|------|
| 易用性 | ★★★★★ | ★★★☆☆ |
| 吞吐量 | ~50 tok/s | ~200 tok/s ★ |
| API兼容性 | OpenAI兼容 | OpenAI兼容 ★ |
| 多模态 | ★★★★★ | 基础 |
| 生产部署 | 开发/小规模 | 大规模 ★ |
| 量化 | GGUF | AWQ/GPTQ ★ |
| 调度 | 基础 | 高级 ★ |

**选择建议**:
- **快速原型/开发**: Ollama
- **高吞吐生产**: vLLM
- **多模态场景**: Ollama
- **单卡轻量**: Ollama或vLLM均可

## Benchmarking

### 性能参考 (A100 40GB, qwen2.5:7b)

| Metric | vLLM | HF Transformers | Improvement |
|--------|------|----------------|-------------|
| 吞吐量 | 150 tok/s | 6 tok/s | 24x ★ |
| 首Token延迟 | 30ms | 200ms | 6.7x |
| 显存效率 | 90% | 60% | 1.5x |

### 测试命令

```bash
# 吞吐量测试
python -m vllm.benchmark_serving \
  --model Qwen/Qwen2.5-7B-Instruct \
  --tokenizer Qwen/Qwen2.5-7B-Instruct

# 延迟测试
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"Qwen/Qwen2.5-7B-Instruct","messages":[{"role":"user","content":"Hi"}],"max_tokens":50}'
```

## Best Practices

1. **生产部署**: 使用AWQ量化 + 0.9显存利用率
2. **长上下文**: 启用`--enable-chunked-prefill`
3. **高吞吐**: 增大`--max-num-batched-tokens`
4. **多卡扩展**: 使用Tensor Parallelism
5. **监控**: 定期检查metrics端点

## Cross-refs

- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — vLLM在本地部署中的角色
- [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] — Ollama vs vLLM选择
- [[infrastructure/Docker.m[[knowledge/Design-Toolkit]]] — vLLM容器化部署
- [[infrastructure/Kubernetes.m[[knowledge/Design-Toolkit]]] — K8s上运行vLLM
- Claude-Work/local_llm_deployment.json
- Claude-Work/vllm_performance_analysis.json