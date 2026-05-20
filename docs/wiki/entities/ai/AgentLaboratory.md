---
type: entity
category: research
key: AgentLaboratory
source: GitHub SamuelSchmidgall/AgentLaboratory
date: 2026-05-20
---

# AgentLaboratory

## Overview
End-to-end autonomous research workflow using LLM agents as research assistants, achieving 84% cost reduction vs previous methods while producing state-of-the-art ML research.

## Architecture
- **Orchestrator**: LaboratoryWorkflow
- **Responsibility**: State machine managing 4 phases with 7 subtasks, checkpointing, and human-in-loop control

## Workflow Phases
1. **literature_review** — ArxivSearch + HFDataSearch
2. **experiment** — 迭代研究流程
3. **writing** — 论文撰写
4. **review** — 评审

## Key Achievement
- **Cost Reduction**: 84%
- **Quality**: State-of-the-art ML research

## Cross-refs
- [[concepts/2026-05-14_concept_agent-architecture.m[[knowledge/Design-Toolkit]]] — 智能体架构
- Claude-Work/agent_lab_analysis.json