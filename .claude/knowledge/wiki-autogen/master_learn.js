/**
 * master_learn.js - 主学习循环
 * 并行执行GitHub/arXiv/Crossref三源学习
 * 每30秒完成一轮
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

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
const SOURCE_ORDER = ['github', 'arxiv', 'crossref']

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

function fetch(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const headers = { 'User-Agent': 'Claude-Auto-Learner' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const req = https.get(url, { headers }, (res) => {
      const statusCode = res.statusCode
      const contentType = res.headers['content-type'] || ''
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        // Rate limit
        if (statusCode === 429) {
          reject(new Error('Rate limit'))
          return
        }
        // Non-JSON response
        if (!contentType.includes('json')) {
          console.log('[Fetch] Non-JSON:', contentType, '| Status:', statusCode)
          reject(new Error(`Non-JSON: ${statusCode}`))
          return
        }
        // JSON parse
        try { resolve(JSON.parse(data)) } catch {
          console.log('[Fetch] Parse failed, status:', statusCode)
          reject(new Error('Parse error'))
        }
      })
    }).on('error', (err) => {
      if (retries > 0) setTimeout(() => resolve(fetch(url, retries - 1)), 500)
      else reject(err)
    })
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

function fetchText(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Claude-Auto-Learner' } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', (err) => {
      if (retries > 0) setTimeout(() => resolve(fetchText(url, retries - 1)), 500)
      else reject(err)
    })
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
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

async function learnGitHub() {
  if (!isAvailable('github')) {
    console.log('[GitHub] 熔断中，跳过')
    return false
  }
  try {
    const q = selectQuery('github')
    recordQuery('github', q, true) // 记录查询尝试
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=30`
    const data = await fetch(url)
    const repos = (data.items || []).filter(r => !isRecentlyLearnedGitHub(r.full_name, r.topics, r.description))
    if (repos.length === 0) {
      recordQuery('github', q, false)
      return false
    }

    const repo = repos[Math.floor(Math.random() * repos.length)]
    console.log('[GitHub]', repo.full_name, '★', repo.stargazers_count)

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
    return true
  } catch (e) { recordFailure('github', e); logFeedback('failure', { source: 'github', error: e.message }); console.log('[GitHub Err]', e.message) }
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
    const q = selectQuery('arxiv')
    recordQuery('arxiv', q, true)
    const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(q)}&max_results=10&sortBy=submittedDate&sortOrder=descending`
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
    if (candidates.length === 0) {
      console.log('[arXiv] 全部' + papers.length + '篇已学习，跳过')
      recordQuery('arxiv', q, false)
      return false
    }

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
    return true
  } catch (e) { recordFailure('arxiv', e); logFeedback('failure', { source: 'arxiv', error: e.message }); console.log('[arXiv Err]', e.message) }
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
    const data = await fetch(url)
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
    return true
  } catch (e) { recordFailure('crossref', e); logFeedback('failure', { source: 'crossref', error: e.message }); console.log('[Crossref Err]', e.message) }
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
      fetch(ghUrl), fetchText(arxivUrl), fetch(crossrefUrl)
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
    // 多Agent并行模式：替代原来的单源顺序执行
    const useMultiAgent = mode === SYSTEM_MODES.NORMAL
    if (useMultiAgent) {
      // 正常模式：多Agent并行广度学习
      const maResult = await learnMultiAgent()
      results = [{ status: 'fulfilled', value: maResult }]
    } else {
      // 降级模式：回退到单源
      results = await Promise.allSettled([
        learnGitHub(),
        learnArxiv(),
        learnCrossref()
      ])
    }
  }

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length
  console.log(`[主循环] 完成，${successCount}/3 新增 | 模式: ${mode}`)

  // SWE-bench风格验证（竞品差距2）- 每50轮运行一次
  const sysState = JSON.parse(fs.readFileSync(SYSTEM_STATE, 'utf-8'))
  sysState.verifyRounds = (sysState.verifyRounds || 0) + 1
  fs.writeFileSync(SYSTEM_STATE, JSON.stringify(sysState))
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