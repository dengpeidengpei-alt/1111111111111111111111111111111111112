/**
 * trajectory_format.js - 标准轨迹数据格式
 *
 * 参照用户指引的Action Trajectory格式:
 * {
 *   "goal": "...",
 *   "observation": "...",
 *   "thought": "...",
 *   "action": "...",
 *   "result": "...",
 *   "reflection": "..."
 * }
 */

const fs = require('fs')
const path = require('path')

const TRAJ_DIR = 'E:/Claude/.learnings/standard_trajectories/'
const TRAJ_INDEX = TRAJ_DIR + 'index.json'

// ============ 标准轨迹格式 ============

function createTrajectory(goal, context = {}) {
  return {
    id: 'traj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    goal,
    context,
    steps: [],
    status: 'active', // active | success | failure
    createdAt: Date.now(),
    completedAt: null
  }
}

function addStep(traj, step) {
  const stepRecord = {
    seq: traj.steps.length,
    observation: step.observation || '',
    thought: step.thought || '',
    action: step.action || '',
    result: step.result || '',
    reflection: step.reflection || '',
    ts: Date.now()
  }
  traj.steps.push(stepRecord)
  return stepRecord
}

function completeTrajectory(traj, status, finalReflection = '') {
  traj.status = status
  traj.completedAt = Date.now()
  traj.duration = traj.completedAt - traj.createdAt
  if (finalReflection) {
    traj.finalReflection = finalReflection
  }
  saveTrajectory(traj)
  return traj
}

// ============ 轨迹存储 ============

function saveTrajectory(traj) {
  ensureDir(TRAJ_DIR)
  const file = TRAJ_DIR + traj.id + '.json'
  fs.writeFileSync(file, JSON.stringify(traj, null, 2))
  updateIndex(traj)
}

function updateIndex(traj) {
  let index = { trajectories: [] }
  try { index = JSON.parse(fs.readFileSync(TRAJ_INDEX, 'utf-8')) } catch {}

  const entry = {
    id: traj.id,
    goal: traj.goal,
    status: traj.status,
    stepCount: traj.steps.length,
    duration: traj.duration,
    hasReflection: traj.steps.some(s => s.reflection) || !!traj.finalReflection,
    createdAt: traj.createdAt
  }

  const existing = index.trajectories.findIndex(t => t.id === traj.id)
  if (existing >= 0) {
    index.trajectories[existing] = entry
  } else {
    index.trajectories.push(entry)
  }

  // 只保留最近500条
  if (index.trajectories.length > 500) {
    index.trajectories = index.trajectories.slice(-500)
  }

  fs.writeFileSync(TRAJ_INDEX, JSON.stringify(index, null, 2))
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

// ============ 轨迹分析 ============

function analyzeTrajectories(filter = {}) {
  const index = JSON.parse(fs.readFileSync(TRAJ_INDEX, 'utf-8'))
  let trajectories = index.trajectories

  if (filter.status) {
    trajectories = trajectories.filter(t => t.status === filter.status)
  }
  if (filter.withReflection) {
    trajectories = trajectories.filter(t => t.hasReflection)
  }

  const success = trajectories.filter(t => t.status === 'success')
  const failure = trajectories.filter(t => t.status === 'failure')

  return {
    total: trajectories.length,
    success: success.length,
    failure: failure.length,
    avgSteps: trajectories.reduce((s, t) => s + t.stepCount, 0) / (trajectories.length || 1),
    avgDuration: trajectories.reduce((s, t) => s + (t.duration || 0), 0) / (trajectories.length || 1),
    withReflection: trajectories.filter(t => t.hasReflection).length
  }
}

function getTrajectoriesByType(type) {
  const index = JSON.parse(fs.readFileSync(TRAJ_INDEX, 'utf-8'))
  // 按goal关键词分类
  const categories = {
    'github': index.trajectories.filter(t => t.goal.toLowerCase().includes('github')),
    'arxiv': index.trajectories.filter(t => t.goal.toLowerCase().includes('arxiv')),
    'learn': index.trajectories.filter(t => t.goal.toLowerCase().includes('learn')),
    'search': index.trajectories.filter(t => t.goal.toLowerCase().includes('search'))
  }
  return categories[type] || []
}

module.exports = {
  createTrajectory,
  addStep,
  completeTrajectory,
  analyzeTrajectories,
  getTrajectoriesByType
}