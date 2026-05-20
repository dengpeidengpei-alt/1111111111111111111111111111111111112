---
type: entity
category: ml
key: Model-Compression
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
stars: 4
---

# Model Compression - 模型压缩技术

## Overview

- **目的**: 降低大模型计算和存储成本，使模型能在消费级硬件运行
- **核心矛盾**: 模型能力 vs 推理效率
- **压缩收益**: 60-90% 显存/存储降低，推理加速 2-8x
- **适用场景**: 本地部署、移动端、边缘计算、RLHF训练

## 核心方法总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        模型压缩方法体系                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   量化      │  │   剪枝      │  │   蒸馏      │  │   架构设计   │       │
│  │ Quantize   │  │   Prune     │  │ Distill     │  │ Architecture│       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│        │                │                │                │              │
│   INT8/INT4/NF4    结构化/非结构化    知识蒸馏        Bolt/Slim        │
│        │                │                │                │              │
│   ┌────┴────┐    ┌──────┴──────┐  ┌────┴────┐  ┌────┴────┐            │
│   │        │    │            │  │        │  │        │               │
│  权重量化  动态量化  神经元剪枝  通道剪枝  老师-学生  轻量架构            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 量化 (Quantization)

### 原理

将高精度浮点数映射到低精度整数，减少表示位数。

| 类型 | 位宽 | 压缩率 | 精度损失 | 适用场景 |
|------|------|--------|----------|----------|
| FP16 | 16bit | 1x | 无 | 基准 |
| INT8 | 8bit | 4x | 极小 | 通用推理 |
| INT4 | 4bit | 8x | 中等 | 资源受限 |
| INT2 | 2bit | 16x | 较大 | 实验性 |
| NF4 | 4bit | 8x | 更低 | LLM专用 |

### 核心挑战：Outlier（离群值）

```
问题：某些异常值（如-67.0）占据量化区间
     导致其他正常值精度被压缩

示例：
FP32: [-67.0, -0.5, 0.3, 0.8, 1.2] → 映射到 INT8 [-128, 127]
      主要信息集中在细小范围内，精度损失严重
```

### 解决方案

| 方案 | 方法 | 论文/工具 |
|------|------|----------|
| LLM.int8 | 部分通道保留FP16，仅量化非离群值 | Dettmers et al. |
| NF4 (Normal Float 4) | 针对权重分布特性设计的数据类型 | QLoRA论文 |
| GPTQ | 4-bit Post-Training Quantization | AutoGPTQ |
| AWQ | Activation-Aware Weight Quantization | 视觉场景 |

### 量化代码示例

```python
# PyTorch 动态量化（简单）
import torch.quantization

model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# Hugging Face Transformers 加载量化模型
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

# INT8 量化
bnb_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=6.0,  # outlier threshold
    llm_int8_has_fp16_weight=False
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)

# INT4 量化 (QLoRA)
bnb_config_4bit = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True
)
```

---

## 2. 剪枝 (Pruning)

### 分类

```
┌──────────────────────────────────────────────┐
│                   剪枝方法                      │
├────────────────────┬───────────────────────┤
│   非结构化剪枝       │     结构化剪枝          │
│   Unstructured      │     Structured         │
├────────────────────┼───────────────────────┤
│  任意位置零权重      │  按通道/注意力头/层剪�     │
│  稀疏模式           │  规则模式               │
│  压缩率依赖硬件     │  硬件友好               │
│  需专用稀疏加速器   │  直接加速               │
└────────────────────┴───────────────────────┘
```

### 非结构化剪枝

```python
# 权重剪枝：按阈值置零
def unstructured_prune(model, threshold=0.01):
    for name, param in model.named_parameters():
        if 'weight' in name:
            mask = torch.abs(param.data) > threshold
            param.data *= mask.float()
    return model

# 迭代剪枝（训练中）
# Step 1: 训练 → Step 2: 剪枝 → Step 3: 微调 → 循环
```

### 结构化剪枝

```python
# Channel Pruning（卷积通道剪枝）
# 使用L2 norm排序，剪除贡献最小的通道
def structured_channel_prune(layer, prune_ratio=0.3):
    # 计算每个通道的L2范数
    channel_weights = torch.norm(layer.weight.data, p=2, dim=(2, 3))
    # 选择保留top-K通道
    n_keep = int(len(channel_weights) * (1 - prune_ratio))
    keep_idx = torch.topk(channel_weights, n_keep)[1]
    return keep_idx

# Transformer层剪枝（使用跳连机制）
class AdaptiveLayer(nn.Module):
    def __init__(self, original_layer, prune_threshold=0.1):
        super().__init__()
        self.layer = original_layer
        self.skip_gate = nn.Parameter(torch.ones(1))  # 可学习跳过门控

    def forward(self, x):
        gate = torch.sigmoid(self.skip_gate)
        if gate < prune_threshold:
            return x  # 跳过此层
        return self.layer(x)
```

### 剪枝策略对比

| 策略 | 方法 | 压缩率 | 精度保持 | 适用 |
|------|------|--------|----------|------|
| Magnitude | 按权重绝对值 | 30-50% | 中 | 简单场景 |
| Lottery Ticket | 寻找winning ticket | 50-70% | 好 | 有预训练 |
| Gradient | 按梯度敏感度 | 40-60% | 好 | 训练时 |
| Sparse | 任意稀疏 | 70-90% | 差 | 专用硬件 |

---

## 3. 知识蒸馏 (Knowledge Distillation)

### 原理

```
┌─────────────────────────────────────────────────────────┐
│                   知识蒸馏                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│     Teacher (大模型)          Student (小模型)           │
│          │                         │                    │
│          │  Soft targets            │                    │
│          │  Intermediate features   │                    │
│          │  Attention maps         │                    │
│          └──────────────┬──────────┘                    │
│                         ↓                                │
│              蒸馏损失函数                                 │
│   Loss = α * CE(Student, Teacher softmax)               │
│          + β * MSE(Student_features, Teacher_features)   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 蒸馏方法

| 方法 | Teacher | Student | 适用场景 |
|------|----------|---------|----------|
| Vanilla KD | 完整大模型 | 小模型 | 分类任务 |
| Self-Distillation | 同模型 | 浅层 | 自学习 |
| DEBERTA | 预训练LLM | 小LLM | NLP生成 |
| MiniLM | 大LLM | 小LLM | 特定任务 |

### 蒸馏代码示例

```python
import torch.nn.functional as F
from torch.distributions import StudentT

class DistillationLoss(nn.Module):
    def __init__(self, temperature=4.0, alpha=0.7):
        super().__init__()
        self.temperature = temperature
        self.alpha = alpha

    def forward(self, student_logits, teacher_logits, labels):
        # Hard label loss
        ce_loss = F.cross_entropy(student_logits, labels)

        # Soft label loss (KL divergence)
        soft_student = F.log_softmax(student_logits / self.temperature, dim=-1)
        soft_teacher = F.softmax(teacher_logits / self.temperature, dim=-1)
        kd_loss = F.kl_div(soft_student, soft_teacher, reduction='batchmean')
        kd_loss *= self.temperature ** 2  # 温度补偿

        # 组合损失
        total_loss = self.alpha * ce_loss + (1 - self.alpha) * kd_loss
        return total_loss

# 训练循环
def train_distill(teacher, student, dataloader, optimizer):
    teacher.eval()  # Teacher不更新
    for batch in dataloader:
        inputs, labels = batch
        with torch.no_grad():
            teacher_logits = teacher(inputs)

        student_logits = student(inputs)
        loss = DistillationLoss(temperature=4.0)(student_logits, teacher_logits, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

### 中间层蒸馏

```python
# MiniLM: 蒸馏注意力池化
class AttentionPoolingDistill(nn.Module):
    """蒸馏最后一层的注意力池化"""
    def forward(self, student_hidden, teacher_hidden):
        # Student: 平均池化
        student_pool = student_hidden.mean(dim=1)

        # Teacher: 注意力加权池化
        # 使用最后一层hidden作为query
        attn_weights = F.softmax(
            torch.matmul(teacher_hidden, teacher_hidden.transpose(-1, -2)),
            dim=-1
        )
        teacher_pool = torch.matmul(attn_weights, teacher_hidden).mean(dim=1)

        return F.mse_loss(student_pool, teacher_pool)

# 多头注意力蒸馏
def multi_head_distill(student_attn, teacher_attn, temperature=2.0):
    """蒸馏多头注意力分布"""
    loss = 0
    for s_attn, t_attn in zip(student_attn, teacher_attn):
        s_attn = F.log_softmax(s_attn / temperature, dim=-1)
        t_attn = F.softmax(t_attn / temperature, dim=-1)
        loss += F.kl_div(s_attn, t_attn, reduction='batchmean')
    return loss * temperature ** 2
```

---

## 4. Bolt框架

### 概述

Bolt是针对Transformer模型的高效压缩框架，核心思想是将"静态"权重压缩与"动态"激活函数优化结合。

### 主要技术

| 技术 | 作用 | 效果 |
|------|------|------|
| Weight Quantization | 4-bit/8-bit 权重压缩 | 存储减半 |
| Dynamic Quantization | 激活函数实时量化 | 加速推理 |
| Bolt Attention | 硬件友好近似计算 | 内存节省 |
| Pruning | 结构化稀疏 | 加速 |

### Bolt vs 传统压缩

| 维度 | 传统方法 | Bolt |
|------|----------|------|
| 压缩粒度 | 粗粒度 | 细粒度 |
| 精度保持 | 中等 | 较高 |
| 硬件适配 | 需专用加速 | 通用GPU |
| 计算开销 | 中等 | 较低 |

---

## 技术对比总表

| 方法 | 压缩率 | 精度损失 | 计算开销 | 硬件友好 | 适用场景 |
|------|--------|----------|----------|----------|----------|
| **量化 INT8** | 4x | <2% | 低 | 是 | 通用推理 ★★★★★ |
| **量化 INT4** | 8x | 3-8% | 低 | 是 | 资源受限 ★★★★☆ |
| **量化 NF4** | 8x | 1-4% | 低 | 是 | LLM ★★★★☆ |
| **非结构化剪枝** | 5-10x | 变化大 | 中 | 否 | 专用硬件 ★★★☆☆ |
| **结构化剪枝** | 2-4x | 2-5% | 低 | 是 | 生产部署 ★★★★☆ |
| **知识蒸馏** | 3-10x | 1-5% | 高 | 是 | 模型迁移 ★★★★☆ |
| **Bolt框架** | 4-8x | 2-6% | 中 | 是 | Transformer ★★★☆☆ |

---

## 适用场景表

| 场景 | 推荐方法 | 配置 | 预期收益 |
|------|----------|------|----------|
| **消费级GPU推理** | INT8量化 | Q8_0 | 4x显存减少，2x加速 |
| **手机/边缘部署** | INT4量化 + 剪枝 | Q4 + 30%剪枝 | 8x压缩 |
| **RLHF训练** | QLoRA | INT4 + LoRA | 单卡70B训练 |
| **快速实验** | 动态量化 | INT8 | 快速验证 |
| **高精度任务** | 蒸馏 + 量化 | 大Teacher | 保持精度 |
| **长上下文** | Flash Attention + 量化 | INT8 | 显存减少 |
| **分布式训练** | 量化 + 并行 | INT8 + ZeRO | 通信减少 |

---

## 典型Pipeline

```
预训练大模型 (如7B)
       │
       ▼
┌──────────────────────────────────────┐
│  Step 1: 确定压缩目标                │
│  - 目标精度：INT8维持95%+            │
│  - 目标设备：RTX 3090 (24GB)         │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Step 2: 选择压缩方法                │
│  - QLoRA: 4bit量化 + LoRA微调        │
│  - 或: INT8量化 + 任务适配             │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Step 3: 验证精度                    │
│  - 任务指标对比                       │
│  - 生成质量评估                       │
└──────────────────────────────────────┘
       │
       ▼
  压缩后模型 (1.8B等效参数)
```

---

## 经典论文引用

| 论文 | 年份 | 核心贡献 | 引用场景 |
|------|------|----------|----------|
| "LLM.int8: Emergent Quantization" | 2022 | INT8量化方案 | 量化基础 |
| "QLoRA: Efficient Finetuning" | 2023 | 4-bit量化+LoRA | 训练压缩 |
| "GPTQ: Post-Training Quantization" | 2023 | 4-bit GPT量化 | 生成任务 |
| "AWQ: Activation-Aware Weight Quantization" | 2024 | 激活感知量化 | 视觉LLM |
| "Knowledge Distillation: A Survey" | 2021 | 蒸馏综述 | 方法参考 |
| "MiniLM: Deep Self-Attention" | 2021 | 注意力蒸馏 | 特征蒸馏 |
| "The Lottery Ticket Hypothesis" | 2019 | 稀疏剪枝 | 剪枝理论 |
| "Bolt: Efficient LLM Compression" | 2024 | Transformer压缩 | Bolt框架 |

---

## Cross-refs

- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低秩适配，常与量化结合 (QLoRA)
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 量化LoRA，INT4+LoRA微调
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 声明式编程，可优化压缩模型使用
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 向量压缩相关
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — 混合专家，稀疏激活本质是结构化压缩
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 本地部署实践
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 训练时的压缩需求
- [[ml/Federated-Learning.m[[knowledge/Design-Toolkit]]] — 分布式训练与压缩
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — RAG场景中的模型压缩应用

---

## 相关条目

- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 压缩目标架构
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 压缩用于RLHF训练
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 压缩模型部署实践