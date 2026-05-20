---
type: entity
category: infrastructure
key: AI-Foundry
source: Claude-Evo research
date: 2026-05-20
---

# AI-Foundry - 模型开发与部署平台

## Overview

微软Azure AI Foundry（原Azure Machine Learning）的核心定位：端到端AI应用开发平台。涵盖模型发现、微调、部署、评估、监控全流程。与OpenAI服务深度集成，支持企业级LLM应用开发。

**核心能力**:
- 模型目录 (OpenAI、Phi、Llama等)
- 微调训练 (LoRA、PEFT)
- 部署推理 (Serverless/Managed)
- 安全合规 (RAG、Content Filtering)
- 成本分析 (Token使用追踪)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Foundry Portal                         │
│              (Web UI / SDK / CLI)                           │
├─────────────────────────────────────────────────────────────┤
│                   AI Foundry SDK                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Model Hub   │  │  Training   │  │  Inference  │        │
│  │ (Discover)  │  │ (Fine-tune) │  │  (Deploy)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                   Azure AI Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Azure OpenAI│  │ Azure ML    │  │ Azure AI     │        │
│  │ Service     │  │ Compute     │  │ Search       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                 Responsible AI Tools                        │
│         (Content Safety / Fairness / Interpretability)     │
└─────────────────────────────────────────────────────────────┘
```

## SDK Usage

```python
# Azure AI Foundry SDK
from azure.ai import foundry
from azure.identity import DefaultAzureCredential

# 初始化客户端
client = foundry.LeanAgentClient(
    subscription_id="<subscription>",
    resource_group="<resource_group>",
    project_name="<project>",
    credential=DefaultAzureCredential()
)

# 列出可用模型
models = client.models.list()
for model in models:
    print(f"{model.name} - {model.version}")

# 部署模型
deployment = client.deployments.create_or_update(
    model="gpt-4o",
    scale_type="standard",
    max_tokens=4096
)
```

## Model Fine-tuning

```python
# LoRA微调
from azure.ai.ml import MLClient
from azure.ai.ml.dsl import pipeline

# 配置训练作业
training_job = client.jobs.create(
    display_name="llama-finetune",
    experiment_name="llm-finetuning",
    compute="gpu-cluster",
    inputs={
        "train_data": "azureml://datastores/data/inputs/train.jsonl",
        "val_data": "azureml://datastores/data/inputs/val.jsonl"
    },
    outputs={
        "model": "azureml://datastores/model/outputs/llama-7b-lora"
    },
    code="train.py",
    command="python train.py \
        --model meta-llama/Llama-2-7b-chat-hf \
        --dataset train.jsonl \
        --lora-r 16 \
        --lora-alpha 32 \
        --epochs 3 \
        --batch-size 4"
)
```

## Deployment Patterns

### Serverless Deployment (OpenAI Models)

```python
# 使用OpenAI兼容API
client = OpenAIClient(
    endpoint="https://<resource>.openai.azure.com",
    credential=DefaultAzureCredential()
)

# 调用部署的模型
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello"}
   [[Self-Healing-Loop]]
)
```

### Managed Online Endpoint

```python
# 创建在线端点
endpoint = client.online_endpoints.create(
    name="llm-endpoint",
    compute_type="managed",
    scale_settings=ScaleSettings(
        scale_type="auto",
        min_instances=0,
        max_instances=3
    )
)

# 部署微调模型
deployment = client.online_deployments.create(
    name="llama-deployment",
    endpoint_name=endpoint.name,
    model="azureml://models/llama-7b-lora/versions/1",
    instance_type="Standard_NC24s_v3",
    min_instances=1,
    max_instances=3
)
```

## RAG Integration

```python
# Azure AI Search (RAG后端)
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

search_client = SearchClient(
    endpoint="https://<search>.search.windows.net",
    index_name="knowledge-base",
    credential=AzureKeyCredential("<key>")
)

# RAG流程
query = "What is the company policy on remote work?"
results = search_client.search(query, top=5)

context = "\n".join([r['content'] for r in result[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]])

prompt = f"""Based on the following context, answer the question.
Context: {context}
Question: {query}
Answer:"""
```

## CLI Commands

```bash
# 安装Foundry CLI
az extension add --name ml

# 登录
az ml folder attach -w <workspace> -g <resource_group>

# 训练作业
az ml job create -f train.yml

# 模型管理
az ml model list
az ml model show --name llama-7b --version 1

# 部署
az ml online-endpoint create -f endpoint.yml
az ml online-deployment create -f deployment.yml

# 查看资源
az ml workspace show
az ml compute list
```

## Cost Management

```bash
# 查看使用情况
az ml job list --query "[[Self-Healing-Loop]].{Name:name, Status:status, Duration:duration}"

# 设置成本警报
az ml workspace update --set quota.category=Dataset
```

| Resource | 估算成本 |
|----------|----------|
| GPT-4o API | $0.01/1K tokens (input) |
| GPT-4o-mini API | $0.00015/1K tokens (input) |
| NC24s_v3 (A100) | ~$3.5/小时 |
| Managed Endpoint | $0.10/小时 (空转) |

## Cross-refs

- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — MCP协议在AI-Foundry中的应用
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — RAG模式集成
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 本地替代方案
- [[infrastructure/vLLM.m[[knowledge/Design-Toolkit]]] — 开源推理引擎对比