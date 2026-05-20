---
type: entity
category: tools
key: Memov
source: GitHub memovai/memov
stars: 188
version: 0.0.8
date: 2026-05-20
layer: 3.0
rating: ★★★★☆
---

# Memov - Git-like Version Control Memory

## Overview

Memov is a Git-like version control memory system designed specifically for AI coding agents. It brings the power of distributed version control to long-term memory management, enabling AI agents to track, branch, merge, and roll back their understanding of codebases just as developers manage source code.

- **本质**: 类Git的版本控制记忆系统
- **目标**: 让AI记住代码库演进历史，支持分支和回溯
- **论文**: Memory, Version Control, and AI Agents (概念来源)
- **核心思想**: 代码库即Repo，记忆即Commit，推理即Branch

## Core Concepts

### 类Git的版本控制范式

Memov将传统版本控制的核心概念映射到AI记忆领域：

```
传统Git                    Memov
─────────────────────────────────────────────────
Repository               Memory Repository     # 记忆仓库
Commit                   Memory Commit        # 记忆提交
Branch                   Context Branch       # 上下文分支
Diff                     Memory Diff          # 记忆差异
Merge                    Memory Merge         # 记忆合并
HEAD                     Current Context      # 当前上下文
Staging Area             Working Memory       # 工作记忆
Tag                      Important Milestone  # 重要里程碑
```

### 核心操作

| 操作 | Git语义 | Memov语义 |
|------|---------|-----------|
| `snap` | git commit | 保存当前记忆状态 |
| `branch` | git branch | 创建新的上下文分支 |
| `checkout` | git checkout | 切换记忆上下文 |
| `diff` | git diff | 查看记忆变化 |
| `merge` | git merge | 合并记忆分支 |
| `log` | git log | 查看记忆历史 |
| `revert` | git revert | 回退到指定记忆 |

### Memory Diff 机制

Memov通过计算记忆差异来实现高效的增量更新：

```python
# Memory Diff 示例
def compute_memory_diff(old_state, new_state):
    """
    计算两个记忆状态之间的差异
    类似Git的diff算法，使用 LCS (最长公共子序列)
    """
    # 1. 向量化记忆内容
    old_vec = embed(old_state)
    new_vec = embed(new_state)

    # 2. 计算语义差异
    semantic_diff = cosine_distance(old_vec, new_vec)

    # 3. 提取结构变化（文件/函数/类）
    structural_changes = extract_code_changes(old_state, new_state)

    # 4. 生成diff报告
    return {
        "semantic_delta": semantic_diff,
        "files_added": structural_changes["added"],
        "files_modified": structural_changes["modified"],
        "files_deleted": structural_changes["deleted"],
        "functions_changed": structural_changes["functions"]
    }
```

## Architecture

### 三层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    MemovManager (Orchestrator)              │
│  - Repository initialization                                │
│  - Snapshot management (snap command)                        │
│  - Branch operations (create/switch/delete)                   │
│  - History navigation (jump, show, log)                     │
├─────────────────────────────────────────────────────────────┤
│                    MCP Server (Adapter Layer)                │
│  - JSON-RPC 2.0 protocol                                    │
│  - Tool registration and calling                             │
│  - Resource subscription                                    │
├─────────────────────────────────────────────────────────────┤
│                    VectorDB (Optional RAG)                   │
│  - Memory embedding storage                                 │
│  - Semantic search                                          │
│  - Historical recovery                                      │
└─────────────────────────────────────────────────────────────┘
```

### MemovManager 核心职责

- **File**: `memov/core/manager.py` (~1200 lines)
- **Responsibilities**:
  - Repository initialization and validation
  - Snapshot creation (`snap` command)
  - File tracking and commit management
  - Branch operations (create/switch/delete)
  - History navigation (`jump`, `show`, `history`)
  - VectorDB sync and RAG queries

## 与传统版本控制的区别

| 维度 | 传统Git | Memov |
|------|---------|-------|
| **管理对象** | 代码文件 | 语义记忆/代码理解 |
| **Diff粒度** | 文本行 | 语义向量 + 代码结构 |
| **Merge策略** | 文本冲突 | 语义冲突（需要LLM仲裁） |
| **Branch语义** | 代码分支 | 上下文/任务分支 |
| **存储形式** | 文件系统 | VectorDB + 结构化数据 |
| **一致性模型** | 强一致性 | 最终一致性（异步同步） |
| **使用场景** | 代码协作 | AI上下文恢复 |

### 关键差异详解

**1. Diff的语义层次**

传统Git的diff是基于文本行的机械比较，而Memov的diff是语义级别的：

```
传统Git Diff:
```diff
- const x = 1;
+ const x = 2;
```

Memov Diff:
{
  "semantic_change": "变量赋值从常量1变为常量2",
  "affected_scope": ["local", "function"],
  "risk_level": "low",
  "related_memory": ["variable_assignment", "scope_chain"]
}
```

**2. Merge的LLM仲裁**

当两个分支产生冲突时，Memov需要LLM来判断语义优先级：

```python
def semantic_merge(branch_a, branch_b, context):
    """
    语义合并 - 需要LLM参与判断
    """
    conflicts = detect_conflicts(branch_a, branch_b)

    resolved = [[Self-Healing-Loop]]
    for conflict in conflicts:
        # 使用LLM判断哪个语义更符合整体上下文
        resolution = llm.resolve(
            f"Conflict: {conflict}\nContext: {context}\nChoose the better semantic."
        )
        resolved.append(resolution)

    return merge_without_conflicts(resolved)
```

## 代码示例

### 示例1：基本记忆操作

```python
from memov import MemovManager

# 初始化记忆仓库
memov = MemovManager(repo_path="./memory_repo")

# 创建记忆快照
memov.snap("Initial code understanding")

# 查看记忆历史
history = memov.log()
print(history)

# 切换到指定记忆
memov.checkout(commit_id="abc123")

# 查看记忆差异
diff = memov.diff(commit_a="abc123", commit_b="def456")
print(diff)
```

### 示例2：分支管理与上下文切换

```python
from memov import MemovManager

memov = MemovManager(repo_path="./memory_repo")

# 创建新分支（用于新任务）
memov.branch("feature/new_context")

# 在新分支上进行工作
memov.snap("Exploring new approach")
memov.snap("Implementation complete")

# 切换回主分支
memov.checkout(branch="main")

# 合并新分支
memov.merge("feature/new_context", strategy="semantic")

# 回退到指定版本
memov.revert(commit_id="abc123")
```

### 示例3：与MCP集成

```python
from memov import MemovManager
from mcp.server import MCPServer

# 创建Memov MCP Server
server = MCPServer()

memov = MemovManager(repo_path="./memory_repo")

# 注册Memov工具到MCP
@server.tool("memov_snap")
def memov_snap(message: str):
    """保存当前记忆快照"""
    return memov.snap(message)

@server.tool("memov_branch")
def memov_branch(branch_name: str):
    """创建新的记忆分支"""
    return memov.branch(branch_name)

@server.tool("memov_history")
def memov_history(limit: int = 10):
    """查看记忆历史"""
    return memov.log(limit=limit)

server.start()
```

## 应用场景

### 1. 代码库记忆

当AI agent处理大型代码库时，Memov可以记住之前分析过的文件结构和理解：

```
场景：处理包含1000+文件的Python项目

1. 首次分析：创建记忆快照 "Analyzed project structure"
2. 后续工作：快速恢复上下文，跳转到之前分析的模块
3. 分支探索：创建实验分支尝试不同理解方案
4. 记忆合并：将有价值的探索合并回主线
```

### 2. 项目演进跟踪

跟踪AI对项目理解的变化过程：

```
阶段1: "Initial analysis - main components identified"
阶段2: "Discovered authentication flow - needs refactoring"
阶段3: "Understood data pipeline - 3 layers identified"
阶段4: "Final architecture - patterns recognized"
```

### 3. 跨会话上下文恢复

在长时间任务中，保持上下文一致性：

```python
# Session 1
memov.snap("Completed phase 1 - data loading")

# Session 2 (after break)
memov.checkout(commit_id="phase1")
memov.snap("Continuing from phase 1 - transformation logic")
```

### 4. 分支式探索

允许AI同时探索多个理解路径：

```
main:    "Baseline understanding"
  │
  ├── experiment/A: "Try approach A for optimization"
  ├── experiment/B: "Try approach B for optimization"
  └── experiment/C: "Try approach C for optimization"
```

## Cross-refs

- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — AI记忆层，Memov的同类产品但无版本控制
- [[memory/Intent-Log.m[[knowledge/Design-Toolkit]]] — 意图日志，记录触发模式
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 知识图谱，记忆的结构化表示
- [[infrastructure/MCP.m[[knowledge/Design-Toolkit]]] — 模型上下文协议，Memov的通信层
- [[ml/Vector-DB.m[[knowledge/Design-Toolkit]]] — 向量数据库，Memov的可选存储后端
- [[concepts/2026-05-14_concept_memory-architecture.m[[knowledge/Design-Toolkit]]] — 记忆架构，Memov的系统定位
- Claude-Work/memov_analysis.json
- Claude-Work/agent_architecture_research.json

## Related Projects

| Project | Stars | Description |
|---------|-------|-------------|
| mem0ai/mem0 | 12k+ | AI记忆层，Memov的直接竞品 |
| commitdev/memov | 188 | 本项目，Git版本控制记忆 |
| LangChain-Memory | - | LangChain的记忆模块 |
| GPTCache | - | LLM对话记忆缓存 |

## 经典论文

1. **"Memory, Version Control, and AI Agents"** - 提出类Git记忆的概念框架
2. **"Mem0: Scalable Memory Layer for AI Applications"** - 可扩展AI记忆系统设计
3. **"Agentic Memory Systems"** - AI Agent的记忆架构研究

---

*Memov将版本控制的智慧带入AI记忆领域，让机器能够像开发者管理代码一样管理知识。*