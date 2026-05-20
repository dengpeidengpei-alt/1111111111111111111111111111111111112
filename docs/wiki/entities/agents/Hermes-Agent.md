---
type: entity
category: agents
key: Hermes Agent
source: GitHub learn-hermes-agent
date: 2026-05-20
---

# Hermes Agent

> 27 章节全栈 Agent 开发教程 | 从零构建生产级自主 AI Agent | 中文原创

## 概述

| 属性 | 值 |
|------|-----|
| 类型 | 全栈 Agent 开发教程 |
| 章节数 | 27 章（完整体系） |
| 目标 | 从零构建生产级自主 AI Agent |
| 语言 | 中文（英文也有） |
| 定位 | 理论 + 实践的全栈教程 |
| 学习路径 | Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5 |

Hermes Agent 是一个系统性 Agent 开发教程，通过 27 个章节由浅入深地讲解如何构建生产级自主 AI Agent。教程采用递进式架构，从单 Agent 核心开始，逐步扩展到多 Agent、自进化等高级主题。

## 五阶段架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Hermes Agent 5阶段架构                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Stage 1: 核心单 Agent + 持久化 (s01-s06)                              │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  Agent Loop → Tool System → Session Store →                     │ │
│   │  Prompt Builder → Context Compression → Error Recovery           │ │
│   │  入门：掌握 Agent 的核心循环和基础设施                             │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                   │
│   Stage 2: 智能化 (s07-s11)                                          │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  Memory System → Skill System → Permission System               │ │
│   │  → Subagent Delegation → Configuration System                   │ │
│   │  进阶：赋予 Agent 记忆、技能和权限管理能力                         │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                   │
│   Stage 3: 多平台 (s12-s15)                                          │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  Gateway Architecture → Platform Adapters                       │ │
│   │  → Terminal Backends → Cron Scheduler                          │ │
│   │  高级：跨平台部署和定时任务能力                                   │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                   │
│   Stage 4: 高级能力 (s16-s20)                                         │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  MCP Integration → Browser Automation                          │ │
│   │  → Voice & Vision → CLI Interface → Background Review          │ │
│   │  高级：扩展边界、语音视觉、自动化                                  │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                   │
│   Stage 5: 自我进化 (s21-s27)                                         │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  Skill Creation Loop → Hook System                              │ │
│   │  → Trajectory & RL → Plugins → Evaluation → Optimization       │ │
│   │  专家：Agent 自我进化、持续优化                                    │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Stage 1: 核心单 Agent（s01-s06）

### s01-s02: Agent Loop

```python
class HermesAgent:
    """
    Agent 核心循环
    理解 → 规划 → 执行 → 反馈
    """
    def __init__(self):
        self.tools = ToolRegistry()
        self.memory = MemorySystem()
        self.prompt_builder = PromptBuilder()

    def run(self, user_input):
        # 1. 理解输入
        context = self.understand(user_input)

        # 2. 规划行动
        plan = self.plan(context)

        # 3. 执行工具
        result = self.execute(plan)

        # 4. 反馈学习
        self.learn(result)

        return result

    def understand(self, input):
        """理解用户意图"""
        # 上下文构建
        # 意图识别
        # 实体提取
        pass

    def plan(self, context):
        """规划行动序列"""
        # 任务分解
        # 依赖分析
        # 资源规划
        pass

    def execute(self, plan):
        """执行计划"""
        results = [[Self-Healing-Loop]]
        for step in plan:
            result = self.tools.dispatch(step.name, step.params)
            results.append(result)
        return results

    def learn(self, result):
        """从结果中学习"""
        # 成功经验沉淀
        # 失败教训记录
        pass
```

### s03-s04: Tool System

```python
class ToolRegistry:
    """
    自注册工具系统
    运行时动态注册，统一调度
    """
    def __init__(self):
        self.tools = {}

    def register(self, tool):
        """注册工具"""
        self.tools[tool.nam[[Self-Healing-Loop]] = tool
        # 自动生成工具描述（用于 LLM 调用）
        self.generate_description(tool)

    def dispatch(self, tool_name, params):
        """调度工具"""
        tool = self.tools.get(tool_name)
        if not tool:
            raise ToolNotFoundError(tool_name)
        return tool.execute(params)

    def auto_discover(self):
        """自动发现和加载"""
        # 扫描指定目录
        # 加载工具类
        # 注册到系统
        pass

    def generate_description(self, tool):
        """生成工具描述（用于 prompt）"""
        return f"{tool.name}: {tool.description}, params: {tool.params}"
```

### s05-s06: Session Store & Error Recovery

```python
class SessionStore:
    """
    会话存储
    支持跨会话持久化
    """
    def save(self, session_id, state):
        """保存会话状态"""
        pass

    def load(self, session_id):
        """加载会话状态"""
        pass

    def list_sessions(self):
        """列出所有会话"""
        pass

class ErrorRecovery:
    """
    错误恢复机制
    自动重试、降级、 fallback
    """
    def handle_error(self, error, context):
        # 重试策略
        for attempt in range(self.max_retries):
            try:
                return self.retry(context)
            except:
                continue

        # 降级策略
        return self.degrade(context)

    def degrade(self, context):
        """降级到简单策略"""
        pass
```

## Stage 2: 智能化（s07-s11）

### s07-s08: Memory System

```python
class HermesMemorySystem:
    """
    三层记忆系统
    与 Vibecosystem 的设计相似
    """
    def __init__(self):
        self.episodic = EpisodicMemory()    # 当前会话
        self.semantic = SemanticMemory()     # 长期知识
        self.procedural = ProceduralMemory() # 技能方法

    def remember(self, key, value):
        """存储到对应层级"""
        if self.is_episodic(key):
            self.episodic.store(key, value)
        elif self.is_semantic(key):
            self.semantic.store(key, value)
        else:
            self.procedural.store(key, value)

    def recall(self, key):
        """检索记忆"""
        # 优先检索工作记忆
        # 然后情景记忆
        # 最后语义记忆
        pass
```

### s09-s10: Skill System

```python
class SkillSystem:
    """
    技能系统
    Agent 可以自己创建、编辑、执行技能
    """
    def create(self, skill_spec):
        """从规范创建技能"""
        skill = Skill(
            name=skill_spec["name"],
            description=skill_spec["description"],
            code=skill_spec["code"],
            trigger=skill_spec.get("trigger", [[Self-Healing-Loop]])
        )
        self.registry.register(skill)
        return skill

    def edit(self, skill_name, updates):
        """运行时更新技能"""
        skill = self.registry.get(skill_name)
        skill.update(updates)
        # 触发重新编译
        skill.compile()

    def execute(self, skill_name, context):
        """执行技能"""
        skill = self.registry.get(skill_name)
        return skill.run(context)

    def learn_from_error(self, error, context):
        """从错误中学习，创建新技能"""
        # 分析错误
        # 生成技能规范
        # 创建技能
        pass
```

### s11: Subagent Delegation

```python
class SubagentManager:
    """
    子 Agent 管理
    复杂任务分解给子 Agent
    """
    def __init__(self):
        self.subagents = {}

    def create_subagent(self, config):
        """创建子 Agent"""
        agent = HermesAgent(config)
        self.subagents[agent.i[[knowledge/Design-Toolkit]] = agent
        return agent

    def delegate(self, task, agent_id):
        """委托任务给子 Agent"""
        agent = self.subagents.get(agent_id)
        if not agent:
            raise AgentNotFoundError(agent_id)
        return agent.run(task)

    def coordinate(self, tasks):
        """协调多个子 Agent"""
        # 并行执行
        # 结果汇总
        # 依赖处理
        pass
```

## Stage 3: 多平台（s12-s15）

### Gateway Architecture

```python
class GatewayArchitecture:
    """
    网关架构
    统一入口，多后端支持
    """
    def __init__(self):
        self.adapters = {}
        self.load_balancer = LoadBalancer()

    def register_adapter(self, platform, adapter):
        """注册平台适配器"""
        self.adapters[platform] = adapter

    def route(self, request):
        """路由请求到对应平台"""
        platform = request.platform
        adapter = self.adapters.get(platform)
        return adapter.handle(request)

    def load_balance(self, requests):
        """负载均衡"""
        return self.load_balancer.distribute(requests)
```

### Platform Adapters

```python
class PlatformAdapter:
    """
    平台适配器
    微信/Telegram/Slack/Discord 等
    """
    def handle(self, message):
        # 消息标准化
        std_msg = self.normalize(message)
        # 转发给 Agent
        response = self.agent.run(std_msg)
        # 格式转换
        formatted = self.format(response)
        # 发送回复
        self.send(formatted)
```

### Terminal Backends

```python
class TerminalBackend:
    """
    终端后端
    支持命令行交互
    """
    def __init__(self, agent):
        self.agent = agent
        self.history = [[Self-Healing-Loop]]

    def run(self):
        """运行终端"""
        while True:
            user_input = input("> ")
            if user_input == "exit":
                break
            response = self.agent.run(user_input)
            print(response)
            self.history.append((user_input, response))
```

### Cron Scheduler

```python
class CronScheduler:
    """
    定时调度器
    支持 cron 表达式
    """
    def __init__(self, agent):
        self.agent = agent
        self.tasks = {}

    def schedule(self, cron_expr, task):
        """调度定时任务"""
        self.tasks[cron_exp[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] = task

    def run(self):
        """运行调度器"""
        while True:
            now = datetime.now()
            for cron_expr, task in self.tasks.items():
                if self.match_cron(now, cron_expr):
                    self.agent.run(task)
            sleep(60)
```

## Stage 4: 高级能力（s16-s20）

### s16: MCP Integration

```python
class MCPIntegration:
    """
    MCP (Model Context Protocol) 集成
    外部能力扩展标准接口
    """
    def __init__(self):
        self.mcp_servers = {}

    def connect(self, server_url):
        """连接 MCP 服务器"""
        server = MCPClient.connect(server_url)
        self.mcp_servers[server_ur[[Self-Healing-Loop]] = server

    def call_tool(self, server, tool_name, params):
        """调用 MCP 工具"""
        server = self.mcp_servers.get(server)
        return server.call_tool(tool_name, params)

    def list_tools(self):
        """列出所有可用工具"""
        tools = [[Self-Healing-Loop]]
        for server in self.mcp_servers.values():
            tools.extend(server.list_tools())
        return tools
```

### s17-s18: Browser Automation

```python
class BrowserAutomation:
    """
    浏览器自动化
    网页抓取、表单填写、点击操作
    """
    def __init__(self):
        self.browser = None

    def navigate(self, url):
        """导航到 URL"""
        self.browser.get(url)

    def click(self, selector):
        """点击元素"""
        element = self.browser.find(selector)
        element.click()

    def fill_form(self, data):
        """填写表单"""
        for field, value in data.items():
            element = self.browser.find(f"[name={field}]")
            element.fill(value)

    def extract_data(self, selector):
        """提取数据"""
        elements = self.browser.find_all(selector)
        return [e.text for e in element[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]]
```

### s19: Voice & Vision

```python
class MultimodalInterface:
    """
    语音和视觉接口
    语音识别、图像理解、语音合成
    """
    def __init__(self, agent):
        self.agent = agent
        self.asr = ASREngine()
        self.tts = TTSEngine()
        self.vision = VisionEngine()

    def voice_input(self, audio_data):
        """语音输入"""
        text = self.asr.transcribe(audio_data)
        return self.agent.run(text)

    def voice_output(self, text):
        """语音输出"""
        audio = self.tts.synthesize(text)
        return audio

    def image_input(self, image_data):
        """图像输入"""
        description = self.vision.analyze(image_data)
        return self.agent.run(f"Image: {description}")
```

### s20: CLI Interface & Background Review

```python
class CLIInterface:
    """
    CLI 界面
    命令行工具
    """
    def __init__(self, agent):
        self.agent = agent
        self.commands = {}

    def register_command(self, name, handler):
        """注册命令"""
        self.commands[nam[[Self-Healing-Loop]] = handler

    def run(self, args):
        """运行命令"""
        cmd = args[0]
        handler = self.commands.get(cmd)
        if handler:
            return handler(args[1:])
        return "Unknown command"

class BackgroundReview:
    """
    后台审查
    定期检查任务完成情况
    """
    def __init__(self, agent):
        self.agent = agent
        self.pending_tasks = [[Self-Healing-Loop]]

    def add_task(self, task):
        self.pending_tasks.append(task)

    def review(self):
        """审查待处理任务"""
        for task in self.pending_tasks:
            status = self.check_status(task)
            if status == "completed":
                self.notify_completion(task)
            elif status == "failed":
                self.handle_failure(task)
```

## Stage 5: 自我进化（s21-s27）

### s21-s22: Skill Creation Loop

```python
class SkillCreationLoop:
    """
    技能创建循环
    从错误中学习，自动创建技能
    """
    def __init__(self, agent):
        self.agent = agent
        self.error_log = [[Self-Healing-Loop]]

    def learn_from_error(self, error, context):
        """从错误中学习"""
        # 分析错误模式
        pattern = self.analyze_pattern(error)

        # 生成技能规范
        skill_spec = self.generate_skill_spec(pattern, context)

        # 创建技能
        skill = self.agent.skill_system.create(skill_spec)

        # 验证技能
        if self.validate(skill):
            self.deploy(skill)
        else:
            self.iterate(skill_spec)

    def analyze_pattern(self, error):
        """分析错误模式"""
        # 聚类相似错误
        # 提取通用模式
        pass

    def generate_skill_spec(self, pattern, context):
        """生成技能规范"""
        return {
            "name": f"skill_{pattern.id}",
            "description": f"Handle {pattern.type} errors",
            "code": self.generate_code(pattern),
            "trigger": pattern.triggers
        }
```

### s23-s24: Hook System & Trajectory & RL

```python
class HookSystem:
    """
    钩子系统
    生命周期事件自动化触发
    """
    HOOK_POINTS = [
        "on_init",
        "on_task_start",
        "on_task_progress",
        "on_task_complete",
        "on_error",
        "on_learning"
   [[Self-Healing-Loop]]

    def register_hook(self, point, handler):
        """注册钩子"""
        self.hooks[poin[[knowledge/Design-Toolkit]].append(handler)

    def trigger(self, point, context):
        """触发钩子"""
        for handler in self.hooks.get(point, [[Self-Healing-Loop]]):
            handler(context)

class TrajectoryRL:
    """
    轨迹强化学习
    从轨迹中学习优化策略
    """
    def __init__(self):
        self.trajectories = [[Self-Healing-Loop]]
        self.policy = PolicyNetwork()

    def record(self, trajectory):
        """记录轨迹"""
        self.trajectories.append(trajectory)

    def optimize(self):
        """优化策略"""
        for traj in self.trajectories:
            reward = self.compute_reward(traj)
            self.policy.update(traj, reward)
```

### s25-s27: Plugins, Evaluation, Optimization

```python
class PluginSystem:
    """
    插件系统
    运行时加载扩展功能
    """
    def __init__(self):
        self.plugins = {}

    def load_plugin(self, plugin_path):
        """加载插件"""
        plugin = import_module(plugin_path)
        self.plugins[plugin.nam[[Self-Healing-Loop]] = plugin
        plugin.install(self)

    def unload_plugin(self, name):
        """卸载插件"""
        self.plugins[nam[[Self-Healing-Loop]].uninstall()
        del self.plugins[nam[[Self-Healing-Loop]]

class EvaluationFramework:
    """
    评估框架
    多维度评估 Agent 性能
    """
    METRICS = [
        "task_completion_rate",
        "reasoning_quality",
        "efficiency",
        "safety",
        "user_satisfaction"
   [[Self-Healing-Loop]]

    def evaluate(self, agent, test_suite):
        """评估 Agent"""
        results = {}
        for metric in self.METRICS:
            results[metric] = self.run_benchmark(agent, metric, test_suite)
        return results

class ContinuousOptimization:
    """
    持续优化
    自动化性能优化
    """
    def __init__(self, agent):
        self.agent = agent
        self.baseline = self.establish_baseline()

    def optimize(self):
        """运行优化循环"""
        while True:
            metrics = self.evaluate()
            if self.improved(metrics):
                self.apply_changes()
            else:
                self.try_alternative()
            sleep(self.interval)
```

## 学习路径

| 阶段 | 章节 | 核心内容 | 代码量 | 难度 |
|------|------|----------|--------|------|
| Stage 1 | s01-s06 | Agent 循环、工具系统、会话存储、错误恢复 | ~500 行 | 入门 |
| Stage 2 | s07-s11 | 记忆、技能、权限、子 Agent、配置 | ~800 行 | 进阶 |
| Stage 3 | s12-s15 | 网关、平台适配、终端、调度 | ~600 行 | 高级 |
| Stage 4 | s16-s20 | MCP、自动化、语音视觉、CLI、审查 | ~700 行 | 高级 |
| Stage 5 | s21-s27 | 自学习、钩子、RL、插件、评估、优化 | ~900 行 | 专家 |

## 与其他 Agent 系统对比

| 维度 | Hermes | [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] | [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] | [[agents/AutoGen.m[[knowledge/Design-Toolkit]]] |
|------|--------|-------------|-------------------|-------------|
| 章节数 | 27 | - | - | - |
| 架构 | 5 阶段递进 | 单进程 + Bun | 5+6+2+3+4 分层 | 对话驱动 |
| 重点 | 开发教程 | 生产部署 | 多 Agent 协作 | 多 Agent 对话 |
| 自进化 | Stage 5 完整 | 3 层循环 | 自组织 | 有限 |
| 工具系统 | 自注册 | MCP | 动态注册 | 内置 |
| 学习曲线 | 递进式 | 中 | 高 | 低 |

## 核心优势

1. **系统性** — 27 章节由浅入深，覆盖完整知识体系
2. **递进式** — Stage 1 → 5，逐步构建复杂能力
3. **实践导向** — 每个章节都有可运行代码
4. **自进化闭环** — Stage 5 完整覆盖自我进化机制
5. **中文原创** — 中文教程更易于理解

## Cross-refs

- [[agents/Phantom-Detail.m[[knowledge/Design-Toolkit]]] — AI coworker 架构参考（生产部署对比）
- [[agents/Vibecosystem.m[[knowledge/Design-Toolkit]]] — 多 Agent 系统参考（架构对比）
- [[agents/SE-Agent-3R.m[[knowledge/Design-Toolkit]]] — 自进化方法论（Stage 5 理论基础）
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent 驱动 RAG（知识管理）
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — 模型上下文协议（s16 参考）