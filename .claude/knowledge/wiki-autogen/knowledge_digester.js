/**
 * knowledge_digester.js - 知识消化吸收机制
 *
 * 竞品差距3：Codex/Gemini只存储，我消化
 *
 * 消化 = 跨知识关联 + 发现模式 + 生成洞察
 * 不是只存着，而是理解并连接
 */

const fs = require('fs')
const path = require('path')

const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'
const DIGEST_LOG = 'E:/Claude/.learnings/digest_log.json'
const SYNTHESIS_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/_synthesis/'

// ============ 工具 ============

function loadDigestLog() {
  try { return JSON.parse(fs.readFileSync(DIGEST_LOG, 'utf-8')) } catch { return { lastDigest: null, connections: [], insights: [] } }
}
function saveDigestLog(d) { fs.writeFileSync(DIGEST_LOG, JSON.stringify(d, null, 2)) }

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }) }

// ============ 关联发现 ============

function findTopicOverlap(files) {
  // 找出主题重叠的知识，建立关联
  const topicMap = {} // topic -> files

  for (const f of files) {
    try {
      const content = fs.readFileSync(f, 'utf-8')
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (fmMatch) {
        const fm = fmMatch[1]
        const topicsMatch = fm.match(/topics:\s*\[([^\]]+)\]/)
        if (topicsMatch) {
          const topics = topicsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')).filter(Boolean)
          for (const t of topics) {
            if (!topicMap[t]) topicMap[t] = []
            topicMap[t].push(path.basename(f, '.md'))
          }
        }
      }
    } catch {}
  }

  // 找重叠主题>1的
  const connections = Object.entries(topicMap)
    .filter(([, files]) => files.length > 1)
    .map(([topic, files]) => ({ topic, related: files }))

  return connections
}

function extractTechStack(content) {
  // 提取技术栈关键词
  const stacks = []
  const patterns = [
    /(?:基于|使用|采用|依赖)([A-Z][a-zA-Z]+(?:\s*[vV]\d+(?:\.\d+)*)?)/g,
    /(?:React|Vue|Angular|Node|Python|Rust|Go|TypeScript|Java)/g,
    /(?:LangChain|Dify|Coze|AutoGen|CrewAI|ollama)/g,
  ]
  for (const p of patterns) {
    const matches = content.match(p)
    if (matches) stacks.push(...matches)
  }
  return [...new Set(stacks)].slice(0, 10)
}

function findTechPatterns(files) {
  // 按技术栈分组
  const stackMap = {}
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8')
    const stacks = extractTechStack(content)
    for (const s of stacks) {
      if (!stackMap[s]) stackMap[s] = []
      stackMap[s].push(path.basename(f, '.md'))
    }
  }
  return Object.entries(stackMap).filter(([, fs]) => fs.length > 1).map(([stack, files]) => ({ stack, projects: files }))
}

// ============ 洞察生成 ============

function generateInsights(connections, techPatterns) {
  const insights = []

  // 洞察1：热门技术组合
  if (techPatterns.length > 0) {
    const topStack = techPatterns.sort((a, b) => b.projects.length - a.projects.length)[0]
    insights.push({
      type: 'tech_pattern',
      summary: `${topStack.stack} 被 ${topStack.projects.length} 个项目使用`,
      detail: `相关项目: ${topStack.projects.slice(0, 5).join(', ')}`,
      ts: Date.now()
    })
  }

  // 洞察2：主题聚合
  if (connections.length > 0) {
    const topTopic = connections.sort((a, b) => b.related.length - a.related.length)[0]
    insights.push({
      type: 'topic_cluster',
      summary: `"${topTopic.topic}" 主题连接了 ${topTopic.related.length} 个知识`,
      detail: topTopic.related.slice(0, 5).join(' ↔ '),
      ts: Date.now()
    })
  }

  return insights
}

// ============ 合成文档写入 ============

function writeSynthesis(insights, connections, techPatterns) {
  ensureDir(SYNTHESIS_DIR)

  const date = new Date().toISOString().split('T')[0]
  const synthesisFile = path.join(SYNTHESIS_DIR, `synthesis_${date}.md`)

  let content = `# 知识合成报告 - ${date}\n\n`
  content += `> 自动生成，基于 ${connections.length} 个关联和 ${techPatterns.length} 个技术模式\n\n`

  content += `## 🔗 主题关联\n\n`
  for (const c of connections.slice(0, 10)) {
    content += `- **${c.topic}**: ${c.related.length} 个知识\n`
    content += `  ${c.related.slice(0, 5).join(' ↔ ')}\n`
  }

  content += `\n## 🛠️ 技术栈聚合\n\n`
  for (const t of techPatterns.slice(0, 10)) {
    content += `- **${t.stack}**: ${t.projects.length} 个项目\n`
    content += `  ${t.projects.slice(0, 5).join(', ')}\n`
  }

  content += `\n## 💡 洞察\n\n`
  for (const ins of insights) {
    content += `### ${ins.type}\n`
    content += `**${ins.summary}**\n${ins.detail}\n\n`
  }

  content += `---\n*自动生成 by knowledge_digester*\n`
  fs.writeFileSync(synthesisFile, content, 'utf-8')

  return synthesisFile
}

// ============ 主消化流程 ============

async function digest(force = false) {
  const log = loadDigestLog()
  const now = Date.now()

  // 每24小时最多一次
  if (!force && log.lastDigest && now - log.lastDigest < 24 * 3600 * 1000) {
    console.log('[Digest] 距上次消化仅', Math.round((now - log.lastDigest)/3600000) + 'h，跳过')
    return null
  }

  console.log('[Digest] 开始知识消化...')

  // 1. 扫描知识文件
  const files = fs.readdirSync(KNOWLEDGE_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => path.join(KNOWLEDGE_DIR, f))

  console.log('[Digest] 扫描', files.length, '个知识文件')

  // 2. 发现关联
  const connections = findTopicOverlap(files)
  const techPatterns = findTechPatterns(files)

  console.log('[Digest] 发现', connections.length, '个主题关联,', techPatterns.length, '个技术模式')

  // 3. 生成洞察
  const insights = generateInsights(connections, techPatterns)

  // 4. 写入合成文档
  const synthesisFile = writeSynthesis(insights, connections, techPatterns)

  // 5. 更新日志
  log.lastDigest = now
  log.connections = connections.slice(0, 50)
  log.insights = insights
  saveDigestLog(log)

  console.log('[Digest] 完成 →', synthesisFile)

  return {
    connections: connections.length,
    techPatterns: techPatterns.length,
    insights: insights.length,
    synthesisFile
  }
}

// ============ 单知识深度消化 ============

function digestEntity(entityId) {
  const file = path.join(KNOWLEDGE_DIR, entityId + '.md')
  if (!fs.existsSync(file)) return null

  const content = fs.readFileSync(file, 'utf-8')
  const stacks = extractTechStack(content)
  const claims = content.match(/\d+[%℃]/g) || []

  return {
    entityId,
    techStack: stacks,
    metrics: claims,
    hasMetrics: claims.length > 0,
    hasTechStack: stacks.length > 0
  }
}

module.exports = {
  digest,
  digestEntity,
  findTopicOverlap,
  findTechPatterns,
  generateInsights,
  extractTechStack
}