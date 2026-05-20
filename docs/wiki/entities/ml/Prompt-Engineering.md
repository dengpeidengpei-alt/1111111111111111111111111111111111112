---
type: entity
category: ml
key: Prompt Engineering
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
stars: 4
---

# Prompt Engineering - 提示工程

## Overview

提示工程(Prompt Engineering)是优化LLM输入以获得期望输出的实践，包括**指令设计**、**上下文组织**和**输出格式化**。核心理念是通过精心设计的提示充分利用预训练大模型的能力。

### 三层定义

| 层级 | 内容 | 说明 |
|------|------|------|
| **指令设计** | 告诉模型"做什么" | 任务描述、约束条件、输出格式 |
| **上下文学习** | 提供完成任务所需的背景 | 示例、知识、参考资料 |
| **思维激发** | 引导模型进行特定推理 | Chain-of-Thought、Role等 |

### 与传统编程的对比

```
传统编程: 程序员 → 代码 → 计算机执行
Prompt工程: 人类 → 自然语言 → LLM理解执行

区别:
- 确定性语法 → 自然语言模糊性
- 编译时检查 → 运行时探索
- 精确匹配 → 语义理解
```

## Core Techniques

### 1. Zero-shot

无需任何示例，直接通过指令完成任务。适用于简单、明确的任务。

```python
# Zero-shot 例子
prompt = "将以下英文翻译为中文: Hello, how are you?"
response = llm.generate(prompt)  # "你好，你怎么样？"
```

**适用场景**:
- 简单分类（如情感判断）
- 基础翻译
- 格式转换
- 常见问答

**优点**: 无需示例，快速执行
**缺点**: 复杂任务表现不稳定

### 2. Few-shot (K-shot)

通过K个示例让模型学习模式。适用于复杂模式识别任务。

```python
# Few-shot 例子 - 情感分类
few_shot_prompt = """
情感分类示例:

文本: 这个电影太棒了！
标签: 正面

文本: 差评，完全浪费时间
标签: 负面

文本: 一般般吧
标签: 中性

文本: 简直无语了
标签: """
```

**示例数量选择**:

| K值 | 适用场景 | 注意事项 |
|-----|----------|----------|
| 1-3 | 简单模式 | 示例过多可能干扰 |
| 5-10 | 中等复杂度 | 注意示例多样性 |
| >10 | 高复杂度 | 考虑使用CoT |

### 3. Chain-of-Thought (CoT)

引导模型输出中间推理步骤，增强复杂推理能力。

```python
# Zero-shot CoT
cot_prompt = """
问题: 小明有50元，买了3本书，每本15元，还剩多少？

让我们一步步思考：
"""

# Few-shot CoT
cot_example = """
问题: 书店有100本书，卖出23本，又进货45本，现在有多少本？

解题:
1. 最初有100本书
2. 卖出23本，剩 100 - 23 = 77 本
3. 又进货45本，现在有 77 + 45 = 122 本

答案: 122本
"""
```

**触发方式**:
- 显式引导: "让我们一步步思考"
- 隐式引导: 使用分步骤符号(1. 2. 3.)
- 自洽性: 多路径采样 + 投票

### 4. Role Prompting

通过设定角色身份来调整输出风格和专业知识。

```python
# Role Prompting 例子
role_prompt = """
你是一位经验丰富的Python后端工程师，拥有10年开发经验。
你擅长写出高效、简洁、可维护的代码。
你总是遵循PEP 8规范，并注重代码可读性。

任务: 写一个快速排序函数
"""

response = llm.generate(role_prompt)
```

**常用角色模板**:
```
You are a [professio[[Self-Healing-Loop]] with [year[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] years of experience in [fiel[[knowledge/Design-Toolkit]].
You specialize in [specific area[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]].
Your communication style is [styl[[Self-Healing-Loop]].
```

### 5. System/User/Assistant 分割

利用消息角色分离不同功能：

```python
from anthropic import HumanMessage, SystemMessage, AssistantMessage

messages = [
    # System: 定义全局约束
    SystemMessage("你是一个专业的金融分析师，提供投资建议时必须包含风险提示"),

    # User: 用户输入
    HumanMessage("分析一下贵州茅台的估值"),

    # Assistant: 助手回复
    AssistantMessage("根据分析，贵州茅台当前估值偏高，建议谨慎..."),

    # 继续对话
    HumanMessage("那现在应该买入还是卖出？")
]
```

## 技巧对比表

| 技巧 | 适用场景 | 示例 | 优点 | 缺点 |
|------|----------|------|------|------|
| **Zero-shot** | 简单任务、通用场景 | "翻译: hello" | 快速、无需示例 | 复杂任务不稳定 |
| **Few-shot** | 复杂模式学习 | 3个例子学分类 | 模式学习准确 | 需人工设计示例 |
| **CoT** | 推理、逻辑任务 | "think step by step" | 推理过程透明 | 增加token消耗 |
| **Role** | 个性化输出 | "You are a doctor..." | 风格专业 | 可能过度表演 |
| **System分割** | 复杂对话管理 | 多轮对话 | 结构清晰 | prompt更长 |

## 代码示例

### Anthropic SDK 完整示例

```python
from anthropic import Anthropic

client = Anthropic()

# 多轮对话完整示例
messages = [
    # System: 全局设置
    SystemMessage("你是一个专业的Python程序员，遵循PEP 8规范，代码简洁高效"),

    # User: 第一轮输入
    HumanMessage("写一个快速排序函数"),

    # Assistant: 第一轮回复（包含代码和解释）
    AssistantMessage("""下面是一个快速排序实现：

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivo[[knowledge/Design-Toolkit]]
    middle = [x for x in arr if x == pivo[[knowledge/Design-Toolkit]]
    right = [x for x in arr if x > pivo[[knowledge/Design-Toolkit]]

    return quicksort(left) + middle + quicksort(right)
```

时间复杂度: O(n log n)
空间复杂度: O(n)
"""),

    # User: 第二轮追问
    HumanMessage("能优化一下空间复杂度吗？")
]

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    messages=messages
)

print(response.content[0].text)
```

### LangChain 集成示例

```python
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatAnthropic

# Chain-of-Thought Prompt Template
cot_template = """
问题: {question}

请按照以下步骤思考：
1. 理解问题核心
2. 分解关键要素
3. 逐步推理
4. 得出结论

解题过程：
"""

prompt = PromptTemplate(
    template=cot_template,
    input_variables=["question"]
)

chat = ChatAnthropic(model="claude-opus-4-5")
chain = prompt | chat

result = chain.invoke({"question": "什么是梯度下降？"})
```

### DSPy 风格优化示例

```python
# 声明式 Prompt 组合
class CodeHelper:
    def __init__(self):
        self.system = "你是一个Python专家，擅长写出简洁高效的代码"
        self.examples = [
            ("写一个求和函数", "def sum_list(lst): return sum(lst)"),
            ("写一个阶乘函数", "def factorial(n): return 1 if n <= 1 else n * factorial(n-1)")
       [[Self-Healing-Loop]]

    def generate(self, task):
        prompt = f"{self.system}\n\n"
        for q, a in self.examples:
            prompt += f"Q: {q}\nA: {a}\n\n"
        prompt += f"Q: {task}\nA:"
        return llm.generate(prompt)
```

## 高级技巧

### 1. 上下文窗口管理

```python
# 上下文压缩策略
def chunk_context(long_text, max_tokens=4000):
    """将长文本分割为适合上下文窗口的块"""
    chunks = [[Self-Healing-Loop]]
    current_chunk = [[Self-Healing-Loop]]

    for segment in long_text.split('\n'):
        if sum(len(t) for t in current_chunk) + len(segment) > max_tokens:
            chunks.append('\n'.join(current_chunk))
            current_chunk = [segmen[[knowledge/Design-Toolkit]]
        else:
            current_chunk.append(segment)

    if current_chunk:
        chunks.append('\n'.join(current_chunk))

    return chunks
```

### 2. 渐进式提示

```python
# 复杂任务分解
def solve_complex_task(task):
    # Step 1: 理解任务
    understanding = llm.generate(f"分析以下任务的核心要求: {task}")

    # Step 2: 规划步骤
    plan = llm.generate(f"根据'{understanding}'，制定执行计划")

    # Step 3: 分步执行
    result = llm.generate(f"任务: {task}\n计划: {plan}\n请执行计划")

    return result
```

### 3. 输出格式控制

```python
# 结构化输出
structured_prompt = """
请以JSON格式回答，字段包含:
- title: 文章标题
- summary: 摘要(100字内)
- keywords: 关键词(3-5个)
- sections: 章节列表

主题: {topic}
"""

response = llm.generate(structured_prompt)
# 输出: {"title": "...", "summary": "...", ...}
```

## 常见陷阱与解决方案

| 陷阱 | 表现 | 解决 |
|------|------|------|
| **指令冲突** | 模型行为不一致 | 明确优先级，使用[IMPORTANT]标记 |
| **示例偏差** | 泛化能力差 | 多样化示例，覆盖边界情况 |
| **上下文污染** | 信息混乱 | 清晰分段，使用<!-- separator --> |
| **角色漂移** | 输出偏离身份 | 在system中强化角色定义 |
| **过度约束** | 创造性受限 | 留有弹性空间 |

## 数学形式化

### 生成目标

给定输入x和模型参数θ，Prompt工程旨在最大化条件概率：

$$
P(y|x; \theta) = \prod_{t=1}^{T} P(y_t | x, y_{1:t-1}; \theta)
$$

### Few-shot条件概率

K-shot场景下，条件概率变为：

$$
P(y|x; \theta) = P(y|x, \{(x_i, y_i)\}_{i=1}^K; \theta)
$$

其中K个示例作为条件上下文。

### CoT推理概率

链式思维引入中间推理R：

$$
P(y|x) = \sum_{R} P(y|x, R) \cdot P(R|x)
$$

其中R = (r_1, r_2, ..., r_n)为推理步骤序列。

## 性能影响因素

### 模型规模效应

| 模型规模 | Zero-shot | Few-shot | CoT |
|----------|-----------|----------|-----|
| < 7B | 差 | 一般 | 有限提升 |
| 7B-13B | 尚可 | 好 | 显著提升 |
| 13B-70B | 好 | 很好 | 优秀 |
| > 70B | 优秀 | 极好 | 涌现 |

### 任务复杂度匹配

| 任务复杂度 | 推荐技巧 | 原因 |
|------------|----------|------|
| 简单分类 | Zero-shot | 无需示例，快速 |
| 模式识别 | Few-shot | 示例提供模式 |
| 多步推理 | CoT / ReAct | 中间步骤分解 |
| 开放生成 | Role Prompting | 风格控制 |

## Prompt调试流程

### 1. 隔离测试

```python
def debug_prompt(prompt, test_cases):
    """隔离测试：固定模型，只变prompt"""
    results = [[Self-Healing-Loop]]
    for case in test_cases:
        # 每次只改变prompt的一个元素
        response = llm.generate(prompt, case.input)
        results.append({
            "input": case.input,
            "output": response,
            "expected": case.expected,
            "match": response == case.expected
        })
    return results
```

### 2. 逐步迭代

```python
def iterative_refine(prompt, test_cases, max_iter=10):
    """迭代优化prompt"""
    for i in range(max_iter):
        results = test(prompt, test_cases)

        # 分析失败案例
        failures = [r for r in results if not r["match"]]
        if not failures:
            return prompt

        # 识别模式
        pattern = analyze_failures(failures)

        # 针对性修改
        prompt = refine(prompt, pattern)

    return prompt
```

### 3. A/B测试

```python
def ab_test(prompt_a, prompt_b, test_cases, n=5):
    """A/B测试比较两个prompt"""
    scores_a = [[Self-Healing-Loop]]
    scores_b = [[Self-Healing-Loop]]

    for _ in range(n):
        # 随机打乱测试顺序
        shuffled = shuffle(test_cases)

        # 各测试一半
        for case in shuffled[:len(shuffled)//2]:
            scores_a.append(evaluate(llm.generate(prompt_a, case)))
        for case in shuffled[len(shuffled)//2:]:
            scores_b.append(evaluate(llm.generate(prompt_b, case)))

    return {
        "prompt_a_avg": mean(scores_a),
        "prompt_b_avg": mean(scores_b),
        "winner": "A" if mean(scores_a) > mean(scores_b) else "B"
    }
```

## 高级模式

### 1. 思维骨架 (Skeleton-of-Thought)

```python
def skeleton_prompt(topic):
    """先生成大纲，再填充内容"""
    skeleton = llm.generate(f"""
主题: {topic}

请列出文章大纲（仅标题，不要详细展开）：
1. """)
    # 再逐节生成
    content = [[Self-Healing-Loop]]
    for heading in skeleton.split('\n'):
        if heading.strip().startswith(('1.', '2.', '3.', '4.', '5.')):
            section = llm.generate(f"请详细展开: {heading}")
            content.append(section)
    return '\n\n'.join(content)
```

### 2. 反思提示 (Reflexion)

```python
def reflexion_prompt(task, attempt):
    """让模型反思自己的回答"""
    return f"""
任务: {task}

你的回答: {attempt}

请反思：
1. 回答中是否有错误或疏漏？
2. 有什么可以改进的地方？
3. 如果重新回答，你会怎么做？

改进后的回答：
"""
```

### 3. 分解-执行-整合 (Decompose)

```python
def decompose_prompt(task):
    """复杂任务分解为子任务"""
    plan = llm.generate(f"""
任务: {task}

请将任务分解为3-5个步骤，并说明每个步骤的具体内容。

步骤：
""")

    results = [[Self-Healing-Loop]]
    for step in parse_steps(plan):
        result = llm.generate(f"执行步骤: {step}")
        results.append(result)

    return llm.generate(f"""
原始任务: {task}
各步骤结果: {results}

请综合以上结果，给出完整答案。
""")
```

## 上下文工程

### 1. 上下文压缩

```python
class SemanticCompressor:
    """语义压缩：保留关键信息，去除冗余"""

    def compress(self, context, query, max_tokens=4000):
        # 识别与query相关的片段
        relevant = self.extract_relevant(context, query)

        # 合并相似片段
        merged = self.merge_similar(relevant)

        # 截断到限制
        return self.truncate(merged, max_tokens)

    def extract_relevant(self, context, query):
        """用嵌入相似度判断相关性"""
        context_emb = embed(context)
        query_emb = embed(query)
        similarity = cosine(context_emb, query_emb)
        return context if similarity > threshold else ""
```

### 2. 动态上下文

```python
class DynamicContext:
    """根据任务动态调整上下文"""

    def build_context(self, task):
        if task.type == "reasoning":
            return self.build_reasoning_context(task)
        elif task.type == "generation":
            return self.build_generation_context(task)
        elif task.type == "extraction":
            return self.build_extraction_context(task)

    def build_reasoning_context(self, task):
        # 推理任务需要更多背景和示例
        return {
            "examples": self.get_similar_examples(task, n=5),
            "background": self.get_related_knowledge(task),
            "constraints": task.constraints
        }
```

## Cross-refs

- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — CoT是Prompt工程的核心技巧，推理链提示
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 声明式Prompt优化框架，自动编译最优提示组合
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — 底层架构，注意力机制决定prompt效果
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 推理+行动模式，动态调整prompt策略
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — RAG场景下的Prompt工程最佳实践
- [[ml/RLHF.m[[knowledge/Design-Toolkit]]] — 对齐训练影响基础prompt效果
- [[ml/LoRA.m[[knowledge/Design-Toolkit]]] — 低秩适配可针对特定prompt风格微调

## 资源

- **论文**: "Prompt Engineering Guide" (arXiv:2303.11366)
- **GitHub**: NirDiamant/Prompt_Engineering (22种技术)
- **Google**: OPRO (Optimization by Prompting)
- **Stanford**: Meta-Prompting