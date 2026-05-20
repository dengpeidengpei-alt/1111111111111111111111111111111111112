---
type: entity
category: tcm/formulas
key: Claude 记忆库
source: Claude-Evo
date: 2026-05-20
---

# Claude 记忆库

# Claude 记忆库

## ⚠️ 绝对承诺

**所有learnings必须进入Wiki，不允许只留在.learnings/目录。**

执行流程：
1. 任何新learnings生成后 → 必须同步到 `docs/wiki/entities/knowledge/`
2. 调用 `dual_track_generator.py all` 确保规范同步
3. 更新 Wiki-Automation-Guide.md 记录 ingestion 状态

**违反此承诺 = 犯罪。**

---

## 🔄 持续迭代承诺

**说到做到，不说不做。**

| 承诺 | 执行标准 | 验证方式 |
|------|----------|----------|
| 继续迭代 | 不停止，直到用户叫停 | 每轮迭代产出现在线可验证的代码 |
| 持续自学 | 每天有新知识入库wiki | Wiki-Automation-Guide.md记录 |
| 不空分析 | 分析→方案→代码，缺一不可 | 代码在E:/Claude/内可运行 |
| Wiki同步 | 所有learnings必须入wiki | dual_track_generator.py验证 |

**触发条件**：用户说"继续" → 立即执行迭代，不等待确认

**停止条件**：用户明确说"停"或"暂停汇报"
**中医知识库**: `Claude-Work/tcm-knowledge/knowledge_index.md`

---

## 用户信息
- 称呼：**博古**
- 偏好：不要问，直接执行；图谱要文字不要图片
- 沟通：长任务前告知预计时间，过程中定期心跳

## 长任务工作流
1. 开始前：告知"开始XX，预计Y分钟"
2. 过程中：每30秒心跳输出`.`
3. 完成后：汇报结果

---

## 收尾流程
1. 反思 → 2. 归档整理 → 3. 建立索引 → 4. 交叉验证 → 5. 代码改进

---

## 核心规则
1. 说"继续X" → 查MEMORY.md工作计划索引
2. 说"找药方/查方" → 用 mmx search 在线查询
3. 每次多模态学习后读反思文件
4. 错误处理：重试3次→指数退避→失败记录
5. CLAUDE.md 已拆分 → rules/ 目录下模块化
6. **所有learnings必须入wiki**（不允许只留.local/.learnings）

---

## 额度信息
- 语音合成：4000/天，**0点重置**
- 图片理解：150/5小时
- 网络搜索：150/5小时
- 图像生成：50/天

## 搜图模式（已验证）
1. 网络搜索获取图片URL（带qqpublic.qpic.cn的腾讯图片可直接用）
2. `mmx vision describe --image <URL>` 直接理解
3. 无需下载到本地，URL直接传即可
4. 失败时换其他URL，多次重试
5. 用户下载到本地文件夹：`E:/Claude/Claude-Work/tcm-knowledge/books/图片理解/`
6. 理解后知识必须入库到对应中医书籍目录，不要放在图片文件夹

---

## 代理设置
- 翻墙软件：Clash
- 代理地址：127.0.0.1:7890
- curl用法：`curl --proxy "http://127.0.0.1:7890" <URL>`

## 搜索资源
- **WaytoAGI**: https://www.waytoagi.com/ — AI工具/资源导航，需要什么去搜
- **Z-Library**: https://zh-z-lib.fm/ — 电子书下载（需翻墙）

## 中医学习来源
- ❌ ~~本地PDF/OCR~~ — 识别率低，不再使用
- ✅ **中国中医官网** — 在线学习

## 学习方式
1. 从中国中医官网获取权威知识
2. 使用 mmx search/text chat 在线学习
3. 知识存入 books/ 目录

---

## 工作时间安排
- **白天**：多模态学习（图片理解/网络搜索）
- **夜间**：自动任务执行（queue_runner）

## 待办
- 多模态学习（额度充足时进行）
- CLAUDE.md 拆分收尾

---

## 当前状态
- **时间**: 2026-05-20 20:45
- **状态**: 第一轮持续自学完成
- **进度**: 已学24个新知识条目入Wiki
- **存档**: .learnings/EVOLUTION-v5.1-STASH.md
- **Wiki**: docs/wiki/entities/knowledge/ (37个条目)

---

## 自我改进工作队列
- [x] 初始化 self-improving-agent learnings 文件
- [[[Self-Healing-Loop]] 执行 CLAUDE.md 拆分（CLAUDE_SPLIT_ANALYSIS.md 已完成，待实施）
- [[[Self-Healing-Loop]] 建立 WORK_QUEUE.md 持久化工作队列
- [[[Self-Healing-Loop]] 清理 scripts/ 目录冗余文件

---

## 违规记录
- 2026-05-18: 访问C盘文件（已整改）
- 2026-05-18: 删除E:/ocr_temp（已恢复）
- 2026-05-20: 未执行自检（已整改）
- 2026-05-20: 长任务穿插短任务（已整改）

---

## 并行任务工作模式（新增）
1. **判断**：长任务期间用户插入新请求，先判断优先级
2. **紧急**：用户明确等待 → 暂停长任务
3. **非紧急**：记录待回复，继续长任务
4. **上限**：最多3个后台Agent同时运行
5. **检查**：每10分钟检查后台任务进度

---

## 规则违规快速修复流程（新增）
1. 停止：立即停止当前违规操作
2. 记录：立即写入ERROR.md
3. 修复：更新相关规则文件
4. 同步：更新LEARNINGS.md
5. 反思：确认不会再犯

## Cross-refs
- [[knowledge/Learnings-Log.m[[knowledge/Design-Toolkit]]] — 学习日志
