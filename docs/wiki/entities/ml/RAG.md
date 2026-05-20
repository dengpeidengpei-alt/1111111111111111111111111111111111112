---
type: entity
category: ml
key: RAG (Retrieval-Augmented Generation)
source: Claude-Evo research
date: 2026-05-14
layer: 4.0
---

# RAG - 检索增强生成

## Overview
- **全称**: Retrieval-Augmented Generation
- **本质**: 将检索与生成结合的架构
- **核心问题**: LLM知识过时/幻觉，RAG通过实时检索解决

## 发展历程

| 时代 | 特点 | 代表 |
|------|------|------|
| 1.0 | Naive RAG | 简单向量检索 |
| 2.0 | Advanced RAG | 预处理优化 |
| 3.0 | Modular RAG | 模块化组合 |
| 3.0 | Agentic RAG | LLM参与检索决策 |

## 核心架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAG 流程                                 │
└─────────────────────────────────────────────────────────────────┘

    用户查询
        │
        ▼
┌───────────────┐
│   检索模块    │ ← 向量数据库
│  (Retrieve)   │
└───────────────┘
        │
        ▼
┌───────────────┐
│   增强模块    │ ← 上下文组装
│   (Rerank)   │
└───────────────┘
        │
        ▼
┌───────────────┐
│   生成模块    │
│   (Generate)  │
└───────────────┘
        │
        ▼
     回答
```

## 关键技术

### 1. 检索策略

| 策略 | 方法 | 适用场景 |
|------|------|----------|
| Dense Retrieval | 向量相似度 | 语义匹配 |
| Sparse Retrieval | BM25 | 关键词精确 |
| Hybrid | 混合两者 | 通用场景 |
| Graph Retrieval | 实体关系 | 复杂推理 |

### 2. 索引方法

| 方法 | 说明 | 代表 |
|------|------|------|
| Chunking | 分块策略 | 滑动窗口 |
| Embedding | 向量化 | OpenAI/Cohere |
| Indexing | 索引结构 | HNSW/IVF |

### 3. 生成优化

| 技术 | 作用 |
|------|------|
| Rerank | 重新排序检索结果 |
| Compress | 上下文压缩 |
| Corrective RAG | 自我修正检索 |

## 主要RAG变体

### Graph RAG
- 利用知识图谱结构
- 提升多跳推理能力
- 适用于复杂问答

### Agentic RAG
- LLM作为Agent决定检索策略
- 动态选择检索时机
- 支持多轮对话

### Self-RAG
- 自我反思生成内容
- 判断是否需要检索
- 减少不必要检索

### FLARE (Forward-Looking Active Retrieval)
- 主动预测下一步检索
- 迭代式增强生成
- 适合长文本生成

### EraRAG
- 增量更新索引
- 支持动态知识库
- 高效处理增长数据

## Advanced RAG 模式

### Pre-Retrieval（检索前优化）

#### Query 改写 (Query Rewriting)
将用户原始 query 转换为更利于检索的形式：

| 方法 | 说明 | 适用场景 |
|------|------|----------|
| HyDE | 让 LLM 生成假设性回答，再用它检索 | 模糊查询 |
| Query Decomposition | 拆分为多个子查询 | 复杂多跳问题 |
| Query Expansion | 同义词/上下文扩展 | 语义不明确 |
| Step-back Prompting | 抽象到更高层次概念 | 需要背景知识 |

```python
class QueryRewriter:
    """Query 改写器 - 将用户 query 转换为最佳检索形式"""
    
    def rewrite(self, query: str, mode: str = "hyde") -> str:
        if mode == "hyde":
            # HyDE: 生成假设性回答引导检索
            hypothetical = self.llm.generate(
                f"Given this question, write a hypothetical answer:\n{query}"
            )
            return f"{query}\n\n{hypothetical}"
        
        elif mode == "decompose":
            # Query Decomposition: 拆分为子查询
            sub_queries = self.llm.generate(
                f"Break down into independent sub-questions:\n{query}"
            ).split("\n")
            return sub_queries  # 返回多个查询
        
        elif mode == "expand":
            # Query Expansion: 同义词扩展
            expanded = self.llm.generate(
                f"Expand with synonyms and related concepts:\n{query}"
            )
            return expanded
        
        return query
```

#### Query Routing
根据 query 类型选择不同检索策略：

```python
class QueryRouter:
    """智能路由 - 根据 query 类型选择策略"""
    
    def route(self, query: str) -> str:
        intent = self.classifier.classify(query)
        
        if intent == "factual":
            return "dense"  # 事实性问题用向量检索
        elif intent == "keyword":
            return "sparse"  # 关键词问题用 BM25
        elif intent == "complex":
            return "hybrid"  # 复杂问题用混合检索
        elif intent == "graph":
            return "knowledge_graph"  # 图相关问题用知识图谱
```

### Post-Retrieval（检索后优化）

#### 重排序 (Reranking)
对初始检索结果进行二次排序：

```python
class Reranker:
    """重排序器 - 使用交叉编码器或 LLM 进行结果重排"""
    
    def rerank(self, query: str, docs: list[Documen[[knowledge/Design-Toolkit]], top_k: int = 10) -> list[Documen[[knowledge/Design-Toolkit]]:
        # 方法1: Cross-Encoder（精确但慢）
        scores = self.cross_encoder.predict([
            (query, doc.content) for doc in docs
       [[Self-Healing-Loop]])
        
        # 方法2: Cohere/Rerank API（效果好）
        results = self.cohere_rerank.rank(
            query=query,
            documents=[d.content for d in doc[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]],
            top_n=top_k
        )
        
        # 方法3: LLM-as-Judge（可解释性强）
        scored_docs = [[Self-Healing-Loop]]
        for doc in docs:
            score = self.llm.evaluate(
                f"Query: {query}\nDoc: {doc.content}\n"
                f"Rate relevance 1-5:"
            )
            scored_docs.append((score, doc))
        
        return sorted(scored_docs, key=lambda x: x[0], reverse=True)[:top_k]
```

#### 上下文压缩 (Context Compression)
压缩检索上下文，去除冗余信息：

| 方法 | 说明 | 实现 |
|------|------|------|
| LLM Compactor | 用 LLM 总结关键信息 | Recomp |
| Token-based | 按 token 数截断/压缩 | CC |
| Relevance filtering | 只保留相关段落 | Selective Context |
| Chain of density | 迭代式浓缩 | CD |

```python
class ContextCompressor:
    """上下文压缩器 - 减少无关信息"""
    
    def compress(self, query: str, context: str, method: str = "recomp") -> str:
        if method == "recomp":
            # Recomp: 提取+压缩
            relevant = self extractor.extract(context, query)  # 选择相关部分
            compressed = self.llm.summarize(
                f"Compress to key points:\n{relevant}"
            )
            return compressed
        
        elif method == "selective":
            # Selective Context: 基于词频过滤
            keywords = self.extract_keywords(query)
            sentences = context.split("\n")
            relevant = [s for s in sentences if any(k in s for k in keywords)]
            return "\n".join(relevant)
        
        elif method == "llmlingua":
            # LLMlingua: 紧凑化
            return self.llmlingua.compress(context, query, ratio=0.5)
        
        return context
```

#### 查询感知的上下文压缩
```python
class QueryAwareCompressor:
    """查询感知压缩 - 根据 query 动态调整"""
    
    def compress(self, query: str, docs: list[Documen[[knowledge/Design-Toolkit]]) -> list[Documen[[knowledge/Design-Toolkit]]:
        # 1. 识别 query 中的实体和关系
        entities = self.extract_entities(query)
        
        # 2. 只保留包含这些实体的句子
        compressed = [[Self-Healing-Loop]]
        for doc in docs:
            filtered = self.filter_sentences(doc.content, entities)
            if filtered:
                compressed.append(doc.with_content(filtered))
        
        # 3. 进一步压缩到预算内
        budget = self.calculate_budget(query, self.llm.context_window)
        return [self.trim_to_budget(c, budget) for c in compresse[[knowledge/Design-Toolkit]]
```

## RAG 评估框架

### RAGAS (RAG Assessment)

| 指标 | 说明 | 评估方式 |
|------|------|----------|
| Faithfulness | 生成答案是否忠实于检索上下文 | 幻觉检测 |
| Answer Relevance | 答案是否切题 | 与 query 相关性 |
| Context Relevance | 检索上下文是否相关 | 摘要匹配 |
| Context Precision | 相关块排序是否正确 | 加权召回 |
| Context Recall | 是否检索到所有必要信息 | 与 ground truth 比较 |

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness, answer_relevance, 
    context_relevity, context_precision
)

# RAGAS 评估
result = evaluate(
    dataset=test_dataset,
    metrics=[
        faithfulness,
        answer_relevance,
        context_relevity,
   [[Self-Healing-Loop]]
)
```

### TruLens

```python
from trulens_eval import Feedback, TruLensApp
from trulens_eval.feedback import Groundedness

# 定义反馈函数
groundedness = Feedback(Groundedness()).on(
    context=Select.Record.app.contexts,
    response=Select.Record.app.completions
)

# 评估
tru = TruLensApp(rag_app, [groundednes[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]])
tru.run()
```

### 其他评估工具

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| RAGAS | 轻量级、快速 | 迭代开发 |
| TruLens | 深度可观测 | 生产监控 |
|ARES | 自动评估 | 少标注数据 |
|Brief | 简化评估 | 快速验证 |
| Upwork | 人工标注 | 高精度需求 |

### 评估指标详解

```
Faithfulness 计算:
1. 给定 context 和 response
2. 提取 response 中的所有事实claims
3. 检查每个 claim 是否能被 context 支撑
4. Faithfulness = 支撑的 claims / 总 claims

Answer Relevance 计算:
1. 生成多个 paraphrase questions
2. 计算 response 与每个 question 的相似度
3. 取平均（惩罚过长/过短答案）

Context Relevance 计算:
1. 识别 context 中与 query 相关的 sentences
2. Context Relevance = 相关 sentences / 总 sentences
```

## 生产级 RAG 架构

```python
class ProductionRAG:
    """生产级 RAG 系统"""
    
    def __init__(self):
        # Pre-retrieval
        self.query_rewriter = QueryRewriter()
        self.query_router = QueryRouter()
        
        # Retrieval
        self.vector_db = VectorDB()
        self.bm25_index = BM25Index()
        self.kg_retriever = KnowledgeGraphRetriever()
        
        # Post-retrieval
        self.reranker = Reranker()
        self.compressor = ContextCompressor()
        
        # Generation
        self.llm = LLM()
    
    def retrieve(self, query: str, mode: str = "auto") -> list[Documen[[knowledge/Design-Toolkit]]:
        # Step 1: Query 改写
        rewritten_query = self.query_rewriter.rewrite(query)
        
        # Step 2: 路由选择
        retrieval_mode = self.query_router.route(query) if mode == "auto" else mode
        
        # Step 3: 多路检索
        results = [[Self-Healing-Loop]]
        if retrieval_mode in ["dense", "hybrid"]:
            results.extend(self.vector_db.search(rewritten_query))
        if retrieval_mode in ["sparse", "hybrid"]:
            results.extend(self.bm25_index.search(rewritten_query))
        if retrieval_mode == "knowledge_graph":
            results.extend(self.kg_retriever.search(query))
        
        # Step 4: 重排序
        reranked = self.reranker.rerank(query, results)
        
        # Step 5: 上下文压缩
        compressed = self.compressor.compress(query, reranked)
        
        return compressed
    
    def generate(self, query: str, context: list[Documen[[knowledge/Design-Toolkit]]) -> str:
        context_str = self.format_context(context)
        
        prompt = f"""Use the following context to answer the question.
If the answer is not in the context, say "I don't know."

Context:
{context_str}

Question: {query}

Answer:"""
        
        return self.llm.generate(prompt)
    
    def run(self, query: str) -> str:
        context = self.retrieve(query)
        return self.generate(query, context)
```

## RAG 优化技巧

### Chunking 策略

| 策略 | 实现 | 适用场景 |
|------|------|----------|
| 固定窗口 | 按 token 数切分 | 通用 |
| 句子分割 | 按句号/换行切分 | 短答案 |
| 语义分块 | 按主题变化切分 | 长文本 |
| 递归分块 | 多级粒度切分 | 复杂文档 |
| 基于实体 | 按实体边界切分 | 结构化文档 |

```python
class SemanticChunker:
    """语义分块器"""
    
    def chunk(self, text: str, max_tokens: int = 512, overlap: int = 50) -> list[st[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]:
        # 1. 句子分割
        sentences = self.sentencizer.split(text)
        
        # 2. 递归合并形成块
        chunks = [[Self-Healing-Loop]]
        current_chunk = [[Self-Healing-Loop]]
        current_tokens = 0
        
        for sent in sentences:
            sent_tokens = self.count_tokens(sent)
            if current_tokens + sent_tokens > max_tokens:
                if current_chunk:
                    chunks.append("\n".join(current_chunk))
                # 保持 overlap
                current_chunk = current_chunk[-2:] if overlap else [[Self-Healing-Loop]]
                current_tokens = sum(self.count_tokens(s) for s in current_chunk)
            
            current_chunk.append(sent)
            current_tokens += sent_tokens
        
        if current_chunk:
            chunks.append("\n".join(current_chunk))
        
        return chunks
```

### 混合检索实现

```python
class HybridRetriever:
    """混合检索器 - 结合向量和关键词检索"""
    
    def __init__(self, vector_weight: float = 0.7):
        self.vector_weight = vector_weight
        self.dense_retriever = DenseRetriever()
        self.sparse_retriever = SparseRetriever()
    
    def retrieve(self, query: str, k: int = 20) -> list[tuple[Document, floa[[knowledge/Design-Toolkit]]]:
        # 并行执行两种检索
        dense_results = self.dense_retriever.search(query, k * 2)
        sparse_results = self.sparse_retriever.search(query, k * 2)
        
        # RRFS (Reciprocal Rank Fusion) 融合
        scores = defaultdict(float)
        for rank, (doc, _) in enumerate(dense_results):
            scores[doc.i[[knowledge/Design-Toolkit]] += 1 / (rank + 60) * self.vector_weight
        for rank, (doc, _) in enumerate(sparse_results):
            scores[doc.i[[knowledge/Design-Toolkit]] += 1 / (rank + 60) * (1 - self.vector_weight)
        
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [(self.get_doc(doc_id), score) for doc_id, score in sorted_docs[:k]]
```

## Key Papers

| Paper | arXiv | 贡献 |
|-------|-------|------|
| LightRAG | 2410.05779 | 简化流程，提升速度 |
| Graph RAG | 2408.08921 | 图结构RAG综述 |
| FLARE | 2305.06983 | 主动迭代检索 |
| EraRAG | - | 增量检索 |
| PathRAG | 2502.14902 | 图剪枝RAG |
| HyDE | 2212.10496 | 假设性文档引导检索 |
| Recomp | 2310.04425 | 上下文压缩 |
| Selective Context | 2310.02421 | 词频过滤压缩 |

## Cross-refs

- [[ml/Self-RAG.m[[knowledge/Design-Toolkit]]] — 自我反思RAG，判断何时需要检索 ★★★★☆
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent驱动RAG，动态选择检索策略 ★★★★☆
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 向量表示，RAG的检索基础 ★★★★☆
- [[ml/Vector-DB.m[[knowledge/Design-Toolkit]]] — 向量数据库，RAG的核心存储 ★★★★☆
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 知识图谱，图结构检索 ★★★★☆
- [[ml/DSPy.m[[knowledge/Design-Toolkit]]] — 声明式编程，可编译优化RAG ★★★★★
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — Agent推理框架，可与RAG结合 ★★★★☆
- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — 推理链提示，增强生成质量 ★★★★☆
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — AI记忆层，长期记忆检索 ★★★★☆
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 生成模型，RAG的生成组件