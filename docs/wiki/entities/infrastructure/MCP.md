---
type: entity
category: research
key: MCP (Model Context Protocol)
source: Claude-Evo research
date: 2026-05-20
layer: 2.0
rating: ★★★★☆
---

# MCP - Model Context Protocol

## Overview

MCP (Model Context Protocol) 是AI模型与外部世界交互的标准化协议，如同USB-C端口之于设备互联。Anthropic于2024年末发布，旨在解决AI与工具/数据源连接的碎片化问题。

**核心价值**:
- 统一协议 (取代散乱的API集成)
- 双向通信 (工具调用 + 资源订阅)
- 安全认证 (OAuth 2.1标准)
- 实时更新 (notifications通道)

**生态**: 2026年支持n8n, Claude Desktop, VS Code (Cline), Cursor, SourceGraph

## Architecture (3-Layer Model)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Claude Code)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │              JSON-RPC 2.0 Messages                    │  │
│  │   - tools/call, resources/read, prompts/list          │  │
│  │   - notifications/initialized, progress, sampling     │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Transport Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │  STDIO (Local)      │  │  Streamable HTTP (Remote)  │   │
│  │  - 进程间通信        │  │  - OAuth 2.1认证           │   │
│  │  - 低延迟            │  │  - 跨网络                  │   │
│  │  - Claude Code集成   │  │  - SSE推送                 │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      MCP Server                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │  Tools    │  │ Resources │  │  Prompts  │  │ Sampling│ │
│  │  模型调用  │  │  应用读取  │  │  模板调用  │  │  采样   │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Protocol Specification

### Transport: STDIO (Local)

用于本地进程间通信，Claude Code通过子进程启动MCP Server。

```json
// Client → Server (stdin)
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "git_status",
    "arguments": {}
  },
  "id": 1
}

// Server → Client (stdout)
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "M CLAUDE.md\n?? new-file.txt"
      }
   [[Self-Healing-Loop]]
  },
  "id": 1
}
```

### Transport: Streamable HTTP (Remote)

用于远程MCP Server连接，支持OAuth 2.1认证。

```bash
# Server声明 (SSE端点)
GET /sse → event stream (server→client)
POST /message → client→server (HTTP/2)

# 端点结构
https://mcp-server.example.com/
  ├── /sse (GET) - 建立SSE连接
  ├── /message (POST) - 发送请求
  └── /health (GET) - 健康检查
```

### Message Types

| Category | Methods | Direction |
|----------|---------|-----------|
| Tools | `tools/list`, `tools/call` | 双向 |
| Resources | `resources/list`, `resources/read`, `resources/subscribe` | 双向 |
| Prompts | `prompts/list`, `prompts/get` | 双向 |
| Sampling | `sampling/create_message` | 双向 |
| Notifications | `initialized`, `progress`, `tools/list_changed` | 单向 |

## Core Primitives Deep-Dive

### Tools (模型主动调用)

Tools是MCP的核心原语，允许AI模型通过函数调用与外部世界交互。

```json
// 工具列表 (模型感知可用工具)
{
  "method": "tools/list",
  "params": {},
  "id": 1
}

// 响应
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "git_status",
        "description": "返回Git工作区状态",
        "inputSchema": {
          "type": "object",
          "properties": {},
          "required": [[Self-Healing-Loop]]
        }
      },
      {
        "name": "search_code",
        "description": "搜索代码库",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {"type": "string"},
            "lang": {"type": "string"}
          },
          "required": ["query"]
        }
      }
   [[Self-Healing-Loop]]
  },
  "id": 1
}
```

```json
// 工具调用
{
  "method": "tools/call",
  "params": {
    "name": "search_code",
    "arguments": {
      "query": "function add",
      "lang": "python"
    }
  },
  "id": 2
}

// 响应
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 3 matches:\n1. def add(a, b): ...\n2. async def add_numbers():\n3. // TODO: add error handling"
      }
   [[Self-Healing-Loop]],
    "isError": false
  },
  "id": 2
}
```

### Resources (应用驱动读取)

Resources由应用控制，当数据变化时主动推送给客户端。

```json
// 资源订阅 (客户端声明感兴趣的资源)
{
  "method": "resources/list",
  "params": {},
  "id": 3
}

// 响应
{
  "jsonrpc": "2.0",
  "result": {
    "resources": [
      {
        "uri": "file:///workspace/config.json",
        "name": "workspace_config",
        "description": "当前工作区配置",
        "mimeType": "application/json"
      },
      {
        "uri": "git://current-branch",
        "name": "current_branch",
        "description": "Git当前分支",
        "mimeType": "text/plain"
      }
   [[Self-Healing-Loop]]
  },
  "id": 3
}
```

```json
// 资源读取
{
  "method": "resources/read",
  "params": {
    "uri": "file:///workspace/config.json"
  },
  "id": 4
}

// 响应
{
  "jsonrpc": "2.0",
  "result": {
    "contents": [
      {
        "uri": "file:///workspace/config.json",
        "mimeType": "application/json",
        "text": "{\"version\": \"1.0\", \"theme\": \"dark\"}"
      }
   [[Self-Healing-Loop]]
  },
  "id": 4
}
```

### Prompts (用户显式调用)

Prompts是预定义的模板，用户可以快捷调用。

```json
// 列出可用prompts
{
  "method": "prompts/list",
  "params": {},
  "id": 5
}

// 响应
{
  "jsonrpc": "2.0",
  "result": {
    "prompts": [
      {
        "name": "code_review",
        "description": "代码审查模板",
        "arguments": [
          {"name": "language", "required": true},
          {"name": "focus", "required": false}
       [[Self-Healing-Loop]]
      }
   [[Self-Healing-Loop]]
  },
  "id": 5
}
```

### Sampling (AI采样控制)

允许MCP Server向客户端请求特定采样。

```json
// 请求采样
{
  "method": "sampling/create_message",
  "params": {
    "messages": [...],
    "systemPrompt": "你是一个代码审查助手",
    "temperature": 0.7,
    "maxTokens": 2048
  },
  "id": 6
}
```

## Tool Calling Mechanism (完整流程)

```
┌──────────────────────────────────────────────────────────────────┐
│                     Session Initialization                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Client ────── initialize ──────────► Server                   │
│        ◄─────── protocolVersion, capabilities                    │
│                                                                   │
│   Client ────── notifications/initialized ──► Server             │
│        (告知client已准备好)                                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Tool Discovery Loop                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Client ────── tools/list ──────────► Server                    │
│        ◄─────── [tool1, tool2, ...]                             │
│                                                                   │
│   Client ────── (缓存工具列表)                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Tool Invocation Loop                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Model ────── decide to call tool                               │
│        │                                                          │
│        ▼                                                          │
│   Client ────── tools/call ───────────► Server                  │
│        │    {name: "git_status", arguments: {}}                   │
│        │                                                          │
│        │    (执行外部操作)                                        │
│        │                                                          │
│        ◄─────── result ────────────────── Server                │
│        │    {content: [{type: "text", text: "..."}]}             │
│        │                                                          │
│   Model ◄───── (处理结果，生成响应)                               │
│        │                                                          │
│        ▼ (如需更多工具，重复)                                     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Real-time Updates                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Server ────── notifications/tools/list_changed ──► Client      │
│        (工具列表变化时主动通知)                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## SDKs Deep-Dive

### Python SDK (mcp)

```python
# 安装
pip install mcp

# 基础服务器
from mcp.server import MCPServer

server = MCPServer(
    name="my-server",
    version="1.0.0"
)

@server.list_tools()
def list_tools():
    return [
        {
            "name": "git_status",
            "description": "返回Git状态",
            "inputSchema": {"type": "object", "properties": {}}
        }
   [[Self-Healing-Loop]]

@server.call_tool()
def call_tool(name: str, arguments: dict):
    if name == "git_status":
        import subprocess
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True
        )
        return [{"type": "text", "text": result.stdout}]
    raise ValueError(f"Unknown tool: {name}")

# 运行 (stdio模式)
server.run()
```

### FastMCP (PrefectHQ) - 推荐

```python
# 安装
pip install fastmcp

# 快速创建工具
from fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression))

@mcp.tool()
def search_files(pattern: str, path: str = ".") -> list:
    """搜索文件"""
    import glob
    return glob.glob(f"{path}/**/{pattern}", recursive=True)

@mcp.resource("config://app")
def get_config():
    """返回应用配置"""
    return {"version": "1.0", "debug": True}

@mcp.prompt()
def code_review_prompt(language: str) -> str:
    """代码审查prompt模板"""
    return f"""审查以下{language}代码，关注：
1. 性能问题
2. 安全漏洞
3. 最佳实践
"""

# 运行
mcp.run()
```

### TypeScript SDK

```typescript
import { MCPServer } from '@modelcontextprotocol/sdk';

const server = new MCPServer({
    name: 'my-server',
    version: '1.0.0'
});

// 注册工具
server.registerTool({
    name: 'git_status',
    description: '返回Git状态',
    inputSchema: {
        type: 'object',
        properties: {}
    },
    handler: async () => {
        const { stdout } = await exec('git status --porcelain');
        return [{ type: 'text', text: stdout }];
    }
});

// 注册资源
server.registerResource({
    uri: 'config://app',
    name: 'app_config',
    mimeType: 'application/json',
    async handler() {
        return { text: JSON.stringify({ version: '1.0' }) };
    }
});

// 启动 (stdio)
server.start();
```

## Security Model

### OAuth 2.1 Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    OAuth 2.1 Authorization Flow                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Client ────────────── Authorization Request ────► Server     │
│         ◄──────────────────────────┐                            │
│                  Authorization       │ (用户点击允许)            │
│                      Grant           │                            │
│                        │             │                            │
│                        ▼             ▼                            │
│               Access Token ◄────────┘                            │
│                        │                                          │
│                        ▼                                          │
│   Client ──────► Resource Server (MCP Server)                   │
│         ◄─────── Protected Data                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 安全机制

1. **用户审批**: 首次连接需用户显式授权
2. **细粒度权限**: 每个工具/资源独立授权
3. **操作审计**: 所有操作记录日志
4. **Token刷新**: 短期Token + 自动刷新

### Claude Code权限配置

```json
// settings.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
      "env": {
        "ALLOWED_DIRECTORIES": "/allowed/path"
      }
    }
  }
}
```

## MCP Server 生态 (常用)

| Server | Stars | Use Case | 安装命令 |
|--------|-------|----------|---------|
| filesystem | - | 文件系统操作 | `npx -y @modelcontextprotocol/server-filesystem` |
| git | - | Git操作 | `uvx mcp-server-git --repo /path` |
| brave-search | - | 网络搜索 | `uvx mcp-server-brave-search --api-key KEY` |
| github | - | GitHub API | `npx -y @modelcontextprotocol/server-github` |
| slack | - | Slack消息 | `uvx mcp-server-slack --token KEY` |
| sequential-thinking | - | 思维链 | `npx -y @modelcontextprotocol/server-sequential-thinking` |

### n8n集成

n8n (18.7k stars) 内置MCP支持，可作为工作流自动化平台：

```javascript
// n8n中配置MCP Server
{
  "nodes": [
    {
      "name": "MCP Tool",
      "type": "n8n-nodes-mcp",
      "parameters": {
        "server": "ollama",
        "tool": "generate"
      }
    }
 [[Self-Healing-Loop]]
}
```

## MCP Client 实现 (Claude Code集成)

### 完整配置示例

```json
// settings.json
{
  "mcpServers": {
    // 文件系统访问
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "ALLOWED_DIRECTORIES": "E:/Claude"
      }
    },

    // Git操作
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "E:/Claude"]
    },

    // Brave搜索
    "brave-search": {
      "command": "uvx",
      "args": ["mcp-server-brave-search", "--api-key", "YOUR_API_KEY"]
    },

    // Ollama本地模型
    "ollama": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-ollama", "--port", "11434"]
    }
  }
}
```

## Troubleshooting

### 诊断流程

```
问题现象 → 检查点 → 解决方案
```

| 问题 | 检查 | 解决 |
|------|------|------|
| 连接失败 | `ollama serve` 是否运行 | 确认端口11434可访问 |
| 工具调用超时 | 服务器日志 | 增加timeout或检查服务器性能 |
| 权限被拒 | OAuth consent dialog | 重新授权或检查scope |
| 模型不识别工具 | session工具列表 | 确认tools/list返回正确 |
| STDIO连接断开 | 服务器进程状态 | 重启MCP服务器 |

### 日志位置

```bash
# Claude Code MCP日志
# macOS: ~/Library/Logs/claude/
# Linux: ~/.config/claude/logs/
# Windows: %APPDATA%/Claude/logs/
```

### 查看MCP状态

```bash
# Claude Code中
/mcp

# 输出示例:
# Connected Servers:
# - filesystem (running)
# - git (running)
# - brave-search (running)
```

## Best Practices

1. **安全优先**
   - 生产环境使用OAuth认证
   - 最小权限原则 (仅请求需要的工具)
   - 定期轮换API Keys

2. **错误处理**
   - 工具函数返回清晰错误信息
   - 使用`isError`标记错误响应
   - 超时设置合理 (默认30s)

3. **实时反馈**
   - 长时间操作使用`progress`通知
   - 流式响应减少等待感
   - 定期发送`ping`保持连接

4. **版本控制**
   - MCP Server和Client版本兼容
   - 升级前测试
   - 保持协议版本一致

5. **性能优化**
   - 工具列表变化时发送`notifications/tools/list_changed`
   - 避免频繁的`resources/list`
   - 使用批量操作减少Round-trip

## Comparison: MCP vs Tool Use

| Aspect | MCP | OpenAI Tool Use |
|--------|-----|-----------------|
| 标准化 | 是 (官方协议) | 否 (各厂商自定义) |
| 传输层 | STDIO/HTTP | HTTP (REST) |
| 资源订阅 | 支持 | 不支持 |
| 双向通信 | 是 | 有限 |
| 生态系统 | 发展中 | 成熟但分散 |

## Cross-refs

- [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] — 本地LLM运行时，MCP集成
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 本地部署方案
- [[infrastructure/OpenClaw.m[[knowledge/Design-Toolkit]]] — OpenClaw优化
- [[infrastructure/Docker.m[[knowledge/Design-Toolkit]]] — MCP Server容器化
- Claude-Work/mcp_ecosystem_research.json
- Claude-Work/agent_architecture_research.json