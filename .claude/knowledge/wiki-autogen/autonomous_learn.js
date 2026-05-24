/**
 * 自主学习循环脚本
 * 每30分钟自动执行，持续扫描和学习新知识
 * 支持深度学习：获取README内容、提取核心信息
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'
const LEARNINGS_DIR = 'E:/Claude/.learnings/'
const WIKI_AUTO_DIR = 'E:/Claude/.claude/knowledge/wiki-autogen/'

const { isRecentlyLearned: isLayeredLearned, markLearned: markLayeredLearned } = require(WIKI_AUTO_DIR + 'layered_learned')

function isRecentlyLearned(repoFullName) {
  if (isLayeredLearned(repoFullName)) return true
  const wikiFile = path.join(KNOWLEDGE_DIR, repoFullName.split('/').pop() + '.md')
  return fs.existsSync(wikiFile)
}

function markRepoLearned(repoFullName, topics = [], description = '') {
  markLayeredLearned(repoFullName, topics, description)
}

// GitHub API fetch - 双令牌轮换
const GITHUB_TOKENS = [
  process.env.GITHUB_TOKEN || '',
  process.env.GITHUB_TOKEN_2 || ''
].filter(Boolean)
let tokenIndex = 0

function getToken() {
  if (GITHUB_TOKENS.length === 0) return ''
  tokenIndex = (tokenIndex + 1) % GITHUB_TOKENS.length
  return GITHUB_TOKENS[tokenIndex]
}

function fetch(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const headers = { 'User-Agent': 'Claude-Auto-Learner' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const req = https.get(url, { headers }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { reject(new Error('Parse error')) }
      })
    }).on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => resolve(fetch(url, retries - 1)), 500)
      } else {
        reject(err)
      }
    })
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

// GitHub Trending获取
async function fetchTrending() {
  const langs = ['', 'python', 'javascript', 'typescript', 'go', 'rust', 'java']
  const lang = langs[Math.floor(Math.random() * langs.length)]
  const url = lang
    ? `https://api.github.com/search/repositories?q=stars:>100+created:>${new Date(Date.now()-30*86400000).toISOString().split('T')[0]}&sort=stars&order=desc&per_page=30`
    : `https://api.github.com/search/repositories?q=stars:>500&sort=stars&order=desc&per_page=50`
  return fetch(url)
}

// 解码base64内容
function decodeBase64(encoded) {
  return Buffer.from(encoded, 'base64').toString('utf-8')
}

// 提取README关键信息 - 深化版
function extractKeyInfo(readmeContent) {
  if (!readmeContent) return '无README内容'
  const clean = readmeContent
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
  return clean.substring(0, 1200)
}

// 深度学习：获取项目核心文件并分析
async function deepLearn(repoFullName) {
  const result = {
    techStack: '',
    installation: '',
    usage: '',
    apiEndpoints: [],
    keyFeatures: []
  }

  // 并发获取多个关键文件
  const files = [
    'package.json',
    'pyproject.toml',
    'setup.py',
    'requirements.txt',
    'Cargo.toml',
    'go.mod'
  ]

  const fileFetchers = files.map(async (file) => {
    try {
      const data = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${file}`)
      if (data.content) {
        return { file, content: decodeBase64(data.content) }
      }
    } catch {}
    return null
  })

  const results = await Promise.all(fileFetchers)
  const fileContents = results.filter(r => r)

  // 分析技术栈
  for (const { file, content } of fileContents) {
    if (file === 'package.json') {
      const pkg = JSON.parse(content)
      result.techStack += `npm包: ${Object.keys(pkg.dependencies || {}).slice(0, 10).join(', ')}\n`
      result.installation += `\`npm install ${pkg.name}\`\n`
    } else if (file === 'requirements.txt') {
      const deps = content.split('\n').filter(l => l && !l.startsWith('#'))
      result.techStack += `Python依赖: ${deps.slice(0, 8).join(', ')}\n`
      result.installation += `\`pip install -r requirements.txt\`\n`
    } else if (file === 'setup.py') {
      result.techStack += `Python包管理: setup.py\n`
      result.installation += `\`pip install .\` 或 \`python setup.py install\`\n`
    } else if (file === 'Cargo.toml') {
      result.techStack += `Rust项目\n`
      result.installation += `\`cargo build --release\`\n`
    }
  }

  // 获取仓库统计信息
  try {
    const repoData = await fetch(`https://api.github.com/repos/${repoFullName}`)
    if (repoData.language) {
      result.techStack += `主语言: ${repoData.language}\n`
    }
    if (repoData.topics) {
      result.keyFeatures = repoData.topics.slice(0, 8)
    }
  } catch {}

  return result
}

// 保存学习结果
function saveToWiki(title, content) {
  const file = path.join(KNOWLEDGE_DIR, title + '.md')
  if (fs.existsSync(file)) {
    console.log('[学习] 已存在:', title)
    return false
  }
  fs.writeFileSync(file, content, 'utf-8')
  console.log('[学习] 新增:', title)
  return true
}

// 记录学习日志
function logLearn(topic, result) {
  const log = `${new Date().toISOString()} | ${topic} | ${result}\n`
  fs.appendFileSync(path.join(LEARNINGS_DIR, 'autonomous_learning.log'), log, 'utf-8')
}

// 主学习循环
async function learn() {
  console.log('[自主学习] 开始扫描...')

  try {
    const queries = [
      // 按时间最近活跃 - 新鲜度优先
      { q: 'created:>2026-05-01', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'pushed:>2026-05-20', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'created:>2026-04-15', sort: 'updated', order: 'desc', per_page: 10 },
      // AI应用 - 细分领域
      { q: 'AI+agent+autonomous', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'MCP+model+context+protocol', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'LLM+RAG+knowledge+graph', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+coding+agent+copilot', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'deepseek+reasoning+agent', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'browser+agent+automation', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'voice+assistant+AI+agent', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'multi+agent+system', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+security+pentest+autonomous', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+memory+context+management', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+research+scientific', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+data+pipeline+ETL', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+workflow+automation', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+image+generation+agent', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+video+generation+agent', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+code+review+security', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+test+automation+generation', sort: 'stars', order: 'desc', per_page: 10 },
      // 新兴技术
      { q: 'ollama+local+LLM+interface', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'graph+RAG+knowledge+graph', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'embedding+vector+search', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'function+calling+tool+use', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'agentic+RAG+retrieval', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'long+context+window+million', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'model+quantization+GGUF', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'fine-tuning+LoRA+RLHF', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'small+language+model+SLM', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'multimodal+vision+AI', sort: 'stars', order: 'desc', per_page: 10 },
      // 框架和工具
      { q: 'LangChain+dify+coze', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AutoGen+CrewAI+metaGPT', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'Jina+reader+web+crawl', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'Firecrawl+scrape+AI', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'OpenWebUI+local+AI', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'Anything+LLM+agent', sort: 'stars', order: 'desc', per_page: 10 },
      // 按语言细分
      { q: 'AI+agent+language:python', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+agent+language:typescript', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+agent+language:rust', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+agent+language:go', sort: 'stars', order: 'desc', per_page: 10 },
      // 新兴项目发现
      { q: 'AI+startup+YC+2024', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'HackerNews+AI+top', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+github+trending+today', sort: 'stars', order: 'desc', per_page: 10 },
      // 更多垂直领域
      { q: 'AI+healthcare+medical+diagnosis', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+education+learning+tutor', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+finance+trading+risk', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+robotics+embodied', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+game+agent+NPC', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+DevOps+GitOps+AIOps', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'AI+API+gateway+aggregator', sort: 'stars', order: 'desc', per_page: 10 },
      { q: 'prompt+engineering+evaluation', sort: 'stars', order: 'desc', per_page: 10 },
    ]

    const shuffledQueries = queries.sort(() => Math.random() - 0.5)

    for (const query of shuffledQueries) {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query.q)}&sort=${query.sort}&order=${query.order}&per_page=${query.per_page}`
      const data = await fetch(url)
      const repos = data.items || []
      const candidates = repos.filter(repo => !isRecentlyLearned(repo.full_name))

      if (candidates.length > 0) {
        const repo = candidates[Math.floor(Math.random() * candidates.length)]
        console.log(`[学习] 主题: ${repo.full_name}`)

        // 深度学习：获取README内容 + 技术栈分析
        let readmeContent = ''
        let keyFeatures = ''
        let techStack = ''
        let deepInfo = null
        try {
          // 尝试多种README文件名
          const readmeFiles = ['README.md', 'README.MD', 'README.rst', 'README.txt', 'Readme.md']
          for (const readmeFile of readmeFiles) {
            try {
              const readmeData = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${readmeFile}`)
              if (readmeData.content) {
                readmeContent = decodeBase64(readmeData.content)
                keyFeatures = extractKeyInfo(readmeContent)
                break
              }
            } catch {}
          }
          // 深度分析技术栈
          deepInfo = await deepLearn(repo.full_name)
          techStack = deepInfo.techStack
        } catch (e) {
          console.log('[深度学习] 获取失败')
        }

        const content = `# ${repo.name}

## 项目信息
- **作者**: ${repo.owner.login}
- **Stars**: ${repo.stargazers_count.toLocaleString()}
- **描述**: ${repo.description || '无'}
- **链接**: ${repo.html_url}
- **语言**: ${repo.language || '未知'}
- **主题标签**: ${(repo.topics || []).slice(0, 8).join(', ') || '无'}
${repo.homepage ? `- **官网**: ${repo.homepage}` : ''}

## 核心功能
${keyFeatures || '[待深入研究]'}

## 技术栈
${techStack || '[待分析]'}

## 技术亮点
[待分析]

---
*自动采集于 ${new Date().toISOString().split('T')[0]}*
`
        const saved = saveToWiki(repo.name, content)
        // Wiki文件存在也标记为已学习，避免重复选择
        markRepoLearned(repo.full_name, repo.topics || [], repo.description || '')
        if (!saved) {
          console.log('[Wiki] 文件已存在，跳过')
          return
        }
        logLearn(repo.full_name, '新增')

        try {
          const hook = require(WIKI_AUTO_DIR + 'hooks/wiki-auto-hook')
          hook.processWikiTrigger('进化')
        } catch (e) {}

        console.log('[自主学习] 完成')
        return
      }
    }

    console.log('[学习] 全部学过了，清理旧记录...')
    const data = getLearnedRepos()
    data.repos = data.repos.slice(-10)
    fs.writeFileSync(LEARNED_FILE, JSON.stringify(data), 'utf-8')
    console.log('[自主学习] 完成')
  } catch (e) {
    console.error('[错误]', e.message)
    logLearn('ERROR', e.message)
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