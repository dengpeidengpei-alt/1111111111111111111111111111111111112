---
type: entity
category: knowledge
key: AI Agent Trends 2025
source: Claude-Evo
date: 2026-05-20
---

# AI Agent Architecture Trends 2025

**学习时间**: 2026-05-20 18:50
**来源**: 互联网搜索

---

## 2025 AI Agent六大趋势

| 趋势 | 定义 | 代表产品/框架 |
|------|------|--------------|
| **Agentic RAG** | RAG + Agent机制，检索与生成更自主、更可控 | Perplexity, Harvey AI, Glean |
| **Voice Agents** | 语音交互全链路闭环(ASR→NLU→执行→TTS) | ElevenLabs, Cognigy, Vapi |
| **CUA (Computer Using Agent)** | 像人类一样操作电脑/GUI | OpenAI Operator, Gemini 2.5 |
| **Coding Agents** | 自主代码生成/修复/测试 | Devin, AutoCoder, Cursor |
| **Deep Research Agents** | 长链路研究推理 | GPT o1, Claude |
| **Agent Protocols** | Agent间标准化通信 | MCP (Anthropic) |

---

## 1. MCP (Model Context Protocol)

**定义**: Anthropic 2024年11月推出的开放协议，AI与外部工具/数据源的标准化接口

**类比**: AI世界的"USB-C接口"

### 核心组件

| 组件 | 作用 |
|------|------|
| MCP Host | 发起请求的应用程序(Claude Desktop, Cursor) |
| MCP Client | 主机与服务器间的通信中介 |
| MCP Server | 提供具体功能的轻量级服务 |

### 技术原理

```
MCP协议 = JSON-RPC 2.0
消息类型: Request / Response / Notification

核心功能:
1. 动态数据访问 - 实时检索外部数据库/API/文件系统
2. 工具调用 - 模型通过标准化接口调用外部工具
3. 上下文管理 - 维护跨会话交互状态
```

**参考**: https://modelcontextprotocol.io/

---

## 2. CUA (Computer Using Agent)

**定义**: 能像人类一样操作电脑的Agent，通过视觉理解屏幕+控制鼠标键盘

**原理**: 闭环智能体
```
理解任务 → 观察屏幕 → 输出动作 → 等待新屏幕 → 再思考下一步
```

**vs 传统AI**: 开环(问一句答一句) vs 闭环(感知-决策-执行循环)

**vs RPA**: RPA是"提线木偶"，CUA是"有脑子的实习生"

### 代表产品

| 产品 | 公司 | 特点 |
|------|------|------|
| Operator | OpenAI | GPT-4o视觉 + 高级推理 |
| Gemini 2.5 Computer Use | Google | 循环交互机制 |
| Manus | 中国 | 通用计算机使用 |

---

## 3. Multi-Agent 协作架构

**核心思想**: 像搭团队一样搭智能体

### 分工模式

| Agent角色 | 职责 |
|-----------|------|
| 入口/路由Agent | 接触用户、收集信息、初步路由 |
| 分析Agent | 理解、抽取结构化信息、判断策略 |
| 执行Agent | 具体任务执行 |
| 质检Agent | 合规与风险检查 |

### 框架对比

| 框架 | 特点 | 架构 |
|------|------|------|
| **LangGraph** | 有向图建模，节点=Agent，边=控制流 | 状态机 |
| **AutoGen** | 对话驱动群聊模式 | 群聊 |
| **AgentScope** | 工程化+消息驱动 | - |
| **CAMEL** | 角色扮演实现协作 | - |

**关键洞察**: 2025年末 Microsoft 把 AutoGen + Semantic Kernel 合并为 MAF (Microsoft Agent Framework)

### 通信模式

| 模式 | 适用场景 |
|------|----------|
| 消息队列 | 异步任务(回访、质检、知识更新) |
| 发布订阅 | 事件驱动(触发质检、复盘、报警) |

---

## 4. Agentic RAG

**定义**: 在传统RAG基础上引入Agent机制，让检索与生成过程更自主、更可控

**架构**:
```
用户 query → Agent(决策) → 检索 → 生成 → Agent(校验) → 输出
```

**应用场景**:
- 构建基于推理的实时数据检索与生成型AI Agent
- 医疗健康(Perplexity, Harvey AI)
- 企业搜索(Glean AI)

---

## 5. Voice Agents

**定义**: 基于语音交互的人机智能体系统

**全链路架构**:
```
语音输入 → ASR → NLU → 任务规划 → 执行 → TTS → 语音输出
```

**应用场景**:
- 语音客服
- 语音助手
- 语音填表

**代表公司**: ElevenLabs, Cognigy, Vapi, Deepgram

---

## 6. Coding Agents

**能力**: 自主代码生成/修复/测试/部署

**代表产品**:
| 产品 | 公司 | 场景 |
|------|------|------|
| Devin | Cognition | Software Engineer |
| AutoCoder | - | 代码自动补全 |
| Cursor | - | AI IDE |

---

## 关键框架工具盘点

| 框架 | 下载量 | 特点 |
|------|--------|------|
| AutoGen | 25万+/月 | 事件驱动群聊 |
| LangGraph | - | 有向图状态机 |
| LangChain | - | 通用LLM应用 |

---

## 技术驱动因素

1. **GPT-4o实时多模态** - 音视频理解 + JSON结构化输出
2. **o1推理模型** - 接近人类的推理逻辑(科学/编码/法律/医学)
3. **云厂商Agent as a Service** - AWS Bedrock, Google Vertex AI

---

## Cross-refs

- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
- [[knowledge/Self-Heal-Triggers.m[[knowledge/Design-Toolkit]]] — 自改进触发器
- [[knowledge/Design-Toolkit.m[[knowledge/Design-Toolkit]]] — 设计工具包
- [[knowledge/Wiki-Automation-Guide.m[[knowledge/Design-Toolkit]]] — Wiki自动化等级