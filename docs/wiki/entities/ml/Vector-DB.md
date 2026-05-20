---
type: entity
category: ml
key: Vector DB (Vector Database)
source: Claude-Evo ML research
date: 2026-05-20
layer: 4.0
---

# Vector DB - 向量数据库

## Overview
- **本质**: 存储和检索高维向量的数据库
- **核心能力**: 近似最近邻搜索 (ANN - Approximate Nearest Neighbor)
- **应用**: RAG、推荐系统、语义搜索

## 主流产品

### 1. ChromaDB
- **类型**: 轻量级嵌入式向量数据库
- **特点**: 开源、API简洁、开发友好
- **适用**: 原型、小规模应用

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("documents")

# 添加向量
collection.add(
    embeddings=[[0.1, 0.2, ...], [0.3, 0.4, ...]],
    ids=["doc1", "doc2"],
    documents=["text content 1", "text content 2"]
)

# 检索
results = collection.query(
    query_embeddings=,
    n_results=2
)
```

### 2. Qdrant
- **类型**: 高性能向量数据库
- **特点**: Rust实现、过滤支持、集群模式
- **适用**: 生产环境、中大规模

```python
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)
client.add(
    collection_name="my_collection",
    vectors={"vector": [0.1, 0.2, ...]},
    ids=[1, 2]
)

results = client.search(
    collection_name="my_collection",
    query_vector=[0.1, 0.2, ...],
    limit=5
)
```

### 3. Milvus
- **类型**: 大规模分布式向量数据库
- **特点**: Zilliz云服务、十亿级向量
- **适用**: 超大规模检索

```python
from pymilvus import connections, Collection

connections.connect("default", host="localhost", port="19530")
collection = Collection("my_collection")
collection.load()

results = collection.search(
    data=,
    anns_field="vector_field",
    param={"metric_type": "IP", "params": {"nprobe": 10}},
    limit=10
)
```

### 4. Pinecone
- **类型**: 云原生向量数据库
- **特点**: 完全托管、无服务器、实时索引
- **适用**: 企业级应用

```python
import pinecone

pinecone.init(api_key="your-key", environment="us-west1")
index = pinecone.Index("my-index")

# 插入
index.upsert([
    ("id1", [0.1, 0.2, ...], {"metadata": "value"}),
    ("id2", [0.3, 0.4, ...], {"metadata": "value2"})
])

# 检索
results = index.query(
    vector=[0.1, 0.2, ...],
    top_k=10,
    include_metadata=True
)
```

## 索引算法

| 算法 | 复杂度 | 精度 | 适用规模 |
|------|--------|------|----------|
| HNSW | O(log N) | 高 | 中等规模 |
| IVF (Inverted Index) | O(log N) | 中 | 大规模 |
| PQ (Product Quantization) | O(1) | 低-中 | 超大规模 |
| DiskANN | O(log N) | 高 | 十亿级 |

## 代码示例

### 基础 RAG 流程
```python
import chromadb
from sentence_transformers import SentenceTransformer

# 1. 初始化
model = SentenceTransformer('BAAI/bge-small')
client = chromadb.Client()
collection = client.create_collection("rag_knowledge")

# 2. 存储文档
documents = [
    "Python is a programming language",
    "Machine learning is a subset of AI",
    "RAG combines retrieval and generation"
]

embeddings = model.encode(documents)
collection.add(
    embeddings=embeddings.tolist(),
    ids=["doc1", "doc2", "doc3"],
    documents=documents
)

# 3. 检索
query = "What is Python?"
query_vec = model.encode(query)
results = collection.query(
    query_embeddings=[query_vec.tolist()],
    n_results=1
)

print(results["documents"][0])  # 最相关文档
```

### 元数据过滤
```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("filtered_docs")

# 添加带元数据的向量
collection.add(
    embeddings=[[0.1, 0.2], [0.3, 0.4]],
    ids=["doc1", "doc2"],
    documents=["Python guide", "ML guide"],
    metadatas=[
        {"category": "programming", "version": "1"},
        {"category": "ai", "version": "2"}
   [[Self-Healing-Loop]]
)

# 元数据过滤查询
results = collection.query(
    query_embeddings=[[0.1, 0.2]],
    where={"category": "programming"},  # 过滤条件
    n_results=1
)
```

## Cross-refs
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — Vector DB是RAG的存储基础设施
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 向量存储实现AI记忆
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 向量检索与知识图谱互补
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — Vector DB存储Embedding向量
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — 智能选择检索策略