---
type: entity
category: infrastructure
key: Docker
source: Claude-Evo research
date: 2026-05-20
---

# Docker - 容器化部署

## Overview

开源容器化平台，将应用及其依赖打包为标准化容器，实现环境一致性、快速部署和资源隔离。AI开发中用于模型服务、Agent环境封装、实验复现。

**核心优势**:
- 环境一致性（开发/生产相同）
- 快速启动（秒级）
- 资源隔离（GPU/内存）
- 镜像复用（层层叠加）

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Host                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Container    │  │ Container    │  │ Container    │        │
│  │ nginx:1.25   │  │ qwen2.5:7b  │  │ postgres:15  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                 │
│  ┌──────┴────────────────┴────────────────┴──────┐          │
│  │              Docker Engine                     │          │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │          │
│  │  │ Network  │  │ Storage  │  │  Image   │   │          │
│  │  │ Manager  │  │ Driver   │  │ Manager  │   │          │
│  │  └──────────┘  └──────────┘  └──────────┘   │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │              NVIDIA Container Runtime         │          │
│  │         (GPU Passthrough to Containers)       │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Essential Commands

```bash
# 镜像管理
docker pull python:3.11-slim
docker images
docker rmi <image_id>
docker build -t my-llm-app .  # 从Dockerfile构建

# 容器生命周期
docker run -d --name qwen-app -p 8000:8000 qwen2.5:7b
docker ps -a
docker stop/start/restart <container>
docker logs -f <container>

# GPU支持 (nvidia-container-toolkit)
docker run --gpus '"device=0"' -it nvidia/cuda:12.1-base

# 清理
docker system prune -af
docker volume prune
```

## Dockerfile Examples

### Python + Ollama Service

```dockerfile
FROM python:3.11-slim

WORKDIR /app
RUN pip install fastapi uvicorn requests

# 安装Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# 复制应用代码
COPY app.py .
COPY requirements.txt .
RUN pip install -r requirements.txt

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### vLLM Inference Server

```dockerfile
FROM nvidia/cuda:12.1-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y python3.11 python3-pip

RUN pip install vllm==0.6.3
RUN useradd -m -u 1000 appuser

WORKDIR /app
COPY serve.sh .
RUN chmod +x serve.sh

USER appuser
CMD ["./serve.sh"]
```

### Agent Environment (Python + Node + Claude)

```dockerfile
FROM python:3.11

# 安装Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 安装核心依赖
RUN pip install anthropic openai langchain langchain-community
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /workspace
COPY . .

ENV PYTHONPATH=/workspace
CMD ["python", "agent.py"]
```

## Docker Compose for AI Stack

```yaml
version: '3.8'

services:
  # LLM推理服务
  vllm:
    image: vllm/vllm-openai:latest
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gp[[knowledge/Design-Toolkit]]
    environment:
      - MODEL=Qwen/Qwen2.5-7B-Instruct
      - GPU_MEMORY_UTILIZATION=0.9

  # Agent运行时
  agent:
    build: ./agent
    depends_on:
      - vllm
    environment:
      - OPENAI_API_BASE=http://vllm:8000/v1
      - OPENAI_API_KEY=EMPTY
    volumes:
      - ./workspace:/workspace

  # 向量数据库
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage

volumes:
  qdrant_storage:
```

## NVIDIA Docker (GPU Support)

```bash
# 检查GPU在容器内可用性
docker run --rm --gpus all nvidia/cuda:12.1-base nvidia-smi

# 常用GPU容器镜像
docker run --gpus '"device=0,1"' nvidia/cuda:12.1-runtime \
  python -c "import torch; print(torch.cuda.is_available())"

# 限制GPU可见性
docker run --gpus '"device=1"' ...  # 只用第二块GPU
```

## Common Issues

| Issue | Solution |
|-------|----------|
| GPU not visible | Install `nvidia-container-toolkit`, restart Docker |
| Port already in use | `docker ps` check, change port mapping `-p 8001:8000` |
| Out of memory | Set memory limit `--memory=8g` |
| Image pull slow | Use registry mirror, `docker pull mirror.gcr.io/library/...` |

## Best Practices

1. **Use slim images**: `python:3.11-slim` instead of `python:3.11`
2. **Multi-stage build**: Reduce final image size
   ```dockerfile
   FROM python:3.11 AS builder
   RUN pip install --user numpy pandas
   
   FROM python:3.11-slim
   COPY --from=builder /root/.local /root/.local
   ```
3. **Non-root user**: For security
   ```dockerfile
   RUN useradd -m appuser && chown -R appuser /app
   USER appuser
   ```
4. **Cache friendly**: Order Dockerfile layers by change frequency
5. **Health check**: Add startup validation
   ```dockerfile
   HEALTHCHECK --interval=30s CMD curl -f localhost:8000/health || exit 1
   ```

## Cross-refs

- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — LLM部署中Docker的使用
- [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] — Ollama容器化方案
- [[infrastructure/vLLM.m[[knowledge/Design-Toolkit]]] — vLLM Docker部署
- [[infrastructure/Kubernetes.m[[knowledge/Design-Toolkit]]] — K8s编排Docker容器