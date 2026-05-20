---
type: entity
category: ml
key: Self-Supervised-Learning — 自监督学习
source: Claude-Evo
date: 2026-05-20
---

# Self-Supervised-Learning — 自监督学习

> 无标签数据学习表示，BERT/MAE/MAE3核心

## 核心原理

** pretext task（代理任务）**：
- 不需要人工标签，自己创造监督信号
- 特征学好后，下游任务用少量标签微调

## 两大范式

### 1. Generative（生成式）
- **MAE**：遮住图像75%像素，让模型重建
- **BERT**：遮住文本15%token，让模型预测

### 2. Contrastive（对比式）
- SimCLR, MoCo：通过比较学习表示
- 同一样本的不同view应该相似

### 3. Masked AutoEncoder（MAE 2021）

```python
class MAE(torch.nn.Module):
    def __init__(self, encoder, decoder_dim=512, mask_ratio=0.75):
        super().__init__()
        self.encoder = encoder
        self.decoder = torch.nn.Linear(encoder.embed_dim, decoder_dim)
        self.mask_ratio = mask_ratio

    def forward(self, x):
        B, N, C = x.shape

        # 随机遮住75%的patch
        num_masked = int(N * self.mask_ratio)
        noise = torch.rand(B, N)
        ids_shuffle = torch.argsort(noise, dim=1)
        ids_restore = torch.argsort(ids_shuffle, dim=1)
        ids_keep = ids_shuffle[:, num_masked:]

        # 只编码可见patch
        x_visible = torch.gather(x, dim=1, index=ids_keep.unsqueeze(-1).expand_as(x))

        # 轻量级解码器重建
        x_decoded = self.decoder(self.encoder(x_visible))

        return x_decoded

# 训练：重建像素值
loss = F.mse_loss(x_decoded, x_original)
```

## 与有监督学习对比

| 维度 | 自监督 | 有监督 |
|------|--------|--------|
| 标签需求 | 无 | 大量 |
| 表征质量 | 通用性强 | 任务相关 |
| 下游微调 | 效果好 | 效果好 |
| 典型任务 | 表征学习 | 分类检测 |

## Cross-refs

- [[ml/Contrastive-Learning.m[[knowledge/Design-Toolkit]]] — 对比式SSL
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — MAE架构基础
- [[ml/CLIP.m[[knowledge/Design-Toolkit]]] — 多模态SSL