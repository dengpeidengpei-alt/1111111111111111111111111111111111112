---
type: entity
category: ml
key: Constitutional AI
source: Claude-Evo ML research
date: 2026-05-14
layer: 4.0
---

# Constitutional AI

## 概述
- **论文**: "Constitutional AI: Harmlessness from AI Feedback" (2022, Anthropic)
- **地位**: AI自对齐方法，RLAIF替代RLHF
- **核心**: 通过AI自评和自我改进实现对齐

## 核心原理

### 双阶段训练
```
阶段1: CRT (Constitutional Reinforcement Learning)
  ↓
  1. 有害prompt → 模型生成response
  2. 模型自评response是否违反宪法
  3. 如违反，生成修正版本
  4. 用偏好数据训练reward模型

阶段2: RLAIF (Reinforcement Learning from AI Feedback)
  ↓
  5. 用CRT数据训练SFT模型
  6. 用RLAIF替代RLHF进行对齐
```

### AI自评机制
```python
class ConstitutionalAI:
    def __init__(self, constitution):
        self.constitution = constitution  # 宪法原则列表
        self.critique_prompt = """请评估以下回复是否违反了宪法原则。
宪法原则: {principle}
回复: {response}

如果违反，请说明违反原因并提供一个修正版本。"""

    def critique(self, response, principle):
        """AI自评机制"""
        prompt = self.critique_prompt.format(
            principle=principle,
            response=response
        )
        critique = self.llm.generate(prompt)
        return critique

    def revise(self, response, critique):
        """根据批评修正回复"""
        revise_prompt = f"""根据以下批评修正回复。

原始回复: {response}

批评: {critique}

请提供一个改进后的回复:"""
        revised = self.llm.generate(revise_prompt)
        return revised
```

### RLAIF vs RLHF
```python
# RLHF: 人类反馈
# 人类标注员对response打分 → 训练Reward Model → PPO优化

# RLAIF: AI反馈 (Constitutional AI)
# AI根据宪法自评response → 生成偏好数据 → SFT/RLAIF优化
```

## 代码示例

### Constitutional AI训练流程
```python
class ConstitutionalTrainer:
    def __init__(self, model, constitution):
        self.model = model
        self.constitution = constitution
        self.critique_template = self._load_critique_template()

    def stage1_crt(self, harmful_prompts):
        """
        阶段1: Constitutional Reinforcement Learning
        生成CRT训练数据
        """
        crt_data = [[Self-Healing-Loop]]

        for prompt in harmful_prompts:
            # 1. 生成初始response
            response = self.model.generate(prompt)

            # 2. 对每个宪法原则进行自评
            critiques = [[Self-Healing-Loop]]
            for principle in self.constitution:
                critique = self.critique(response, principle)
                critiques.append(critique)

            # 3. 如果违反原则，生成修正版本
            if self.is_harmful(critiques):
                revised = self.revise(response, critiques)
                crt_data.append({
                    'prompt': prompt,
                    'response': revised,
                    'critiques': critiques
                })

        return crt_data

    def stage2_rlaif(self, crt_data):
        """
        阶段2: RLAIF训练
        用CRT数据训练模型
        """
        # 构建偏好数据
        preference_data = [[Self-Healing-Loop]]

        for item in crt_data:
            # 原始有害response vs 修正后的response
            preference_data.append({
                'prompt': item['prompt'],
                'chosen': item['response'],  # 修正版本
                'rejected': item.get('original_response')  # 原始版本
            })

        # 使用DPO或SFT训练
        self.train_with_preference(preference_data)

        return self.model

    def _load_critique_template(self):
        """宪法批评模板"""
        return """请评估以下AI助手的回复是否违反了以下宪法原则:

宪法原则:
{principles}

AI助手的回复:
{response}

评估标准:
1. 是否有害? (伤害他人/非法内容/欺诈等)
2. 是否诚实? (不说谎/不误导)
3. 是否公正? (不歧视/尊重多样性)

请提供:
- 是否违反: [是/否]
- 违反的具体原则
- 违反原因
- 如违反，提供修正建议"""
```

### 12条核心宪法原则 (Anthropic)
```python
CONSTATUTION_PRINCIPLES = [
    "帮助用户并提供有用信息，同时不造成伤害",
    "无害性优先：当面临潜在伤害时，优先考虑安全性",
    "诚实优先：提供准确信息，不编造或误导",
    "避免歧视：不使用基于种族、性别、国籍等的歧视性言论",
    "隐私保护：不收集或分享个人隐私信息",
    "不协助伤害：不提供制造武器或实施犯罪的指导",
    "性内容：只提供适度、不色情的性相关内容",
    "政治中立：不推广特定政治观点或干预政治进程",
    "专业建议：在医疗、法律、金融等专业领域提供免责声明",
    "信息核实：对不确定信息进行标注，不传播错误信息",
    "儿童安全：特别保护儿童权益，不提供有害儿童内容",
    "环境保护：不鼓励环境破坏行为"
]

def evaluate_with_constitution(model, response, context=""):
    """使用宪法评估回复"""
    principles_text = "\n".join(f"{i+1}. {p}" for i, p in enumerate(CONSTATUTION_PRINCIPLES))

    evaluation_prompt = f"""评估以下AI助手的回复是否符合宪法原则:

上下文: {context}

回复: {response}

宪法原则:
{principles_text}

请逐条评估并给出总体判断。"""

    evaluation = model.generate(evaluation_prompt)
    return evaluation
```

## 变体

### 1. Self-Critique and Revision (SCR)
```python
# 简化的自批评修订
def self_critique_revision(model, prompt, response):
    """基础的自我批评修订"""
    critique_prompt = f"评估以下回复的有害性并提供修正建议: {response}"
    critique = model.generate(critique_prompt)

    if "有害" in critique or "违反" in critique:
        revise_prompt = f"根据批评修正回复: {response}\n批评: {critique}"
        revised = model.generate(revise_prompt)
        return revised
    return response
```

### 2. RLAIF (Reinforcement Learning from AI Feedback)
```python
# RLAIF核心流程
def rlaif_train(model, ai_preference_data):
    """
    RLAIF: 用AI生成的偏好数据训练
    替代RLHF的人类反馈
    """
    # AI偏好数据生成
    preference_pairs = [[Self-Healing-Loop]]
    for item in ai_preference_data:
        # AI评估两个response的优劣
        evaluation = model.evaluate(
            prompt=item['prompt'],
            response_a=item['response_a'],
            response_b=item['response_b']
        )
        preference_pairs.append({
            'prompt': item['prompt'],
            'preferred': item['response_a'] if evaluation == 'A' else item['response_b'],
            'rejected': item['response_b'] if evaluation == 'A' else item['response_a']
        })

    # 用偏好数据训练 (DPO/SFT)
    return train_with_preference(model, preference_pairs)
```

## 适用场景

| 场景 | 方法选择 | 说明 |
|------|----------|------|
| 安全性对齐 | Constitutional AI | 自带安全性检查 |
| 减少人工标注 | RLAIF | AI反馈替代人工 |
| 可解释对齐 | Constitutional AI | 宪法原则可追溯 |
| 多语言对齐 | CAI + 翻译 | 跨语言一致性 |

## 与其他方法对比

| 维度 | Constitutional AI | RLHF | DPO | GRPO |
|------|-------------------|------|-----|------|
| 反馈来源 | AI自评 | 人类标注 | 参考模型 | 组内相对 |
| 人工需求 | 极低 | 高 | 中 | 低 |
| 可解释性 | 高(宪法原则) | 中 | 低 | 中 |
| 训练稳定性 | 高 | 中 | 高 | 高 |
| 安全性 | 高 | 中 | 中 | 中 |
| 实现复杂度 | 中 | 高 | 低 | 低 |

## Cross-refs
- [[ml/DPO.m[[knowledge/Design-Toolkit]]] — 直接偏好优化，对比
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 传统对齐方法
- [[ml/GRPO.m[[knowledge/Design-Toolkit]]] — DeepSeek强化学习优化
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 底层架构
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩
- [[analysis/AI-Alignment.m[[knowledge/Design-Toolkit]]] — AI对齐研究