---
type: entity
category: infrastructure
key: NVIDIA CUDA
source: Claude-Evo research
date: 2026-05-20
---

# NVIDIA CUDA - GPU并行计算平台

## Overview

NVIDIA的GPU并行计算平台和编程模型，赋予开发者直接访问GPU虚拟指令集和并行计算单元。AI训练和推理的基础：CUDA Toolkit提供编译器(nvcc)、数学库(cuBLAS/cuDNN)、性能分析工具(nvprof/nsight)。

**核心组件**:
- NVCC (CUDA编译器)
- cuBLAS (矩阵运算)
- cuDNN (深度学习原语)
- cuFFT (傅里叶变换)
- TensorRT (推理优化)
- Nsight (性能分析)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CUDA Application                          │
│                      (Python/C++/Fortran)                   │
├─────────────────────────────────────────────────────────────┤
│                   CUDA Runtime API                          │
│            (cudaRuntime.h / torch.cuda)                    │
├─────────────────────────────────────────────────────────────┤
│                    CUDA Driver API                          │
│              (cuda.h / nvidia-uvm / nvidia-modeset)        │
├─────────────────────────────────────────────────────────────┤
│                    NVIDIA Driver                           │
├─────────────────────────────────────────────────────────────┤
│                    GPU Hardware                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │    SM    │  │    SM    │  │    SM    │  ...    │  │
│  │  │  (Shader  │  │  (Shader  │  │  (Shader  │         │  │
│  │  │  Multipro│  │  Multipro│  │  Multipro│         │  │
│  │  │   cessor)│  │   cessor)│  │   cessor)│         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │           Global Memory (VRAM)                │  │  │
│  │  │                24GB / 80GB                     │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Essential Commands

```bash
# 查看GPU状态
nvidia-smi
nvidia-smi -L  # 列出所有GPU
nvidia-smi -q  # 详细查询

# 监控GPU使用
watch -n 1 nvidia-smi  # 每秒刷新
nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu --format=csv

# 进程管理
nvidia-smi | grep python  # 查看Python进程
kill -9 <pid>  # 终止进程

# 设置GPU可见性
export CUDA_VISIBLE_DEVICES=0,1  # 只用GPU 0和1
```

## CUDA with PyTorch

```python
import torch

# 检查CUDA可用性
print(torch.cuda.is_available())  # True
print(torch.cuda.device_count())  # GPU数量
print(torch.cuda.get_device_name(0))  # GPU名称

# 设备管理
device = torch.device("cuda:0")
tensor = torch.randn(1000, 1000).to(device)

# 模型移到GPU
model = MyModel().cuda()
output = model(input_tensor.cuda())

# 多GPU训练
model = torch.nn.DataParallel(model, device_ids=[0, 1, 2, 3])
output = model(input)
```

## CUDA with TensorRT

```bash
# 安装TensorRT (从 NVIDIA NGC)
pip install tensorrt

# 转换PyTorch模型到TensorRT
python
```

```python
import torch
import tensorrt as trt

# 加载PyTorch模型
model = torch.load("model.pth")
model.eval()
input_tensor = torch.randn(1, 3, 224, 224).cuda()

# 转换到TensorRT
logger = trt.Logger(trt.Logger.WARNING)
builder = trt.Builder(logger)
network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
parser = torch_executor.append_torch_network(network, input_tensor)
builder.max_batch_size = 32
config = builder.create_builder_config()
config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 1 << 30)  # 1GB

engine = builder.build_serialized_network(network, config)
```

## cuDNN Integration

```python
import torch

# PyTorch自动使用cuDNN
torch.backends.cudnn.benchmark = True  # 启用cuDNN自动调优

# 验证cuDNN版本
print(torch.backends.cudnn.version())  # 8900

# 启用/禁用cuDNN
torch.backends.cudnn.enabled = True  # 启用
```

## Memory Management

```bash
# GPU内存重置 (如果被占用)
nvidia-smi --gpu-reset  # 需要root

# Python中清理GPU内存
python
>>> import torch
>>> torch.cuda.empty_cache()
>>> torch.cuda.synchronize()
```

```python
# 显式内存管理
del model  # 删除大对象
torch.cuda.empty_cache()  # 清理缓存

# 监控内存
print(f"Allocated: {torch.cuda.memory_allocated()/1e9:.2f}GB")
print(f"Cached: {torch.cuda.memory_reserved()/1e9:.2f}GB")
```

## Compute Capability

| GPU | Compute Capability | VRAM | 适用场景 |
|-----|-------------------|------|----------|
| RTX 3060 | 8.6 | 12GB | 入门推理 |
| RTX 4090 | 8.9 | 24GB | 高性能推理/小模型训练 |
| A100 SXM | 8.0 | 40GB | 数据中心训练/推理 |
| A100 80GB | 8.0 | 80GB | 大模型推理 |
| H100 SXM | 9.0 | 80GB | 最新大模型训练 |

## Docker GPU Access

```bash
# Docker中使用GPU
docker run --gpus all nvidia/cuda:12.1-runtime-ubuntu22.04 nvidia-smi

# docker-compose.yml
services:
  training:
    image: pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gp[[knowledge/Design-Toolkit]]
    volumes:
      - ./data:/data
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CUDA out of memory | 减小batch size，使用gradient checkpointing |
| GPU not detected | 检查nvidia-driver安装，`nvidia-smi`确认 |
| cuDNN not found | 确认PyTorch编译包含cuDNN |
| NCCL timeout | 增加NCCL_TIMEOUT，或检查网络 |
| Invalid device ordinal | 检查CUDA_VISIBLE_DEVICES设置 |

```bash
# 诊断
nvcc --version  # CUDA版本
nvidia-smi -a > gpu_info.txt  # 完整GPU信息
cat /proc/driver/nvidia/version  # 驱动版本
```

## Cross-refs

- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — CUDA用于LLM推理
- [[infrastructure/Docker.m[[knowledge/Design-Toolkit]]] — Docker GPU支持
- [[infrastructure/Kubernetes.m[[knowledge/Design-Toolkit]]] — K8s GPU调度
- [[infrastructure/vLLM.m[[knowledge/Design-Toolkit]]] — vLLM CUDA优化