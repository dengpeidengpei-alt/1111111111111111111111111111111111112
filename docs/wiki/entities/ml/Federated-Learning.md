---
type: entity
category: ml
key: Federated Learning
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# Federated Learning - 联邦学习

## Overview

- **定义**: 分布式数据隐私保护训练范式，模型不动数据，数据不动模型
- **核心**: 客户端本地训练，仅上传梯度/参数，服务器聚合
- **论文**: "Communication-Efficient Learning of Deep Networks from Decentralized Data" (2017)
- **地位**: 隐私计算核心方案，Google首次应用于手机键盘预测

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          联邦学习系统架构                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   客户端 A          客户端 B          客户端 C          客户端 D              │
│   ┌────────┐       ┌────────┐       ┌────────┐       ┌────────┐           │
│   │本地数据│       │本地数据│       │本地数据│       │本地数据│           │
│   │  ────  │       │  ────  │       │  ────  │       │  ────  │           │
│   │本地训练│       │本地训练│       │本地训练│       │本地训练│           │
│   └────┬───┘       └────┬───┘       └────┬───┘       └────┬───┘           │
│        │                │                │                │               │
│        ▼                ▼                ▼                ▼               │
│   ┌─────────────────────────────────────────────────────────────┐        │
│   │                    安全聚合服务器                              │        │
│   │                    (Secure Aggregation)                      │        │
│   │              FedAvg: θ = Σ (n_k/n) × θ_k                     │        │
│   └─────────────────────────────────────────────────────────────┘        │
│                              │                                            │
│                              ▼                                            │
│                         全局模型                                           │
│                          ↓ ↑                                             │
│                    下一轮分发                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 核心概念

### FedAvg - 联邦平均算法

```python
class FedAvg:
    """联邦平均算法 - 核心聚合方法"""
    def __init__(self, clients, rounds=100, local_epochs=5):
        self.clients = clients
        self.rounds = rounds
        self.local_epochs = local_epochs
        self.global_model = None

    def fit(self):
        """主循环"""
        for round in range(self.rounds):
            # 1. 选择客户端子集
            client_subset = random.sample(self.clients, k=min(C, len(self.clients)))

            # 2. 本地训练
            local_weights = [[Self-Healing-Loop]]
            for client in client_subset:
                w = client.local_train(epochs=self.local_epochs)
                local_weights.append((w, len(client.data)))

            # 3. 加权聚合
            self.global_model = self._aggregate(local_weights)

            # 4. 分发全局模型
            for client in self.clients:
                client.update_model(self.global_model)

        return self.global_model

    def _aggregate(self, local_weights):
        """FedAvg加权聚合"""
        total_samples = sum(n for _, n in local_weights)
        aggregated = {}

        for key in local_weights[0][0].keys():
            weighted_sum = sum(
                w[key] * (n / total_samples)
                for w, n in local_weights
            )
            aggregated[key] = weighted_sum

        return aggregated
```

### 安全聚合 (Secure Aggregation)

```python
class SecureAggregation:
    """安全聚合协议 - 防止服务器窥探单个客户端更新"""

    def __init__(self, n_clients, threshold=2):
        self.n = n_clients
        self.threshold = threshold  # 需要至少threshold个客户端才能重构

    def aggregate(self, encrypted_updates):
        """
        1. 客户端生成随机掩码
        2. 加密上传
        3. 聚合时掩码相互抵消
        4. 只有聚合后总量可见
        """
        # 掩码生成: m_i = random_vector()
        # 加密: enc_i = update_i + m_i
        # 聚合: Σ enc_i = Σ update_i + Σ m_i
        # 由于掩码成对抵消，聚合结果保留 Σ update_i

        aggregated = {}
        for key in encrypted_updates[0].keys():
            values = [up[key] for up in encrypted_update[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
            aggregated[key] = sum(values) / len(values)
        return aggregated
```

### 差分隐私 (Differential Privacy)

```python
class DPClient:
    """差分隐私保护的联邦学习客户端"""

    def __init__(self, sensitivity=1.0, epsilon=3.0, delta=1e-5):
        self.sensitivity = sensitivity
        self.epsilon = epsilon  # 隐私预算
        self.delta = delta      # 失败概率

    def add_noise(self, gradients):
        """拉普拉斯噪声或高斯噪声"""
        # 拉普拉斯机制
        scale = self.sensitivity / self.epsilon
        noisy_gradients = {}

        for key, grad in gradients.items():
            noise = np.random.laplace(0, scale, grad.shape)
            noisy_gradients[key] = grad + noise

        return noisy_gradients

    def clip_gradients(self, gradients, max_norm=1.0):
        """梯度裁剪 - 限制敏感度"""
        total_norm = sqrt(sum(g.norm()**2 for g in gradients.values()))
        clip_coef = max_norm / (total_norm + 1e-6)

        if clip_coef < 1:
            return {k: v * clip_coef for k, v in gradients.items()}
        return gradients
```

## 技术框架

### 1. 横向联邦学习 (Horizontal Federated Learning)

```
┌────────────────────────────────────────────────────────────────┐
│                    横向联邦                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  客户端A: [特征1, 特征2, 特征3] ← 样本1, 样本2           │
│  客户端B: [特征1, 特征2, 特征3] ← 样本3, 样本4           │
│  客户端C: [特征1, 特征2, 特征3] ← 样本5, 样本6           │
│                                                                 │
│  样本空间不同，特征空间相同                                      │
│  典型: 跨银行、跨医院的患者数据                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 2. 纵向联邦学习 (Vertical Federated Learning)

```
┌────────────────────────────────────────────────────────────────┐
│                    纵向联邦                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  客户端A (银行): [特征1, 特征2] ← 用户A, B, C           │
│  客户端B (电商): [特征3, 特征4] ← 用户A, B, C           │
│                                                                 │
│  样本空间相同，特征空间不同                                      │
│  典型: 银行+电商联合建模，用户特征互补                            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 3. 联邦迁移学习 (Federated Transfer Learning)

```
┌────────────────────────────────────────────────────────────────┐
│                    联邦迁移学习                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  客户端A: [特征1, 特征2] ← 样本1, 样本2                  │
│  客户端B: [特征3, 特征4] ← 样本3, 样本4                  │
│                                                                 │
│  样本空间不同，特征空间也不同                                   │
│  使用迁移学习桥接知识差异                                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 框架对比

| 类型 | 样本划分 | 特征划分 | 典型场景 |
|------|---------|---------|---------|
| 横向联邦 | 样本不同 | 特征相同 | 跨医院影像数据 |
| 纵向联邦 | 样本相同 | 特征不同 | 银行+电商联合风控 |
| 联邦迁移 | 样本不同 | 特征不同 | 跨组织知识迁移 |

## 联邦学习 vs 集中式学习

| 维度 | 联邦学习 | 集中式学习 |
|------|---------|-----------|
| 数据隐私 | 数据不动，隐私保护 | 数据集中，风险高 |
| 通信效率 | 传输梯度而非原始数据 | 需上传原始数据 |
| 单点故障 | 无中心服务器则无单点 | 服务器故障全系统瘫痪 |
| 数据异构 | 支持异构数据源 | 需数据标准化 |
| 模型质量 | 受限于客户端算力 | 可用全部数据 |
| 通信开销 | 每轮传输模型参数 | 仅上传数据一次 |
| 隐私安全 | 仍有梯度泄露风险 | 需额外加密 |
| 实现复杂度 | 高（需协调协议） | 低（传统ML流程） |
| 适用场景 | 多方数据无法汇聚 | 数据可集中获取 |

## 应用场景

### 医疗健康

```
┌────────────────────────────────────────────────────────────────┐
│                      医疗联邦学习                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  医院A (影像): X光/CT/MRI + 诊断标签                           │
│  医院B (检验): 血液检查 + 诊断标签                              │
│  医院C (病历): 电子病历 + 诊断标签                              │
│                                                                 │
│  目标: 训练罕见病早筛模型                                        │
│  约束: 患者隐私、HIPAA/GDPR合规                                 │
│  优势: 不共享原始数据，突破数据孤岛                              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 金融风控

```
┌────────────────────────────────────────────────────────────────┐
│                      金融联邦学习                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  银行A: 存款、理财历史                                          │
│  银行B: 贷款、征信记录                                          │
│  电商C: 消费、还款行为                                          │
│                                                                 │
│  目标: 联合构建反欺诈模型                                        │
│  约束: 金融数据敏感、反洗钱合规                                  │
│  优势: 特征互补，提升风控准确性                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 移动设备

```
┌────────────────────────────────────────────────────────────────┐
│                    移动端联邦学习                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  手机A: 键盘输入习惯、位置信息                                  │
│  手机B: 语音助手使用、App偏好                                  │
│  手机C: 推荐系统交互、搜索历史                                  │
│                                                                 │
│  目标: Gboard下一词预测、个性化推荐                             │
│  约束: 设备算力有限、电量限制                                    │
│  优势: Edge侧训练，保护用户隐私                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 经典论文

| 年份 | 论文 | 作者 | 贡献 |
|------|------|------|------|
| 2017 | Communication-Efficient Learning of Deep Networks from Decentralized Data | McMahan et al. | FedAvg原始论文 |
| 2017 | Federated Learning: Strategies for Improving Communication Efficiency | Konevcny et al. | 通信优化 |
| 2018 | Federated Learning for Mobile Keyboard Prediction | Hard et al. | 首个大面积应用 |
| 2019 | Advances and Open Problems in Federated Learning | Kairouz et al. | 综述论文 |
| 2020 | Differential Privacy in Federated Learning | True et al. | 隐私分析 |
| 2021 | FedProx: Federated Optimization for Heterogeneous Networks | Li et al. | 处理数据异构 |
| 2022 | SCAFFOLD: Stochastic Controlled Averaging for Federated Learning | Karimireddy et al. | 方差减少 |

## Cross-refs

- [[ml/Privacy-AI.m[[knowledge/Design-Toolkit]]] — 隐私计算整体框架
- [[Differential-Privacy]] — 差分隐私，联邦学习隐私保护基础
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩，联邦通信优化手段
- [[ml/Continual-Learning.m[[knowledge/Design-Toolkit]]] — 持续学习，处理非独立同分布数据
- [[ml/MoE.m[[knowledge/Design-Toolkit]]] — 混合专家，联邦学习可结合的架构
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低秩适配，联邦学习中的高效微调
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 差分隐私符号缩写
- [[ml/Healthcare-AI.m[[knowledge/Design-Toolkit]]] — 医疗AI，联邦学习核心应用场景
- [[ml/Mobile-AI.m[[knowledge/Design-Toolkit]]] — 移动端AI，联邦学习落地场景

## Layer Rating

★★★★☆ (4.0/5) — 核心概念清晰，架构完整，但缺乏最新进展（如FedNova、FedOpt）和工业实践案例