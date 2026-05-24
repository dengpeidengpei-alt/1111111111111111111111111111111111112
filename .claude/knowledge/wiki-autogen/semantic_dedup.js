/**
 * semantic_dedup.js - 语义去重模块 (v2)
 *
 * 精确hash + 语义相似度判断，控制重复污染
 *
 * 判定规则:
 *   similarity >= 0.95  → exact duplicate, skip
 *   similarity >= 0.85 → near duplicate, deweight
 *   similarity >= 0.70 → possible duplicate, consider time window
 *   similarity < 0.70  → new content, proceed
 */

const fs = require('fs')
const crypto = require('crypto')

const LEARNED_EXACT_FILE = 'E:/Claude/.learnings/learned_exact.json'
const LEARNED_SEMANTIC_FILE = 'E:/Claude/.learnings/learned_semantic.json'
const LEARNED_EPOCH_FILE = 'E:/Claude/.learnings/learned_epoch.json'
const DEDUP_LOG_FILE = 'E:/Claude/.learnings/dedup_records.json'

const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'

// =====================
// 相似度阈值
// =====================
const THRESHOLDS = {
  EXACT: 0.95,
  NEAR: 0.85,
  POSSIBLE: 0.70,
}

// 去重决策
const DECISIONS = {
  SKIP: 'skip',
  DEWEIGHT: 'deweight',
  SAMPLE: 'sample',
  PROCEED: 'proceed'
}

// =====================
// 辅助函数
// =====================

function loadLearnedRepos() {
  try {
    const data = JSON.parse(fs.readFileSync(LEARNED_EXACT_FILE, 'utf-8'))
    // learned_exact.json 格式: { data: { repoName: timestamp }, lastCleanup: null }
    if (data.data) return Object.keys(data.data)
    if (data.repos) return data.repos
    return []
  } catch {
    return []
  }
}

function loadSemantic() {
  try {
    const data = JSON.parse(fs.readFileSync(LEARNED_SEMANTIC_FILE, 'utf-8'))
    return Array.isArray(data) ? data : (data.entries || [])
  } catch {
    return []
  }
}

function loadEpoch() {
  try {
    const data = JSON.parse(fs.readFileSync(LEARNED_EPOCH_FILE, 'utf-8'))
    return Array.isArray(data) ? data : (data.entries || [])
  } catch {
    return []
  }
}

function saveSemantic(entries) {
  fs.writeFileSync(LEARNED_SEMANTIC_FILE, JSON.stringify(entries, null, 2))
}

function saveEpoch(entries) {
  fs.writeFileSync(LEARNED_EPOCH_FILE, JSON.stringify(entries, null, 2))
}

function computeHash(content) {
  return crypto.createHash('md5').update(content || '').digest('hex')
}

function computeSimilarity(text1, text2) {
  if (!text1 || !text2) return 0

  const tokens1 = new Set(text1.toLowerCase().split(/\W+/).filter(t => t.length > 2))
  const tokens2 = new Set(text2.toLowerCase().split(/\W+/).filter(t => t.length > 2))

  if (tokens1.size === 0 || tokens2.size === 0) return 0

  const intersection = [...tokens1].filter(t => tokens2.has(t)).length
  const union = new Set([...tokens1, ...tokens2]).size

  return intersection / union
}

function loadDedupLog() {
  try {
    const data = JSON.parse(fs.readFileSync(DEDUP_LOG_FILE, 'utf-8'))
    return Array.isArray(data) ? data : (data.records || [])
  } catch {
    return []
  }
}

function saveDedupLog(records) {
  fs.writeFileSync(DEDUP_LOG_FILE, JSON.stringify(records, null, 2))
}

// =====================
// 核心API
// =====================

/**
 * 检查是否应该跳过
 */
function checkDedup(options) {
  const { content, title, sourceType = 'unknown', externalId = null, topics = [] } = options

  const decisions = []
  const hash = computeHash(content)

  // 1. 精确hash检查
  const repos = loadLearnedRepos()
  if (repos.includes(externalId)) {
    logDedup({ hash, sourceType, externalId, decision: DECISIONS.SKIP, similarity: 1.0, reason: 'exact_repo' })
    return { decision: DECISIONS.SKIP, similarity: 1.0, layer: 'exact', reason: 'exact_repo' }
  }

  // 2. 语义相似度检查
  const semanticEntries = loadSemantic()
  let bestMatch = { similarity: 0, key: null }

  for (const entry of semanticEntries) {
    const sim = computeSimilarity(content, entry.content || '')
    if (sim > bestMatch.similarity) {
      bestMatch = { similarity: sim, key: entry.key }
    }
  }

  if (bestMatch.similarity >= THRESHOLDS.EXACT) {
    logDedup({ hash, sourceType, externalId, decision: DECISIONS.SKIP, similarity: bestMatch.similarity, reason: 'semantic_exact' })
    return { decision: DECISIONS.SKIP, similarity: bestMatch.similarity, layer: 'semantic', reason: 'semantic_exact', matchedKey: bestMatch.key }
  }

  if (bestMatch.similarity >= THRESHOLDS.NEAR) {
    logDedup({ hash, sourceType, externalId, decision: DECISIONS.DEWEIGHT, similarity: bestMatch.similarity, reason: 'semantic_near' })
    return { decision: DECISIONS.DEWEIGHT, similarity: bestMatch.similarity, layer: 'semantic', reason: 'semantic_near', matchedKey: bestMatch.key }
  }

  // 3. 时间窗口检查
  if (bestMatch.similarity >= THRESHOLDS.POSSIBLE) {
    const epochEntries = loadEpoch()
    const now = Date.now()
    const EPOCH_MS = 7 * 24 * 60 * 60 * 1000

    const relevantEpoch = epochEntries.find(e =>
      e.topics && e.topics.some(t => topics.includes(t))
    )

    if (relevantEpoch && (now - relevantEpoch.lastSeen) < EPOCH_MS) {
      logDedup({ hash, sourceType, externalId, decision: DECISIONS.SKIP, similarity: bestMatch.similarity, reason: 'epoch_cooling' })
      return { decision: DECISIONS.SKIP, similarity: bestMatch.similarity, layer: 'epoch', reason: 'epoch_cooling', matchedKey: bestMatch.key }
    }

    logDedup({ hash, sourceType, externalId, decision: DECISIONS.SAMPLE, similarity: bestMatch.similarity, reason: 'epoch_allowed' })
    return { decision: DECISIONS.SAMPLE, similarity: bestMatch.similarity, layer: 'epoch', reason: 'epoch_allowed', matchedKey: bestMatch.key }
  }

  logDedup({ hash, sourceType, externalId, decision: DECISIONS.PROCEED, similarity: bestMatch.similarity, reason: 'new_content' })
  return { decision: DECISIONS.PROCEED, similarity: bestMatch.similarity, layer: 'new', reason: 'new_content' }
}

/**
 * 记录去重决策
 */
function logDedup(record) {
  const log = loadDedupLog()
  record.timestamp = Date.now()
  record.id = `dedup_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  log.push(record)

  if (log.length > 1000) {
    log = log.slice(-1000)
  }
  saveDedupLog(log)
}

/**
 * 标记为已学习
 */
function markLearned(options) {
  const { key, content, topics = [], sourceType = 'unknown' } = options
  const now = Date.now()

  // 1. Exact层 - 追加到learned_exact
  if (sourceType === 'github' && key) {
    try {
      const exact = JSON.parse(fs.readFileSync(LEARNED_EXACT_FILE, 'utf-8'))
      if (!exact.data) exact.data = {}
      exact.data[key] = Date.now()
      exact.lastCleanup = exact.lastCleanup || null
      fs.writeFileSync(LEARNED_EXACT_FILE, JSON.stringify(exact, null, 2))
    } catch {
      fs.writeFileSync(LEARNED_EXACT_FILE, JSON.stringify({ data: { [key]: Date.now() }, lastCleanup: null }, null, 2))
    }
  }

  // 2. Semantic层
  const semanticEntries = loadSemantic()
  const existingIdx = semanticEntries.findIndex(e => e.key === key)

  if (existingIdx >= 0) {
    semanticEntries[existingIdx].content = content.substring(0, 5000)
    semanticEntries[existingIdx].topics = topics
    semanticEntries[existingIdx].lastSeen = now
  } else {
    semanticEntries.push({
      key,
      content: content.substring(0, 5000),
      topics,
      learnedAt: now,
      lastSeen: now
    })
  }

  if (semanticEntries.length > 500) {
    semanticEntries.splice(0, semanticEntries.length - 500)
  }
  saveSemantic(semanticEntries)

  // 3. Epoch层
  const epochEntries = loadEpoch()
  const existingEpochIdx = epochEntries.findIndex(e =>
    e.topics && e.topics.some(t => topics.includes(t))
  )

  if (existingEpochIdx >= 0) {
    epochEntries[existingEpochIdx].lastSeen = now
    epochEntries[existingEpochIdx].count++
  } else {
    epochEntries.push({ key, topics, learnedAt: now, lastSeen: now, count: 1 })
  }
  saveEpoch(epochEntries)
}

/**
 * 获取去重统计
 */
function getDedupStats() {
  const repos = loadLearnedRepos()
  const semanticEntries = loadSemantic()
  const epochEntries = loadEpoch()
  const dedupLog = loadDedupLog()

  const decisions = { skip: 0, deweight: 0, sample: 0, proceed: 0 }
  for (const r of dedupLog) {
    if (r.decision === DECISIONS.SKIP) decisions.skip++
    else if (r.decision === DECISIONS.DEWEIGHT) decisions.deweight++
    else if (r.decision === DECISIONS.SAMPLE) decisions.sample++
    else if (r.decision === DECISIONS.PROCEED) decisions.proceed++
  }

  return {
    exact_repos: repos.length,
    semantic_entries: semanticEntries.length,
    epoch_entries: epochEntries.length,
    dedup_log_entries: dedupLog.length,
    decisions
  }
}

/**
 * 清理过期冷却
 */
function cleanupCooldowns() {
  const now = Date.now()
  const EPOCH_MS = 7 * 24 * 60 * 60 * 1000

  const epochEntries = loadEpoch()
  const filtered = epochEntries.filter(e => now - e.lastSeen < EPOCH_MS * 2)
  saveEpoch(filtered)

  const semanticEntries = loadSemantic()
  const semFiltered = semanticEntries.filter(e => now - e.lastSeen < 30 * 24 * 60 * 60 * 1000)
  saveSemantic(semFiltered)

  return { cleaned: true, removedEpoch: epochEntries.length - filtered.length, removedSemantic: semanticEntries.length - semFiltered.length }
}

module.exports = {
  THRESHOLDS,
  DECISIONS,
  checkDedup,
  markLearned,
  getDedupStats,
  cleanupCooldowns,
  computeSimilarity,
  computeHash
}