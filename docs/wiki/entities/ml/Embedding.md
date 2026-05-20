---
type: entity
category: ml
key: Embedding
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
---

# Embedding - 文本向量化表示

## Overview
- **本质**: 将文本转换为稠密向量 (dense vector)
- **目的**: 捕捉语义信息，支持相似度计算
- **核心**: 表示学习 (Representation Learning)

## 核心模型

### 1. Word2Vec
- **机构**: Google (Mikolov et al., 2013)
- **方法**: Skip-gram / CBOW
- **特点**: 词级别嵌入，静态表示

```python
from gensim.models import Word2Vec

sentences = [["word", "embedding"], ["dense", "vector"]]
model = Word2Vec(sentences, vector_size=100, window=5, min_count=1)
vec = model.wv["word"]
```

### 2. BERT Embedding
- **机构**: Google (Devlin et al., 2018)
- **方法**: 上下文感知的动态表示
- **输出**: [CL[[Self-Healing-Loop]] token 或 最后一层 hidden states

```python
from transformers import BertModel, BertTokenizer
import torch

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

inputs = tokenizer("text", return_tensors="pt")
outputs = model(**inputs)
embedding = outputs.last_hidden_state[:, 0, :]  # [CL[[Self-Healing-Loop]] token
```

### 3. OpenAI Embedding
- **模型**: text-embedding-3-large / text-embedding-3-small
- **维度**: 3072 / 1536 / 256
- **特点**: API调用，支持多种维度

```python
from openai import OpenAI

client = OpenAI()
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="text to embed"
)
embedding = response.data[0].embedding
```

### 4. BGE (BAAI)
- **机构**: BAAI (Beijing Academy of Artificial Intelligence)
- **模型**: bge-large / bge-small / bge-base
- **特点**: 中英双语，支持MRL (Matryoshka Representation Learning)

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('BAAI/bge-small')
embedding = model.encode("text to embed", normalize_embeddings=True)
```

## 模型对比

| 模型 | 维度 | 上下文 | 适用场景 |
|------|------|--------|----------|
| Word2Vec | 100-300 | 词级 | 简单语义 |
| BERT | 768-1024 | 512 tokens | 细粒度任务 |
| OpenAI | 256-3072 | 8K tokens | 生产环境 |
| BGE | 1024 | 512 tokens | 中英双语 |

## 代码示例

### 基础 Embedding 流程
```python
from sentence_transformers import SentenceTransformer

# 加载模型
model = SentenceTransformer('BAAI/bge-small')

# 单条文本
embedding = model.encode("What is embedding?")
print(f"Shape: {embedding.shape}")  # (384,)

# 批量处理
texts = ["text1", "text2", "text3"]
embeddings = model.encode(texts)
print(f"Shape: {embeddings.shape}")  # (3, 384)
```

### 相似度计算
```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer('BAAI/bge-small')

vec_a = model.encode("machine learning")
vec_b = model.encode("deep learning")
vec_c = model.encode("cooking recipe")

# 余弦相似度
sim_ab = cosine_similarity([vec_[[Self-Healing-Loop]], [vec_b])[0][0]
sim_ac = cosine_similarity([vec_[[Self-Healing-Loop]], [vec_c])[0][0]

print(f"ML vs DL: {sim_ab:.4f}")  # 高相似度
print(f"ML vs Recipe: {sim_ac:.4f}")  # 低相似度
```

## Cross-refs
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — Embedding是RAG检索的基础
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 向量存储用于AI记忆
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 向量检索与知识图谱互补
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — Embedding层是Transformer输入
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Embedding驱动智能检索