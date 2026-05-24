/**
 * discovery_sources.js - 多源Discovery层
 * 替代单一GitHub Search，实现真正的多源知识发现
 *
 * 核心思想：
 * - MMX Search为主（不依赖GitHub quota）
 * - 其他源辅助
 * - 统一输出候选repo列表
 */

const { execSync } = require('child_process')
const https = require('https')
const fs = require('fs')
const path = require('path')

const WIKI_AUTO_DIR = 'E:/Claude/.claude/knowledge/wiki-autogen/'
const LEARNINGS_DIR = 'E:/Claude/.learnings/'

function getProxyUrl() {
  return process.env.HTTP_PROXY || process.env.HTTPS_PROXY || ''
}

// 搜索词模板（时间窗口随机化）
const SEARCH_TEMPLATES = [
  'best open source AI agent github 2026',
  'site:github.com autonomous agent MCP',
  'github trending AI tools this week',
  'model context protocol server awesome list',
  'RAG framework github stars:>500',
  'LLM agent autonomous coding tools github',
  'recent open source multimodal AI agents',
  'huggingface transformers agent examples',
  'AI agent memory context management github',
  'local LLM agent tools ollama langchain',
  'best new AI repositories github today',
  'awesome AI agents list github stars',
  'deep learning agents reinforcement github',
  'AI browser automation agent github',
  'multi agent system coordination github',
]

const SEARCH_SOURCES = {
  mmx: {
    name: 'MMX Search',
    weight: 5,  // 权重最高
    minInterval: 5000,  // 最小间隔ms
  },
  github: {
    name: 'GitHub Search',
    weight: 3,
    minInterval: 15000,  // GitHub需要更长间隔
  },
  paperswithcode: {
    name: 'PapersWithCode',
    weight: 2,
    minInterval: 10000,
  },
  gitlab: {
    name: 'GitLab',
    weight: 2,
    minInterval: 10000,
    proxy: true,  // 需要代理
  },
  sourcehut: {
    name: 'SourceHut',
    weight: 1,
    minInterval: 10000,
  },
  codeberg: {
    name: 'Codeberg',
    weight: 1,
    minInterval: 10000,
  },
  huggingface: {
    name: 'HuggingFace',
    weight: 2,
    minInterval: 10000,
  },
  reddit: {
    name: 'Reddit',
    weight: 1,
    minInterval: 20000,
  },
  hackernews: {
    name: 'HackerNews',
    weight: 1,
    minInterval: 15000,
  }
}

// ============ 工具函数 ============

function getToken() {
  const tokens = [
    process.env.GITHUB_TOKEN || '',
    process.env.GITHUB_TOKEN_2 || ''
  ].filter(Boolean)
  if (tokens.length === 0) return ''
  return tokens[Math.floor(Math.random() * tokens.length)]
}

function parseRetryAfter(header) {
  if (!header) return null
  const val = parseInt(header)
  if (!isNaN(val)) return val * 1000
  return 60000
}

function fetch(url, timeout = 30000, options = {}) {
  let retries = 2
  if (typeof options === 'number') {
    retries = options
  } else if (options && options.retries !== undefined) {
    retries = options.retries
  }
  return new Promise((resolve, reject) => {
    const attempt = (remaining, delay) => {
      // Proxy mode: use curl for HTTP CONNECT proxy
      if (options && options.proxy) {
        const proxyUrl = getProxyUrl()
        if (!proxyUrl) {
          // No proxy configured, fall through to native https
        } else {
          const { execSync } = require('child_process')
          const shellCmd = `curl -s -x ${proxyUrl} --max-time 25 --connect-timeout 15 "${url.replace(/"/g, '\\"')}"`
          try {
            const result = execSync(shellCmd, { encoding: 'utf8', windowsHide: true, maxBuffer: 10 * 1024 * 1024 })
            try { resolve(JSON.parse(result)) } catch { resolve(result) }
            return
          } catch(e) { reject(new Error('curl failed: ' + e.message)) }
          return
        }
      }

      const token = getToken()
      const headers = { 'User-Agent': 'Claude-Auto-Learner' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const req = https.get(url, { headers }, (res) => {
        let data = ''
        res.on('data', c => data += c)
        res.on('end', () => {
          if (res.statusCode === 429) {
            const retryAfter = parseRetryAfter(res.headers['retry-after'])
            const backoff = retryAfter || Math.min(delay * 2, 120000)
            console.log(`[Discovery] 429, retry in ${Math.round(backoff/1000)}s (${remaining-1} left)`)
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1, backoff), backoff)
              return
            }
            reject(new Error('Rate limit (max retries)'))
            return
          }
          try { resolve(JSON.parse(data)) } catch { resolve(data) }
        })
      }).on('error', (err) => {
        const backoff = Math.min(delay * 2, 30000)
        if (remaining > 0) {
          setTimeout(() => attempt(remaining - 1, backoff), backoff)
        } else {
          reject(err)
        }
      })
      req.setTimeout(timeout, function() { req.destroy(); reject(new Error('Timeout')) })
    }
    attempt(retries, 1000)
  })
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min)) + min
  return new Promise(r => setTimeout(r, delay))
}

// ============ MMX Search发现 ============

async function discoverFromMMX(query) {
  try {
    const fullCmd = `mmx search query "${query}" --limit 20`
    console.log('[MMX Discovery]', query.substring(0, 50))
    const output = execSync(fullCmd, { shell: true, timeout: 30000, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })

    // 检测quota exhausted
    if (output.includes('usage limit exceeded') || output.includes('150/150 used')) {
      console.log('[MMX] Quota exhausted，设置cooldown')
      try {
        const { recordFailure } = require('./source_health')
        recordFailure('mmx', new Error('MMX search quota exhausted'))
      } catch {}
      return { source: 'mmx', query, repos: [], error: 'quota exhausted' }
    }

    // 从搜索结果中提取GitHub URL
    const githubMatches = output.match(/github\.com\/([\w-]+\/[\w-]+)/gi) || []
    const uniqueRepos = [...new Set(githubMatches.map(m => {
      let repo = m.replace('github.com/', '')
      // 清理错误的prefix（如 github/github-mcp-server -> github-mcp-server）
      if (repo.split('/')[0] === 'github') {
        repo = repo.split('/').slice(1).join('/')
      }
      return repo
    }))]

    return {
      source: 'mmx',
      query,
      repos: uniqueRepos,
      raw: output.substring(0, 500)
    }
  } catch (e) {
    console.log('[MMX Discovery Err]', e.message)
    return { source: 'mmx', query, repos: [], error: e.message }
  }
}

// ============ GitHub发现 ============

async function discoverFromGitHub(query) {
  try {
    await randomDelay(2000, 4000)  // 避免rate limit
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=15`
    const data = await fetch(url)
    const repos = (data.items || []).map(r => r.full_name)

    return { source: 'github', query, repos }
  } catch (e) {
    console.log('[GitHub Discovery Err]', e.message)
    return { source: 'github', query, repos: [], error: e.message }
  }
}

// ============ GitLab发现 ============

async function discoverFromGitLab(query) {
  try {
    await randomDelay(2000, 4000)
    const url = `https://gitlab.com/api/v4/projects?search=${encodeURIComponent(query)}&visibility=public&order_by=star_count&sort=desc&per_page=10`
    // Direct curl for proxy - fetch doesn't handle HTTP CONNECT proxy properly
    const proxyUrl = getProxyUrl()
    const { execSync } = require('child_process')
    const safeUrl = url.replace(/"/g, '\\"')
    const shellCmd = proxyUrl
      ? `curl -s -x ${proxyUrl} --max-time 25 --connect-timeout 15 "${safeUrl}"`
      : `curl -s --max-time 25 --connect-timeout 15 "${safeUrl}"`
    const result = execSync(shellCmd, { encoding: 'utf8', windowsHide: true, maxBuffer: 10 * 1024 * 1024 })
    const data = JSON.parse(result)
    const repos = (data || []).map(r => r.path_with_namespace)

    return { source: 'gitlab', query, repos }
  } catch (e) {
    console.log('[GitLab Discovery Err]', e.message)
    return { source: 'gitlab', query, repos: [], error: e.message }
  }
}

// ============ SourceHut发现 ============

async function discoverFromSourceHut(query) {
  try {
    await randomDelay(2000, 4000)
    // SourceHut has no public API, use their search page
    const url = `https://sr.ht/?search=${encodeURIComponent(query)}`
    // sr.ht doesn't have a good API, return empty for now
    return { source: 'sourcehut', query, repos: [], error: 'no public API' }
  } catch (e) {
    return { source: 'sourcehut', query, repos: [], error: e.message }
  }
}

// ============ Codeberg发现 ============

async function discoverFromCodeberg(query) {
  try {
    await randomDelay(2000, 4000)
    // Codeberg API - use direct curl for proxy
    const url = `https://codeberg.org/api/v1/repos/search?q=${encodeURIComponent(query)}&limit=10`
    const { execSync } = require('child_process')
    const safeUrl = url.replace(/"/g, '\\"')
    const proxyUrl = getProxyUrl()
    const shellCmd = proxyUrl
      ? `curl -s -x ${proxyUrl} --max-time 25 --connect-timeout 15 "${safeUrl}"`
      : `curl -s --max-time 25 --connect-timeout 15 "${safeUrl}"`
    const result = execSync(shellCmd, { encoding: 'utf8', windowsHide: true, maxBuffer: 10 * 1024 * 1024 })
    const data = JSON.parse(result)
    const repos = (data.data || []).map(r => r.full_name)

    return { source: 'codeberg', query, repos }
  } catch (e) {
    console.log('[Codeberg Discovery Err]', e.message)
    return { source: 'codeberg', query, repos: [], error: e.message }
  }
}

// ============ PapersWithCode发现 ============

async function discoverFromPapersWithCode(topic) {
  try {
    await randomDelay(1000, 2000)
    const url = `https://paperswithcode.com/api/v1/papers/?q=${encodeURIComponent(topic)}&format=json`
    const data = await fetch(url)
    const repos = []

    for (const paper of (data.results || []).slice(0, 5)) {
      if (paper.github_url) {
        const match = paper.github_url.match(/github\.com\/([\w-]+\/[\w-]+)/)
        if (match) repos.push(match[1])
      }
    }

    return { source: 'paperswithcode', query: topic, repos }
  } catch (e) {
    return { source: 'paperswithcode', query: topic, repos: [], error: e.message }
  }
}

// ============ HuggingFace发现 ============

async function discoverFromHuggingFace(topic) {
  try {
    await randomDelay(1000, 2000)
    const url = `https://huggingface.co/api/models?search=${encodeURIComponent(topic)}&sort=downloads&order=desc&limit=10`
    const data = await fetch(url)
    const repos = []

    for (const model of (data || [])) {
      if (model.repo_id) {
        repos.push(model.repo_id)
      }
    }

    return { source: 'huggingface', query: topic, repos }
  } catch (e) {
    return { source: 'huggingface', query: topic, repos: [], error: e.message }
  }
}

// ============ Reddit发现 ============

async function discoverFromReddit(topic) {
  try {
    await randomDelay(1000, 2000)
    // 使用Reddit JSON API
    const url = `https://www.reddit.com/r/LocalLLaMA/search.json?q=${encodeURIComponent(topic)}&sort=top&limit=10`
    const data = await fetch(url)
    const repos = []

    for (const post of (data.data?.children || [])) {
      const url = post.data?.url || ''
      const match = url.match(/github\.com\/([\w-]+\/[\w-]+)/)
      if (match) repos.push(match[1])
    }

    return { source: 'reddit', query: topic, repos }
  } catch (e) {
    return { source: 'reddit', query: topic, repos: [], error: e.message }
  }
}

// ============ HackerNews发现 ============

async function discoverFromHackerNews(topic) {
  try {
    await randomDelay(1000, 2000)
    // HN API - 先搜索
    const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(topic)}&tags=story&hitsPerPage=10`
    const data = await fetch(searchUrl)
    const repos = []

    for (const hit of (data.hits || [])) {
      const url = hit.url || ''
      const match = url.match(/github\.com\/([\w-]+\/[\w-]+)/)
      if (match) repos.push(match[1])
    }

    return { source: 'hackernews', query: topic, repos }
  } catch (e) {
    return { source: 'hackernews', query: topic, repos: [], error: e.message }
  }
}

// ============ 主入口：多源发现 ============

// 从URL推断forge
function inferForge(repoFullName) {
  const lower = repoFullName.toLowerCase()
  if (lower.includes('gitlab.com') || lower.includes('gitlab')) return 'gitlab'
  if (lower.includes('codeberg.org')) return 'codeberg'
  if (lower.includes('github.com') || !lower.includes('.')) return 'github'  // bare "owner/repo" defaults to github
  return 'github'
}

async function discoverCandidates(topic, options = {}) {
  const {
    useMMX = true,
    useGitHub = true,
    useGitLab = true,
    useSourceHut = true,
    useCodeberg = true,
    usePapersWithCode = true,
    useHuggingFace = true,
    useReddit = true,
    useHackerNews = true,
    maxPerSource = 10,
  } = options

  const results = {
    mmx: [],
    github: [],
    gitlab: [],
    sourcehut: [],
    codeberg: [],
    paperswithcode: [],
    huggingface: [],
    reddit: [],
    hackernews: [],
  }

  // 随机选择一个搜索词
  const shuffledTemplates = shuffleArray(SEARCH_TEMPLATES)
  const query = shuffledTemplates[0].replace('AI agent', topic || 'AI agent')

  console.log('[Discovery] 主题:', topic || 'AI agent', '| 查询:', query.substring(0, 40))

  // 检查MMX是否cooldown（避免无效调用）
  let mmxAvailable = true
  try {
    const { isAvailable } = require('./source_health')
    mmxAvailable = isAvailable('mmx')
    if (!mmxAvailable) console.log('[Discovery] MMX cooldown，跳过')
  } catch {}

  // 并行执行各源发现
  const tasks = []

  if (useMMX && mmxAvailable) {
    tasks.push(discoverFromMMX(query).then(r => { results.mmx = r.repos.slice(0, maxPerSource) }))
  }

  if (useGitHub) {
    tasks.push(discoverFromGitHub(query).then(r => { results.github = r.repos.slice(0, maxPerSource) }))
  }

  if (useGitLab) {
    tasks.push(discoverFromGitLab(query).then(r => { results.gitlab = r.repos.slice(0, maxPerSource) }))
  }

  if (useSourceHut) {
    tasks.push(discoverFromSourceHut(query).then(r => { results.sourcehut = r.repos.slice(0, maxPerSource) }))
  }

  if (useCodeberg) {
    tasks.push(discoverFromCodeberg(query).then(r => { results.codeberg = r.repos.slice(0, maxPerSource) }))
  }

  if (usePapersWithCode) {
    tasks.push(discoverFromPapersWithCode(topic || 'AI agent').then(r => { results.paperswithcode = r.repos.slice(0, maxPerSource) }))
  }

  if (useHuggingFace) {
    tasks.push(discoverFromHuggingFace(topic || 'AI agent').then(r => { results.huggingface = r.repos.slice(0, maxPerSource) }))
  }

  if (useReddit) {
    tasks.push(discoverFromReddit(topic || 'AI agent').then(r => { results.reddit = r.repos.slice(0, maxPerSource) }))
  }

  if (useHackerNews) {
    tasks.push(discoverFromHackerNews(topic || 'AI agent').then(r => { results.hackernews = r.repos.slice(0, maxPerSource) }))
  }

  await Promise.allSettled(tasks)

  // 汇总所有repos，每个候选标记forge
  const allRepos = []
  const seen = new Set()

  for (const [source, repos] of Object.entries(results)) {
    for (const repo of repos) {
      if (!seen.has(repo)) {
        seen.add(repo)
        allRepos.push({ repo, source, forge: inferForge(repo) })
      }
    }
  }

  const totalFound = Object.values(results).reduce((sum, r) => sum + r.length, 0)
  console.log('[Discovery] 汇总:', totalFound, '个候选repos | 来源分布:', Object.entries(results).map(([k,v]) => k + '=' + v.length).join(', '))

  return {
    totalFound,
    bySource: results,
    candidates: allRepos,
    query,
  }
}

// ============ 命令行测试 ============

if (require.main === module) {
  const topic = process.argv[2] || 'AI agent'
  discoverCandidates(topic).then(r => {
    console.log('\n=== 发现结果 ===')
    console.log('总计:', r.totalFound)
    console.log('候选:', r.candidates.slice(0, 10).map(c => c.repo).join(', '))
  }).catch(e => console.log('Err', e.message))
}

module.exports = {
  discoverCandidates,
  discoverFromGitLab,
  discoverFromCodeberg,
  SEARCH_TEMPLATES,
  SEARCH_SOURCES,
}