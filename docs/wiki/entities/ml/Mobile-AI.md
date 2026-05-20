---
type: entity
category: ml
key: Mobile-AI
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
stars: 4
---

# Mobile-AI - 移动端AI

## Overview

- **定义**: 在移动设备、边缘终端上运行的AI推理与训练技术
- **核心挑战**: 算力受限、内存受限、功耗受限、延迟敏感
- **目标**: 将大模型能力迁移到端侧，实现离线可用、隐私保护、低延迟
- **典型场景**: 端侧推理、语音助手、AR/VR、智能相机、实时翻译

## 核心技术栈

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Mobile-AI 技术体系                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        应用层 (Applications)                         │  │
│  │   端侧推理 │ 语音助手 │ AR/VR │ 智能相机 │ 实时翻译 │ 手势识别        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      模型压缩 (Model Compression)                    │  │
│  │   量化 (INT8/INT4/NF4) │ 剪枝 │ 知识蒸馏 │ 架构搜索 (NAS)            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      推理框架 (Inference Frameworks)                  │  │
│  │        TFLite │ ONNX Runtime │ Core ML │ TensorRT │ MNN │ NCNN        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      硬件适配 (Hardware Adaptation)                   │  │
│  │         NPU │ DSP │ GPU │ 专用AI加速器 │ 异构计算                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 核心应用场景

### 1. 端侧推理 (On-Device Inference)

```
┌────────────────────────────────────────────────────────────────┐
│                      端侧推理架构                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐              │
│  │  语音输入  │ ──→ │  端侧ASR │ ──→ │  本地响应  │              │
│  └──────────┘      └──────────┘      └──────────┘              │
│                           │                                    │
│                           ▼                                    │
│                    ┌──────────────┐                           │
│                    │  离线模型     │  ← 无需网络                │
│                    │  (小模型)     │  ← 隐私留在本地              │
│                    └──────────────┘                           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**优势**:
- 延迟 < 50ms (vs 云端 200-500ms)
- 离线可用
- 隐私数据不出设备
- 省流量/省电量

### 2. 语音助手

```
┌────────────────────────────────────────────────────────────────┐
│                    移动端语音助手架构                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   用户语音                                                         │
│      │                                                             │
│      ▼                                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              端侧语音增强 (回声消除/降噪)                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│      │                                                             │
│      ▼                                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              端侧 ASR (Whisper Tiny/Fish-Speech)             │  │
│  │   量化后 39M 参数，INT8 推理 < 100ms                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│      │                                                             │
│      ▼                                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              端侧 LLM (Gemma 2B / Qwen 1.8B)                │  │
│  │   意图识别 + 对话生成                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│      │                                                             │
│      ▼                                                             │
│   语音回复 / 显示回复                                              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 3. AR/VR 增强现实

| 技术 | 端侧模型 | 延迟要求 | 功耗限制 |
|------|----------|----------|----------|
| 手势识别 | MediaPipe Hands | < 20ms | < 500mW |
| 场景理解 | DepthAnything | < 33ms | < 1W |
| 物体追踪 | YOLO-Lite | < 15ms | < 300mW |
| SLAM | ORB-SLAM3 | < 25ms | < 1.5W |

## 推理框架对比

| 框架 | 开发方 | 平台支持 | 量化支持 | 推理速度 | 适用场景 |
|------|--------|----------|----------|----------|----------|
| **TFLite** | Google | Android/iOS/Linux | INT8/FP16 | 快 | 移动端首选 |
| **ONNX Runtime** | Microsoft | 全平台 | INT8/FP16 | 快 | 跨平台通用 |
| **Core ML** | Apple | iOS/macOS | Core ML格式 | 最快 | 苹果生态 |
| **TensorRT** | NVIDIA | Linux/Jetson | INT8/FP16 | 最快 | GPU设备 |
| **MNN** | Alibaba | 全平台 | INT8/FP16 | 快 | 国产安卓 |
| **NCNN** | Tencent | Android/iOS | INT8 | 快 | 轻量级 |

## 模型压缩技术

### 量化实战代码

```python
# TFLite 动态量化示例
import tensorflow as tf

# 加载模型
converter = tf.lite.TFLiteConverter.from_saved_model("saved_model/")
converter.optimizations = [tf.lite.Optimize.DEFAULT]

# INT8 量化（动态范围）
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type = tf.int8
converter.inference_output_type = tf.int8

# 代表性数据集校准（需提供少量数据）
def representative_dataset_gen():
    for _ in range(100):
        yield [np.random.rand(1, 224, 224, 3).astype(np.float32)]

converter.representative_dataset = representative_dataset_gen

# 转换为量化模型
quantized_tflite_model = converter.convert()

# 保存
with open("model_quantized.tflite", "wb") as f:
    f.write(quantized_tflite_model)

# 验证模型大小
original_size = tf.io.gfile.GFile("model.tflite", "rb").read()
quantized_size = len(quantized_tflite_model)
print(f"压缩率: {len(original_size) / quantized_size:.2f}x")
```

### ONNX 动态量化

```python
# ONNX Runtime INT8 量化
import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType

# 动态量化（最简单，自动选择量化粒度）
quantize_dynamic(
    model_input="model.onnx",
    model_output="model_quantized.onnx",
    weight_type=QuantType.QInt8,
    optimize_model=True
)

# 静态量化（更精确，需校准）
from onnxruntime.quantization import quantize_static, CalibrationDataReader

class ImageDataReader(CalibrationDataReader):
    def __init__(self, image_paths):
        self.image_paths = image_paths
        self.input_name = "input"

    def get_next(self):
        if not self.image_paths:
            return None
        img_path = self.image_paths.pop()
        # 预处理
        img = preprocess(img_path)
        return {self.input_name: img}

quantize_static(
    model_input="model.onnx",
    model_output="model_static_quant.onnx",
    calibration_data_reader=ImageDataReader(calibration_images),
    weight_type=QuantType.QInt8
)
```

### 知识蒸馏代码

```python
# 端侧模型蒸馏示例
import torch
import torch.nn.functional as F

class MobileDistillation:
    """将大模型知识蒸馏到端侧小模型"""

    def __init__(self, teacher, student, temperature=4.0, alpha=0.7):
        self.teacher = teacher
        self.student = student
        self.temperature = temperature
        self.alpha = alpha
        # Teacher 不更新
        for param in self.teacher.parameters():
            param.requires_grad = False

    def compute_loss(self, images, labels):
        # Student 前向
        student_logits = self.student(images)

        with torch.no_grad():
            teacher_logits = self.teacher(images)

        # Hard label 交叉熵
        ce_loss = F.cross_entropy(student_logits, labels)

        # Soft label KL 散度（知识蒸馏）
        soft_student = F.log_softmax(student_logits / self.temperature, dim=-1)
        soft_teacher = F.softmax(teacher_logits / self.temperature, dim=-1)
        kd_loss = F.kl_div(soft_student, soft_teacher, reduction='batchmean')
        kd_loss *= self.temperature ** 2

        # 加权组合
        return self.alpha * ce_loss + (1 - self.alpha) * kd_loss

# 使用示例
teacher = load_large_model("vit-large")  # 304M 参数
student = MobileNetV3Small()  # 2.5M 参数

distiller = MobileDistillation(teacher, student, temperature=4.0, alpha=0.7)

for epoch in range(100):
    for batch in dataloader:
        loss = distiller.compute_loss(batch["images"], batch["labels"])
        loss.backward()
        optimizer.step()
```

## Edge AI 部署架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Edge AI 部署架构                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                          云端 (Cloud)                                │  │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │  │
│   │  │ 训练服务 │  │ 模型仓库 │  │ 联邦学习 │  │ 监控运维 │                 │  │
│   │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘                 │  │
│   └───────┼────────────┼────────────┼────────────┼───────────────────────┘  │
│           │            │            │            │                           │
│           │     模型下发      梯度上传      数据聚合                        │
│           │            │            │            │                           │
│           ▼            ▼            ▼            ▼                           │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                         边缘节点 (Edge)                               │  │
│   │   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │  │
│   │  │  手机/平板      │  │  IoT设备       │  │  智能摄像头     │       │  │
│   │  │  TFLite/ONNX   │  │  TensorRT-L4   │  │  NPU加速       │       │  │
│   │  │  INT8量化模型   │  │  轻量模型      │  │  本地推理      │       │  │
│   │  └────────────────┘  └────────────────┘  └────────────────┘       │  │
│   │                                                                       │  │
│   │   算力: 1-10 TOPS          功耗: 100mW-5W        内存: 2-8GB           │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 端侧模型推荐

| 任务 | 大模型参考 | 端侧替代方案 | 参数量 | 量化后大小 |
|------|------------|--------------|--------|------------|
| **文本生成** | GPT-3 (175B) | Phi-2 (2.7B) / Gemma 2B | 2-3B | 2-4GB |
| **语音识别** | Whisper Large | Whisper Tiny | 39M | 75MB |
| **图像分类** | ViT-L (307M) | MobileNetV3 | 5M | 10MB |
| **目标检测** | YOLOv8-X (68M) | YOLOv8n | 3.2M | 7MB |
| **语义分割** | DeepLabV3+ (59M) | MobileSeg | 5M | 10MB |
| **语音合成** | VALL-E (7B) | Fish-Speech 1.4B | 1.4B | 3GB |

## 云端AI vs 端侧AI 对比

| 维度 | 云端AI | 端侧AI |
|------|--------|--------|
| **延迟** | 200-1000ms | 10-100ms |
| **可用性** | 依赖网络 | 离线可用 |
| **隐私** | 数据上传，有泄露风险 | 数据本地，隐私保护 |
| **成本** | 按调用计费 | 一次性部署 |
| **模型规模** | 100B+ 参数 | 1-10B 参数 |
| **更新频率** | 实时更新 | 定期更新 |
| **功耗** | 不限（云端） | < 5W（移动端） |
| **可靠性** | 依赖服务商 | 自主控制 |
| **定制化** | 需上传数据 | 可联邦学习 |

## 移动端LLM框架

### 主流框架对比

| 框架 | 支持模型 | 平台 | GPU加速 | 特色 |
|------|----------|------|---------|------|
| **MLC-LLM** | LLaMA/Qwen/Gemma | 全平台 | 是 | WebGPU |
| **llama.cpp** | LLaMA/GGUF | 全平台 | 是 | CPU优先 |
| **Swift Transformer** | 多LLM | iOS | 是 | 苹果生态 |
| **Qwen.cpp** | Qwen | 全平台 | 是 | 中文优化 |
| **ExLlamaV2** | LLaMA/Mistral | Linux | 是 | 高效推理 |

### llama.cpp 量化与推理

```python
# llama.cpp Python bindings (llama-cpp-python)
from llama_cpp import Llama

# 加载 4-bit 量化模型 (Q4_K_M)
llm = Llama(
    model_path="./models/llama-2-7b-chat.Q4_K_M.gguf",
    n_ctx=4096,        # 上下文长度
    n_threads=4,       # CPU线程数
    n_gpu_layers=0,    # GPU层数 (0=纯CPU)
    use_mlock=True,    # 锁定内存防止换出
)

# 推理
output = llm(
    "请给我讲一个关于人工智能的短故事：",
    max_tokens=512,
    temperature=0.8,
    stop=["</s>", "USER:"],
)

print(output["choices"][0]["text"])
```

## 经典论文引用

| 年份 | 论文 | 作者 | 核心贡献 |
|------|------|------|----------|
| 2017 | "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision" | Howard et al. | 深度可分离卷积 |
| 2018 | "MobileNetV2: Inverted Residuals and Linear Bottlenecks" | Sandler et al. | 倒残差结构 |
| 2019 | "EfficientNet: Rethinking Model Scaling" | Tan et al. | 复合缩放 |
| 2020 | "Once-for-All: Train One Network and Specialize it for Efficient Deployment" | Cai et al. | 神经网络架构搜索 |
| 2021 | "EdgeYOLO: An Object Detection Framework for Edge Devices" | Wang et al. | 边缘目标检测 |
| 2022 | "QNN: Query-based Efficient Neural Network Inference" | Park et al. | 高效推理框架 |
| 2023 | "MobileLLM: Optimizing Sub-billion Parameter Language Models" | Liu et al. | 移动端LLM |
| 2024 | "MLC-LLM: Universal LLM Deployment" | MLC Team | 通用LLM部署 |
| 2024 | "Fish-Speech: Zero-Shot Text to Speech" | Fish Audio | 端侧语音合成 |

## Cross-refs

- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩技术根基，量化/剪枝/蒸馏是Mobile-AI核心
- [[ml/Federated-Learning.m[[knowledge/Design-Toolkit]]] — 联邦学习，Mobile-AI隐私保护训练范式
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — 混合专家，稀疏激活可大幅降低端侧计算
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低秩适配，端侧微调主流方法
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — Transformer架构是现代LLM基础
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 本地LLM部署实践
- [[ml/CLIP.m[[knowledge/Design-Toolkit]]] — 端侧多模态理解
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 端侧向量检索与语义理解
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 端侧RAG应用
- [[Edge-Inferenc[[Self-Healing-Loop]]] — 边缘推理相关技术

## Layer Rating

★★★★☆ (4.0/5) — 核心概念清晰，代码示例充分，但缺乏最新端侧多模态模型（如Gemini Nano）和实时推理优化细节