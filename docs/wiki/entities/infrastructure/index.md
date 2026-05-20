---
type: entity
category: infrastructure
key: Infrastructure - 基础设施
source: Claude-Evo
date: 2026-05-20
---

# Infrastructure - 基础设施

基础设施层涵盖本地AI部署、协议标准、工具配置等核心组件。

## Entries

| Entry | Category | Description |
|-------|----------|-------------|
| [[infrastructure/AI-Foundry.m[[knowledge/Design-Toolkit]]] | tools | Azure端到端模型开发部署平台、微调训练、RAG集成 |
| [[infrastructure/Docker.m[[knowledge/Design-Toolkit]]] | tools | 容器化部署、环境隔离、GPU支持 |
| [[infrastructure/Kubernetes.m[[knowledge/Design-Toolkit]]] | tools | K8s容器编排、GPU调度、自动扩缩容 |
| [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] | research | 本地LLM部署方案、模型规格、硬件选型 ★★★★☆ |
| [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] | research | Model Context Protocol 协议详解、SDK、集成 ★★★★☆ |
| [[infrastructure/MiniMax-Multimodal.m[[knowledge/Design-Toolkit]]] | tools | MiniMax多模态能力：图像生成、理解、视频、语音 |
| [[infrastructure/MiniMax-Setup.m[[knowledge/Design-Toolkit]]] | tools | MiniMax配置、API使用、mmx工具命令 |
| [[infrastructure/NVIDIA-CUDA.m[[knowledge/Design-Toolkit]]] | tools | GPU并行计算、cuDNN/TensorRT集成、显存管理 |
| [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] | tools | 本地LLM运行平台、Model管理、API使用 ★★★★☆ |
| [[infrastructure/OpenClaw.m[[knowledge/Design-Toolkit]]] | research | Claude Code优化指南、速度优化、模型选择 |
| [[infrastructure/vLLM.m[[knowledge/Design-Toolkit]]] | tools | 高吞吐量LLM推理、PagedAttention、量化部署 ★★★★☆ |

## Quick Reference

### 部署方案选择

```
轻量任务 (1-2GB RAM)     → qwen2.5:1.5b + Ollama
中等复杂度 (4-8GB RAM)   → qwen2.5:3b/7b + Ollama
专业任务 (16GB+ RAM)     → qwen2.5:14b + vLLM
离线大模型 (64GB+ RAM)   → qwen2.5:32b + vLLM 分布式
```

### MCP Server 快速启用

| Server | Command |
|--------|---------|
| 文件系统 | `npx -y @modelcontextprotocol/server-filesystem /path` |
| Git | `uvx mcp-server-git --repo /path` |
| 搜索 | `uvx mcp-server-brave-search --api-key KEY` |

### MiniMax 额度提醒

| 能力 | 限制 |
|------|------|
| 语音合成 | 4000次/天 |
| 图像理解 | 150次/5小时 |
| 图像生成 | 50次/天 |
| 视频生成 | 10次/月 |

## Cross-Category Links

- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] + [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] = 完整本地部署方案
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] + [[infrastructure/MiniMax-Setup.m[[knowledge/Design-Toolkit]]] = MiniMax MCP集成
- [[infrastructure/OpenClaw.m[[knowledge/Design-Toolkit]]] + [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] = 优化本地LLM性能

## Metadata

- Updated: 2026-05-20
- Maintainer: Claude-Evo
- Version: 1.0

## Cross-refs
- [[infrastructure/log]] — Infrastructure Deepening Log
- [[infrastructure/AI-Foundry]] — AI-Foundry
- [[infrastructure/Docker]] — Docker
- [[infrastructure/Kubernetes]] — Kubernetes
- [[infrastructure/NVIDIA-CUDA]] — NVIDIA CUDA
