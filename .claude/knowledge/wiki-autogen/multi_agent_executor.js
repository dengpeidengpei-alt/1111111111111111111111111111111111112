/**
 * multi_agent_executor.js - 多Agent并行执行器
 *
 * 架构：Coordinator + N个Worker Agent
 * 每个Worker负责不同查询域，并行执行后合并结果
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const WIKI_AUTO_DIR = 'E:/Claude/.claude/knowledge/wiki-autogen/'
const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'

const { record } = require(WIKI_AUTO_DIR + 'self_tune')
const { recordSuccess, recordFailure, isAvailable } = require(WIKI_AUTO_DIR + 'source_health')

// ============ 工具函数 ============

function getToken() {
  const tokens = [
    process.env.GITHUB_TOKEN || '',
    process.env.GITHUB_TOKEN_2 || ''
  ].filter(Boolean)
  if (tokens.length === 0) return ''
  return tokens[Math.floor(Math.random() * tokens.length)]
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const headers = { 'User-Agent': 'Claude-Auto-Learner' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    https.get(url, { headers }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        if (res.statusCode === 429) return reject(new Error('Rate limit'))
        try { resolve(JSON.parse(data)) } catch { reject(new Error('Parse error')) }
      })
    }).on('error', reject).setTimeout(15000, function() { this.destroy(); reject(new Error('Timeout')) })
  })
}

function fetchReadme(owner, repo) {
  return new Promise((resolve) => {
    const token = getToken()
    const headers = { 'User-Agent': 'Claude-Auto-Learner' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    https.get(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, { headers }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.content) resolve(Buffer.from(json.content, 'base64').toString('utf-8'))
          else resolve('')
        } catch { resolve('') }
      })
    }).on('error', () => resolve('')).setTimeout(10000, function() { this.destroy(); resolve('') })
  })
}

// ============ 单个Worker Agent ============

async function workerAgent(query, workerId) {
  const results = []
  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`
    const data = await fetchJson(url)
    const repos = data.items || []

    for (const repo of repos) {
      const readme = await fetchReadme(repo.owner.login, repo.name)
      const features = readme
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .trim()
        .substring(0, 800)

      results.push({
        workerId,
        query,
        repo: {
          fullName: repo.full_name,
          name: repo.name,
          description: repo.description || '',
          stars: repo.stargazers_count,
          language: repo.language || '',
          topics: repo.topics || [],
          url: repo.html_url,
          readme: readme.substring(0, 2000),
          keyFeatures: features
        }
      })
    }
  } catch (e) {
    console.log(`[Worker${workerId}] Error on "${query}": ${e.message}`)
  }
  return results
}

// ============ Coordinator ============

/**
 * 并行执行多Agent查询
 * @param {string[]} queries - 查询词数组
 * @param {number} concurrency - 并发数
 * @returns {Promise<Array>} 所有结果
 */
async function executeMultiAgent(queries, concurrency = 3) {
  console.log(`[MultiAgent] Starting ${queries.length} workers (concurrency=${concurrency})`)

  // 分批处理，每批concurrency个
  const results = []
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency)
    const batchPromises = batch.map((q, idx) => workerAgent(q, i + idx))
    const batchResults = await Promise.allSettled(batchPromises)

    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(...r.value)
    }

    console.log(`[MultiAgent] Batch ${Math.floor(i/concurrency)+1} done, total=${results.length}`)
  }

  return results
}

/**
 * 学习单个结果
 */
async function learnRepoResult(result, { addEntity, buildFrontmatter, addSnapshot }) {
  const repo = result.repo
  const entityId = repo.fullName.replace(/\//g, '_').toLowerCase()
  const file = path.join(KNOWLEDGE_DIR, repo.name + '.md')

  const content = `# ${repo.name}\n\n${repo.description ? `> ${repo.description}\n\n` : ''}## 项目信息\n- **Stars**: ${repo.stars}\n- **语言**: ${repo.language}\n- **链接**: ${repo.url}\n- **主题**: ${repo.topics.slice(0, 5).join(', ') || '无'}\n\n## 核心功能\n${repo.keyFeatures || '[待研究]'}\n\n---\n*来源: GitHub | 查询: ${result.query}*\n`

  if (!fs.existsSync(file)) {
    const entity = {
      id: entityId,
      version: 1,
      sources: [`github:${repo.fullName}`],
      confidence: repo.stars > 1000 ? 'high' : 'medium',
      topics: repo.topics.slice(0, 5),
      created: Date.now(),
      updated: Date.now()
    }
    fs.writeFileSync(file, buildFrontmatter(entity) + content, 'utf-8')
    addSnapshot(entityId, { version: 1, confidence: entity.confidence, sources: entity.sources, topics: entity.topics })
    return true
  }
  return false
}

/**
 * 主入口：多Agent广度学习
 * @param {string[]} queries - 并行执行的查询词列表
 * @param {object} kg - knowledge_graph模块
 */
async function multiAgentLearn(queries, kg) {
  const { addEntity, buildFrontmatter, addSnapshot } = kg

  const allResults = await executeMultiAgent(queries, 3)

  let learned = 0
  for (const r of allResults) {
    const added = await learnRepoResult(r, { addEntity, buildFrontmatter, addSnapshot })
    if (added) {
      learned++
      record({ broad: true, deep: false, topic: r.repo.topics[0] || r.query, stars: r.repo.stars, added: true })
    }
  }

  console.log(`[MultiAgent] 完成: ${learned}/${allResults.length} 新增`)
  return { total: allResults.length, learned, results: allResults }
}

module.exports = {
  workerAgent,
  executeMultiAgent,
  multiAgentLearn,
  learnRepoResult
}