# Tasks（任务清单）

> 高中学科知识 AI 网站 MySQL/Git MVP · 第 9 节

---

## Phase 0：环境与文档（部分已完成）

| # | 任务 | Git Commit |
|---|------|------------|
| 0.1 | 初始化 Git 仓库 | `chore: init subject ai website repo` |
| 0.2 | 创建 `docker-compose.yml` 并启动 MySQL | ✅ 已有文件 |
| 0.3 | 创建 `sql/init.sql`，导入并验证 3 条 subjects | `chore: add mysql environment for subject ai website` |
| 0.4 | 创建 `.env.example`、`.gitignore` | 同上 commit |
| 0.5 | 完善 `docs/api.md` | `docs: add api contract` |

## Phase 1：后端 API + 落库

| # | 任务 | 说明 |
|---|------|------|
| 1.1 | 搭建后端项目骨架 | Express 入口、CORS、健康检查 |
| 1.2 | 实现 `db.js` | 读取 `.env`，连接 MySQL |
| 1.3 | 实现 `GET /api/subjects` | 查 `subjects` 表，映射字段 |
| 1.4 | 实现 `services/mockAi.js` | 返回结构化 answer |
| 1.5 | 实现 `POST /api/chat` | Mock → 写 `qa_records` → 返回 id |
| 1.6 | 实现 `GET /api/history` | `ORDER BY id DESC LIMIT ?` |
| 1.7 | curl 自测三个接口 | 确认落库 |

**Commit：** `feat: add subject ai mvp backend and database records`

## Phase 2：前端 UI

| # | 任务 | 说明 |
|---|------|------|
| 2.1 | 搭建前端项目 | Vite + React 或 Next.js |
| 2.2 | 学科 / 年级选择组件 | 年级写死：高一、高二、高三 |
| 2.3 | 问题输入 + 提交 | 调用 `POST /api/chat` |
| 2.4 | 结构化答案展示 | summary / knowledgePoints / steps / example / reminder |
| 2.5 | 历史记录区域 | 调用 `GET /api/history?limit=5` |
| 2.6 | 提交成功后刷新历史 | 不依赖 LocalStorage |

**Commit：** `feat: add subject question UI and history view`

## Phase 3：联调与文档收尾

| # | 任务 | Git Commit |
|---|------|------------|
| 3.1 | 页面完成一次完整问答流程 | — |
| 3.2 | SQL 验证 `qa_records` 与页面一致 | — |
| 3.3 | README 补充启动步骤 + Mock 替换说明 | `docs: update readme with run guide` |
| 3.4 | 最终验收自测 | — |

## 建议执行顺序

```text
数据库 → 后端三个接口 → curl 验证 → 前端页面 → 联调 → Git 提交
```

**禁止：** 一次性让 AI 生成整个项目；应分 Phase 逐步生成并验证。

## 下一步

确认规划无误后，使用课程 **5.3 MVP 开发 Prompt** 分 Phase 生成代码：

1. Phase 0 补全 `sql/init.sql`、`.env.example`、`.gitignore`
2. Phase 1 后端
3. Phase 2 前端
4. Phase 3 联调验收
