/**
 * layered_learned.js - 分层学习记忆系统 v2
 *
 * 核心思想：learned不再是"永久封禁"，而是"动态记忆层"
 * 三层结构：
 * 1. exact层 - 精确重复过滤（永久或长TTL）
 * 2. semantic层 - 语义去重（标题相似度）
 * 3. epoch层 - 时间窗口，允许周期性重学
 */

const fs = require('fs')
const path = require('path')

const LEARNED_DIR = 'E:/Claude/.learnings/'
const EXACT_FILE = LEARNED_DIR + 'learned_exact.json'      // 精确匹配
const SEMANTIC_FILE = LEARNED_DIR + 'learned_semantic.json' // 语义指纹
const EPOCH_FILE = LEARNED_DIR + 'learned_epoch.json'     // 时间窗口

// 配置
const CONFIG = {
  // 精确层TTL（毫秒），0=永不过期
  exactTTL: 0,  // 30 * 86400000, // 30天
  // 语义层相似度阈值
  semanticThreshold: 0.85,
  // Epoch长度（毫秒）
  epochLength: 7 * 86400000,  // 7天
  // 最多保留多少个epoch历史
  maxEpochs: 12,  // 约3个月
}

// ========== 基础读写 ==========

function loadExact() {
  try { return JSON.parse(fs.readFileSync(EXACT_FILE, 'utf-8')) } catch { return { data: {}, lastCleanup: null } }
}

function saveExact(d) { fs.writeFileSync(EXACT_FILE, JSON.stringify(d, null, 2)) }

function loadSemantic() {
  try {
    const data = JSON.parse(fs.readFileSync(SEMANTIC_FILE, 'utf-8'))
    // 兼容旧格式: [{key, content, ...}] 和新格式: {fingerprints: {...}}
    if (Array.isArray(data)) {
      const fingerprints = {}
      for (const entry of data) {
        if (entry.key) fingerprints[entry.key] = entry.content
      }
      return { fingerprints, lastCleanup: null }
    }
    return data
  } catch { return { fingerprints: {}, lastCleanup: null } }
}

function saveSemantic(d) { fs.writeFileSync(SEMANTIC_FILE, JSON.stringify(d, null, 2)) }

function loadEpoch() {
  try {
    const data = JSON.parse(fs.readFileSync(EPOCH_FILE, 'utf-8'))
    // 兼容旧格式: [{key, ...}] 和新格式: {repos: {...}, currentEpoch: N}
    if (Array.isArray(data)) {
      const repos = {}
      for (const entry of data) {
        if (entry.key) repos[entry.key] = entry.learnedAt
      }
      return { repos, epochs: [], currentEpoch: 0 }
    }
    return data
  } catch { return { repos: {}, epochs: [], currentEpoch: 0 } }
}

function saveEpoch(d) { fs.writeFileSync(EPOCH_FILE, JSON.stringify(d, null, 2)) }

// ========== 精确层 ==========

function isRecentlyLearnedExact(repoFullName) {
  const d = loadExact()
  if (!d.data[repoFullName]) return false

  // 检查TTL
  if (CONFIG.exactTTL > 0) {
    const age = Date.now() - d.data[repoFullName]
    if (age > CONFIG.exactTTL) {
      // 过期，删除
      delete d.data[repoFullName]
      saveExact(d)
      return false
    }
  }
  return true
}

function markLearnedExact(repoFullName) {
  const d = loadExact()
  d.data[repoFullName] = Date.now()
  saveExact(d)
}

function cleanupExact() {
  if (CONFIG.exactTTL === 0) return 0
  const d = loadExact()
  const now = Date.now()
  let removed = 0
  for (const [repo, ts] of Object.entries(d.data)) {
    if (now - ts > CONFIG.exactTTL) {
      delete d.data[repo]
      removed++
    }
  }
  if (removed > 0) saveExact(d)
  d.lastCleanup = Date.now()
  saveExact(d)
  return removed
}

// ========== 语义层 ==========

function simpleFingerprint(text) {
  // 简化指纹：提取关键词排序
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 20)
    .sort()
  return words.join(' ')
}

function similarity(fp1, fp2) {
  const a = fp1.split(' ')
  const b = fp2.split(' ')
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter(x => setB.has(x)).length
  const union = new Set([...a, ...b]).size
  return union > 0 ? intersection / union : 0
}

function isRecentlyLearnedSemantic(repoFullName, topics = [], description = '') {
  const d = loadSemantic()
  const fp = simpleFingerprint((topics.join(' ') + ' ' + description).substring(0, 500))

  for (const [stored, storedFp] of Object.entries(d.fingerprints)) {
    if (similarity(fp, storedFp) >= CONFIG.semanticThreshold) {
      return true  // 语义相似
    }
  }
  return false
}

function markLearnedSemantic(repoFullName, topics = [], description = '') {
  const d = loadSemantic()
  const fp = simpleFingerprint((topics.join(' ') + ' ' + description).substring(0, 500))
  d.fingerprints[repoFullName] = fp
  saveSemantic(d)
}

function cleanupSemantic() {
  const d = loadSemantic()
  // 语义层不自动清理，保留永久记忆以保持去重效果
  d.lastCleanup = Date.now()
  saveSemantic(d)
  return 0
}

// ========== Epoch层 ==========

function getCurrentEpoch() {
  return Math.floor(Date.now() / CONFIG.epochLength)
}

function isRecentlyLearnedEpoch(repoFullName) {
  const d = loadEpoch()
  const currentEpoch = getCurrentEpoch()

  // 检查是否在当前epoch或上一个epoch学过
  const lastEpoch = d.currentEpoch
  const prevEpoch = lastEpoch - 1

  return d.repos[repoFullName] === currentEpoch ||
         d.repos[repoFullName] === lastEpoch ||
         d.repos[repoFullName] === prevEpoch
}

function markLearnedEpoch(repoFullName) {
  const d = loadEpoch()
  const currentEpoch = getCurrentEpoch()

  // 如果epoch变了，创建新epoch
  if (d.currentEpoch !== currentEpoch) {
    d.epochs.push(d.currentEpoch)
    if (d.epochs.length > CONFIG.maxEpochs) d.epochs.shift()
    d.currentEpoch = currentEpoch
  }

  d.repos[repoFullName] = currentEpoch
  saveEpoch(d)
}

function getEpochStats() {
  const d = loadEpoch()
  return {
    currentEpoch: d.currentEpoch,
    epochsCount: d.epochs.length,
    reposInCurrentEpoch: Object.values(d.repos).filter(v => v === d.currentEpoch).length,
    totalRepos: Object.keys(d.repos).length
  }
}

// ========== 统一接口 ==========

/**
 * 三层检查 - 任一层认为是已学习则返回true
 */
function isRecentlyLearned(repoFullName, topics = [], description = '') {
  return isRecentlyLearnedExact(repoFullName) ||
         isRecentlyLearnedSemantic(repoFullName, topics, description) ||
         isRecentlyLearnedEpoch(repoFullName)
}

/**
 * 三层标记 - 同时记录到三层
 */
function markLearned(repoFullName, topics = [], description = '') {
  markLearnedExact(repoFullName)
  markLearnedSemantic(repoFullName, topics, description)
  markLearnedEpoch(repoFullName)
}

/**
 * 清理过期数据
 */
function cleanup() {
  const exactRemoved = cleanupExact()
  cleanupSemantic()
  return { exactRemoved }
}

/**
 * 获取系统状态
 */
function getStatus() {
  const exact = loadExact()
  const semantic = loadSemantic()
  const epoch = getEpochStats()

  return {
    exact: { count: Object.keys(exact.data).length },
    semantic: { count: Object.keys(semantic.fingerprints).length },
    epoch,
    config: {
      exactTTL: CONFIG.exactTTL > 0 ? CONFIG.exactTTL / 86400000 + 'd' : 'never',
      semanticThreshold: CONFIG.semanticThreshold,
      epochLength: CONFIG.epochLength / 86400000 + 'd',
      maxEpochs: CONFIG.maxEpochs
    }
  }
}

/**
 * 手动触发重学（清除特定项目的所有记忆）
 */
function forget(repoFullName) {
  const exact = loadExact()
  delete exact.data[repoFullName]
  saveExact(exact)

  const semantic = loadSemantic()
  delete semantic.fingerprints[repoFullName]
  saveSemantic(semantic)

  const epoch = loadEpoch()
  delete epoch.repos[repoFullName]
  saveEpoch(epoch)

  return true
}

/**
 * 重置epoch层（强制所有项目可以在新epoch重新学习）
 */
function resetEpochs() {
  const epoch = loadEpoch()
  epoch.epochs.push(epoch.currentEpoch)
  if (epoch.epochs.length > CONFIG.maxEpochs) epoch.epochs.shift()
  epoch.currentEpoch = getCurrentEpoch()
  epoch.repos = {}
  saveEpoch(epoch)
  return true
}

// ========== 从旧系统导入 ==========

/**
 * 从旧 learned_repos.json 导入到新系统
 */
function importFromLegacy() {
  const legacyFile = LEARNED_DIR + 'learned_repos.json'
  if (!fs.existsSync(legacyFile)) return { imported: 0 }

  try {
    const legacy = JSON.parse(fs.readFileSync(legacyFile, 'utf-8'))
    const repos = legacy.repos || []
    let imported = 0
    for (const repo of repos) {
      if (!isRecentlyLearnedExact(repo)) {
        markLearnedExact(repo)
        markLearnedEpoch(repo)
        imported++
      }
    }
    console.log(`[layered_learned] 从旧系统导入 ${imported}/${repos.length} 条`)
    return { imported, total: repos.length }
  } catch (e) {
    console.error('[layered_learned] 导入旧系统失败:', e.message)
    return { imported: 0, error: e.message }
  }
}

// 启动时自动导入一次
const importResult = importFromLegacy()

module.exports = {
  isRecentlyLearned,
  markLearned,
  isRecentlyLearnedExact,
  isRecentlyLearnedSemantic,
  isRecentlyLearnedEpoch,
  markLearnedExact,
  markLearnedSemantic,
  markLearnedEpoch,
  forget,
  resetEpochs,
  cleanup,
  getStatus,
  getEpochStats,
  importFromLegacy,
  simpleFingerprint,
  similarity,
  CONFIG
}