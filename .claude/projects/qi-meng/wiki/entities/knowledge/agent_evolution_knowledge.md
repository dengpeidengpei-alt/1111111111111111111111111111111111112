# Agent进化知识体系 - 2026技术栈

> trajectory > knowledge

## 核心认知

Agent不会因为"知道更多"而进化，而是因为：
- 做过更多
- 失败更多
- 复盘更多
- 总结更多

---

## 一、Trajectory数据集 (P0)

| 数据集 | 价值 | 用途 |
|--------|------|------|
| AgentBench | Agent综合能力benchmark | ReAct, planning, reflection |
| SWE-bench | Coding Agent进化核心 | bug修复轨迹 |
| OpenAI Evals | 自评估/自动评分 | 回归测试 |

## 二、真实环境 (P0)

| 环境 | 用途 |
|------|------|
| BrowserGym | Browser Agent benchmark |
| WebArena | 真实网页交互 |

## 三、Reflection架构 (P0)

| 论文/框架 | 核心思想 |
|----------|----------|
| Reflexion | 失败→反思→更新策略 |
| Generative Agents | episodic memory + reflection + retrieval |
| Mem0 | 长期记忆系统 |
| Zep | Memory Layer |

## 四、Agent框架 (P1)

| 框架 | 特点 |
|------|------|
| LangGraph | 状态机/长任务流/branching |
| AutoGen | 多Agent协作/group chat |
| CrewAI | 角色分工/企业自动化 |

## 五、标准轨迹格式

```json
{
  "goal": "任务目标",
  "observation": "观察结果",
  "thought": "思考过程",
  "action": "执行动作",
  "result": "结果",
  "reflection": "反思"
}
```

## 六、进化SOP

```
接任务 → 规划 → 执行 → 评估 → 反思 → 改进
```

## 七、2026技术栈

### 轻量版
- LLM: Claude / GPT-5
- Framework: LangGraph
- Memory: Mem0
- Vector DB: Qdrant
- Browser: Playwright
- Evaluation: OpenAI Evals

### 企业版
- Gateway: LiteLLM
- Workflow: LangGraph
- Memory: Zep + Redis
- Long-term: Postgres
- Tool Layer: MCP
- Browser: BrowserBase
- Monitoring: LangSmith

## 八、4个核心研究方向

1. **ReAct**: Thought → Action → Observation
2. **Reflexion**: 失败 → 反思 → 更新策略
3. **Tree of Thoughts**: 分叉尝试 → 比较 → 选择
4. **MCP (Model Context Protocol)**: 2026超核心

## 九、真正该喂的数据（按价值排序）

| 类型 | 价值 |
|------|------|
| 高质量任务轨迹 | 极高 |
| 错误修复案例 | 极高 |
| 工具调用记录 | 极高 |
| 反思日志 | 极高 |
| SOP工作流 | 高 |
| 论文 | 中 |
| 普通教程 | 低 |

---

*参照用户指引构建 | 2026-05-23*