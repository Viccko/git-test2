# Proposal（项目提案）

> 高中学科知识 AI 网站 · DeepSeek 接入 · 第 10 节

---

## 1.1 背景

第 9 节已完成 MVP 全链路：前端页面、后端三个 API、MySQL `qa_records` 落库、`Mock AI` 生成结构化答案。学生可在浏览器选择学科与年级、提问、查看结构化答案与最近 5 条历史。

第 10 节在**不改变对外 API 契约**的前提下，将 `/api/chat` 背后的答案生成器从 Mock 替换为 **DeepSeek API**，使回答内容真实可用，并保留完整审计字段（`answer_source`）。

## 1.2 目标用户

与第 9 节相同：高一至高三学生，匿名使用，无登录。

## 1.3 核心价值（第 10 节增量）

| 能力 | 说明 |
|------|------|
| 真实 AI 问答 | 根据用户问题生成针对性解答，而非固定模板 |
| 结构化输出 | 继续返回 summary、knowledgePoints、steps、example、reminder，并新增 disclaimer |
| 可追溯来源 | `answer_source = deepseek`，与历史 mock 记录可区分 |
| 安全边界清晰 | API Key 仅存服务端 `.env`，前端与 Git 均不可见 |

## 1.4 范围（In Scope）

- 新建 `backend/src/services/deepSeekService.js`
- 修改 `backend/src/routes/chat.js`：调用 DeepSeek → 解析 JSON → 写入 `qa_records`
- 读取环境变量：`DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`
- 前端增强：loading / success / error / JSON 解析失败提示（请求体与接口路径不变）
- 更新 `.env.example`（占位符）、本地 `.env`（真实 Key）
- 更新 `docs/api.md`：`source` 示例由 `mock` 扩展为 `deepseek`
- Git 提交前安全检查：无 `.env`、无真实 API Key

## 1.5 范围外（Out of Scope）

- 修改数据库表结构（`qa_records` 已有 `answer_json`、`answer_source`）
- 修改 `GET /api/subjects`、`GET /api/history` 行为
- 前端直连 DeepSeek
- 登录 / 注册 / 用户体系
- 流式输出（SSE / WebSocket）
- 重试队列、缓存、限流、计费监控
- 部署到阿里云（沿用第 9 节 deploy 文档，本节不扩展）
- 删除或禁用 Mock 模块（可保留作本地无 Key 时的开发备选，默认生产路径走 DeepSeek）

## 1.6 当前仓库进度（第 9 节基线）

| 项 | 状态 |
|----|------|
| `docker-compose.yml` + MySQL | ✅ 已完成 |
| `sql/init.sql` + `subjects` / `qa_records` | ✅ 已完成 |
| `GET /api/subjects` | ✅ 已完成 |
| `POST /api/chat`（Mock + 落库） | ✅ 已完成 |
| `GET /api/history` | ✅ 已完成 |
| 前端学科 / 年级 / 提问 / 答案 / 历史 | ✅ 已完成 |
| `.env.example` DeepSeek 占位符 | ✅ 已完成 |
| 本地 `.env` 真实 Key | ⏳ 用户自行配置 |
| DeepSeek 服务模块 | ⬜ 未开始 |
| `chat` 路由切换 DeepSeek | ⬜ 未开始 |
| 前端 disclaimer 展示与错误文案 | ⬜ 未开始 |
| Git 提交（本节） | ⬜ 未开始 |

## 1.7 成功标准（一句话）

学生在页面上提交任意学科问题后，收到 DeepSeek 生成的结构化答案，数据库中对应记录的 `answer_source` 为 `deepseek`，且 Git 仓库中不包含任何密钥。
