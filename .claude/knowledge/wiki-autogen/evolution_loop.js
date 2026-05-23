/**
 * evolution_loop.js - Agent自我进化循环
 *
 * 参照: Reflexion, Self-Refine的设计模式
 *
 * Loop: 执行 → 反思 → 提炼 → 改进
 */

const fs = require('fs')
const path = require('path')

const WIKI_AUTO_DIR = 'E:/Claude/.claude/knowledge/wiki-autogen/'
const memory = require(WIKI_AUTO_DIR + 'memory_layer')

// ============ 反思引擎 ============

async function reflect(experience) {
  /**
   * 核心反思：从经验中提炼可操作的教训
   */
  const { task, steps, outcome, error } = experience

  const lessons = []

  if (outcome === 'success') {
    lessons.push({
      text: `成功完成: ${task}`,
      type: 'success',
      steps: steps
    })
  }

  if (error) {
    lessons.push({
      text: `失败分析: ${error.message || error}`,
      type: 'failure',
      category: categorizeError(error)
    })
  }

  // 检查是否有更好的执行路径
  if (steps && steps.length > 5) {
    lessons.push({
      text: '任务过于复杂，应分解',
      type: 'optimization',
      suggestion: '考虑分解为子任务'
    })
  }

  // 存储反思
  for (const lesson of lessons) {
    memory.storeReflection(lesson.text, lesson.type)
  }

  return lessons
}

function categorizeError(error) {
  const msg = (error.message || error).toLowerCase()
  if (msg.includes('timeout')) return 'timeout'
  if (msg.includes('rate limit')) return 'rate_limit'
  if (msg.includes('not found') || msg.includes('enoent')) return 'not_found'
  if (msg.includes('permission')) return 'permission'
  return 'unknown'
}

// ============ 经验压缩 ============

function distillStrategy(experiences) {
  /**
   * 从多个经验中提炼通用策略
   */
  const strategy = {
    patterns: [],
    rules: [],
    ts: Date.now()
  }

  // 聚类相似任务
  const taskGroups = {}
  experiences.forEach(exp => {
    const key = exp.task.substring(0, 30)
    if (!taskGroups[key]) taskGroups[key] = []
    taskGroups[key].push(exp)
  })

  // 为每个群提炼策略
  for (const [taskKey, group] of Object.entries(taskGroups)) {
    if (group.length < 2) continue

    const successes = group.filter(e => e.outcome === 'success')
    if (successes.length > 0) {
      strategy.patterns.push({
        taskPattern: taskKey,
        approach: successes[0].steps[0],
        successRate: successes.length / group.length
      })
    }
  }

  // 生成规则
  const frequentErrors = {}
  experiences.filter(e => e.error).forEach(e => {
    const key = e.error.message.substring(0, 50)
    frequentErrors[key] = (frequentErrors[key] || 0) + 1
  })

  Object.entries(frequentErrors)
    .filter(([, count]) => count >= 2)
    .forEach(([pattern]) => {
      strategy.rules.push({
        condition: '遇到类似错误',
        rule: '规避或特殊处理'
      })
    })

  return strategy
}

// ============ 自我改进 ============

function generateImprovedPrompt(basePrompt, insights) {
  /**
   * 基于洞察改进prompt
   */
  let improved = basePrompt

  for (const insight of insights) {
    if (insight.type === 'frequent_error') {
      // 添加错误规避指令
      improved += '\n\n注意: 避免 ' + insight.pattern.substring(0, 50)
    }
    if (insight.type === 'proven_strategy') {
      // 添加成功策略
      improved += '\n\n推荐: ' + insight.steps[0]
    }
  }

  return improved
}

// ============ 进化循环主函数 ============

async function runEvolutionCycle(context) {
  /**
   * 执行一次进化循环
   */
  console.log('[Evolution] 开始自我进化...')

  // 1. 获取最近经验
  const recent = memory.retrieveRelevant('', 'episodic').slice(0, 20)

  // 2. 反思
  const reflectionResults = []
  for (const exp of recent) {
    const lessons = await reflect(exp)
    reflectionResults.push(...lessons)
  }

  // 3. 提炼策略
  const strategy = distillStrategy(recent)

  // 4. 生成洞察
  const insights = memory.getActionableInsights()

  console.log('[Evolution] 反思:', reflectionResults.length, '条')
  console.log('[Evolution] 策略:', strategy.patterns.length, '个模式')
  console.log('[Evolution] 洞察:', insights.length, '条')

  // 5. 存储进化结果
  const evolution = {
    ts: Date.now(),
    reflections: reflectionResults.length,
    patterns: strategy.patterns.length,
    insights: insights.length,
    rules: strategy.rules.length
  }

  fs.writeFileSync('E:/Claude/.learnings/evolution_log.json',
    JSON.stringify(evolution, null, 2))

  return evolution
}

// ============ 快速学习单次经验 ============

async function learnFromTask(task, steps, outcome, error = null) {
  // 1. 存储经验
  memory.storeEpisodic(task, steps, outcome, error)

  // 2. 反思
  const lessons = await reflect({ task, steps, outcome, error })

  // 3. 如有错误，触发深入反思
  if (error) {
    const deeper = await runEvolutionCycle({ cause: error })
    return { lessons, deeper }
  }

  return { lessons }
}

module.exports = {
  reflect,
  distillStrategy,
  generateImprovedPrompt,
  runEvolutionCycle,
  learnFromTask
}