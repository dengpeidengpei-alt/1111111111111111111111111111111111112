---
type: entity
category: knowledge
key: Function Calling & Tool Use
source: Claude-Evo
date: 2026-05-20
---

# Function Calling & Tool Use

**学习时间**: 2026-05-20 19:35
**来源**: 互联网搜索

---

## 什么是Function Calling

让大语言模型从"只会输出文本"变成"能调用外部系统"

**核心**: 模型输出结构化函数调用请求，应用程序执行并将结果回传

---

## 三步骤工作流

### 1. 定义工具 (Declaration)
用 JSON Schema 描述工具:

```json
{
  "name": "get_weather",
  "description": "获取指定城市的天气",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {"type": "string", "description": "城市名称"}
    },
    "required": ["city"]
  }
}
```

### 2. 模型决策 (Selection)
模型判断是否需要调用工具，生成调用请求

### 3. 执行与返回 (Execution & Feedback)
应用程序执行函数，结果返回给模型继续生成

---

## 主流模型支持

| 模型 | 支持情况 |
|------|----------|
| OpenAI GPT-4 | ✅ 原生支持 |
| Claude | ✅ 原生支持 |
| DeepSeek | ✅ 原生支持 |
| Gemini | ✅ 原生支持 |

---

## Function Calling vs Prompt模板

| 方法 | 优点 | 缺点 |
|------|------|------|
| Function Calling | 结构化，可靠 | 需模型支持 |
| Prompt模板 | 通用 | 依赖Prompt质量 |

---

## 最佳实践

1. **工具名要直观** - 名称即功能
2. **描述要清楚** - 说明"什么时候用"
3. **参数少而准** - 减少模型判断负担
4. **结果要完整** - 反馈给模型继续推理

---

## 与ReAct的关系

Function Calling是ReAct的基础设施：
```
ReAct = Reasoning + Acting
       ↓
Function Calling = 工具调用能力
```

---

## Cross-refs

- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — Agentic工作流与RAG
- [[knowledge/AI-Agent-Trends-2025.m[[knowledge/Design-Toolkit]]] — AI Agent六大趋势
- [[knowledge/Self-Improving-Agent-Patterns.m[[knowledge/Design-Toolkit]]] — 自改进Agent模式