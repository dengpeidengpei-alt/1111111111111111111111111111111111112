---
type: entity
category: ml
key: SFT — Supervised Fine-Tuning
source: Claude-Evo
date: 2026-05-20
---

# SFT — Supervised Fine-Tuning

> 监督微调，用标注数据直接训练LLM，是RLHF流程的第一步 ★★★★☆

## 核心原理

**定位**：LLM训练三阶段中的第二阶段
```
预训练 → SFT → RLHF → 对齐
```

**核心思想**：使用人工标注的问答对，教会模型"如何回答"
- 输入：instruction + input
- 输出：ground-truth response
- 目标：最大化正确回答的概率

**数学目标**：
$$
\mathcal{L}_{SFT} = -\mathbb{E}_{(x,y) \sim \mathcal{D}} \sum_{t=1}^{T} \log P(y_t | y_{<t}, x; \theta)
$$

其中x为输入，y为期望输出，θ为模型参数。

**数据格式**：
```json
{
  "instruction": "解释量子纠缠",
  "input": "",
  "output": "量子纠缠是两个或多个粒子..."
}
```

## 与预训练的区别

| 维度 | 预训练 | SFT |
|------|--------|-----|
| 数据 | 网页文本（万亿token） | 标注问答对（万级） |
| 目标 | 下一个token预测 | 响应质量 |
| Loss | 语言建模 | 仅计算output部分 |
| 过拟合风险 | 低 | 中高 |

## 代码示例

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, DataCollator

def format_example(example):
    # 常用格式：ChatML
    return f"<|user|>{example['instruction']}\n<|assistant|>{example['output']}<|endoftext|>"

def train_sft(model_name, train_data, output_dir):
    model = AutoModelForCausalLM.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name, padding_side="right")

    def tokenize(example):
        text = format_example(example)
        result = tokenizer(text, truncation=True, max_length=2048)
        result["labels"] = result["input_ids"].copy()
        return result

    train_dataset = train_data.map(tokenize)
    data_collator = DataCollator(tokenizer=tokenizer)

    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=1e-5,
        num_train_epochs=3,
        warmup_ratio=0.1,
        fp16=True,
        logging_steps=10,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        data_collator=data_collator,
    )
    trainer.train()
```

## 数据工程关键

1. **数据质量 > 数量**：Math/Instruct数据比预训练数据更贵
2. **多样性**：避免answer风格过拟合
3. **格式一致性**：System prompt + instruction + output

## 数据处理流程

### 数据过滤

```python
def filter_instruction_data(raw_data):
    """SFT数据过滤流程"""
    filtered = [[Self-Healing-Loop]]

    for item in raw_data:
        # 1. 长度过滤
        if len(item["output"]) < 20 or len(item["output"]) > 2048:
            continue

        # 2. 质量过滤
        if not is_high_quuality(item["output"]):
            continue

        # 3. 格式过滤
        if not has_proper_format(item):
            continue

        # 4. 去重
        if is_duplicate(item, filtered):
            continue

        filtered.append(item)

    return filtered

def is_high_quuality(text):
    """质量判断标准"""
    criteria = {
        "no_factual_errors": not contains_factual_errors(text),
        "no_hallucination": not is_hallucinated(text),
        "proper_length": 20 < len(text) < 2048,
        "well_formed": is_well_formed(text)
    }
    return sum(criteria.values()) >= 3
```

### 数据增强

```python
def augment_instruction_data(item, method="paraphrase"):
    """数据增强策略"""
    if method == "paraphrase":
        # 改写增强
        paraphrased = llm.generate(f"请用不同的方式表达: {item['output']}")
        return {**item, "output": paraphrased}

    elif method == "expand":
        # 扩展细节
        expanded = llm.generate(f"详细展开: {item['output']}")
        return {**item, "output": expanded}

    elif method == "simplify":
        # 简化
        simplified = llm.generate(f"简化表达: {item['output']}")
        return {**item, "output": simplified}
```

## 训练配置优化

### 学习率调度

```python
from transformers import get_cosine_schedule_with_warmup

def get_training_scheduler(optimizer, num_training_steps, warmup_steps):
    """余弦学习率调度"""
    return get_cosine_schedule_with_warmup(
        optimizer,
        num_warmup_steps=warmup_steps,
        num_training_steps=num_training_steps
    )

# 典型配置
config = {
    "learning_rate": 1e-5,        # 典型值：1e-5 到 2e-5
    "warmup_ratio": 0.1,          # 前10%步骤预热
    "weight_decay": 0.01,         # 防止过拟合
    "gradient_clip": 1.0          # 防止梯度爆炸
}
```

### 规避过拟合

| 策略 | 方法 | 效果 |
|------|------|------|
| **早停** | 监控验证集loss | 防止训练过度 |
| **正则化** | weight_decay=0.01 | 限制参数规模 |
| **数据增强** | 改写/扩展/简化 | 增加数据多样性 |
| **dropout** | hidden_dropout=0.1 | 增强泛化 |
| **数据过滤** | 去除低质量样本 | 保证数据质量 |

## SFT阶段的重要性

### 为什么需要SFT

```
预训练模型的问题：
- 只学习语言模型目标
- 不知道如何"回答问题"
- 输出格式随意
- 可能包含有害内容

SFT的作用：
+ 学习指令遵循
+ 格式化输出
+ 提升Assistant能力
+ 为RLHF做准备
```

### SFT vs 预训练对比

| 指标 | 预训练 | SFT |
|------|--------|-----|
| 数据规模 | 万亿token | 百万token |
| 计算量 | 极大 | 中等 |
| 训练时间 | 数周 | 数天 |
| 目的 | 知识存储 | 能力激活 |
| 损失计算 | 所有token | 仅output token |

## 评估指标

```python
def evaluate_sft_model(model, eval_dataset):
    """SFT模型评估"""
    metrics = {}

    # 1. 困惑度 (Perplexity)
    perplexity = compute_perplexity(model, eval_dataset)
    metrics["perplexity"] = perplexity

    # 2. 准确率 (Accuracy)
    accuracy = compute_exact_match(model, eval_dataset)
    metrics["accuracy"] = accuracy

    # 3. BLEU score (用于生成任务)
    bleu = compute_bleu(model, eval_dataset)
    metrics["bleu"] = bleu

    # 4. ROUGE score
    rouge = compute_rouge(model, eval_dataset)
    metrics["rouge"] = rouge

    return metrics
```

## 常见问题与解决

### 1. 模型遗忘预训练知识

```python
# 解决方案：混合预训练数据
def create_mix_dataset(instruct_data, pretrain_data, ratio=0.1):
    """在SFT数据中混入少量预训练数据"""
    mixed = [[Self-Healing-Loop]]
    for item in instruct_data:
        mixed.append(item)
        if random() < ratio:
            # 添加随机预训练样本
            mixed.append(random.choice(pretrain_data))
    return mixed
```

### 2. 输出格式不稳定

```python
# 解决方案：格式强化训练
format_prompt = """
请严格按照以下格式回答：

[答案]
<your answer here>
[解释]
<your explanation>

示例：
[答案]
42
[解释]
因为6*7=42
"""
```

### 3. 训练不稳定

```python
# 解决方案：梯度裁剪 + 早停
training_args = TrainingArguments(
    gradient_clipping=1.0,      # 防止梯度爆炸
    evaluation_strategy="steps",
    eval_steps=100,
    load_best_model_at_end=True,
    metric_for_best_model="loss",
    greater_is_better=False
)
```

## Cross-refs

- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — SFT后是RLHF阶段
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — DPO可跳过RLHF直接对齐
- [[ml/GRPO.m[[knowledge/Design-Toolkit]]] — GRPO的替代方案
- [[ml/Reward-Model.m[[knowledge/Design-Toolkit]]] — 需要先有SFT模型再做reward标注
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 基于Transformer架构
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 常用的高效微调方法