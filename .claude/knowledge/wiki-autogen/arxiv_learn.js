/**
 * arxiv_learn.js - 从arxiv获取最新AI论文，学习并记录到wiki
 * 免费无限制的数据源
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'
const LEARNINGS_DIR = 'E:/Claude/.learnings/'
const WIKI_AUTO_DIR = 'E:/Claude/.claude/knowledge/wiki-autogen/'

const LEARNED_FILE = path.join(LEARNINGS_DIR, 'learned_arxiv.json')

function getLearned() {
  if (fs.existsSync(LEARNED_FILE)) {
    return JSON.parse(fs.readFileSync(LEARNED_FILE, 'utf-8'))
  }
  return { papers: [], lastCleanup: Date.now() }
}

function markLearned(paperId) {
  const data = getLearned()
  if (!data.papers.includes(paperId)) {
    data.papers.push(paperId)
  }
  if (data.papers.length > 200) {
    data.papers = data.papers.slice(-100)
  }
  fs.writeFileSync(LEARNED_FILE, JSON.stringify(data), 'utf-8')
}

function isRecentlyLearned(paperId) {
  const data = getLearned()
  if (data.papers.includes(paperId)) return true
  // 检查wiki是否已存在
  const wikiFile = path.join(KNOWLEDGE_DIR, paperId + '.md')
  return fs.existsSync(wikiFile)
}

function parseRetryAfter(header) {
  if (!header) return null
  const val = parseInt(header)
  if (!isNaN(val)) return val * 1000
  return 60000
}

function fetch(url, retries = 3) {
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
            console.log(`[arXiv] 429, retry in ${Math.round(backoff/1000)}s (${remaining-1} retries left)`)
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1, backoff), backoff)
              return
            }
            reject(new Error('Rate limit (max retries)'))
            return
          }
          if (statusCode >= 400) {
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
      req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')) })
    }
    attempt(retries, 1000)
  })
}

function parseArxivFeed(xml) {
  const papers = []
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
  for (const entry of entries) {
    const id = (entry.match(/<id>(.*?)<\/id>/s) || [])[1] || ''
    const title = (entry.match(/<title>(.*?)<\/title>/s) || [])[1] || ''
    const summary = (entry.match(/<summary>(.*?)<\/summary>/s) || [])[1] || ''
    const published = (entry.match(/<published>(.*?)<\/published>/s) || [])[1] || ''
    const link = (entry.match(/<link[^>]*rel="alternate"[^>]*href="(.*?)"/s) || [])[1] || ''
    const authors = []
    const authorMatches = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g) || []
    for (const m of authorMatches) {
      const n = (m.match(/<name>(.*?)<\/name>/) || [])[1]
      if (n) authors.push(n)
    }
    const categories = []
    const catMatches = entry.match(/<category term="(.*?)"/g) || []
    for (const m of catMatches) {
      const c = m.match(/term="(.*?)"/)[1]
      if (c) categories.push(c)
    }
    if (id) {
      papers.push({
        id: id.split('/').pop().replace('v1', '').replace('v2', '').replace('v3', ''),
        title: title.replace(/[\n\r]/g, ' ').trim(),
        summary: summary.replace(/[\n\r]/g, ' ').trim().substring(0, 800),
        published,
        link,
        authors: authors.slice(0, 5),
        categories: categories.slice(0, 5)
      })
    }
  }
  return papers
}

function saveToWiki(title, content) {
  const file = path.join(KNOWLEDGE_DIR, title + '.md')
  if (fs.existsSync(file)) return false
  fs.writeFileSync(file, content, 'utf-8')
  return true
}

// arXiv搜索查询
const QUERIES = [
  { q: 'ti:AI+agent', label: 'AI Agent' },
  { q: 'ti:LLM+agent', label: 'LLM Agent' },
  { q: 'ti:multi+agent', label: 'Multi-Agent' },
  { q: 'ti:RAG+retrieval', label: 'RAG' },
  { q: 'ti:autonomous', label: 'Autonomous' },
  { q: 'ti:reasoning+LLM', label: 'LLM Reasoning' },
  { q: 'ti:tool+learning', label: 'Tool Learning' },
  { q: 'ti:prompt+engineering', label: 'Prompt Engineering' },
  { q: 'ti:MCP+model+context', label: 'MCP Protocol' },
  { q: 'ti:agentic+RAG', label: 'Agentic RAG' },
  { q: 'ti:AI+security', label: 'AI Security' },
  { q: 'ti:fine-tuning+LLM', label: 'LLM Fine-tuning' },
  { q: 'ti:local+LLM', label: 'Local LLM' },
  { q: 'ti:graph+neural', label: 'Graph Neural' },
  { q: 'ti:embedding+vector', label: 'Embedding' },
  { q: 'ti:memory+context', label: 'Context Memory' },
  { q: 'ti:workflow+AI', label: 'AI Workflow' },
  { q: 'ti:code+generation+AI', label: 'AI Code Gen' },
  { q: 'ti:vision+language+model', label: 'Multimodal' },
  { q: 'ti:robotics+AI', label: 'AI Robotics' },
]

async function searchArxiv(query) {
  await new Promise(r => setTimeout(r, 5000))
  const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query).replace(/%2B/g, '+')}&max_results=10&sortBy=submittedDate&sortOrder=descending`
  const xml = await fetch(url)
  return parseArxivFeed(xml)
}

async function learnPaper(paper) {
  const content = `# ${paper.title}

## 论文信息
- **arXiv ID**: ${paper.id}
- **作者**: ${paper.authors.join(', ') || '未知'}
- **发表**: ${paper.published ? paper.published.split('T')[0] : '未知'}
- **类别**: ${paper.categories.join(', ') || '未知'}
- **链接**: ${paper.link}

## 摘要
${paper.summary || '[无摘要]'}

## 研究意义
[待深入阅读原文后补充]

---
*自动采集于 ${new Date().toISOString().split('T')[0]}*
`

  const saved = saveToWiki(paper.id, content)
  if (saved) {
    console.log(`  [论文] 新增: ${paper.title.substring(0, 50)}`)
    markLearned(paper.id)
    return true
  }
  return false
}

async function learn() {
  console.log('[arXiv学习] 开始扫描...')

  try {
    const shuffled = QUERIES.sort(() => Math.random() - 0.5)

    for (const query of shuffled) {
      console.log(`[查询] ${query.label}: ${query.q}`)
      const papers = await searchArxiv(query.q)
      const candidates = papers.filter(p => !isRecentlyLearned(p.id))

      if (candidates.length > 0) {
        const paper = candidates[Math.floor(Math.random() * candidates.length)]
        console.log(`[论文] 主题: ${paper.title.substring(0, 60)}`)

        const ok = await learnPaper(paper)
        if (ok) {
          try {
            const hook = require(WIKI_AUTO_DIR + 'hooks/wiki-auto-hook')
            hook.processWikiTrigger('进化')
          } catch (e) {}
          console.log('[arXiv学习] 完成')
          return
        }
      }

      await new Promise(r => setTimeout(r, 1000))
    }

    console.log('[arXiv学习] 全部学过了...')
    const data = getLearned()
    data.papers = data.papers.slice(-50)
    fs.writeFileSync(LEARNED_FILE, JSON.stringify(data), 'utf-8')
    console.log('[arXiv学习] 完成')
  } catch (e) {
    console.error('[错误]', e.message)
  }
}

if (require.main === module) {
  ;(async () => {
    while (true) {
      await learn()
      await new Promise(r => setTimeout(r, 30000))
    }
  })()
}

module.exports = { learn }