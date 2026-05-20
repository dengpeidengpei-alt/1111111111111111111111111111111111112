---
type: entity
category: research
key: AI Understanding Tensions
source: Claude-Evo research
date: 2026-05-20
---

# AI Understanding Tensions - AI理解张力

## Key Tensions

### Scaling vs Efficiency
- **Tension**: Larger models are more capable but cost more to deploy
- **Resolution**: Distillation, quantization, pruning
- **Evidence**: LLaMA, GPT-4 turbo, FlashAttention

### Memory vs Context
- **Tension**: Longer context needs more memory, but memory is limited
- **Resolution**: Sparse attention, rolling cache, selective memory
- **Evidence**: Longformer sliding window, Mem0 retrieval

### Alignment vs Capability
- **Tension**: Over-alignment makes model conservative, losing capability
- **Resolution**: Constitutional AI finds balance
- **Evidence**: Claude vs early GPT

## Cross-refs
- [[ml/Model-Compression.m[[knowledge/Design-Toolkit]]] — 模型压缩
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 记忆层
- Claude-Work/understanding_graph.json