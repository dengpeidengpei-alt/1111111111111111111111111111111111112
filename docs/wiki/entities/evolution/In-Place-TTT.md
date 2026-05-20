---
type: entity
category: research
key: In-Place TTT
source: arXiv 2604.06169
date: 2026-05-20
---

# In-Place Test-Time Training

> ★★★★☆ | ICLR 2026 Oral | ByteDance Seed | 推理时参数适应

## Overview
- **全称**: In-Place Test-Time Training
- **会议**: ICLR 2026 Oral (满分接收)
- **来源**: arXiv:2604.06169
- **机构**: ByteDance Seed
- **本质**: 在推理阶段修改final projection实现参数自适应

## 核心创新

```
传统方法：
输入 → Transformer Encoder → LM Head → 输出
                          ↑
                    固定参数

In-Place TTT：
输入 → Transformer Encoder → [Final Projection修改] → 输出
                                       ↑
                                 推理时学习
```

### 关键技术：Final Projection Modification

```python
class InPlaceTTT:
    """推理时训练final projection"""
    
    def __init__(self, model):
        self.model = model
        self.final_proj = model.lm_head  # 锁定其他参数
        
    def adapt(self, x, y_true):
        """在推理时适应"""
        # 只更新final projection
        logits = self.model(x)
        
        # 计算梯度
        loss = cross_entropy(logits, y_true)
        grad = compute_grad(loss, self.final_proj)
        
        # 原位更新（不存储中间状态）
        self.final_proj.update_in_place(grad)
        
        return logits
```

## 与其他TTT方法对比

| 方法 | 训练阶段 | 推理阶段 | 适应性 |
|------|----------|----------|--------|
| 传统TTA | 测试时推断 | 固定参数 | 无 |
| TTT | 训练时学习 | 固定参数 | 无 |
| **In-Place TTT** | 固定 | **原位学习** | **在线** |
| JitRL | 固定 | 即时学习 | 在线 |

### 核心优势

1. **无需额外训练** — 直接在推理时适应
2. **只改final projection** — 其他参数冻结，资源占用低
3. **原位更新** — 不存储反向传播中间状态，内存高效
4. **即插即用** — 可替换任何Transformer LM Head

## 技术细节

### 原位更新机制

```python
def update_in_place(module, grad):
    """原位梯度更新（无额外内存）"""
    with torch.no_grad():
        # Adam风格的动量更新
        module.exp_avg.mul_(beta1).add_(grad, alpha=1-beta1)
        module.exp_avg_sq.mul_(beta2).add_(grad.pow(2), alpha=1-beta2)
        
        # 偏置校正
        bias_correction = 1 - beta1 ** step
        adjusted = module.exp_avg / bias_correction
        
        # 更新参数
        module.weight -= lr * adjusted
        
        step += 1
```

### 与常规训练的对比

| 维度 | 常规训练 | In-Place TTT |
|------|----------|--------------|
| 反向传播 | 完整图 | 仅final projection |
| 内存占用 | 高 | 低 |
| 更新范围 | 所有参数 | 仅head |
| 训练时间 | 长 | 即时 |
| 适用场景 | 离线 | 在线/推理时 |

## 应用场景

### 1. 持续学习 (Continual Learning)

```python
# 场景：新任务到来时快速适应
def adapt_to_new_task(model, task_data):
    """用In-Place TTT快速适应新任务"""
    for x, y in task_data:
        model.adapt(x, y)  # 边推理边学习
```

### 2. 领域适应 (Domain Adaptation)

```python
# 场景：从通用模型适应到专业领域
def adapt_to_domain(model, domain_examples):
    """将通用模型适应到特定领域"""
    for example in domain_examples:
        x, y = parse(example)
        model.adapt(x, y)
```

### 3. 自我进化 (Self-Evolution)

```python
# 场景：Evolution Loop中的正反馈
def self_evolve(evolve_state, feedback):
    """根据反馈即时更新"""
    for signal in feedback:
        x = signal.input
        y_true = signal.correct_output
        evolve_state.model.adapt(x, y_true)
```

## 与Evolution-Loop的集成

```
┌─────────────────────────────────────────────────────────────────┐
│              In-Place TTT → Evolution Loop 集成                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Evolution Loop                                                │
│   ├── 活动1: Research → 新知识                                 │
│   │         │                                                   │
│   │         ▼                                                   │
│   │   In-Place TTT: 适应新知识模式                             │
│   │         │                                                   │
│   │         ▼                                                   │
│   ├── 活动2-6: 其他活动                                        │
│   │         │                                                   │
│   │         ▼                                                   │
│   └── 活动1: 再次Research → 验证适应效果                         │
│                                                                  │
│   效果：每轮循环都包含即时学习，而非固定参数                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 开源资源

- **论文**: arXiv:2604.06169
- **代码**: ByteDance-Seed/In-Place-TTT
- **会议**: ICLR 2026 Oral (满分接收)

## Cross-refs
- [[concepts/2026-05-14_concept_self-evolution.m[[knowledge/Design-Toolkit]]] — 自我进化
- [[ml/Continual-Learning.m[[knowledge/Design-Toolkit]]] — 持续学习
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化循环（集成In-Place TTT作为正反馈）
- [[research/ECC-Workflow.m[[knowledge/Design-Toolkit]]] — ECC工作流模式
- Claude-Work/temp_In-Place TTT.json — 原始资料