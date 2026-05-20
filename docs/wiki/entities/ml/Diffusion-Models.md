---
type: entity
category: ml
key: Diffusion Models
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# Diffusion Models - 扩散模型

## 概述
- **论文**: DDPM (2020), Ho et al.
- **地位**: 生成式AI核心架构，与GAN三分天下
- **应用**: 图像/音频/视频/分子生成

## 核心原理

### 前向过程 (Forward Process)
```python
# 逐步加噪声将数据转化为纯噪声
def forward_process(x_0, t, beta_t):
    """
    x_0: 原始图像
    t: 时间步
    beta_t: 当前噪声调度参数
    """
    noise = torch.randn_like(x_0)
    alpha_t = 1 - beta_t
    x_t = torch.sqrt(alpha_t) * x_0 + torch.sqrt(1 - alpha_t) * noise
    return x_t
```

**核心公式**:
```
q(x_t | x_0) = N(x_t; sqrt(α_t) * x_0, (1-α_t)I)
α_t = Π(1-β_i)
```

### 反向过程 (Reverse Process)
```python
# 逐步去噪还原数据
def reverse_process(x_t, t, model, beta_t):
    """
    model: 噪声预测网络 (UNet)
    """
    predicted_noise = model(x_t, t)
    alpha_t = 1 - beta_t

    # 重建原图
    x_0 = (x_t - torch.sqrt(1-alpha_t) * predicted_noise) / torch.sqrt(alpha_t)

    # 计算均值和方差
    mean = (x_t - beta_t / torch.sqrt(1-alpha_t) * predicted_noise) / torch.sqrt(alpha_t)
    variance = beta_t

    # 重采样
    if t > 0:
        x_{t-1} = mean + torch.sqrt(variance) * torch.randn_like(x_t)
    else:
        x_{t-1} = mean
    return x_{t-1}
```

## 数学推导

### 训练目标
```python
# 简化的噪声预测损失
def training_loss(model, x_0):
    t = torch.randint(0, T, (batch_size,))
    noise = torch.randn_like(x_0)

    # 加噪
    x_t = forward_process(x_0, t, beta_t)

    # 预测噪声
    predicted_noise = model(x_t, t)

    # MSE损失
    loss = F.mse_loss(predicted_noise, noise)
    return loss
```

### 关键数学推导
1. **重参数化技巧**: 将随机采样转化为确定性计算
2. **噪声调度**: β_t 决定前向过程速度
3. **对数似然下界**: ELBO = -L_simple + L_vlb

## 主要类型

| 类型 | 特点 | 代表模型 |
|------|------|----------|
| DDPM | 基础，逐步去噪 | 原论文 |
| DDIM | 加速采样(10-50步) | Stable Diffusion v1 |
| LDPM (Latent) | 在隐空间扩散 | Stable Diffusion |
| DiT | Transformer替代UNet | PixArt, Stable Diffusion 3 |

### DDPM vs DDIM vs LDPM
```python
# DDPM: T=1000步，慢但质量高
# DDIM: T=20-50步，快10-50倍，质量略降

# DDIM采样（关键代码）
def ddim_step(x_t, model, t, prev_t, eta=0.0):
    """DDIM单步采样"""
    alpha_t = alpha_bar[[[knowledge/Design-Toolkit]]
    alpha_prev = alpha_bar[prev_[[knowledge/Design-Toolkit]]

    predicted = model(x_t, t)
    predicted_noise = predicted

    # DDIM轨迹
    x_0 = (x_t - predicted_noise * torch.sqrt(1-alpha_t)) / torch.sqrt(alpha_t)
    direction = predicted_noise * torch.sqrt(1-alpha_prev)

    if eta > 0:
        # 添加随机性
        variance = eta * (1-alpha_prev/alpha_t) * (1-alpha_t/alpha_prev)
        x_prev = x_0 + direction + torch.sqrt(variance) * torch.randn_like(x_t)
    else:
        # 确定性轨迹
        x_prev = x_0 + direction

    return x_prev
```

## 代码示例

### 完整的DDPM训练
```python
import torch
import torch.nn.functional as F

class SimpleDDPM(torch.nn.Module):
    def __init__(self, T=1000, beta_start=1e-4, beta_end=0.02):
        super().__init__()
        self.T = T
        self.beta = torch.linspace(beta_start, beta_end, T)
        self.alpha = 1 - self.beta
        self.alpha_bar = torch.cumprod(self.alpha, dim=0)

    def forward_process(self, x_0, t):
        """前向加噪"""
        noise = torch.randn_like(x_0)
        sqrt_alpha_bar = torch.sqrt(self.alpha_bar[[[knowledge/Design-Toolkit]])
        sqrt_one_minus_alpha_bar = torch.sqrt(1 - self.alpha_bar[[[knowledge/Design-Toolkit]])
        return sqrt_alpha_bar[:, None, None, Non[[Self-Healing-Loop]] * x_0 + sqrt_one_minus_alpha_bar[:, None, None, Non[[Self-Healing-Loop]] * noise, noise

    def reverse_step(self, x_t, t, model):
        """单步反向去噪"""
        with torch.no_grad():
            t_batch = torch.full((x_t.size(0),), t, device=x_t.device)
            predicted = model(x_t, t_batch)
            predicted_noise = predicted

            alpha_t = self.alpha[[[knowledge/Design-Toolkit]]
            alpha_bar_t = self.alpha_bar[[[knowledge/Design-Toolkit]]

            mean = (x_t - self.beta[[[knowledge/Design-Toolkit]]/torch.sqrt(1-alpha_bar_t)*predicted_noise) / torch.sqrt(alpha_t)
            variance = self.beta[[[knowledge/Design-Toolkit]]

            if t > 0:
                x_t_minus_1 = mean + torch.sqrt(variance) * torch.randn_like(x_t)
            else:
                x_t_minus_1 = mean
            return x_t_minus_1

    @torch.no_grad()
    def sample(self, model, shape):
        """完整采样"""
        x_t = torch.randn(shape, device=self.beta.device)
        for t in reversed(range(self.T)):
            x_t = self.reverse_step(x_t, t, model)
        return x_t
```

### Latent Diffusion Model (Stable Diffusion核心)
```python
class LatentDiffusionModel:
    """
    Stable Diffusion = VAE + UNet(隐空间) + 文本编码器
    """

    def __init__(self, T=50):
        self.T = T
        # 文本编码器 (CLIP)
        self.text_encoder = CLIPTextEncoder()
        # UNet (隐空间噪声预测)
        self.unet = UNet()
        # VAE解码器
        self.vae = VAE()

    @torch.no_grad()
    def generate(self, prompt, guidance_scale=7.5):
        # 1. 文本编码
        text_embeds = self.text_encoder(prompt)  # [B, 77, 768]

        # 2. 随机隐向量
        latent = torch.randn(1, 4, 64, 64, device=text_embeds.device)

        # 3. DDIM采样
        for t in reversed(range(self.T)):
            # 无分类器引导
            noise_pred = self.unet(latent, t, text_embeds)
            noise_pred_uncond = self.unet(latent, t, null_embeds)

            # 引导合并
            noise_pred = noise_pred_uncond + guidance_scale * (noise_pred - noise_pred_uncond)

            # 更新latent
            latent = self.ddim_step(latent, noise_pred, t)

        # 4. VAE解码
        image = self.vae.decode(latent)
        return image
```

## 变体

### 1. Classifier-Free Guidance (CFG)
```python
# 训练时随机丢弃条件（无分类器引导）
def cfg_training(x_t, model, cond=None, drop_prob=0.1):
    if torch.rand() < drop_prob:
        cond = null_cond  # 随机丢弃条件
    return model(x_t, cond)

# 推理时使用引导
def cfg_inference(x_t, model, cond, guidance_scale=7.5):
    noise_cond = model(x_t, cond)
    noise_uncond = model(x_t, null_cond)
    noise_pred = noise_uncond + guidance_scale * (noise_cond - noise_uncond)
    return noise_pred
```

### 2. ControlNet条件控制
```python
# ControlNet额外添加条件控制
class ControlNetCondition:
    def __init__(self, control_type="canny"):
        self.control_type = control_type

    def preprocess(self, image):
        if self.control_type == "canny":
            return canny_edge_detect(image)
        elif self.control_type == "pose":
            return pose_estimation(image)
        return image
```

## 适用场景

| 场景 | 模型选择 | 采样步数 |
|------|----------|----------|
| 高质量图像生成 | DDPM/SD XL | 50-100 |
| 快速生成 | DDIM/SD v1.5 | 20-30 |
| 视频生成 | SVD/DiT | 25-50 |
| 音频生成 | AudioLDM | 50-100 |
| 分子设计 | EDM | 100-1000 |

## 与其他方法对比

| 维度 | Diffusion | GAN | VAE | Flow |
|------|-----------|-----|-----|------|
| 训练稳定性 | 稳定 | 不稳定 | 稳定 | 稳定 |
| 模式覆盖 | 完整 | 部分 | 中等 | 完整 |
| 生成速度 | 慢(多步) | 快(单步) | 快 | 中 |
| 采样可控性 | 高 | 低 | 中 | 高 |
| 似然评估 | 可近似 | 不可 | 可 | 可 |
| 典型应用 | 图像/视频生成 | 图像生成 | 压缩表示 | 音频 |

## Cross-refs
- [[ml/World-Models.m[[knowledge/Design-Toolkit]]] — 视频生成基础
- [[ml/CLIP.m[[knowledge/Design-Toolkit]]] — 文本-图像对齐用于条件控制
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — DiT使用Transformer架构
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 量化用于加速扩散模型
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — 生成式RAG结合扩散模型
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 向量检索与生成结合