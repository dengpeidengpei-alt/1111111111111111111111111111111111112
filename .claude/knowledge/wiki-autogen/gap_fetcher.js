/**
 * gap_fetcher.js - Gap驱动的高优先级抓取
 *
 * 当Gap→Task链路产生任务时，优先执行这些任务
 * 整合到master_learn循环中
 */

const fs = require('fs')
const https = require('https')

const GAP_TASK_FILE = 'E:/Claude/.learnings/gap_tasks.json'
const QUERY_POOL_FILE = 'E:/Claude/.learnings/query_pool.json'
const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'

const { isRecentlyLearned: isLayeredLearned } = require('E:/Claude/.claude/knowledge/wiki-autogen/layered_learned')

// 从gap_to_task加载
const gt = require('E:/Claude/.claude/knowledge/wiki-autogen/gap_to_task')

function loadJSON(file, defaultVal) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return defaultVal || {} }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

/**
 * 优先抓取Gap任务
 */
function fetchGapTask() {
  const next = gt.getNextQuery()
  if (!next) {
    return { fetched: false, reason: 'no_gap_tasks' }
  }

  console.log('[GapFetch] 执行gap任务:', next.query)

  // 执行抓取
  const result = {
    query: next.query,
    sources: next.sources,
    task_id: next.task_id,
    gap_id: next.gap_id
  }

  // 尝试GitHub
  if (next.sources.includes('github')) {
    const githubResult = fetchFromGitHub(next.query)
    if (githubResult.success) {
      result.github = githubResult
      // 标记任务完成
      gt.markTaskComplete(next.task_id, { source: 'github', result: githubResult })
      return result
    }
  }

  // 尝试arXiv
  if (next.sources.includes('arxiv')) {
    const arxivResult = fetchFromArxiv(next.query)
    if (arxivResult.success) {
      result.arxiv = arxivResult
      gt.markTaskComplete(next.task_id, { source: 'arxiv', result: arxivResult })
      return result
    }
  }

  // 失败
  gt.markTaskFailed(next.task_id, result.error || 'fetch_failed')
  return result
}

/**
 * 从GitHub抓取
 */
function fetchFromGitHub(query) {
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://api.github.com/search/repositories?q=${encodedQuery}&sort=stars&per_page=5`

    return new Promise((resolve) => {
      const req = https.get(url, {
        headers: { 'User-Agent': 'Claude-AutoLearn/2.0' }
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.items && json.items.length > 0) {
              const results = []
              for (const item of json.items.slice(0, 3)) {
                if (!isRecentlyLearned(item.full_name)) {
                  const saved = saveKnowledgeFile(item)
                  if (saved) results.push(item.full_name)
                }
              }
              resolve({ success: true, count: results.length, repos: results })
            } else {
              resolve({ success: false, error: 'no_results' })
            }
          } catch (e) {
            resolve({ success: false, error: 'parse_error' })
          }
        })
      })
      req.setTimeout(10000, () => {
        req.destroy()
        resolve({ success: false, error: 'timeout' })
      })
      req.on('error', (e) => resolve({ success: false, error: e.message }))
    })
  } catch (e) {
    return { success: false, error: e.message }
  }
}

function fetchFromArxiv(query, retries = 3) {
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodedQuery}&max_results=5`

    const attempt = (remaining, delay) => new Promise((resolve) => {
      https.get(url, { headers: { 'User-Agent': 'Claude-Auto-Learner' } }, (res) => {
        const statusCode = res.statusCode
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (statusCode === 429) {
            const retryAfter = res.headers['retry-after']
            const backoff = (retryAfter ? parseInt(retryAfter) * 1000 : null) || Math.min(delay * 2, 120000)
            console.log(`[GapFetch/arXiv] 429, retry in ${Math.round(backoff/1000)}s (${remaining-1} left)`)
            if (remaining > 0) {
              setTimeout(() => resolve(attempt(remaining - 1, backoff)), backoff)
              return
            }
            resolve({ success: false, error: 'rate_limit' })
            return
          }
          if (statusCode >= 400) {
            resolve({ success: false, error: 'http_' + statusCode })
            return
          }
          if (data.includes('<entry>')) {
            resolve({ success: true, count: 0, message: 'arxiv_found' })
          } else {
            resolve({ success: false, error: 'no_results' })
          }
        })
      }).on('error', (e) => {
        const backoff = Math.min(delay * 2, 30000)
        if (remaining > 0) {
          setTimeout(() => resolve(attempt(remaining - 1, backoff)), backoff)
        } else {
          resolve({ success: false, error: e.message })
        }
      })
    })

    return attempt(retries, 1000)
  } catch (e) {
    return { success: false, error: e.message }
  }
}

/**
 * 检查是否已学习（统一走 layered_learned）
 */
function isRecentlyLearned(repoFullName) {
  return isLayeredLearned(repoFullName)
}

/**
 * 保存知识文件
 */
function saveKnowledgeFile(item) {
  try {
    const filename = item.full_name.replace('/', '_').replace(/\./g, '_') + '.md'
    const filepath = KNOWLEDGE_DIR + filename

    if (fs.existsSync(filepath)) {
      return false
    }

    const content = `# ${item.name}\n\n` +
      `**${item.full_name}** | ⭐ ${item.stargazers_count.toLocaleString()} | Lang: ${item.language || 'N/A'}\n\n` +
      `${item.description || 'No description'}\n\n` +
      `## Links\n- [GitHub](${item.html_url})\n` +
      `## Auto-collected\n` +
      `采集时间: ${new Date().toISOString()}\n`

    fs.writeFileSync(filepath, content)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 执行一轮Gap优先抓取
 */
function runGapFetchCycle() {
  console.log('[GapFetch] =====================')
  console.log('[GapFetch] 开始Gap优先抓取循环')

  // 1. 先执行gap任务
  const fetchResult = fetchGapTask()
  console.log('[GapFetch] 抓取结果:', JSON.stringify(fetchResult))

  // 2. 检查是否还有待处理gap
  const stats = gt.getLoopStats()
  console.log('[GapFetch] Gap循环统计:', JSON.stringify(stats))

  return fetchResult
}

/**
 * 获取Gap任务状态
 */
function getGapFetchStatus() {
  const stats = gt.getLoopStats()
  const next = gt.getNextQuery()

  return {
    loop_stats: stats,
    next_query: next,
    pending_count: stats.tasks?.by_status?.pending || 0,
    completed_count: stats.tasks?.by_status?.completed || 0
  }
}

module.exports = {
  fetchGapTask,
  runGapFetchCycle,
  getGapFetchStatus
}