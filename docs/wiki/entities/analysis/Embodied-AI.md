---
type: entity
category: research
key: Embodied AI - 具身智能
source: Claude-Evo research
date: 2026-05-14
rating: ★★★★☆
---

# Embodied AI - 具身智能

> 具身智能：智能体通过身体与环境交互，实现感知-决策-执行闭环的智能范式

## Core Concept - 核心概念

### 定义
具身智能（Embodied AI）指智能系统通过物理身体与环境进行实时交互，主动感知、推理并执行动作的智能形式。与纯语言模型不同，具身智能强调**身体在场（Body-Present）** 和**环境交互（Environmental Engagement）**。

### 感知-决策-执行闭环

```
感知（Perception）→ 认知（Cognition）→ 规划（Planning）→ 执行（Execution）→ 环境反馈 → 感知...
```

| 环节 | 功能 | 关键技术 |
|------|------|----------|
| 感知 | 环境信息获取 | 视觉、触觉、深度传感器、IMU |
| 认知 | 状态理解与推理 | 世界模型、注意力机制 |
| 规划 | 动作序列生成 | 强化学习、运动规划 |
| 执行 | 电机控制与精操 | 逆运动学、力控、阻抗控制 |

### Sim2Real 核心问题

**数据匮乏是通用具身智能最大障碍**，Google/NVIDIA/OpenAI尚未实现Scaling Law。核心挑战：

1. **物理交互数据稀缺** - 机器人操作数据采集成本极高
2. **Sim2Real Gap** - 仿真环境与真实物理世界差异
3. **泛化性差** - 策略在未见过的物体/场景泛化困难
4. **安全性约束** - 真实世界无法像游戏那样重置

## Technical Framework - 技术框架

### 1. 视觉导航（Visual Navigation）

智能体通过视觉输入在未知环境中导航至目标位置。

```python
# 视觉导航伪代码示例
class VisualNavigationAgent:
    def __init__(self, perception_module, world_model, planner):
        self.perception = perception_module  # CNN/ViT编码器
        self.world_model = world_model       # 隐式环境地图
        self.planner = planner               # A*/RRT路径规划

    def step(self, rgb_image, goal):
        # 1. 感知：编码当前视觉状态
        state = self.perception.encode(rgb_image)

        # 2. 认知：从世界模型获取环境表征
        latent = self.world_model.predict_state(state, goal)

        # 3. 规划：生成动作序列
        action_seq = self.planner.plan(latent, goal)

        # 4. 选择第一个动作执行
        return action_seq[0]
```

**典型方法**：
- Active Neural Mapping (NeurIPS 2023)
- Occupancy World Model (CoRL 2024)
- GNM: General Nearest Model (ICRA 2023)

### 2. 操作任务（Manipulation Tasks）

多指机械手/臂完成物体抓取、装配、操作等任务。

```python
# 模仿学习+RL 操作框架示例
class ManipulationPolicy:
    def __init__(self, vla_model, reward_fn):
        self.vla = vla_model  # Vision-Language-Action Model
        self.reward_fn = reward_fn

    def imitate_and_refine(self, demonstrations, env):
        """DAgger + RL refinement pipeline"""
        policy = self.vla.init_policy()

        for epoch in range(100):
            # 1. 收集演示数据
            trajs = collect_demonstrations(policy, env)

            # 2. 模仿学习更新策略
            policy = policy.update(trajs)

            # 3. RL微调提升鲁棒性
            policy = ppo_update(policy, env, self.reward_fn)

        return policy

    def execute_task(self, task_description, scene_obs):
        """VLA驱动任务执行"""
        action = self.vla.predict(
            observation=scene_obs,
            language_instruction=task_description
        )
        return action
```

**典型方法**：
- RT-2: Vision-Language-Action Models (CoRL 2023)
- Octo: Open-Source VLA (2024)
- PhysGaussian: 3D Gaussian + Physics (CVPR 2024)

### 3. 对话机器人（Interactive Robotics）

具身对话系统通过语言理解和物理交互完成复杂任务。

```python
#具身对话系统架构
class EmbodiedConversationSystem:
    def __init__(self, llm, skill_library, robot_controller):
        self.llm = llm
        self.skills = skill_library
        self.robot = robot_controller

    def respond_and_act(self, user_command, visual_context):
        # 1. LLM理解意图 + 生成动作计划
        plan = self.llm.plan(
            instruction=user_command,
            context=visual_context
        )

        # 2. 分解为可执行技能序列
        skill_seq = self.decompose_to_skills(plan)

        # 3. 逐步执行并反馈
        for skill_name, params in skill_seq:
            skill_fn = self.skills.get(skill_name)
            result = self.robot.execute(skill_fn, params)
            self.llm.integrate_feedback(result)

        return self.llm.summarize_result()
```

## 与纯语言模型的区别

| 维度 | 具身智能 | 纯语言模型 |
|------|----------|------------|
| 知识来源 | 物理交互 + 语言 | 文本语料 |
| 决策方式 | 环境反馈闭环 | 一次性生成 |
| 错误恢复 | 自动重试/调整 | 依赖人类纠正 |
| 泛化能力 | 跨物理任务 | 跨文本任务 |
| 计算载体 | GPU+电机+传感器 | GPU/TPU |
| 实时性要求 | 高（毫秒级控制） | 可离线异步 |
| 安全边界 | 物理破坏风险 | 幻觉风险 |

**核心区别**：具身智能必须处理**物理世界的随机性和不可逆性**，而语言模型可以在token空间自由探索。

## Application Scenarios - 应用场景

### 机器人（Robotics）

| 应用 | 代表项目 | 技术特点 |
|------|----------|----------|
| 人形机器人 | 宇树科技H1、Figure 01、Tesla Optimus | 双足行走、双手操作、复杂地形 |
| 工业操作 | Festo仿生、亚马逊仓库机器人 | 精细抓取、装配、质检 |
| 服务机器人 | 普渡送餐、手术机器人 | 自主导航、人机协作 |
| 遥操作 | OmniH2O (CMU)、ARCA | 人体动作迁移、远程控制 |

### 自动驾驶（Autonomous Driving）

| 级别 | 场景 | 技术挑战 |
|------|------|----------|
| L2+ | 高速NOA、城市领航 | 感知-规划-控制闭环 |
| L3 | 特定ODD自动驾驶 | 冗余安全、故障处理 |
| L4 | Robotaxi、无人配送 | 全域自主、长期记忆 |
| L5 | 完全自动驾驶 | 泛化到任意场景 |

### 具身AI研究平台

- **Habitat 3.0** (Meta): 模拟器+人形+社交
- **SAPIEN**: 关节物体操作
- **RLBench**: 大量演示任务benchmark
- **ManiSkill**: 技能学习benchmark

## Sim2Real Methods

### 1. Domain Randomization (DR)

领域随机化通过在仿真中引入参数变化提升泛化：

- 视觉纹理随机化
- 物理参数扰动（摩擦力、质量、弹性）
- 光照条件变化

```python
# Domain Randomization示例
def randomize_physics(sim_env):
    sim_env.set_friction(random.uniform(0.1, 2.0))
    sim_env.set_mass(random.uniform(0.5, 2.0))
    sim_env.set_gravity(random.choice([9.8, 10.0, 10.2]))
    return sim_env

def train_with_dr(policy, env_generator, n_envs=1000):
    for step in range(100000):
        # 生成随机化环境
        env = randomize_physics(env_generator.create())

        # 在随机环境中训练
        data = collect_rollouts(policy, env, n_steps=100)

        # 策略更新
        policy.update(data)
```

### 2. CMA-ES (Covariance Matrix Adaptation Evolution Strategy)

协方差矩阵适应进化策略，黑箱优化方法，适用于无法求导的物理控制任务。

### 3. SPI (Sample-based Physics Identification)

基于采样的电机辨识配合主动探索，适合不确定系统的自适应控制。

### 4. Humanoid-Gym (Isaac Gym to Mujoco)

Sim2Sim框架：Nvidia Isaac Gym到Mujoco的零样本迁移，支持XBot-S/XBot-L人形机器人。

## Key Projects - 关键项目

### Humanoid-Gym
- **By**: 星动纪元+清华+上海期智院
- **Tech**: Nvidia Isaac Gym强化学习框架
- **Feature**: 零样本Sim2Real迁移，支持XBot-S/XBot-L人形机器人

### OmniH2O
- **By**: CMU+上海交大
- **Tech**: 通用灵巧人形机器人遥操作系统
- **Method**: 强化学习Sim2Real管道从人体运动数据学习

### VLA (Vision-Language-Action Model)
- **Features**: Realtime-VLA FLASH加速推理、FrameSkip高效训练、AttenA+纠正动作不等性

### TouchAnything
- **Content**: 双手机触觉估计数据集和框架

### 宇树科技
- **成就**: 2025春晚人形机器人表演，H1机器人全身敏捷动作学习

## Classic Papers - 经典论文

| 论文 | 会议/期刊 | 核心贡献 |
|------|-----------|----------|
| RT-2: Vision-Language-Action Models | CoRL 2023 | VLA端到端控制 |
| GNM: General Nearest Model | ICRA 2023 | 通用导航先验 |
| Learning Agile Skills | RSS 2024 | 强化学习动物技能迁移 |
| Octo: Open-Source VLA | 2024 | 开源VLA基座 |
| OmniH2O | CoRL 2024 | 人形遥操作 |
| PhysGaussian | CVPR 2024 | 3D Gaussians物理仿真 |
| Habitat 3.0 | NeurIPS 2024 | 人形社交模拟器 |

## Cross-refs

- [[ml/World-Models.m[[knowledge/Design-Toolkit]]] — 世界模型：具身智能的环境预测基础
- [[ml/ReAct.m[[knowledge/Design-Toolkit]]] — 推理+行动模式：与具身决策闭环相似
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent驱动RAG：知识检索支撑具身规划
- [[ai/Agent-Economy.m[[knowledge/Design-Toolkit]]] — AI Agent经济：具身Agent的规模化应用
- [[concepts/2026-05-14_concept_agent-architecture.m[[knowledge/Design-Toolkit]]] — 智能体架构：具身Agent的系统设计
- [[ml/Self-RAG.m[[knowledge/Design-Toolkit]]] — 自我反思RAG：具身智能的错误自检机制
- [[ml/Chain-of-Thought.m[[knowledge/Design-Toolkit]]] — 推理链提示：具身规划的可解释性
- [[evolution/Evolution-Loop.m[[knowledge/Design-Toolkit]]] — 进化循环：具身智能的持续优化

## Related Files

- Claude-Work/embodied_ai_research.json
- [[concepts/2026-05-14_concept_agent-architecture.m[[knowledge/Design-Toolkit]]]