/**
 * trajectory_collector.js - Agent轨迹数据收集
 *
 * 收集高价值轨迹：推理、工具调用、修正、重试、规划
 *
 * 数据格式参考: SWE-bench, AgentBench, OpenAI Evals
 */

const fs = require('fs')
const path = require('path')

const TRAJ_DIR = 'E:/Claude/.learnings/trajectories/'
const TRAJ_INDEX = 'E:/Claude/.learnings/trajectory_index.json'

// ============ 轨迹事件类型 ============

const EVENT_TYPES = {
  START: 'task_start',
  STEP: 'step',
  TOOL_CALL: 'tool_call',
  RETRY: 'retry',
  ERROR: 'error',
  REFLECTION: 'reflection',
  PLAN: 'plan',
  COMPLETE: 'complete',
  ABORT: 'abort'
}

// ============ 轨迹存储 ============

function startTrajectory(task, context = {}) {
  const id = 'traj_' + Date.now()
  return {
    id,
    task,
    context,
    events: [{ type: EVENT_TYPES.START, ts: Date.now() }],
    outcome: null
  }
}

function addEvent(trajectory, event) {
  trajectory.events.push({
    ...event,
    ts: Date.now(),
    seq: trajectory.events.length
  })
}

function endTrajectory(trajectory, outcome) {
  trajectory.outcome = outcome
  trajectory.duration = Date.now() - trajectory.events[0].ts
  trajectory.events.push({ type: EVENT_TYPES.COMPLETE, ts: Date.now() })
  saveTrajectory(trajectory)
  return trajectory.id
}

function saveTrajectory(trajectory) {
  ensureDir(TRAJ_DIR)
  const file = path.join(TRAJ_DIR, trajectory.id + '.json')
  fs.writeFileSync(file, JSON.stringify(trajectory, null, 2))
  updateIndex(trajectory)
}

function updateIndex(trajectory) {
  let index = { trajectories: [] }
  try { index = JSON.parse(fs.readFileSync(TRAJ_INDEX, 'utf-8')) } catch {}

  // 更新索引
  const existing = index.trajectories.findIndex(t => t.id === trajectory.id)
  const entry = {
    id: trajectory.id,
    task: trajectory.task,
    outcome: trajectory.outcome,
    duration: trajectory.duration,
    stepCount: trajectory.events.length,
    toolCalls: trajectory.events.filter(e => e.type === EVENT_TYPES.TOOL_CALL).length,
    errors: trajectory.events.filter(e => e.type === EVENT_TYPES.ERROR).length,
    ts: trajectory.events[0].ts
  }

  if (existing >= 0) {
    index.trajectories[existing] = entry
  } else {
    index.trajectories.push(entry)
  }

  // 只保留最近1000条
  if (index.trajectories.length > 1000) {
    index.trajectories = index.trajectories.slice(-1000)
  }

  fs.writeFileSync(TRAJ_INDEX, JSON.stringify(index, null, 2))
}

// ============ 工具 ============

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

// ============ 轨迹分析 ============

function analyzeTrajectories(filter = {}) {
  const index = JSON.parse(fs.readFileSync(TRAJ_INDEX, 'utf-8'))
  let trajectories = index.trajectories

  if (filter.outcome) {
    trajectories = trajectories.filter(t => t.outcome === filter.outcome)
  }
  if (filter.minSteps) {
    trajectories = trajectories.filter(t => t.stepCount >= filter.minSteps)
  }

  // 统计分析
  const stats = {
    total: trajectories.length,
    success: trajectories.filter(t => t.outcome === 'success').length,
    failure: trajectories.filter(t => t.outcome === 'failure').length,
    avgSteps: trajectories.reduce((s, t) => s + t.stepCount, 0) / trajectories.length,
    avgToolCalls: trajectories.reduce((s, t) => s + t.toolCalls, 0) / trajectories.length,
    commonErrors: findCommonErrors(trajectories)
  }

  return stats
}

function findCommonErrors(trajectories) {
  const errorFiles = trajectories.filter(t => t.errors > 0).map(t => t.id)
  const errors = {}

  for (const id of errorFiles) {
    try {
      const traj = JSON.parse(fs.readFileSync(path.join(TRAJ_DIR, id + '.json'), 'utf-8'))
      traj.events.filter(e => e.type === EVENT_TYPES.ERROR).forEach(e => {
        const key = (e.error?.message || e.error || 'unknown').substring(0, 50)
        errors[key] = (errors[key] || 0) + 1
      })
    } catch {}
  }

  return Object.entries(errors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([err, count]) => ({ error: err, count }))
}

// ============ 轨迹回放 ============

function replayTrajectory(id) {
  const file = path.join(TRAJ_DIR, id + '.json')
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function getSuccessfulTrajectories(minSteps = 5) {
  const index = JSON.parse(fs.readFileSync(TRAJ_INDEX, 'utf-8'))
  return index.trajectories
    .filter(t => t.outcome === 'success' && t.stepCount >= minSteps)
    .sort((a, b) => b.score - a.score)
}

module.exports = {
  EVENT_TYPES,
  startTrajectory,
  addEvent,
  endTrajectory,
  analyzeTrajectories,
  replayTrajectory,
  getSuccessfulTrajectories
}