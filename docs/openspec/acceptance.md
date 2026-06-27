# 验收标准（Acceptance Criteria）

> 高中学科知识 AI 网站 MySQL/Git MVP · 第 9 节

---

## 4.1 必验项（课堂结束前）

| # | 验收项 | 验证方式 | 通过 |
|---|--------|----------|------|
| 1 | Git 仓库已初始化，至少 3 个 commit | `git log --oneline` | ☐ |
| 2 | Docker Compose 启动 MySQL 成功 | `docker ps` | ☐ |
| 3 | `subjects` 表有 3 条学科数据 | `SELECT * FROM subjects;` | ☐ |
| 4 | `qa_records` 表结构正确 | `DESCRIBE qa_records;` | ☐ |
| 5 | `GET /api/subjects` 返回学科列表 | curl 或浏览器 | ☐ |
| 6 | `POST /api/chat` 返回 Mock 结构化答案 | curl，检查 answer 五字段 | ☐ |
| 7 | `POST /api/chat` 写入 `qa_records` | SQL 查询最新一条 | ☐ |
| 8 | `GET /api/history?limit=5` 返回最近记录 | curl，按 id 降序 | ☐ |
| 9 | 页面历史与 SQL 查询结果一致 | 对比 subject/grade/question | ☐ |
| 10 | 前端无 API Key，无 LocalStorage 核心历史 | 代码搜索 + DevTools | ☐ |
| 11 | README 标注 Mock → DeepSeek 替换位置 | 阅读 README | ☐ |

## 4.2 接口级验收

**GET /api/subjects**

- HTTP 200
- `subjects` 为数组，每项含 `code`、`name`、`gradeRange`
- 至少 3 条：math、english、physics

**POST /api/chat**

- 请求体必填：`subject`、`grade`、`question`
- HTTP 200，响应含 `id`（数字）、`source`（`mock`）、`answer`
- `answer` 含：`summary`、`knowledgePoints[]`、`steps[]`、`example`、`reminder`
- 每次成功调用，`qa_records` 新增 1 行

**GET /api/history?limit=5**

- HTTP 200，`records` 为数组，最多 5 条
- 按 `created_at` / `id` 降序
- 每条含：`id`、`subject`、`grade`、`question`、`source`、`createdAt`

## 4.3 前端 UX 验收

- [ ] 可选择学科：数学、英语、物理
- [ ] 可选择年级：高一、高二、高三
- [ ] 可输入问题并提交
- [ ] 提交后展示结构化答案（非 alert 弹窗）
- [ ] 历史区域展示最近记录，提交后自动更新
- [ ] 前端代码中无 `generateAnswer`、`mockAi` 等本地生成逻辑

## 4.4 学生自测 8 问

1. 项目是否由 Git 管理？是否至少有 2 个 commit？
2. MySQL 是否通过 Docker Compose 启动？
3. 是否有 `subjects` 和 `qa_records` 表？
4. 前端是否调用后端 `/api/chat`，而不是自己生成答案？
5. `POST /api/chat` 是否把问答记录写入 MySQL？
6. 历史记录是否来自 `/api/history` 或数据库查询？
7. 是否没有在前端写 API Key？
8. 第 10 节要替换 Mock 的位置是否清楚？

**全部回答「是」即为通过。**

## 4.5 非功能验收

- `.env` 未提交到 Git
- `node_modules/` 未提交
- 无登录注册相关代码
- 无 DeepSeek 真实 API 调用
