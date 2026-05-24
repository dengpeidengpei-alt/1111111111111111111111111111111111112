/**
 * source_health.js - 最小源健康状态管理
 * 只记录：状态、失败计数、最后错误、降级模式
 */

const fs = require('fs')
const path = require('path')

const HEALTH_FILE = 'E:/Claude/.learnings/source_health.json'

const SOURCES = {
  github: { name: 'GitHub API', fallback: null, cooldown: 300000, maxFailures: 5 },
  gitlab: { name: 'GitLab API', fallback: null, cooldown: 300000, maxFailures: 5 },
  codeberg: { name: 'Codeberg API', fallback: null, cooldown: 300000, maxFailures: 5 },
  arxiv: { name: 'arXiv API', fallback: 'crossref', cooldown: 600000, maxFailures: 5 },
  crossref: { name: 'Crossref API', fallback: null, cooldown: 600000, maxFailures: 5 },
  mmx: { name: 'MMX Search', fallback: null, cooldown: 300000, maxFailures: 3 },
}

const DEFAULT_HEALTH = {
  github: { status: 'ok', failures: 0, lastError: null, lastTry: null, cooldownUntil: null },
  gitlab: { status: 'ok', failures: 0, lastError: null, lastTry: null, cooldownUntil: null },
  codeberg: { status: 'ok', failures: 0, lastError: null, lastTry: null, cooldownUntil: null },
  arxiv: { status: 'ok', failures: 0, lastError: null, lastTry: null, cooldownUntil: null },
  crossref: { status: 'ok', failures: 0, lastError: null, lastTry: null, cooldownUntil: null },
  mmx: { status: 'ok', failures: 0, lastError: null, lastTry: null, cooldownUntil: null },
}

function loadHealth() {
  try {
    const data = JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf-8'))
    // 合并默认结构，防止新加源没有初始状态
    return { ...DEFAULT_HEALTH, ...data }
  } catch {
    return { ...DEFAULT_HEALTH }
  }
}

function saveHealth(health) {
  fs.writeFileSync(HEALTH_FILE, JSON.stringify(health, null, 2))
}

function recordFailure(source, error) {
  const health = loadHealth()
  const now = Date.now()
  const cfg = SOURCES[source]

  if (!cfg) return health

  // 如果已经在cooldown中，不累积更多失败，等冷却
  if (health[source]?.cooldownUntil && now < health[source].cooldownUntil) {
    return health
  }

  // 初始化
  if (!health[source]) health[source] = { events: [], lastError: null, cooldownUntil: null }

  // 只保留最近10分钟内的失败事件
  const windowStart = now - 600000
  health[source].events = (health[source].events || []).filter(ts => ts > windowStart)
  health[source].events.push(now)

  const recentFails = health[source].events.length
  health[source].lastError = error?.message || String(error).substring(0, 100)

  // 超过熔断阈值，标记degraded并设置cooldown
  if (recentFails >= cfg.maxFailures && !health[source].cooldownUntil) {
    health[source].status = 'degraded'
    health[source].cooldownUntil = now + cfg.cooldown
  } else if (recentFails >= cfg.maxFailures) {
    health[source].status = 'degraded'
  } else {
    health[source].status = 'failing'
  }

  saveHealth(health)
  return health
}

function recordSuccess(source) {
  const health = loadHealth()
  const now = Date.now()

  if (!health[source]) {
    health[source] = { events: [], status: 'ok', lastError: null, cooldownUntil: null }
  }

  // 成功时不重置失败计数，而是让时间窗口自然过期
  // 只有在cooldown到期后才认为恢复正常
  if (health[source].status === 'failing' && !health[source].cooldownUntil) {
    health[source].status = 'ok'
  }

  health[source].lastError = null
  saveHealth(health)
  return health
}

function isAvailable(source) {
  const health = loadHealth()
  const now = Date.now()

  if (!health[source]) return true

  // cooldown未到期，禁止访问
  if (health[source].cooldownUntil && now < health[source].cooldownUntil) {
    return false
  }

  // cooldown到期，自动恢复
  if (health[source].cooldownUntil && now >= health[source].cooldownUntil) {
    health[source].status = 'ok'
    health[source].cooldownUntil = null
    health[source].events = []
    saveHealth(health)
  }

  // 'failing'或'degraded'状态，只要有events（还在窗口内）就不可用
  // 但如果没有active cooldown，说明窗口已过，可以尝试
  if (health[source].status === 'failing' || health[source].status === 'degraded') {
    return true
  }

  return health[source].status === 'ok'
}

function getFallback(source) {
  const cfg = SOURCES[source]
  if (!cfg || !cfg.fallback) return null
  if (isAvailable(cfg.fallback)) return cfg.fallback
  return null
}

function getStatus() {
  const health = loadHealth()
  const result = {}
  for (const [source, cfg] of Object.entries(SOURCES)) {
    const h = health[source] || {}
    result[source] = {
      name: cfg.name,
      status: h.status || 'unknown',
      failures: h.failures || 0,
      lastError: h.lastError,
      cooldownActive: h.cooldownUntil && Date.now() < h.cooldownUntil,
      fallback: cfg.fallback,
    }
  }
  return result
}

function logStatus() {
  const status = getStatus()
  const lines = Object.entries(status).map(([k, v]) =>
    `[${v.status}] ${v.name}: ${v.failures}次失败${v.lastError ? ' | 最后错误: ' + v.lastError.substring(0, 50) : ''}`
  )
  console.log('[Source Health]', lines.join(' | '))
}

function resetSource(source) {
  const health = loadHealth()
  if (health[source]) {
    health[source] = {
      status: 'ok',
      failures: 0,
      lastError: null,
      lastTry: null,
      cooldownUntil: null,
    }
  }
  saveHealth(health)
}

module.exports = {
  recordFailure, recordSuccess, isAvailable, getFallback, getStatus, logStatus, resetSource, SOURCES
}