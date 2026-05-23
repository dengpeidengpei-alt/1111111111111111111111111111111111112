# 自学习系统 2.0 - 知识体系梳理与反思

## 系统架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                    自学习系统 2.0 架构                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐          │
│  │ GitHub  │   │  arXiv  │   │Crossref│   │  Web    │  ← 采集层 │
│  │ ★43/60  │   │  ok     │   │degraded│   │         │          │
│  └────┬────┘   └────┬────┘   └────┬────┘   └─────────┘          │
│       │             │             │                              │
│       └─────────────┼─────────────┘                              │
│                     ▼                                            │
│              ┌─────────────┐                                      │
│              │  熔断器层    │  ← rate limit保护, cooldown机制     │
│              └──────┬──────┘                                      │
│                     ▼                                            │
│              ┌─────────────┐                                      │
│              │  分层learned │  ← exact/semantic/epoch三层        │
│              │  去重核心    │                                      │
│              └──────┬──────┘                                      │
│                     ▼                                            │
│              ┌─────────────┐                                      │
│              │ 覆盖率追踪   │  ← 30+核心概念, 分类权重            │
│              │ coverage.js │                                      │
│              └──────┬──────┘                                      │
│                     ▼                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    知识层 (3层结构)                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │概念抽取  │→│关系抽取  │→│主题聚类  │→│图谱写入  │  │  │
│  │  │concept   │  │relation  │  │cluster   │  │graph     │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                     ▼                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    推理层 (2个核心)                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │冲突检测  │  │空白识别  │  │研究问题  │  │共识提炼  │  │  │
│  │  │conflict  │  │gap       │  │question  │  │consensus │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                     ↓                                            │
│              ┌─────────────┐                                      │
│              │  PostgreSQL │  ← 25张表, pgvector, 触发器        │
│              │  持久化存储  │                                      │
│              └─────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 当前知识资产统计

### 1. 数据源健康状态

| 来源 | 状态 | 问题 | cooldown |
|------|------|------|----------|
| GitHub | degraded | Rate limit | ~3分钟 |
| arXiv | ok | 正常 | - |
| Crossref | degraded | Rate limit | ~5分钟 |

### 2. Learned记录

| 类型 | 文件 | 记录数 |
|------|------|--------|
| learned_repos | learned_repos.json | 28566 bytes |
| learned_arxiv | learned_arxiv.json | 18049 bytes |
| learned_crossref | learned_crossref.json | 4647 bytes |
| 分层learned | learned_exact/semantic/epoch | 各172 bytes |

### 3. 查询统计

| 来源 | 活跃查询数 |
|------|-----------|
| arXiv | 40+ 查询词 |
| GitHub | 24 查询词 |

### 4. 覆盖率追踪

```javascript
// 核心概念分类
CORE_CONCEPTS = {
  agent: ['multi-agent', 'autonomous', 'MCP', 'tool-use', 'reasoning', 'memory', 'planning'],
  foundation: ['LLM', 'embedding'],
  infrastructure: ['vector-search'],
  retrieval: ['RAG'],
  training: ['fine-tuning'],
  optimization: ['quantization'],
  deployment: ['local-LLM'],
  application: ['code-generation', 'image-generation', 'video-generation', 'browser-agent', 'automation'],
  framework: ['LangChain', 'AutoGen', 'CrewAI', 'Dify', 'Coze']
}
```

---

## 已完成模块 (2.0 Phase 1-6)

| Phase | 模块 | 文件 | 功能 |
|-------|------|------|------|
| 1 | 分层learned | layered_learned.js | exact/semantic/epoch三层去重 |
| 2 | 查询扩展 | query_expander.js | 细分/交叉/时间查询生成 |
| 3 | 关系挖掘 | relation_miner.js | uses/implements/conflicts等关系 |
| 3.5 | 文档切分 | document_chunker.js | overview/method/result/limit/future |
| 4 | 冲突检测 | conflict_detector.js | 证据权重, 共识提炼 |
| 5 | 空白识别 | gap_detector.js | 7种空白类型, 研究问题生成 |
| 6 | 结构指标 | structural_metrics.js | novelty/coverage/relation_density |

---

## 数据库架构 (25表)

```
sources          ← 数据源配置
fetch_jobs       ← 抓取任务队列
raw_items        ← 原始采集内容
learned_items    ← 学习记忆(去重核心)
dedup_records    ← 去重判定记录
documents        ← 解析后结构化文档
document_chunks  ← 文档切片
metadata         ← 文档元数据
topic_clusters   ← 主题簇
concepts         ← 概念表
relations        ← 关系表
embeddings       ← 向量表
graph_nodes      ← 图节点
graph_edges      ← 图边
conflicts        ← 冲突记录
consensus_reports ← 共识报告
knowledge_gaps   ← 知识空白
research_questions ← 研究问题
task_queue       ← 任务队列
task_runs        ← 任务运行记录
policies         ← 策略配置
metrics_daily    ← 日指标
metrics_topic    ← 主题指标
metrics_system   ← 系统指标
```

---

## 反思：做得好的

### 1. 熔断器设计健壮
- 滑动窗口失败计数
- 动态cooldown退避
- HALF_OPEN试探恢复
- 不会同时触发所有源

### 2. 分层learned突破饱和
- epoch层(7天周期)解决永久锁定
- semantic层防止近重复
- exact层精确匹配

### 3. 覆盖率驱动探索
- 从"学更多"转向"学得更立体"
- 30+核心概念分类追踪
- 未覆盖概念优先建议

### 4. 查询扩展多元化
- 细分查询: RAG→retrieval-planning/fusion/multi-hop
- 交叉查询: LLM+compiler, LLM+robotics
- 时间查询: topic+new-release/2026

### 5. 文档结构化
- chunk分型: overview/method/result/limit/future
- 质量评分机制
- 元数据抽取

---

## 反思：待改进的

### 1. 图谱层尚未激活
- relation_miner.js 有代码但未充分调用
- 447实体仅13条关系 → 关系抽取效果差
- 原因：依赖人工定义pattern，覆盖有限

### 2. 语义去重缺失
- 只有精确hash去重
- 没有embedding相似度判断
- 近重复内容(如不同README描述同一项目)无法识别

### 3. 增量更新未实现
- 当前仍是全量重学模式
- 没有基于时间/变化的增量

### 4. 调度闭环不完整
- gap_detector.js 生成了研究问题
- 但没有自动转化为查询任务
- 空白→查询→新文档→入库 链路断裂

### 5. 指标体系未激活
- structural_metrics.js 有框架
- 但metrics_daily/topic/system表未写入
- 无法看到周主题饱和变化

---

## 核心问题诊断

### 问题1: 关系密度极低
```
当前: 13 relations / 447 entities = 0.029 relations/entity
目标: >0.1 relations/entity
```

**根因**:
- relation_miner.js 使用正则pattern匹配
- 人工定义的pattern有限
- 需要LLM理解才能抽取深层关系

### 问题2: 覆盖分数的计算可能有偏差
```javascript
// 当前公式：简单加权
totalWeight += catWeight
coveredWeight += catWeight * (data.covered / Math.max(data.total, 1))
```

**问题**:
- 30个核心概念可能已过时
- 没有动态扩展机制
- 权重固定，未根据学习效果调整

### 问题3: PostgreSQL建好但未迁移
- schema.sql 已完成
- sample_data_and_queries.sql 已完成
- 但当前系统仍用JSON文件
- 没有启动PostgreSQL版master_learn

---

## 改进方向

### 高优先级

| 改进 | 说明 | 影响 |
|------|------|------|
| 激活gap→task回流 | gap_detector产出→task_queue | 完整闭环 |
| 写入metrics表 | 日/周指标收集 | 可视化 |
| semantic dedup | embedding相似度>0.85降权 | 去重质量 |

### 中优先级

| 改进 | 说明 | 影响 |
|------|------|------|
| 关系挖掘增强 | 引入LLM做关系抽取 | 图谱质量 |
| 增量更新 | 基于时间戳的变化检测 | 效率 |
| PostgreSQL迁移 | JSON→数据库 | 可扩展性 |

### 低优先级

| 改进 | 说明 | 影响 |
|------|------|------|
| 实时图谱可视化 | JSON→D3.js | 体验 |
| 多源并行抓取 | 串行→并行 | 速度 |
| 向量检索 | 关键词→pgvector | 语义搜索 |

---

## 下一步行动

### Week 1-2: 完成调度闭环
```
gap_detector.js → knowledge_gaps表
↓
research_questions表
↓
task_queue表 (gap_scan任务)
↓
自动生成新查询
↓
执行fetch
↓
入库raw_items → documents
```

### Week 3-4: 激活指标
```
structural_metrics.js → metrics_daily
↓
每周汇总 → metrics_topic
↓
系统级 → metrics_system
↓
生成可视化报表
```

### Week 5-6: 增强关系挖掘
```
relation_miner.js + LLM
↓
关系类型扩展: USES/IMPLEMENTS/EXTENDS/CONFLICTS/BUILDS_ON
↓
图谱写入 graph_nodes/edges
↓
冲突检测增强
```

---

## 代码质量评估

| 模块 | 行数 | 可读性 | 可维护性 | 备注 |
|------|------|--------|----------|------|
| master_learn.js | 580+ | 中 | 中 | 核心调度，逻辑复杂 |
| layered_learned.js | 190+ | 好 | 好 | 职责单一，清晰 |
| query_expander.js | 260+ | 好 | 好 | 扩展性强 |
| coverage_tracker.js | 225+ | 好 | 好 | 覆盖逻辑清晰 |
| relation_miner.js | 310+ | 中 | 中 | 正则依赖，可增强 |
| conflict_detector.js | 280+ | 中 | 中 | 逻辑较多 |
| gap_detector.js | 290+ | 好 | 好 | 结构清晰 |
| structural_metrics.js | 280+ | 好 | 中 | 指标定义清晰 |
| document_chunker.js | 300+ | 中 | 中 | 切分规则复杂 |

---

## 资源消耗

| 资源 | 当前使用 | 限额 | 状态 |
|------|----------|------|------|
| 搜索 | ~150/5h | 150/5h | 接近上限 |
| 图片理解 | ~50/5h | 150/5h | 充足 |
| 语音合成 | ~4000/day | 4000/day | 充足 |
| 图像生成 | ~20/day | 50/day | 充足 |

---

## 总结

### 做得好的
1. 熔断+动态退避 → 系统稳定性
2. 分层learned → 突破饱和
3. 覆盖率驱动 → 从量到质
4. 文档结构化 → 知识组织

### 待改进
1. 图谱关系密度 0.029 → 需要LLM增强
2. 调度闭环断裂 → gap→task未打通
3. 指标未激活 → 无法可视化
4. JSON→PostgreSQL → 未迁移

### 核心矛盾
- **探索 vs 去重**: 太激进会重复，太保守会饱和
- **广度 vs 深度**: 30+概念覆盖 vs 关系密度
- **速度 vs 质量**: 快速产出 vs 结构化知识

---

## 2026-05-23下午补充：用户指引认知升级

### 核心认知转变
> **trajectory > knowledge**

旧认知：
- 学习 = 收集知识
- 知识库 = 存储
- 进化 = 积累更多条目

新认知（来自用户）：
- 真正让Agent变强的是：任务轨迹、错误修复、工具调用
- 进化 = 做过更多 + 失败更多 + 复盘更多 + 总结更多
- Agent不会因为"知道更多"而进化

### 新构建的组件
| 组件 | 功能 | 参照 |
|------|------|------|
| memory_layer.js | 三层记忆+经验压缩 | Mem0, Zep, Reflexion |
| evolution_loop.js | 执行→反思→提炼→改进 | Self-Refine模式 |
| trajectory_format.js | 标准轨迹数据格式 | SWE-bench格式 |
| trajectory_collector.js | 轨迹收集/分析/回放 | AgentBench |

### 今日新增知识体系
- **P0数据集**: AgentBench, SWE-bench, OpenAI Evals
- **P0环境**: BrowserGym, WebArena
- **P0架构**: Reflexion, Mem0, Zep, LangGraph, AutoGen, CrewAI
- **4个核心方向**: ReAct, Reflexion, Tree of Thoughts, MCP

### 今日数据指标更新
| 指标 | 之前 | 现在 |
|------|------|------|
| 知识库条目 | 2900 | 3322 |
| 轨迹记录 | 0 | 2 |
| 主题关联 | 99 | 112 |
| 技术栈模式 | 22 | 22 |
| 平均步骤/轨迹 | N/A | 3.5 |

### 核心差距分析
| 维度 | Codex/Gemini | 我 | 差距 |
|------|-------------|-----|------|
| 轨迹数据 | SWE-bench百万级 | 2条 | 极大 |
| 反思机制 | Reflexion论文级 | 有模块未使用 | 中等 |
| 记忆系统 | Mem0/Zep商业化 | 有模块未集成 | 大 |
| 自我进化 | 真实闭环 | 伪闭环 | 极大 |

### 立即整改项
1. **停止追求条目增长** → 转向轨迹积累
2. **集成memory_layer到master_learn.js** → 失败时自动写episodic memory
3. **改造学习循环记录标准轨迹** → goal/observation/thought/action/result/reflection
4. **运行真实evolution循环** → 分析轨迹，提炼策略

### 真正该喂的数据（按价值排序）
| 类型 | 价值 |
|------|------|
| 高质量任务轨迹 | 极高 |
| 错误修复案例 | 极高 |
| 工具调用记录 | 极高 |
| 反思日志 | 极高 |
| SOP工作流 | 高 |

### 进化SOP（参照用户指引）
```
接任务 → 规划 → 执行 → 评估 → 反思 → 改进
```

### 2026技术栈（轻量版）
- LLM: Claude / GPT-5
- Framework: LangGraph
- Memory: Mem0
- Vector DB: Qdrant
- Browser: Playwright
- Evaluation: OpenAI Evals

---

*反思时间: 2026-05-23 下午更新*