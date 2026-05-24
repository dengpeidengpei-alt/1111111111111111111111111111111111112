/**
 * crossref_learn.js - 从Crossref获取最新AI论文，学习并记录到wiki
 * 免费数据源，每小时可请求数千次
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'
const LEARNINGS_DIR = 'E:/Claude/.learnings/'
const WIKI_AUTO_DIR = 'E:/Claude/.claude/knowledge/wiki-autogen/'

const LEARNED_FILE = path.join(LEARNINGS_DIR, 'learned_crossref.json')

function getLearned() {
  if (fs.existsSync(LEARNED_FILE)) {
    return JSON.parse(fs.readFileSync(LEARNED_FILE, 'utf-8'))
  }
  return { papers: [], lastCleanup: Date.now() }
}

function markLearned(doi) {
  const data = getLearned()
  if (!data.papers.includes(doi)) {
    data.papers.push(doi)
  }
  if (data.papers.length > 300) {
    data.papers = data.papers.slice(-100)
  }
  fs.writeFileSync(LEARNED_FILE, JSON.stringify(data), 'utf-8')
}

function isRecentlyLearned(doi) {
  const data = getLearned()
  if (data.papers.includes(doi)) return true
  const safeName = doi.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60)
  const wikiFile = path.join(KNOWLEDGE_DIR, safeName + '.md')
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
      const req = https.get(url, { headers: { 'User-Agent': 'Claude-Auto-Learner/1.0 (mailto:your-email@example.com)' } }, (res) => {
        const statusCode = res.statusCode
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (statusCode === 429) {
            const retryAfter = parseRetryAfter(res.headers['retry-after'])
            const backoff = retryAfter || Math.min(delay * 2, 120000)
            console.log(`[Crossref] 429, retry in ${Math.round(backoff/1000)}s (${remaining-1} left)`)
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1, backoff), backoff)
              return
            }
            reject(new Error('Rate limit (max retries)'))
            return
          }
          if (statusCode === 401) {
            reject(new Error('Crossref 401 Unauthorized — check API access'))
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
      req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) })
    }
    attempt(retries, 1000)
  })
}

function parseCrossref(data) {
  try {
    const json = JSON.parse(data)
    const items = json.message?.items || []
    return items.map(item => {
      const authors = (item.author || []).map(a => `${a.given || ''} ${a.family || ''}`).filter(n => n.trim()).slice(0, 8)
      const year = item.issued?.['date-parts']?.[0]?.[0] || '未知'
      const title = (item.title || ['无标题'])[0]
      const abstract = item.abstract?.replace(/<[^>]+>/g, '').trim() || ''
      const doi = item.DOI || ''
      const url = item.URL || `https://doi.org/${doi}`
      const container = item['container-title']?.[0] || item.publisher || '未知期刊'
      const refCount = item['reference-count'] || 0
      const score = item.score || 0
      return {
        doi,
        title: title.replace(/[\n\r]/g, ' ').trim(),
        authors,
        year,
        abstract: abstract.substring(0, 1000),
        url,
        container,
        refCount,
        score
      }
    })
  } catch (e) {
    return []
  }
}

function saveToWiki(title, content) {
  const safeName = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60)
  const file = path.join(KNOWLEDGE_DIR, safeName + '.md')
  if (fs.existsSync(file)) return false
  fs.writeFileSync(file, content, 'utf-8')
  return true
}

// Crossref搜索查询
const QUERIES = [
  { q: 'AI agent large language model', label: 'AI Agent' },
  { q: 'LLM reasoning chain-of-thought', label: 'LLM Reasoning' },
  { q: 'autonomous AI agent reinforcement learning', label: 'Auto Agent' },
  { q: 'RAG retrieval augmented generation', label: 'RAG' },
  { q: 'multi-agent system AI', label: 'Multi-Agent' },
  { q: 'AI tool use function calling', label: 'Tool Use' },
  { q: 'AI memory context management', label: 'Context Memory' },
  { q: 'AI planning task decomposition', label: 'AI Planning' },
  { q: 'local LLM inference Ollama', label: 'Local LLM' },
  { q: 'model quantization GGUF', label: 'Model Quantization' },
  { q: 'AI code generation copilot', label: 'AI Code Gen' },
  { q: 'AI workflow automation agent', label: 'AI Workflow' },
  { q: 'embedding model vector search', label: 'Embedding' },
  { q: 'knowledge graph RAG AI', label: 'Knowledge Graph' },
  { q: 'AI safety alignment RLHF', label: 'AI Safety' },
  { q: 'AI vision multimodal language model', label: 'Multimodal' },
  { q: 'agentic AI RAG proactive', label: 'Agentic RAG' },
  { q: 'fine-tuning LLM LoRA instruction', label: 'LLM Fine-tuning' },
  { q: 'AI research scientific discovery', label: 'AI Research' },
  { q: 'AI robotics embodied agent', label: 'Robotics AI' },
]

async function searchCrossref(query) {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=10&sort=score&order=desc&mailto=your-email@example.com`
  const data = await fetch(url)
  return parseCrossref(data)
}

async function learnPaper(paper) {
  const content = `# ${paper.title}

## 论文信息
- **DOI**: ${paper.doi}
- **期刊**: ${paper.container}
- **作者**: ${paper.authors.join(', ') || '未知'}
- **年份**: ${paper.year}
- **引用数**: ${paper.refCount}
- **链接**: ${paper.url}

## 摘要
${paper.abstract || '[无摘要]'}

## 研究意义
[待深入阅读原文后补充]

---
*自动采集于 ${new Date().toISOString().split('T')[0]}*
`

  const saved = saveToWiki(paper.title, content)
  if (saved) {
    console.log(`  [论文] 新增: ${paper.title.substring(0, 50)}`)
    markLearned(paper.doi)
    return true
  }
  return false
}

async function learn() {
  console.log('[Crossref学习] 开始扫描...')

  try {
    const shuffled = QUERIES.sort(() => Math.random() - 0.5)

    for (const query of shuffled) {
      console.log(`[查询] ${query.label}: ${query.q}`)
      const papers = await searchCrossref(query.q)
      const candidates = papers.filter(p => !isRecentlyLearned(p.doi))

      if (candidates.length > 0) {
        const paper = candidates[Math.floor(Math.random() * candidates.length)]
        console.log(`[论文] 主题: ${paper.title.substring(0, 60)}`)

        const ok = await learnPaper(paper)
        if (ok) {
          try {
            const hook = require(WIKI_AUTO_DIR + 'hooks/wiki-auto-hook')
            hook.processWikiTrigger('进化')
          } catch (e) {}
          console.log('[Crossref学习] 完成')
          return
        }
      }

      await new Promise(r => setTimeout(r, 800))
    }

    console.log('[Crossref学习] 全部学过了...')
    const data = getLearned()
    data.papers = data.papers.slice(-100)
    fs.writeFileSync(LEARNED_FILE, JSON.stringify(data), 'utf-8')
    console.log('[Crossref学习] 完成')
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