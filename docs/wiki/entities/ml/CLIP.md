---
type: entity
category: ml
key: CLIP
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
rating: 4
---

# CLIP - Contrastive Language-Image Pre-training

## Overview
- **论文**: "Learning Transferable Visual Models From Natural Language Supervision" (2021)
- **作者**: Radford et al., OpenAI
- **地位**: 视觉-语言预训练的里程碑，开启多模态大模型时代
- **训练数据**: 4亿图像-文本对 (WIT - WebImageText)

## 核心原理

### 1. 对比学习 (Contrastive Learning)

CLIP的核心是对比学习目标函数。在一个batch中，模型学习将匹配的图像-文本对拉近，将不匹配的对拉远。

```python
import torch
import torch.nn.functional as F

def clip_loss(image_features, text_features, temperature):
    """
    image_features: [B, [[knowledge/Design-Toolkit]] 图像嵌入
    text_features: [B, [[knowledge/Design-Toolkit]] 文本嵌入
    temperature: 温度参数，控制分布锐度
    """
    # L2归一化
    image_features = F.normalize(image_features, p=2, dim=1)
    text_features = F.normalize(text_features, p=2, dim=1)

    # 计算余弦相似度矩阵
    logits = (image_features @ text_features.T) / temperature

    # 对比损失：同一pair趋近1，不同pair趋近0
    labels = torch.arange(len(image_features), device=image_features.device)

    # 双向NCE损失
    loss_i2t = F.cross_entropy(logits, labels)  # 图像→文本
    loss_t2i = F.cross_entropy(logits.T, labels)  # 文本→图像
    loss = (loss_i2t + loss_t2i) / 2

    return loss
```

### 2. 图像-文本对齐 (Image-Text Alignment)

CLIP将图像和文本映射到共享的嵌入空间，实现跨模态理解：

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIP 双塔架构                                │
└─────────────────────────────────────────────────────────────────┘

  图像输入                    文本输入
     │                           │
     ▼                           ▼
┌─────────┐              ┌─────────────┐
│   ViT   │              │ Transformer │
│ Encoder │              │   Encoder   │
└─────────┘              └─────────────┘
     │                           │
     ▼                           ▼
 [B, [[knowledge/Design-Toolkit]] image_emb          [B, [[knowledge/Design-Toolkit]] text_emb
     │                           │
     └──────────┬───────────────┘
                ▼
      余弦相似度矩阵计算
                │
                ▼
        Softmax → 对比损失
```

### 3. Transformer Encoder

**Text Encoder**: 标准Transformer encoder (12层, 768维, 12头)

```python
class TextEncoder(torch.nn.Module):
    def __init__(self, vocab_size=49408, max_len=77, d_model=512):
        super().__init__()
        self.embedding = torch.nn.Embedding(vocab_size, d_model)
        self.positional_embedding = torch.nn.Parameter(torch.randn(max_len, d_model))
        self.transformer = torch.nn.TransformerEncoder(
            torch.nn.TransformerEncoderLayer(d_model=512, nhead=8),
            num_layers=12
        )
        self.ln = torch.nn.LayerNorm(d_model)

    def forward(self, tokens):
        # tokens: [B, [[Self-Healing-Loop]]
        x = self.embedding(tokens) + self.positional_embedding
        x = self.transformer(x)
        # [CL[[Self-Healing-Loop]] token 聚合
        x = self.ln(x[:, 0, :])
        return x
```

**Image Encoder**: ViT (Vision Transformer) 或 ResNet

```python
class ViTEncoder(torch.nn.Module):
    def __init__(self, image_size=224, patch_size=16, d_model=768):
        super().__init__()
        self.patch_embed = torch.nn.Conv2d(
            in_channels=3, out_channels=d_model,
            kernel_size=patch_size, stride=patch_size
        )
        num_patches = (image_size // patch_size) ** 2
        self.cls_token = torch.nn.Parameter(torch.randn(1, 1, d_model))
        self.pos_embedding = torch.nn.Parameter(torch.randn(1, num_patches + 1, d_model))
        self.blocks = torch.nn.Sequential(*[
            torch.nnTransformerEncoderLayer(d_model, nhead=12)
            for _ in range(12)
       [[Self-Healing-Loop]])
        self.ln = torch.nn.LayerNorm(d_model)

    def forward(self, x):
        # x: [B, 3, 224, 224]
        x = self.patch_embed(x).flatten(2).transpose(1, 2)  # [B, N, [[knowledge/Design-Toolkit]]
        x = torch.cat([self.cls_token.expand(x.size(0), -1, -1), x], dim=1)
        x = x + self.pos_embedding
        x = self.blocks(x)
        return self.ln(x[:, 0, :])  # [CL[[Self-Healing-Loop]] token
```

## 模型架构图解

```
                    CLIP 训练流程

    ┌──────────┐         ┌──────────┐
    │ "a cat   │         │  cat.jpg │
    │ sitting" │         │          │
    └────┬─────┘         └────┬─────┘
         │                    │
         ▼                    ▼
    ┌─────────┐         ┌─────────┐
    │  Text    │         │  Image  │
    │Encoder(12L)│       │Encoder  │
    │Transformer│         │ ViT-B/16│
    └────┬─────┘         └────┬─────┘
         │                    │
         ▼                    ▼
    ┌─────────┐         ┌─────────┐
    │ [CL[[Self-Healing-Loop]]   │         │ [CL[[Self-Healing-Loop]]   │
    │ text_emb│         │ image_emb│
    └────┬─────┘         └────┬─────┘
         │                    │
         └────────┬───────────┘
                  ▼
         ┌───────────────┐
         │ Cosine Sim    │
         │  ────────────  │
         │  I₁ T₁  I₁ T₂  │
         │  I₂ T₁  I₂ T₂  │
         └───────┬───────┘
                 ▼
         ┌───────────────┐
         │   Softmax     │
         │   NCE Loss    │
         └───────────────┘
```

## 零样本分类能力 (Zero-Shot Classification)

CLIP的核心创新：**文本作为开放词汇分类器**

```python
import torch
from torchvision.models import vit_b_16

# 1. 定义类别文本描述
classes = [
    "a photo of a cat",
    "a photo of a dog",
    "a photo of a bird"
]
text_descriptions = [f"a photo of a {c}" for c in classe[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]

# 2. 编码类别描述
text_embeds = text_encoder(tokenize(text_descriptions))  # [3, [[knowledge/Design-Toolkit]]

# 3. 编码图像
image = preprocess(cat_image)
image_embed = image_encoder(image.unsqueeze(0))  # [1, [[knowledge/Design-Toolkit]]

# 4. 计算相似度并分类
similarity = cosine_similarity(image_embed, text_embeds)
predicted_class = classes[similarity.argmax()]
```

### zero-shot vs 传统监督学习

| 维度 | CLIP Zero-Shot | 传统监督学习 |
|------|----------------|--------------|
| 分类器 | 文本描述自动生成 | 人工标注训练 |
| 新类别 | 文本即可，无需重新训练 | 需要重新训练 |
| 鲁棒性 | 对分布偏移更鲁棒 | 分布偏移敏感 |
| 精度(CIFAR-10) | ~75% | ~95% (有监督) |
| 扩展性 | 任意开放词汇 | 受限于训练集 |

## 变体模型

| 变体 | 机构 | 改进点 |
|------|------|--------|
| **OpenCLIP** | LAION | 更大训练数据，支持更多模态 |
| **ProCLIP** | SJTU (2025.10) | 支持长文本(77词+)，多语言理解 |
| **CLIP-LLava** | - | CLIP视觉编码器 + LLaVA语言模型 |
| **Llip** | ICML 2024 | 潜空间图像语言预训练框架 |
| **SigLIP** | Google | Sigmoid损失替代InfoNCE |

## 应用场景

### 1. 图像检索 (Image Retrieval)
```python
# 文本→图像检索
query = "a sunset over the ocean"
query_embed = text_encoder(tokenize(query))
results = retrieve_top_k(image_embeddings, query_embed, k=10)
```

### 2. 文本→图像生成条件 (Text-to-Image Conditioning)
Stable Diffusion等模型使用CLIP文本编码器作为条件控制：
```python
# CLIP text encoder用于生成引导
text_embeds = clip_text_encoder(prompt)
noise_pred = unet(latent, timestep, text_embeds)
```

### 3. 开放词汇检测 (Open-Vocabulary Detection)
将CLIP知识迁移到目标检测，实现任意类别检测：
```python
# 类别无关检测 + CLIP分类
features = detector.extract_features(image)
for class_name in open_vocabulary:
    class_embed = text_encoder(class_name)
    detection_score = cosine_similarity(features, class_embed)
```

### 4. 其他应用
| 场景 | 说明 |
|------|------|
| 图像相似度 | 以图搜图、版权检测 |
| 视觉问答 | VQA基础编码器 |
| 图像标注 | 自动生成描述 |
| 分布检测 | 检测分布外样本 |

## CLIP vs 传统监督学习对比

| 维度 | CLIP | 传统ResNet/ViT |
|------|------|----------------|
| 训练数据 | 4亿图文对(网络爬取) | 标注数据集(ImageNet等) |
| 标签来源 | 自然语言描述 | 人工标注类别 |
| 新类别 | 文本prompt即可 | 需重新标注和训练 |
| 泛化能力 | 分布偏移下更鲁棒 | 分布偏移敏感 |
| 训练目标 | 对比学习 | 交叉熵损失 |
| zero-shot | 支持 | 不支持 |
| 图像编码器 | ViT/ResNet | ViT/ResNet |
| 文本编码器 | Transformer | 无 |
| 计算成本 | 高(大batch对比) | 中等 |

## 代码示例

### 完整的CLIP推理流程
```python
import torch
import clip
from PIL import Image

# 加载模型
model, preprocess = clip.load("ViT-B/16", device="cuda")

# 加载并预处理图像
image = Image.open("cat.jpg")
image_input = preprocess(image).unsqueeze(0).to(device)

# 编码图像
with torch.no_grad():
    image_features = model.encode_image(image_input)

# 定义候选类别
classes = ["a dog", "a cat", "a bird", "a car"]
text_tokens = clip.tokenize(classes)
with torch.no_grad():
    text_features = model.encode_text(text_tokens)

# 计算相似度并归一化
image_features /= image_features.norm(dim=-1, keepdim=True)
text_features /= text_features.norm(dim=-1, keepdim=True)

similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
print(f"分类结果: {classes[similarity.argmax().item()]}")
```

### 使用OpenCLIP自定义训练
```python
import torch
from open_clip import create_model_and_transforms

# 加载OpenCLIP模型
model, _, preprocess = create_model_and_transforms(
    model_name="ViT-H-14",
    pretrained="laion2B_s32b_b79k"
)

# 图像编码
image = Image.open("photo.jpg")
image_input = preprocess(image).unsqueeze(0)

# 文本编码
text = clip.tokenize(["a photo of a sunset"])
text_input = text.to(device)

with torch.no_grad():
    image_features = model.encode_image(image_input)
    text_features = model.encode_text(text_input)

# 相似度计算
image_features /= image_features.norm(dim=-1, keepdim=True)
text_features /= text_features.norm(dim=-1, keepdim=True)
similarity = image_features @ text_features.T
```

## Cross-refs

| 相关条目 | 说明 |
|----------|------|
| [[ml/Diffusion-Models.m[[knowledge/Design-Toolkit]]] | CLIP文本编码器用于Stable Diffusion条件控制 |
| [[ml/Embedding.m[[knowledge/Design-Toolkit]]] | CLIP产生共享语义空间的向量表示 |
| [[ml/Transformer.m[[knowledge/Design-Toolkit]]] | Text Encoder使用Transformer架构 |
| [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] | 视觉-语言知识表示与知识图谱互补 |
| [[ml/Vector-DB.m[[knowledge/Design-Toolkit]]] | CLIP embeddings可存储于向量数据库进行检索 |
| [[concepts/2026-05-14_concept_multimodal-learning.m[[knowledge/Design-Toolkit]]] | CLIP是多模态学习的核心组件 |
| [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] | 多模态RAG使用CLIP进行图像理解 |

## 经典论文引用

1. **CLIP (2021)**
   ```
   @inproceedings{radford2021learning,
     title={Learning Transferable Visual Models From Natural Language Supervision},
     author={Alex Radford and Jong Wook Kim et al.},
     booktitle={ICML},
     year={2021}
   }
   ```

2. **OpenCLIP**
   ```
   @article{schuhmann2022laion,
     title={LAION-5B: An open large-scale dataset for training next generation image-text models},
     author={Christoph Schuhmann et al.},
     booktitle={NeurIPS},
     year={2022}
   }
   ```

3. **SigLIP (2024)**
   ```
   @article{zhai2024siglip,
     title={SigLIP: Sigmoid Loss for Language Image Pre-Training},
     author={Xiaohua Zhai et al.},
     booktitle={CVPR},
     year={2024}
   }
   ```