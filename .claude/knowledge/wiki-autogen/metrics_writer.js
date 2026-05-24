/**
 * metrics_writer.js - 指标写入模块
 *
 * 把学习成果写入 metrics_daily / metrics_topic / metrics_system
 * 形成可观测的增长曲线
 */

const fs = require('fs')
const path = require('path')

const METRICS_DIR = 'E:/Claude/.learnings/'
const DAILY_FILE = METRICS_DIR + 'metrics_daily.json'
const TOPIC_FILE = METRICS_DIR + 'metrics_topic.json'
const SYSTEM_FILE = METRICS_DIR + 'metrics_system.json'

// 知识库路径
const KNOWLEDGE_DIR = 'E:/Claude/.claude/projects/qi-meng/wiki/entities/knowledge/'

function loadJSON(file, defaultVal = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return defaultVal }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

/**
 * 统计当前状态
 */
function captureSnapshot() {
  // 统计知识库文件
  const files = fs.readdirSync(KNOWLEDGE_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('实体_'))

  // 统计概念（从文件名提取）
  const concepts = new Set()
  for (const f of files) {
    // 简单策略：从文件名提取看起来像概念的内容
    const name = f.replace('.md', '')
    if (name.length > 3 && name.length < 50 && !name.includes(' ')) {
      concepts.add(name)
    }
  }

  // 统计今天新建的文件
  const today = new Date().toISOString().split('T')[0]
  const todayFiles = files.filter(f => {
    try {
      const stat = fs.statSync(path.join(KNOWLEDGE_DIR, f))
      return stat.ctime.toISOString().split('T')[0] === today
    } catch { return false }
  })

  return {
    total_files: files.length,
    total_concepts: concepts.size,
    new_files_today: todayFiles.length,
    timestamp: Date.now()
  }
}

/**
 * 写入日指标
 */
function writeDailyMetrics(force = false) {
  const daily = loadJSON(DAILY_FILE, { entries: [], lastDate: null })
  const today = new Date().toISOString().split('T')[0]

  // 每天只写一次
  if (daily.lastDate === today && !force) {
    return { skipped: true, reason: 'already_written_today' }
  }

  const snapshot = captureSnapshot()

  // 计算新增和重复
  const prevEntry = daily.entries[daily.entries.length - 1]
  const new_docs = prevEntry
    ? snapshot.total_files - prevEntry.total_files
    : snapshot.total_files

  const entry = {
    date: today,
    total_docs: snapshot.total_files,
    new_docs,
    total_concepts: snapshot.total_concepts,
    new_concepts: prevEntry
      ? snapshot.total_concepts - prevEntry.total_concepts
      : 0,
    novelty_rate: calculateNoveltyRate(snapshot.total_files, new_docs),
    duplicate_rate: calculateDuplicateRate(),
    task_success_rate: getTaskSuccessRate(),
    captured_at: Date.now()
  }

  daily.entries.push(entry)
  daily.lastDate = today

  // 只保留最近30天
  if (daily.entries.length > 30) {
    daily.entries = daily.entries.slice(-30)
  }

  saveJSON(DAILY_FILE, daily)

  return { written: true, entry }
}

/**
 * 计算新颖率
 */
function calculateNoveltyRate(total, newCount) {
  if (total === 0) return 0
  return newCount / total
}

/**
 * 计算重复率（使用 layered_learned 新系统）
 */
function calculateDuplicateRate() {
  const layered = loadJSON('E:/Claude/.learnings/learned_exact.json', { data: {} })
  const exactCount = Object.keys(layered.data || {}).length
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md'))
  return exactCount > 0
    ? Math.min(exactCount / (exactCount + files.length), 0.95)
    : 0
}

/**
 * 获取任务成功率
 */
function getTaskSuccessRate() {
  const tasks = loadJSON('E:/Claude/.learnings/gap_tasks.json', [])
  if (tasks.length === 0) return 0

  const completed = tasks.filter(t => t.status === 'completed').length
  return completed / tasks.length
}

/**
 * 写入主题指标
 */
function writeTopicMetrics() {
  const topic = loadJSON(TOPIC_FILE, { entries: [], lastDate: null })
  const today = new Date().toISOString().split('T')[0]

  // 每周写一次
  const lastWeek = topic.lastDate
    ? daysBetween(topic.lastDate, today) >= 7
    : true

  if (!lastWeek) {
    return { skipped: true, reason: 'not_a_week_yet' }
  }

  // 获取主题覆盖率
  const ct = require('E:/Claude/.claude/knowledge/wiki-autogen/coverage_tracker')
  const coverageScore = parseFloat(ct.getCoverageScore()) / 100 || 0
  const uncoveredCount = ct.getUncoveredConcepts().length

  // 获取gap统计
  const gd = require('E:/Claude/.claude/knowledge/wiki-autogen/gap_detector')
  gd.scanKnowledgeBase()
  const gapStats = gd.getGapStats()

  // 获取冲突统计
  const cd = require('E:/Claude/.claude/knowledge/wiki-autogen/conflict_detector')
  const conflictStats = cd.getConflictStats ? cd.getConflictStats() : { total: 0 }

  const entry = {
    date: today,
    coverage_score: coverageScore,
    saturation_score: calculateSaturation(coverageScore),
    gap_count: gapStats.total_gaps,
    gap_by_priority: gapStats.by_priority,
    conflict_count: conflictStats.total,
    uncovered_concepts: uncoveredCount,
    topic_diversity: calculateTopicDiversity(),
    captured_at: Date.now()
  }

  topic.entries.push(entry)
  topic.lastDate = today

  // 只保留最近12周
  if (topic.entries.length > 12) {
    topic.entries = topic.entries.slice(-12)
  }

  saveJSON(TOPIC_FILE, topic)

  return { written: true, entry }
}

/**
 * 计算饱和度
 */
function calculateSaturation(coverageScore) {
  // 饱和度 = 1 - 覆盖率 * 0.3 (简单估算)
  return Math.min(1, coverageScore * 0.3 + (1 - coverageScore) * 0.7)
}

/**
 * 计算主题多样性
 */
function calculateTopicDiversity() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md'))

  // 统计各主题出现次数
  const topics = ['Agent', 'LLM', 'RAG', 'multi-agent', 'embedding', 'code']
  const topicCounts = {}

  for (const topic of topics) {
    topicCounts[topic] = files.filter(f => {
      const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf-8').toLowerCase()
      return content.includes(topic.toLowerCase())
    }).length
  }

  // 计算Shannon多样性指数
  const total = Object.values(topicCounts).reduce((a, b) => a + b, 0)
  if (total === 0) return 0

  let entropy = 0
  for (const count of Object.values(topicCounts)) {
    if (count > 0) {
      const p = count / total
      entropy -= p * Math.log(p)
    }
  }

  return entropy / Math.log(topics.length) // 归一化
}

/**
 * 写入系统指标
 */
function writeSystemMetrics(force = false) {
  const system = loadJSON(SYSTEM_FILE, { entries: [], lastDate: null })
  const today = new Date().toISOString().split('T')[0]

  // 每天只写一次
  if (system.lastDate === today && !force) {
    return { skipped: true, reason: 'already_written_today' }
  }

  const snapshot = captureSnapshot()

  // 获取关系密度
  const rm = require('E:/Claude/.claude/knowledge/wiki-autogen/relation_miner')
  const relationStats = rm.getRelationStats ? rm.getRelationStats() : { relations: 0, entities: 0 }

  const graphDensity = relationStats.entities > 0
    ? relationStats.relations / relationStats.entities
    : 0

  // 计算跨域链接率（从gap统计）
  const gd = require('E:/Claude/.claude/knowledge/wiki-autogen/gap_detector')
  gd.scanKnowledgeBase()
  const gapStats = gd.getGapStats()
  const crossDomainGaps = gapStats.by_type?.cross_domain_missing || 0

  const crossDomainRate = snapshot.total_files > 0
    ? crossDomainGaps / snapshot.total_files
    : 0

  // 演化指数（综合增长和多样性）
  const prevEntry = system.entries[system.entries.length - 1]
  const evolutionIndex = calculateEvolutionIndex(snapshot, prevEntry, graphDensity)

  const entry = {
    date: today,
    total_docs: snapshot.total_files,
    total_concepts: snapshot.total_concepts,
    total_relations: relationStats.relations,
    graph_density: graphDensity,
    cross_domain_link_rate: crossDomainRate,
    evolution_index: evolutionIndex,
    new_docs_today: snapshot.new_files_today,
    captured_at: Date.now()
  }

  system.entries.push(entry)
  system.lastDate = today

  // 只保留最近30天
  if (system.entries.length > 30) {
    system.entries = system.entries.slice(-30)
  }

  saveJSON(SYSTEM_FILE, system)

  return { written: true, entry }
}

/**
 * 计算演化指数
 */
function calculateEvolutionIndex(snapshot, prevEntry, graphDensity) {
  // 综合：文档增长 + 概念增长 + 图密度
  let docGrowth = 0
  let conceptGrowth = 0

  if (prevEntry) {
    docGrowth = Math.min(1, (snapshot.total_files - prevEntry.total_docs) / 100)
    conceptGrowth = Math.min(1, (snapshot.total_concepts - prevEntry.total_concepts) / 50)
  } else {
    docGrowth = 0.5 // 初始值
    conceptGrowth = 0.5
  }

  return (docGrowth * 0.4 + conceptGrowth * 0.3 + graphDensity * 0.3).toFixed(3)
}

/**
 * 天数差计算
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2 - d1) / 86400000)
}

/**
 * 获取指标摘要
 */
function getMetricsSummary() {
  const daily = loadJSON(DAILY_FILE, { entries: [] })
  const topic = loadJSON(TOPIC_FILE, { entries: [] })
  const system = loadJSON(SYSTEM_FILE, { entries: [] })

  const latestDaily = daily.entries[daily.entries.length - 1]
  const latestTopic = topic.entries[topic.entries.length - 1]
  const latestSystem = system.entries[system.entries.length - 1]

  return {
    daily: latestDaily || null,
    topic: latestTopic || null,
    system: latestSystem || null,
    trend: {
      docs_7d: getTrend(daily.entries, 'new_docs', 7),
      docs_30d: getTrend(daily.entries, 'new_docs', 30),
      coverage: latestTopic?.coverage_score || 0,
      graph_density: latestSystem?.graph_density || 0
    }
  }
}

/**
 * 获取趋势
 */
function getTrend(entries, field, days) {
  const cutoff = Date.now() - days * 86400000
  const recent = entries.filter(e => e.captured_at > cutoff)
  return recent.reduce((sum, e) => sum + (e[field] || 0), 0)
}

/**
 * 执行完整写入
 */
function runMetricsLoop(force = false) {
  console.log('[Metrics] 开始写入循环')

  const results = {
    daily: null,
    topic: null,
    system: null
  }

  try {
    // 1. 日指标
    results.daily = writeDailyMetrics(force)
    console.log('[Metrics] Daily:', JSON.stringify(results.daily))

    // 2. 周主题指标
    results.topic = writeTopicMetrics()
    console.log('[Metrics] Topic:', JSON.stringify(results.topic))

    // 3. 系统指标
    results.system = writeSystemMetrics(force)
    console.log('[Metrics] System:', JSON.stringify(results.system))

  } catch (e) {
    console.error('[Metrics] Error:', e.message)
  }

  console.log('[Metrics] 摘要:', JSON.stringify(getMetricsSummary()))
  return results
}

module.exports = {
  writeDailyMetrics,
  writeTopicMetrics,
  writeSystemMetrics,
  getMetricsSummary,
  runMetricsLoop,
  captureSnapshot
}