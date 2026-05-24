/**
 * master_learn.js - 主学习循环
 * 并行执行GitHub/arXiv/Crossref三源学习
 * 每30秒完成一轮
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const { HttpsProxyAgent } = (() => {
  try { return require('E:/Claude/.claude/knowledge/wiki-autogen/video-collector/node_modules/https-proxy-agent') } catch { return { HttpsProxyAgent: null } }
})()

// 加载.env
try {
  const envContent = fs.readFileSync('E:/Claude/.env', 'utf-8')
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([^=]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}

const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'
const LEARNINGS_DIR = 'E:/Claude/.learnings/'
const WIKI_AUTO_DIR = 'E:/Claude/.claude/knowledge/wiki-autogen/'
const { record } = require(WIKI_AUTO_DIR + 'self_tune')
const { recordFailure, recordSuccess, isAvailable, getStatus, logStatus } = require(WIKI_AUTO_DIR + 'source_health')
const { selectQuery, recordQuery, getStatus: getQueryStatus, pruneBadQueries, expandPool } = require(WIKI_AUTO_DIR + 'query_optimizer')
const { addEntity, buildFrontmatter, addSnapshot } = require(WIKI_AUTO_DIR + 'knowledge_graph')
const { record: logFeedback } = require(WIKI_AUTO_DIR + 'feedback_log')
const { suggestNextTopics, updateCoverage, getCoverageScore } = require(WIKI_AUTO_DIR + 'coverage_tracker')

// 轨迹记录 + 记忆系统 + Minimax增强 + Vision学习 + Discovery + Scoring + Quality + 双层学习
const trajectory = require(WIKI_AUTO_DIR + 'trajectory_format')
const memory = require(WIKI_AUTO_DIR + 'memory_layer')
const minimax = require(WIKI_AUTO_DIR + 'minimax_learner')
const visionLearn = require(WIKI_AUTO_DIR + 'vision_learner')
const discovery = require(WIKI_AUTO_DIR + 'discovery_sources')
const { scoreAndRank, filterByScore, recordDiscovery, recordFilter, recordLearn, getAnalytics, recordSourceLearn } = require(WIKI_AUTO_DIR + 'repo_scorer')
const { assessRepoQuality, batchAssessQuality } = require(WIKI_AUTO_DIR + 'knowledge_quality')
const { learnWithDepth, learnWithDepthDispatched, LEARN_CONFIG } = require(WIKI_AUTO_DIR + 'dual_layer_learner')
const { addToPromotionWatch, getPromotionQueue, markPromoted, runPromotionCheck } = require(WIKI_AUTO_DIR + 'promotion_queue')
const { recordLearnedKnowledge, recordRetrieval, pruneColdEntries } = require(WIKI_AUTO_DIR + 'learning_outcomes')

// 学习记录
const LEARNED_REPOS = 'E:/Claude/.learnings/learned_repos.json'
const LEARNED_ARXIV = 'E:/Claude/.learnings/learned_arxiv.json'
const LEARNED_CROSSREF = 'E:/Claude/.learnings/learned_crossref.json'

// 热点主题追踪
const HOT_TOPICS = 'E:/Claude/.learnings/hot_topics.json'
const DEEP_QUEUE = 'E:/Claude/.learnings/deep_queue.json'
const SYSTEM_STATE = 'E:/Claude/.learnings/system_state.json'

// 系统模式
const SYSTEM_MODES = {
  NORMAL: 'normal',       // 所有源正常
  DEGRADED: 'degraded',   // 部分源cooldown
  COOLDOWN: 'cooldown',   // 全源cooldown，进入本地模式
  TRY: 'try'               // 单源试探恢复中
}

// 源优先级顺序
const SOURCE_ORDER = ['github', 'gitlab', 'codeberg', 'arxiv', 'crossref']

// 动态间隔配置
const INTERVALS = {
  [SYSTEM_MODES.NORMAL]: 30000,
  [SYSTEM_MODES.DEGRADED]: 60000,
  [SYSTEM_MODES.COOLDOWN]: 120000,
  [SYSTEM_MODES.TRY]: 30000
}

let trySource = null  // 当前试探的源
let tryIndex = 0       // SOURCE_ORDER中的索引

function getSystemMode() {
  const { isAvailable } = require('./source_health')
  const sources = SOURCE_ORDER.map(s => ({ name: s, ok: isAvailable(s) }))
  const allOk = sources.every(s => s.ok)
  const noneOk = sources.every(s => !s.ok)
  if (noneOk) return SYSTEM_MODES.COOLDOWN
  if (allOk) return SYSTEM_MODES.NORMAL
  if (trySource) return SYSTEM_MODES.TRY
  return SYSTEM_MODES.DEGRADED
}

function shouldDoLocalWork(mode) {
  return mode === SYSTEM_MODES.COOLDOWN
}

// 获取下一个试探源
function nextTrySource() {
  const { isAvailable } = require('./source_health')
  // 跳过已可用的，找第一个cooldown到期需要试探的
  for (let i = 0; i < SOURCE_ORDER.length; i++) {
    const idx = (tryIndex + i) % SOURCE_ORDER.length
    const name = SOURCE_ORDER[idx]
    if (isAvailable(name)) {
      // 这个源已恢复，记录并跳过
      tryIndex = (idx + 1) % SOURCE_ORDER.length
    } else {
      // 找第一个不可用的作为试探目标
      tryIndex = idx
      return name
    }
  }
  return null  // 全都可用
}

async function doLocalWork() {
  console.log('[主循环] 本地整理模式...')
  try {
    const digest = require('./weekly_digest')
    digest.generateDigest()
    console.log('[本地] 周报已生成')
  } catch (e) {}
  try {
    const { pruneBadQueries } = require('./query_optimizer')
    pruneBadQueries()
    console.log('[本地] 查询优化完成')
  } catch (e) {}
  console.log('[主循环] 本地整理完成')
}

function getHotTopics() {
  try { return JSON.parse(fs.readFileSync(HOT_TOPICS, 'utf-8')) } catch { return [] }
}
function saveHotTopics(topics) {
  fs.writeFileSync(HOT_TOPICS, JSON.stringify(topics))
}
function getDeepQueue() {
  try { return JSON.parse(fs.readFileSync(DEEP_QUEUE, 'utf-8')) } catch { return [] }
}
function addToDeepQueue(topic) {
  const q = getDeepQueue()
  if (!q.includes(topic)) q.push(topic)
  fs.writeFileSync(DEEP_QUEUE, JSON.stringify(q))
}

function getToken() {
  const tokens = [
    process.env.GITHUB_TOKEN || '',
    process.env.GITHUB_TOKEN_2 || ''
  ].filter(Boolean)
  if (tokens.length === 0) return ''
  const idx = Math.floor(Math.random() * tokens.length)
  return tokens[idx]
}

function parseRetryAfter(header) {
  if (!header) return null
  const val = parseInt(header)
  if (!isNaN(val)) return val * 1000
  return 60000
}

function fetch(url, options = {}) {
  let retries = 2
  let useProxy = false
  let noAuth = false
  if (typeof options === 'number') {
    retries = options
  } else if (options && typeof options === 'object') {
    retries = options.retries !== undefined ? options.retries : 2
    useProxy = options.proxy || false
    noAuth = options.noAuth || false
  }
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || ''
  const agent = (useProxy && proxyUrl && HttpsProxyAgent) ? new HttpsProxyAgent(proxyUrl) : undefined
  return new Promise((resolve, reject) => {
    const attempt = (remaining, delay) => {
      const token = getToken()
      const headers = { 'User-Agent': 'Claude-Auto-Learner' }
      if (token && !noAuth) headers['Authorization'] = `Bearer ${token}`
      const req = https.get(url, { headers, agent }, (res) => {
        const statusCode = res.statusCode
        const contentType = res.headers['content-type'] || ''
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (statusCode === 429) {
            const retryAfter = parseRetryAfter(res.headers['retry-after'])
            const backoff = retryAfter || Math.min(delay * 2, 120000)
            console.log(`[Fetch] 429 on ${url.substring(0, 60)}, retry in ${Math.round(backoff/1000)}s`)
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1, backoff), backoff)
              return
            }
            reject(new Error('Rate limit (max retries)'))
            return
          }
          if (!contentType.includes('json')) {
            console.log('[Fetch] Non-JSON:', contentType, '| Status:', statusCode)
            reject(new Error(`Non-JSON: ${statusCode}`))
            return
          }
          try { resolve(JSON.parse(data)) } catch {
            console.log('[Fetch] Parse failed, status:', statusCode)
            reject(new Error('Parse error'))
          }
        })
      }).on('error', (err) => {
        const backoff = Math.min(delay * 2, 30000)
        if (remaining > 0) {
          setTimeout(() => attempt(remaining - 1, backoff), backoff)
        } else {
          reject(err)
        }
      })
      req.setTimeout(45000, () => { req.destroy(); reject(new Error('Timeout')) })
    }
    attempt(retries, 1000)
  })
}

function fetchText(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining, delay) => {
      const req = https.get(url, { headers: { 'User-Agent': 'Claude-Auto-Learner' } }, (res) => {
        const statusCode = res.statusCode
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (statusCode === 429) {
            const retryAfter = parseRetryAfter(res.headers['retry-after'])
            const backoff = retryAfter || Math.min(delay * 2, 120000)
            console.log(`[fetchText] 429, retry in ${Math.round(backoff/1000)}s (${remaining-1} left)`)
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1, backoff), backoff)
              return
            }
            reject(new Error('Rate limit (max retries)'))
            return
          }
          if (statusCode >= 400) {
            console.log('[fetchText] HTTP ' + statusCode + ' for', url.substring(0, 80))
            reject(new Error('HTTP ' + statusCode))
            return
          }
          resolve(data)
        })
      }).on('error', (err) => {
        const backoff = Math.min(delay * 2, 30000)
        if (remaining > 0) {
          setTimeout(() => attempt(remaining - 1, backoff), backoff)
        } else {
          reject(err)
        }
      })
      req.setTimeout(45000, () => { req.destroy(); reject(new Error('Timeout')) })
    }
    attempt(retries, 1000)
  })
}

function normalizeRepoData(data, source) {
  if (!data) return null
  switch (source) {
    case 'gitlab':
      return {
        full_name: data.path_with_namespace,
        name: data.name,
        owner: { login: (data.owner && data.owner.username) || (data.namespace && data.namespace.name) || 'unknown' },
        stargazers_count: data.star_count || 0,
        description: data.description || '',
        html_url: data.web_url || '',
        language: '',
        topics: data.topics || []
      }
    case 'codeberg':
      return {
        full_name: data.full_name,
        name: data.name,
        owner: data.owner || { login: 'unknown' },
        stargazers_count: data.stars_count || 0,
        description: data.description || '',
        html_url: data.html_url || '',
        language: data.language || '',
        topics: data.topics || []
      }
    default:
      return {
        full_name: data.full_name,
        name: data.name,
        owner: data.owner || { login: 'unknown' },
        stargazers_count: data.stargazers_count || 0,
        description: data.description || '',
        html_url: data.html_url || '',
        language: data.language || '',
        topics: data.topics || []
      }
  }
}

// ============ GitHub ============
// 2.0: 使用分层learned系统
const { isRecentlyLearned, markLearned } = require('./layered_learned')

function isRecentlyLearnedGitHub(repoFullName, topics = [], description = '') {
  return isRecentlyLearned(repoFullName, topics, description || '')
}

function markLearnedGitHub(repoFullName, topics = [], description = '') {
  markLearned(repoFullName, topics, description || '')
}

// ============ 根据repo名称直接学习（用于Discovery模块） ============
async function learnGitHubForRepo(repoFullName, source = 'github') {
  const srcLabel = source.charAt(0).toUpperCase() + source.slice(1)
  if (!isAvailable(source)) {
    console.log(`[${srcLabel}] 熔断中，跳过`)
    return false
  }
  try {
    const [owner, repo] = repoFullName.split('/')
    if (!owner || !repo) {
      console.log(`[${srcLabel}] 无效的repo名称:`, repoFullName)
      return false
    }

    let data
    if (source === 'gitlab') {
      data = await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(repoFullName)}`, { proxy: true })
    } else if (source === 'codeberg') {
      data = await fetch(`https://codeberg.org/api/v1/repos/${owner}/${repo}`, { proxy: true })
    } else {
      data = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    }
    const repoData = normalizeRepoData(data, source)
    if (!repoData || !repoData.full_name) {
      console.log(`[${srcLabel}] 获取repo失败:`, repoFullName)
      return false
    }

    console.log(`[${srcLabel}]`, repoData.full_name, '★', repoData.stargazers_count)

    if (isRecentlyLearnedGitHub(repoData.full_name, repoData.topics, repoData.description)) {
      console.log(`[${srcLabel}] 已学习，跳过:`, repoData.full_name)
      return false
    }

    let readme = '', keyFeatures = ''
    if (source === 'gitlab') {
      try {
        const raw = await fetchText(`https://gitlab.com/api/v4/projects/${encodeURIComponent(repoFullName)}/repository/files/README.md/raw`)
        if (raw && raw.length > 20) {
          readme = raw
          keyFeatures = readme.replace(/#{1,6}\s+/g, '').replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`{1,3}[^`]*`{1,3}/g, '').trim().substring(0, 1200)
        }
      } catch {}
    } else if (source === 'codeberg') {
      try {
        const d = await fetch(`https://codeberg.org/api/v1/repos/${owner}/${repo}/contents/README.md`, { proxy: true })
        if (d.content) {
          readme = Buffer.from(d.content, 'base64').toString('utf-8')
          keyFeatures = readme.replace(/#{1,6}\s+/g, '').replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`{1,3}[^`]*`{1,3}/g, '').trim().substring(0, 1200)
        }
      } catch {}
    } else {
      for (const f of ['README.md', 'README.MD', 'README.rst']) {
        try {
          const d = await fetch(`https://api.github.com/repos/${repoData.full_name}/contents/${f}`)
          if (d.content) {
            readme = Buffer.from(d.content, 'base64').toString('utf-8')
            keyFeatures = readme.replace(/#{1,6}\s+/g, '').replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`{1,3}[^`]*`{1,3}/g, '').trim().substring(0, 1200)
            break
          }
        } catch {}
      }
    }

    const content = `# ${repoData.name}

## 项目信息
- **作者**: ${repoData.owner.login}
- **Stars**: ${repoData.stargazers_count.toLocaleString()}
- **描述**: ${repoData.description || '无'}
- **链接**: ${repoData.html_url}
- **语言**: ${repoData.language || '未知'}
- **主题标签**: ${(repoData.topics || []).slice(0, 8).join(', ') || '无'}

## 核心功能
${keyFeatures || '[待深入研究]'}

---
*自动采集于 ${new Date().toISOString().split('T')[0]}*
`
    const safeName = repoData.name
    const file = path.join(KNOWLEDGE_DIR, safeName + '.md')
    const entityId = addEntity({
      title: repoData.name,
      type: 'github_project',
      source: `${source}:${repoData.full_name}`,
      confidence: repoData.stargazers_count > 1000 ? 'high' : 'medium',
      topics: repoData.topics?.slice(0, 5) || [],
    })
    if (!fs.existsSync(file)) {
      const entity = { id: entityId, version: 1, sources: [`${source}:${repoData.full_name}`], confidence: repoData.stargazers_count > 1000 ? 'high' : 'medium', topics: repoData.topics?.slice(0, 5) || [], created: Date.now(), updated: Date.now() }
      const fullContent = buildFrontmatter(entity) + content
      fs.writeFileSync(file, fullContent, 'utf-8')
      addSnapshot(entityId, { version: 1, confidence: entity.confidence, sources: entity.sources, topics: entity.topics })
      console.log(`[${srcLabel}] 新增:`, safeName)
    } else {
      addSnapshot(entityId, { version: Date.now(), confidence: repoData.stargazers_count > 1000 ? 'high' : 'medium', sources: [`${source}:${repoData.full_name}`], topics: repoData.topics?.slice(0, 5) || [] })
    }
    markLearnedGitHub(repoData.full_name, repoData.topics || [], repoData.description || '')
    record({ broad: true, deep: false, topic: repoData.topics?.[0] || repoData.name, stars: repoData.stargazers_count, added: true })
    recordSuccess(source)
    logFeedback('success', { source, topic: repoData.topics?.[0] || repoData.name })

    try {
      updateCoverage([file])
      const score = getCoverageScore()
      console.log('[覆盖] 覆盖率:', score + '%')
    } catch (e) {}

    return true
  } catch (e) {
    recordFailure(source, e)
    logFeedback('failure', { source, error: e.message })
    console.log(`[${srcLabel} Err]`, e.message)
  }
  return false
}

async function learnGitHub() {
  if (!isAvailable('github')) {
    console.log('[GitHub] 熔断中，跳过')
    return false
  }
  try {
    const q = selectQuery('github')
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=30`
    const data = await fetch(url)
    const repos = (data.items || []).filter(r => !isRecentlyLearnedGitHub(r.full_name, r.topics, r.description))
    if (repos.length === 0) {
      recordQuery('github', q, false)
      // MMX优先补充
      let supplemented = false
      try {
        const { isAvailable } = require(WIKI_AUTO_DIR + 'source_health')
        if (!isAvailable('mmx')) {
          console.log('[Minimax] MMX cooldown')
        } else {
          const mmxSearch = require(WIKI_AUTO_DIR + 'minimax_learner')
          const searchQuery = `AI agent autonomous code ${q.replace(/\+/g, ' ')} 2026 site:github.com`
          const searchResult = await mmxSearch.webSearch(searchQuery)
          if (searchResult && typeof searchResult === 'object' && searchResult.error) {
            console.log('[Minimax] 补充失败:', searchResult.error.message?.substring(0, 60))
            const { recordFailure } = require(WIKI_AUTO_DIR + 'source_health')
            recordFailure('mmx', new Error(searchResult.error.message || 'MMX search failed'))
          } else if (searchResult && searchResult.length > 100) {
            const repoMatches = searchResult.match(/github\.com\/([\w-]+\/[\w-]+)/gi) || []
            const newRepos = [...new Set(repoMatches.map(m => m.replace('github.com/', '')))]
              .filter(r => !isRecentlyLearnedGitHub(r))
            if (newRepos.length > 0) {
              console.log('[Minimax] 补充发现', newRepos.length, '个潜在项目')
              // 立即学习第一个
              await learnGitHubForRepo(newRepos[0])
              supplemented = true
            }
          }
        }
      } catch(e) { console.log('[Minimax补充失败]', e.message) }

      // 第二层降级：其它发现源
      if (!supplemented) {
        const disc = require(WIKI_AUTO_DIR + 'discovery_sources')
        const { isAvailable: isSrcAvail } = require(WIKI_AUTO_DIR + 'source_health')
        const discResult = await disc.discoverCandidates(q.replace(/\+/g, ' '), { useMMX: false, maxPerSource: 5 })
        const newFromDisc = discResult.candidates.filter(c => !isRecentlyLearned(c.repo))
        if (newFromDisc.length > 0) {
          console.log('[降级发现] 从其它源找到', newFromDisc.length, '个候选')
          const [owner, repo] = newFromDisc[0].repo.split('/')
          if (owner && repo) {
            const url = `https://api.github.com/repos/${owner}/${repo}`
            const repoData = await fetch(url)
            if (repoData && repoData.full_name) {
              console.log('[降级] 学习:', repoData.full_name, '★', repoData.stargazers_count)
              await saveGitHubEntry(repoData)
              recordSuccess('github')
              supplemented = true
            }
          }
        }
      }

      // 第三层降级：arXiv论文（可能引出新的GitHub项目）
      if (!supplemented) {
        const arxivQ = selectQuery('arxiv')
        try {
          const arxivResult = await learnArxiv(arxivQ)
          if (arxivResult) supplemented = true
        } catch(e) {}
      }

      if (!supplemented) return false
      return true
    }

    const repo = repos[Math.floor(Math.random() * repos.length)]
    console.log('[GitHub]', repo.full_name, '★', repo.stargazers_count)

    // 有新repos，记录成功
    recordQuery('github', q, true)

    // 热点追踪：Stars>阈值(默认800)或热点主题项目加入深度队列
    const starThreshold = 800
    if (repo.stargazers_count > starThreshold) {
      const topic = repo.topics?.[0] || repo.name
      addToDeepQueue(topic)
      console.log('[热点] ★', repo.stargazers_count, '→ 深度队列:', topic)
    }

    let readme = '', keyFeatures = ''
    for (const f of ['README.md', 'README.MD', 'README.rst']) {
      try {
        const d = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${f}`)
        if (d.content) {
          readme = Buffer.from(d.content, 'base64').toString('utf-8')
          keyFeatures = readme.replace(/#{1,6}\s+/g, '').replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`{1,3}[^`]*`{1,3}/g, '').trim().substring(0, 1200)
          break
        }
      } catch {}
    }

    const content = `# ${repo.name}

## 项目信息
- **作者**: ${repo.owner.login}
- **Stars**: ${repo.stargazers_count.toLocaleString()}
- **描述**: ${repo.description || '无'}
- **链接**: ${repo.html_url}
- **语言**: ${repo.language || '未知'}
- **主题标签**: ${(repo.topics || []).slice(0, 8).join(', ') || '无'}

## 核心功能
${keyFeatures || '[待深入研究]'}

---
*自动采集于 ${new Date().toISOString().split('T')[0]}*
`
    const safeName = repo.full_name.split('/').pop()
    const file = path.join(KNOWLEDGE_DIR, safeName + '.md')
    // 2.0: 总是注册实体（不依赖文件是否存在）
    const entityId = addEntity({
      title: repo.name,
      type: 'github_project',
      source: `github:${repo.full_name}`,
      confidence: repo.stargazers_count > 1000 ? 'high' : 'medium',
      topics: repo.topics?.slice(0, 5) || [],
    })
    if (!fs.existsSync(file)) {
      // 添加frontmatter到内容
      const entity = { id: entityId, version: 1, sources: [`github:${repo.full_name}`], confidence: repo.stargazers_count > 1000 ? 'high' : 'medium', topics: repo.topics?.slice(0, 5) || [], created: Date.now(), updated: Date.now() }
      const fullContent = buildFrontmatter(entity) + content
      fs.writeFileSync(file, fullContent, 'utf-8')
      // 记录首版快照
      addSnapshot(entityId, { version: 1, confidence: entity.confidence, sources: entity.sources, topics: entity.topics })
    } else {
      // 2.0: 文件已存在，更新实体快照
      addSnapshot(entityId, { version: Date.now(), confidence: repo.stargazers_count > 1000 ? 'high' : 'medium', sources: [`github:${repo.full_name}`], topics: repo.topics?.slice(0, 5) || [] })
    }
    markLearnedGitHub(repo.full_name, repo.topics || [], repo.description || '')
    record({ broad: true, deep: false, topic: repo.topics?.[0] || repo.name, stars: repo.stargazers_count, added: true })
    recordSuccess('github')
    logFeedback('success', { source: 'github', topic: repo.topics?.[0] || repo.name })

    // 2.0: 更新覆盖率并记录覆盖指标
    try {
      updateCoverage([file])
      const score = getCoverageScore()
      console.log('[覆盖] 覆盖率:', score + '%')
    } catch (e) {}

    // Vision学习：分析README中的架构图（每5个项目一次）
    try {
      const sysState = JSON.parse(fs.readFileSync(SYSTEM_STATE, 'utf-8'))
      sysState.visionRounds = (sysState.visionRounds || 0) + 1
      if (sysState.visionRounds % 5 === 0 && readme) {
        // 提取图片URL
        const imgMatches = readme.match(/!\[([^\]]*)\]\(([^)]+\.(png|jpg|jpeg|gif|svg|webp))\)/gi) || []
        if (imgMatches.length > 0) {
          const imgMatch = imgMatches[0].match(/\(([^)]+)\)/)
          if (imgMatch && imgMatch[1].startsWith('http')) {
            console.log('[Vision] 分析架构图:', imgMatch[1].substring(0, 50))
            const vr = await visionLearn.learnFromImage(imgMatch[1], repo.topics?.[0] || repo.name, repo.full_name)
            if (vr.saved) console.log('[Vision] 已保存分析')
          }
        }
      }
      fs.writeFileSync(SYSTEM_STATE, JSON.stringify(sysState))
    } catch (e) {}

    // 自动扩展arXiv查询池：基于GitHub项目主题
    if (repo.topics && repo.topics.length > 0) {
      const arXivQueries = repo.topics
        .filter(t => t.length > 2 && !t.includes('-'))
        .slice(0, 3)
        .map(t => 'ti:' + t.replace(/\s+/g, '+'))
      if (arXivQueries.length > 0) {
        expandPool('arxiv', arXivQueries)
        console.log('[Query扩展] arXiv新增:', arXivQueries.join(', '))
      }
    }
    // 记录轨迹和记忆
    try {
      memory.storeEpisodic('GitHub学习:'+repo.full_name, ['fetch','filter','save','update'], 'success')
    } catch(e) {}

    return true
  } catch (e) {
    recordFailure('github', e)
    logFeedback('failure', { source: 'github', error: e.message })
    try {
      memory.storeEpisodic('GitHub学习', ['fetch'], 'failure', e)
    } catch(e) {}
    console.log('[GitHub Err]', e.message)
  }
  return false
}

// ============ GitLab ============
async function learnGitLab() {
  if (!isAvailable('gitlab')) {
    console.log('[GitLab] 熔断中，跳过')
    return false
  }
  try {
    const q = selectQuery('gitlab')
    const url = `https://gitlab.com/api/v4/projects?search=${encodeURIComponent(q)}&visibility=public&order_by=star_count&sort=desc&per_page=30`
    const data = await fetch(url, { proxy: true })
    // GitLab returns {ok:true, data:[...]} or direct [...] or error object
    const arr = data?.data || (Array.isArray(data) ? data : [])
    if (!Array.isArray(arr)) {
      console.log('[GitLab] API返回格式异常:', typeof arr)
      return false
    }
    const repos = arr.filter(r => r.path_with_namespace && !isRecentlyLearnedGitHub(r.path_with_namespace, r.topics, r.description))
    if (repos.length === 0) {
      recordQuery('gitlab', q, false)
      recordFailure('gitlab', new Error('No new repos'))
      return false
    }
    recordQuery('gitlab', q, true)
    const repo = repos[Math.floor(Math.random() * repos.length)]
    console.log('[GitLab]', repo.path_with_namespace, '★', repo.star_count)
    return await learnGitHubForRepo(repo.path_with_namespace, 'gitlab')
  } catch (e) {
    recordFailure('gitlab', e)
    logFeedback('failure', { source: 'gitlab', error: e.message })
    console.log('[GitLab Err]', e.message)
  }
  return false
}

// ============ Codeberg ============
async function learnCodeberg() {
  if (!isAvailable('codeberg')) {
    console.log('[Codeberg] 熔断中，跳过')
    return false
  }
  try {
    const q = selectQuery('codeberg')
    const url = `https://codeberg.org/api/v1/repos/search?q=${encodeURIComponent(q)}&limit=30`
    const data = await fetch(url, { proxy: true })
    const repos = (data.results || []).filter(r => r.full_name && !isRecentlyLearnedGitHub(r.full_name, r.owner?.topics, r.description))
    if (repos.length === 0) {
      recordQuery('codeberg', q, false)
      recordFailure('codeberg', new Error('No new repos'))
      return false
    }
    recordQuery('codeberg', q, true)
    const repo = repos[Math.floor(Math.random() * repos.length)]
    console.log('[Codeberg]', repo.full_name, '★', repo.stars_count)
    return await learnGitHubForRepo(repo.full_name, 'codeberg')
  } catch (e) {
    recordFailure('codeberg', e)
    logFeedback('failure', { source: 'codeberg', error: e.message })
    console.log('[Codeberg Err]', e.message)
  }
  return false
}

// ============ arXiv ============
function isRecentlyLearnedArxiv(id) {
  try {
    const d = JSON.parse(fs.readFileSync(LEARNED_ARXIV, 'utf-8'))
    return d.papers.includes(id)
  } catch { return false }
}

function markLearnedArxiv(id) {
  try {
    const d = JSON.parse(fs.readFileSync(LEARNED_ARXIV, 'utf-8'))
    if (!d.papers.includes(id)) d.papers.push(id)
    fs.writeFileSync(LEARNED_ARXIV, JSON.stringify(d))
  } catch {}
}

async function learnArxiv() {
  if (!isAvailable('arxiv')) {
    console.log('[arXiv] 熔断中，跳过')
    return false
  }
  try {
    // arXiv export API rate limit: ~1 req/5s, add delay before query
    await new Promise(r => setTimeout(r, 5000))
    const q = selectQuery('arxiv')
    // arXiv 查询语法修复：ti:词1+词2 → ti:词1 OR ti:词2，+ 不是 arXiv 布尔运算符
    const fixedQ = q.replace(/^ti:([^+]+)\+([^+]+)$/, (_, w1, w2) => `ti:${w1} OR ti:${w2}`)
    const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(fixedQ)}&max_results=30&sortBy=submittedDate&sortOrder=descending`
    const xml = await fetchText(url)

    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
    const papers = []
    for (const e of entries) {
      const id = (e.match(/<id>(.*?)<\/id>/s) || [])[1] || ''
      const title = (e.match(/<title>(.*?)<\/title>/s) || [])[1] || ''
      const summary = (e.match(/<summary>(.*?)<\/summary>/s) || [])[1] || ''
      if (id) {
        const cleanId = id.split('/').pop().replace(/v\d+$/, '')
        papers.push({
          id: cleanId,
          title: title.replace(/[\n\r]/g, ' ').trim(),
          summary: summary.replace(/[\n\r]/g, ' ').trim().substring(0, 800)
        })
      }
    }

    const candidates = papers.filter(p => !isRecentlyLearnedArxiv(p.id))
    console.log('[arXiv Debug] 查询:', q, '-> papers:', papers.length, 'candidates:', candidates.length)
    if (papers.length === 0) {
      // 查询返回0结果，不是"已学习"而是查询本身无效
      console.log('[arXiv] 查询无效:', q, '返回0结果')
      recordQuery('arxiv', q, false)
      return false
    }
    if (candidates.length === 0) {
      console.log('[arXiv] 全部' + papers.length + '篇已学习，跳过')
      recordQuery('arxiv', q, false)
      return false
    }

    // 有新论文，记录成功
    recordQuery('arxiv', q, true)

    const paper = candidates[Math.floor(Math.random() * candidates.length)]
    console.log('[arXiv]', paper.id, paper.title.substring(0, 40))

    // 2.0: 总是注册实体
    const entityId = addEntity({
      title: paper.title.substring(0, 50),
      type: 'arxiv_paper',
      source: `arxiv:${paper.id}`,
      confidence: 'medium',
      topics: [],
    })

    const file = path.join(KNOWLEDGE_DIR, paper.id + '.md')
    if (!fs.existsSync(file)) {
      const content = `# ${paper.title}

## 论文信息
- **arXiv ID**: ${paper.id}
- **链接**: https://arxiv.org/abs/${paper.id}

## 摘要
${paper.summary || '[无摘要]'}

---
*自动采集于 ${new Date().toISOString().split('T')[0]}*
`
      fs.writeFileSync(file, content, 'utf-8')
      addSnapshot(entityId, { version: 1, confidence: 'medium', sources: [`arxiv:${paper.id}`], topics: [] })
      // 2.0: 更新覆盖率
      try {
        updateCoverage([file])
        const score = getCoverageScore()
        console.log('[覆盖] 覆盖率:', score + '%')
      } catch (e) {}
    }
    markLearnedArxiv(paper.id)
    record({ broad: true, deep: false, topic: paper.id, stars: 0, added: true })
    recordSuccess('arxiv')
    logFeedback('success', { source: 'arxiv', topic: paper.id })
    try { memory.storeEpisodic('arXiv学习:'+paper.id, ['fetch','parse','save'], 'success') } catch(e) {}
    return true
  } catch (e) {
    recordFailure('arxiv', e)
    logFeedback('failure', { source: 'arxiv', error: e.message })
    try { memory.storeEpisodic('arXiv学习', ['fetch'], 'failure', e) } catch(e) {}
    console.log('[arXiv Err]', e.message)
  }
  return false
}

// ============ Crossref ============
function isRecentlyLearnedCrossref(doi) {
  try {
    const d = JSON.parse(fs.readFileSync(LEARNED_CROSSREF, 'utf-8'))
    return d.papers.includes(doi)
  } catch { return false }
}

function markLearnedCrossref(doi) {
  try {
    const d = JSON.parse(fs.readFileSync(LEARNED_CROSSREF, 'utf-8'))
    if (!d.papers.includes(doi)) d.papers.push(doi)
    fs.writeFileSync(LEARNED_CROSSREF, JSON.stringify(d))
  } catch {}
}

async function learnCrossref() {
  if (!isAvailable('crossref')) {
    console.log('[Crossref] 熔断中，跳过')
    return false
  }
  try {
    const q = selectQuery('crossref')
    recordQuery('crossref', q, true)
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=10&sort=score&order=desc`
    const data = await fetch(url, { noAuth: true })
    const items = data.message?.items || []

    const candidates = items.filter(item => {
      const doi = item.DOI || ''
      return doi && !isRecentlyLearnedCrossref(doi)
    })

    if (candidates.length === 0) {
      recordQuery('crossref', q, false)
      return false
    }

    const paper = candidates[Math.floor(Math.random() * candidates.length)]
    const doi = paper.DOI
    const title = (paper.title || ['无标题'])[0]
    const abstract = paper.abstract?.replace(/<[^>]+>/g, '').trim() || ''
    const authors = (paper.author || []).map(a => `${a.given || ''} ${a.family || ''}`).filter(n => n.trim()).slice(0, 5)
    const year = paper.issued?.['date-parts']?.[0]?.[0] || '未知'
    const container = paper['container-title']?.[0] || paper.publisher || '未知期刊'

    console.log('[Crossref]', doi, title.substring(0, 40))

    // 2.0: 总是注册实体
    const entityId = addEntity({
      title: title.substring(0, 50),
      type: 'crossref_paper',
      source: `crossref:${doi}`,
      confidence: 'medium',
      topics: [],
    })

    const content = `# ${title}

## 论文信息
- **DOI**: ${doi}
- **期刊**: ${container}
- **作者**: ${authors.join(', ') || '未知'}
- **年份**: ${year}
- **链接**: https://doi.org/${doi}

## 摘要
${abstract.substring(0, 800) || '[无摘要]'}

---
*自动采集于 ${new Date().toISOString().split('T')[0]}*
`
    const safeName = doi.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60)
    const file = path.join(KNOWLEDGE_DIR, safeName + '.md')
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, content, 'utf-8')
      addSnapshot(entityId, { version: 1, confidence: 'medium', sources: [`crossref:${doi}`], topics: [] })
      // 2.0: 更新覆盖率
      try {
        updateCoverage([file])
        const score = getCoverageScore()
        console.log('[覆盖] 覆盖率:', score + '%')
      } catch (e) {}
    }
    markLearnedCrossref(doi)
    record({ broad: true, deep: false, topic: title.substring(0, 30), stars: 0, added: true })
    recordSuccess('crossref')
    logFeedback('success', { source: 'crossref', topic: title.substring(0, 30) })
    try { memory.storeEpisodic('Crossref学习:'+title.substring(0,20), ['fetch','parse','save'], 'success') } catch(e) {}
    return true
  } catch (e) {
    recordFailure('crossref', e)
    logFeedback('failure', { source: 'crossref', error: e.message })
    try { memory.storeEpisodic('Crossref学习', ['fetch'], 'failure', e) } catch(e) {}
    console.log('[Crossref Err]', e.message)
  }
  return false
}

// ============ 深度学习 ============
async function learnDeep(topic) {
  console.log('[深度]', topic)
  try {
    // 并行从三源深挖同一主题
    const [ghUrl, arxivUrl, crossrefUrl] = [
      `https://api.github.com/search/repositories?q=${encodeURIComponent(topic)}+AI&sort=stars&order=desc&per_page=5`,
      `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(topic)}&max_results=5&sortBy=submittedDate&sortOrder=descending`,
      `https://api.crossref.org/works?query=${encodeURIComponent(topic)}&rows=5&sort=score&order=desc`
    ]

    const [ghData, arxivXml, crossrefData] = await Promise.allSettled([
      fetch(ghUrl), fetchText(arxivUrl), fetch(crossrefUrl, { noAuth: true })
    ])

    let newCount = 0

    // GitHub
    if (ghData.status === 'fulfilled') {
      const repos = (ghData.value.items || []).filter(r => !isRecentlyLearnedGitHub(r.full_name))
      for (const repo of repos.slice(0, 3)) {
        const content = `# ${repo.name}\n\n## 项目信息\n- **Stars**: ${repo.stargazers_count}\n- **描述**: ${repo.description || '无'}\n- **链接**: ${repo.html_url}\n- **语言**: ${repo.language || '未知'}\n\n## 核心功能\n[待深入研究]\n\n---\n*深度采集于 ${new Date().toISOString().split('T')[0]}*\n`
        const file = path.join(KNOWLEDGE_DIR, repo.full_name.split('/').pop() + '.md')
        if (!fs.existsSync(file)) {
          fs.writeFileSync(file, content, 'utf-8')
          markLearnedGitHub(repo.full_name, repo.topics || [], repo.description || '')
          record({ broad: false, deep: true, topic: repo.topics?.[0] || repo.name, stars: repo.stargazers_count, added: true })
          newCount++
        }
      }
    }

    // arXiv
    if (arxivData.status === 'fulfilled') {
      const entries = arxivData.value.match(/<entry>[\s\S]*?<\/entry>/g) || []
      for (const e of entries.slice(0, 3)) {
        const id = (e.match(/<id>(.*?)<\/id>/s) || [])[1] || ''
        const title = (e.match(/<title>(.*?)<\/title>/s) || [])[1] || ''
        const summary = (e.match(/<summary>(.*?)<\/summary>/s) || [])[1] || ''
        const cleanId = id.split('/').pop().replace(/v\d+$/, '')
        if (cleanId && !isRecentlyLearnedArxiv(cleanId)) {
          const content = `# ${title.replace(/[\n\r]/g, ' ').trim()}\n\n## 论文信息\n- **arXiv ID**: ${cleanId}\n- **链接**: https://arxiv.org/abs/${cleanId}\n\n## 摘要\n${summary.replace(/[\n\r]/g, ' ').trim().substring(0, 800)}\n\n---\n*深度采集于 ${new Date().toISOString().split('T')[0]}*\n`
          const file = path.join(KNOWLEDGE_DIR, cleanId + '.md')
          if (!fs.existsSync(file)) {
            fs.writeFileSync(file, content, 'utf-8')
            markLearnedArxiv(cleanId)
            record({ broad: false, deep: true, topic: cleanId, stars: 0, added: true })
            newCount++
          }
        }
      }
    }

    // Crossref
    if (crossrefData.status === 'fulfilled') {
      const items = crossrefData.value.message?.items || []
      for (const item of items.slice(0, 3)) {
        const doi = item.DOI || ''
        if (doi && !isRecentlyLearnedCrossref(doi)) {
          const title = (item.title || ['无标题'])[0]
          const content = `# ${title}\n\n## 论文信息\n- **DOI**: ${doi}\n- **期刊**: ${item['container-title']?.[0] || '未知'}\n- **链接**: https://doi.org/${doi}\n\n## 摘要\n${item.abstract?.replace(/<[^>]+>/g, '').trim().substring(0, 800) || '[无摘要]'}\n\n---\n*深度采集于 ${new Date().toISOString().split('T')[0]}*\n`
          const safeName = doi.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60)
          const file = path.join(KNOWLEDGE_DIR, safeName + '.md')
          if (!fs.existsSync(file)) {
            fs.writeFileSync(file, content, 'utf-8')
            markLearnedCrossref(doi)
            record({ broad: false, deep: true, topic: title.substring(0, 30), stars: 0, added: true })
            newCount++
          }
        }
      }
    }

    console.log('[深度] 完成，', newCount, '条新内容')
    return newCount
  } catch (e) {
    console.log('[深度 Err]', e.message)
    return 0
  }
}

// ============ 多Agent并行学习 (竞品差距1) ============
async function learnMultiAgent() {
  try {
    const { multiAgentLearn } = require(WIKI_AUTO_DIR + 'multi_agent_executor')
    const { addEntity, buildFrontmatter, addSnapshot } = require(WIKI_AUTO_DIR + 'knowledge_graph')

    // 从查询池取多个不同查询并发执行
    const pool = require(WIKI_AUTO_DIR + 'query_optimizer')
    const queries = [
      pool.selectQuery('github'),
      pool.selectQuery('github'),
      pool.selectQuery('github'),
    ]

    console.log('[MultiAgent] 并行执行', queries.length, '个查询')
    const result = await multiAgentLearn(queries, { addEntity, buildFrontmatter, addSnapshot })
    return result.learned > 0
  } catch (e) {
    console.log('[MultiAgent Err]', e.message)
    return false
  }
}

// ============ 主循环 ============
async function learn() {
  const mode = getSystemMode()
  const interval = INTERVALS[mode]

  // 全源cooldown时进入本地整理模式
  if (shouldDoLocalWork(mode)) {
    await doLocalWork()
    console.log(`[主循环] 模式: ${mode}, 等待${interval/1000}秒...`)
    await new Promise(r => setTimeout(r, interval))
    return
  }

  // 检查深度队列
  const deepQueue = getDeepQueue()
  if (deepQueue.length > 0) {
    const topic = deepQueue.shift()
    fs.writeFileSync(DEEP_QUEUE, JSON.stringify(deepQueue))
    console.log('[主循环] === 深度模式 ===')
    await learnDeep(topic)
    console.log('[主循环] === 深度完成，暂停30秒 ===')
    await new Promise(r => setTimeout(r, 30000))
    return
  }

  console.log('[主循环] 开始广度学习...')

  let results
  if (mode === SYSTEM_MODES.TRY) {
    // TRY模式：只试探单个源
    const { isAvailable } = require('./source_health')
    const trySrc = nextTrySource()
    if (trySrc) {
      console.log(`[主循环] 试探模式: ${trySrc}`)
      let result = false
      if (trySrc === 'github') result = await learnGitHub()
      else if (trySrc === 'gitlab') result = await learnGitLab()
      else if (trySrc === 'codeberg') result = await learnCodeberg()
      else if (trySrc === 'arxiv') result = await learnArxiv()
      else if (trySrc === 'crossref') result = await learnCrossref()
      console.log(`[试探] ${trySrc}: ${result ? '成功' : '失败'}`)
      if (!result) {
        // 试探失败，保持TRY模式
      } else {
        // 试探成功，恢复TRY模式，继续下一个源
        trySource = null
      }
    } else {
      // 所有源都可用
      trySource = null
    }
    results = [{ status: 'fulfilled', value: true }]
  } else {
    // 新：多源Discovery + 学习模式
    // 使用Discovery Sources模块实现真正的多源发现
    const useDiscovery = mode === SYSTEM_MODES.NORMAL
    if (useDiscovery) {
      // 正常模式：使用多源Discovery
      try {
        const topic = suggestNextTopics ? suggestNextTopics()[0] : 'AI agent'
        const discResult = await discovery.discoverCandidates(topic, {
          useMMX: true,
          useGitHub: true,
          usePapersWithCode: true,
          useHuggingFace: true,
          useReddit: true,
          useHackerNews: true,
          maxPerSource: 8,
        })

        if (discResult.candidates.length > 0) {
          // 记录Discovery统计
          recordDiscovery('mmx', discResult.bySource.mmx?.length || 0)

          // 从候选中过滤已学习的
          const { isRecentlyLearned } = require(WIKI_AUTO_DIR + 'layered_learned')
          let newCandidates = discResult.candidates.filter(c => !isRecentlyLearned(c.repo))
          console.log('[Discovery] 过滤后候选:', newCandidates.length, '/', discResult.totalFound)

          if (newCandidates.length > 0) {
            // 获取候选的stars信息并评分
            const { getStatus } = require(WIKI_AUTO_DIR + 'source_health')
            for (let i = 0; i < newCandidates.length; i++) {
              try {
                const [owner, repo] = newCandidates[i].repo.split('/')
                if (owner && repo) {
                  const url = `https://api.github.com/repos/${owner}/${repo}`
                  const data = await fetch(url)
                  if (data && data.stargazers_count) {
                    newCandidates[i].stars = data.stargazers_count
                    newCandidates[i].topics = data.topics || []
                    newCandidates[i].description = data.description || ''
                  }
                }
              } catch(e) {}
              // 加延迟避免rate limit
              await new Promise(r => setTimeout(r, 500))
            }

            // 使用评分系统过滤
            const scored = scoreAndRank(newCandidates)
            const passed = scored.filter(c => c.score.passes)
            const filtered = scored.filter(c => !c.score.passes)

            console.log('[Scoring] 通过:', passed.length, '/', newCandidates.length, '| 淘汰:', filtered.length)
            recordFilter(filtered.length)

            if (passed.length > 0) {
              // 对通过的候选进行质量检查
              console.log('[Quality] 正在进行质量检查...')
              const qualityPromises = passed.map(async (c, idx) => {
                try {
                  const qa = await assessRepoQuality(c.repo, [c.source])
                  return { ...c, quality: qa }
                } catch(e) {
                  return { ...c, quality: { canLearn: true, overallScore: 50, decision: 'error' } }
                }
              })

              const qualityResults = await Promise.all(qualityPromises)
              const qualityPassed = qualityResults.filter(c => c.quality?.canLearn)
              const qualityFailed = qualityResults.filter(c => !c.quality?.canLearn)

              console.log('[Quality] 通过:', qualityPassed.length, '/', passed.length, '| 淘汰:', qualityFailed.length)
              recordFilter(qualityFailed.length)

              if (qualityPassed.length > 0) {
                // 选择质量分数最高的
                qualityPassed.sort((a, b) => (b.quality?.overallScore || 0) - (a.quality?.overallScore || 0))
                const target = qualityPassed[0]
                console.log('[Quality] 选择:', target.repo, '(质量分:', target.quality?.overallScore, ')')

                // 使用统一分发器按forge分流到对应平台学习
                const learnResult = await learnWithDepthDispatched(target.repo, { name: target.repo.split('/').pop() }, { score: target.score?.total || 0, forge: target.forge || 'github' })
                if (learnResult.success) {
                  // 标记为已学习（防重复）
                  markLearned(target.repo, target.topics || [], target.description || '')
                  recordLearn(target.repo, target.score?.total || 0, target.source)
                  recordSourceLearn(target.source)

                  // 记录学习成果
                  const fileName = target.repo.split('/').pop() + '.md'
                  recordLearnedKnowledge(fileName, {
                    topics: target.topics || [],
                    stars: target.stars || 0,
                    tier: learnResult.tier === 1 ? 'tier1' : 'tier2',
                    score: target.score?.total || 0,
                    source: target.source || 'unknown',
                  })

                  // 如果是浅学习，添加到晋升监控
                  if (learnResult.tier === 2) {
                    addToPromotionWatch(target.repo, target.stars || 0, target.source)
                    console.log('[Promotion] 已加入监控:', target.repo)
                  }

                  console.log('[Learn] 类型:', learnResult.tier === 1 ? '深学习' : '浅学习')
                  results = [{ status: 'fulfilled', value: true }]
                } else {
                  results = [{ status: 'fulfilled', value: false }]
                }
              } else {
                console.log('[Quality] 无候选通过质量检查，尝试其他源...')
                results = await Promise.allSettled([
                  learnGitHub(),
                  learnGitLab(),
                  learnCodeberg(),
                  learnArxiv(),
                  learnCrossref()
                ])
              }
            } else {
              console.log('[Scoring] 无候选通过评分，尝试其他源...')
              results = await Promise.allSettled([
                learnGitHub(),
                learnGitLab(),
                learnCodeberg(),
                learnArxiv(),
                learnCrossref()
              ])
            }
          } else {
            console.log('[Discovery] 所有候选已学习，尝试其他源...')
            results = await Promise.allSettled([
              learnGitHub(),
              learnGitLab(),
              learnCodeberg(),
              learnArxiv(),
              learnCrossref()
            ])
          }
        } else {
          console.log('[Discovery] 未发现候选，回退到传统源')
          results = await Promise.allSettled([
            learnGitHub(),
            learnGitLab(),
            learnCodeberg(),
            learnArxiv(),
            learnCrossref()
          ])
        }
      } catch(e) {
        console.log('[Discovery Err]', e.message)
        results = await Promise.allSettled([
          learnGitHub(),
          learnGitLab(),
          learnCodeberg(),
          learnArxiv(),
          learnCrossref()
        ])
      }
    } else {
      // 降级模式：回退到单源
      results = await Promise.allSettled([
        learnGitHub(),
        learnGitLab(),
        learnCodeberg(),
        learnArxiv(),
        learnCrossref()
      ])
    }
  }

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length
  console.log(`[主循环] 完成，${successCount}/5 新增 | 模式: ${mode}`)

  // 记录标准轨迹（trajectory > knowledge）
  try {
    const traj = trajectory.createTrajectory('广度学习循环', { mode, successCount })
    trajectory.addStep(traj, { observation: 'sources attempted', thought: 'filter by available', action: 'learnGitHub/GitLab/Codeberg/Arxiv/Crossref', result: successCount > 0 ? 'success' : 'no new' })
    trajectory.addStep(traj, { observation: 'coverage: ' + (process.env.LAST_COVERAGE || 'N/A'), thought: 'update coverage', action: 'updateCoverage', result: 'done' })
    trajectory.completeTrajectory(traj, successCount > 0 ? 'success' : 'partial')
  } catch(e) {}

  // 运行进化循环（每20轮）
  const sysState = JSON.parse(fs.readFileSync(SYSTEM_STATE, 'utf-8'))
  sysState.verifyRounds = (sysState.verifyRounds || 0) + 1
  fs.writeFileSync(SYSTEM_STATE, JSON.stringify(sysState))
  if (sysState.verifyRounds % 20 === 0) {
    try {
      const evolution = require(WIKI_AUTO_DIR + 'evolution_loop')
      const er = await evolution.runEvolutionCycle({})
      if (er.insights > 0) console.log('[Evolution] 洞察:', er.insights, '策略:', er.patterns)
    } catch(e) { console.log('[Evolution Err]', e.message) }
  }

  // Minimax增强（每20轮一次）
  if (sysState.verifyRounds % 20 === 0) {
    try {
      const evolution = require(WIKI_AUTO_DIR + 'evolution_loop')
      const er = await evolution.runEvolutionCycle({})
      if (er.insights > 0) console.log('[Evolution] 洞察:', er.insights, '策略:', er.patterns)
    } catch(e) { console.log('[Evolution Err]', e.message) }

    // Minimax增强学习
    try {
      const mmxResult = await minimax.enhancedLearnCycle('AI Agent', null)
      const mmxActivated = Object.entries(mmxResult).filter(([k,v]) => v && typeof v === 'string' && v.length > 0).map(([k]) => k)
      if (mmxActivated.length > 0) console.log('[Minimax] 激活:', mmxActivated.join(', '))
    } catch(e) { console.log('[Minimax Err]', e.message) }

    // Promotion检查（Tier2 -> Tier1）
    try {
      const promoQueue = getPromotionQueue()
      if (promoQueue.length > 0) {
        console.log('[Promotion] 待晋升队列:', promoQueue.length)
        const nextPromo = getNextPromotion()
        if (nextPromo) {
          console.log('[Promotion] 晋升:', nextPromo.repo, '(趋势分:', nextPromo.trendScore, ')')
          const promoResult = await learnWithDepth(nextPromo.repo, {
            name: nextPromo.repo.split('/').pop(),
            description: nextPromo.description,
            topics: nextPromo.topics,
          }, { score: 40, source: 'promotion' })
          if (promoResult.success) {
            markPromoted(nextPromo.repo)
            recordLearnedKnowledge(nextPromo.repo.split('/').pop() + '.md', {
              topics: nextPromo.topics,
              stars: nextPromo.currentStars,
              tier: 'tier1',
              score: 40,
              source: 'promotion',
            })
            console.log('[Promotion] 晋升成功:', nextPromo.repo)
          }
        }
      }
    } catch(e) { console.log('[Promotion Err]', e.message) }
  }

  // 清理冷门知识 + 重建map索引（每50轮一次）
  if (sysState.verifyRounds % 50 === 0) {
    try {
      pruneColdEntries()
    } catch(e) { console.log('[Prune Err]', e.message) }
    try {
      const runner = require(WIKI_AUTO_DIR + 'runner')
      await runner.runRebuild()
    } catch(e) { console.log('[Rebuild Err]', e.message) }
  }

  // SWE-bench验证 (移到这里避免重复)
  if (sysState.verifyRounds >= 50) {
    sysState.verifyRounds = 0
    fs.writeFileSync(SYSTEM_STATE, JSON.stringify(sysState))
    try {
      const { runSweBench, triggerSelfImprove } = require(WIKI_AUTO_DIR + 'swe_bench_integrator')
      const vr = await runSweBench({ sampleSize: 10 })
      const improve = triggerSelfImprove(vr.results)
      if (improve) {
        console.log('[SWE] 触发自我改进:', improve.files.length, '个文件需要验证')
      }
    } catch (e) { console.log('[SWE Err]', e.message) }
  }

  // 知识消化（竞品差距3）- 每100轮或强制触发
  if (sysState.verifyRounds % 100 === 0 || sysState.forceDigest) {
    try {
      const { digest } = require(WIKI_AUTO_DIR + 'knowledge_digester')
      const dr = await digest()
      if (dr) console.log('[Digest] 生成', dr.insights, '条洞察')
    } catch (e) { console.log('[Digest Err]', e.message) }
  }

  // 触发wiki更新
  if (successCount > 0) {
    try {
      const hook = require(WIKI_AUTO_DIR + 'hooks/wiki-auto-hook')
      hook.processWikiTrigger('进化')
    } catch (e) {}
  }

  // 根据系统模式动态调整间隔
  console.log(`[主循环] 等待${interval/1000}秒...`)
  await new Promise(r => setTimeout(r, interval))
}

;(async () => {
  console.log('[Master] 启动混合学习循环（广度+深度）')
  while (true) {
    await learn()
  }
})()
  .catch(e => console.error('[Fatal]', e.message))