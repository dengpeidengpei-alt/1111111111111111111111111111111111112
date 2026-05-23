/**
 * memory_layer.js - Agent长期记忆架构
 *
 * 三层记忆 + 经验压缩 + 自我反思
 *
 * 参照: Mem0, Zep, Reflexion 的设计
 */

const fs = require('fs')
const path = require('path')

const MEMORY_DIR = 'E:/Claude/.learnings/memory/'
const TRAJECTORY_DIR = 'E:/Claude/.learnings/trajectories/'
const REFLECTION_DIR = 'E:/Claude/.learnings/reflections/'

// 记忆类型
const MEMORY_TYPES = {
  EPISODIC: 'episodic',      // 事件记忆 - 具体经验
  SEMANTIC: 'semantic',     // 语义记忆 - 抽象知识
  RETRIEVAL: 'retrieval',   // 可检索记忆 - 快速召回
  REFLECTION: 'reflection'  // 反思记忆 - 经验总结
}

// ============ 经验压缩 ============

function compressExperience(raw) {
  // 从原始经验中提取核心模式
  const patterns = []
  const { task, steps, outcome, error } = raw

  if (error) {
    patterns.push({
      type: 'error_pattern',
      symptom: error.message || error,
      avoid: true
    })
  }

  if (steps && steps.length > 0) {
    patterns.push({
      type: 'successful_strategy',
      steps: steps.slice(0, 3), // 只保留前3步
      outcome
    })
  }

  if (task) {
    patterns.push({
      type: 'task_type',
      category: categorizeTask(task)
    })
  }

  return patterns
}

function categorizeTask(task) {
  const taskLower = task.toLowerCase()
  if (taskLower.includes('code') || taskLower.includes('bug')) return 'coding'
  if (taskLower.includes('search') || taskLower.includes('find')) return 'search'
  if (taskLower.includes('write') || taskLower.includes('create')) return 'creation'
  if (taskLower.includes('learn') || taskLower.includes('study')) return 'learning'
  return 'general'
}

// ============ 记忆写入 ============

function storeEpisodic(task, steps, outcome, error = null) {
  ensureDir(MEMORY_DIR)
  const id = 'ep_' + Date.now()
  const memory = {
    id,
    type: MEMORY_TYPES.EPISODIC,
    task,
    steps,
    outcome,
    error,
    patterns: compressExperience({ task, steps, outcome, error }),
    ts: Date.now()
  }
  fs.writeFileSync(path.join(MEMORY_DIR, id + '.json'), JSON.stringify(memory, null, 2))
  return id
}

function storeReflection(lesson, category) {
  ensureDir(REFLECTION_DIR)
  const id = 'ref_' + Date.now()
  const reflection = {
    id,
    type: MEMORY_TYPES.REFLECTION,
    lesson,
    category,
    ts: Date.now()
  }
  fs.writeFileSync(path.join(REFLECTION_DIR, id + '.json'), JSON.stringify(reflection, null, 2))
  return id
}

// ============ 记忆检索 ============

function retrieveRelevant(query, type = null) {
  const memories = []
  const dir = type === MEMORY_TYPES.REFLECTION ? REFLECTION_DIR : MEMORY_DIR

  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'))
    if (type && content.type !== type) continue
    // 简单关键词匹配
    const text = JSON.stringify(content).toLowerCase()
    if (text.includes(query.toLowerCase())) {
      memories.push(content)
    }
  }

  return memories.sort((a, b) => b.ts - a.ts) // 最新优先
}

function getActionableInsights() {
  // 从记忆中发现可操作的洞察
  const reflections = retrieveRelevant('', MEMORY_TYPES.REFLECTION)
  const episodics = retrieveRelevant('', MEMORY_TYPES.EPISODIC)

  const insights = []

  // 从错误中提取模式
  const errors = episodics.filter(e => e.error)
  const errorPatterns = {}
  errors.forEach(e => {
    const key = e.error.message || e.error.toString().substring(0, 50)
    errorPatterns[key] = (errorPatterns[key] || 0) + 1
  })

  Object.entries(errorPatterns)
    .filter(([, count]) => count >= 2)
    .forEach(([pattern, count]) => {
      insights.push({
        type: 'frequent_error',
        pattern,
        count,
        advice: '遇到类似情况考虑规避'
      })
    })

  // 从成功中提取策略
  const successes = episodics.filter(e => e.outcome === 'success' && e.steps)
  if (successes.length > 0) {
    insights.push({
      type: 'proven_strategy',
      description: '成功的多步策略',
      steps: successes[0].steps.slice(0, 3),
      occurrence: successes.length
    })
  }

  return insights
}

// ============ Trajectory存储 ============

function storeTrajectory(trajectory) {
  ensureDir(TRAJECTORY_DIR)
  const id = 'traj_' + Date.now()
  const file = path.join(TRAJECTORY_DIR, id + '.json')
  fs.writeFileSync(file, JSON.stringify({
    id,
    ...trajectory,
    ts: Date.now()
  }, null, 2))
  return id
}

// ============ 工具 ============

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function getMemoryStats() {
  const stats = {}
  for (const [name, dir] of [['episodic', MEMORY_DIR], ['reflection', REFLECTION_DIR], ['trajectory', TRAJECTORY_DIR]]) {
    if (fs.existsSync(dir)) {
      stats[name] = fs.readdirSync(dir).filter(f => f.endsWith('.json')).length
    } else {
      stats[name] = 0
    }
  }
  stats.insights = getActionableInsights().length
  return stats
}

module.exports = {
  MEMORY_TYPES,
  storeEpisodic,
  storeReflection,
  retrieveRelevant,
  getActionableInsights,
  storeTrajectory,
  getMemoryStats,
  compressExperience
}