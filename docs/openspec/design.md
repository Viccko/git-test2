# Design（技术设计）

> 高中学科知识 AI 网站 MySQL/Git MVP · 第 9 节

---

## 2.1 系统架构

```text
┌─────────────┐     HTTP      ┌─────────────┐     SQL       ┌─────────────┐
│   前端 UI   │ ────────────► │  后端 API   │ ────────────► │   MySQL     │
│  (浏览器)   │ ◄──────────── │  + Mock AI  │ ◄──────────── │ subject_ai  │
└─────────────┘               └─────────────┘               └─────────────┘
```

**数据流（一次问答）：**

1. 前端 `GET /api/subjects` 加载学科列表
2. 用户选择学科、年级，输入问题
3. 前端 `POST /api/chat` 提交（**不在前端生成答案**）
4. 后端调用 Mock AI 服务 → 得到结构化 `answer`
5. 后端写入 `qa_records`（含 `answer_json`、`answer_source='mock'`）
6. 返回 `{ id, source, answer }` 给前端展示
7. 前端 `GET /api/history?limit=5` 刷新历史区域

**第 10 节替换点：**

```text
POST /api/chat 内部：
  mockAiService.generate()  →  deepSeekService.generate()
接口路径、请求体、响应体结构保持不变
```

## 2.2 技术选型建议

| 层级 | 推荐方案 | 说明 |
|------|----------|------|
| 数据库 | MySQL 8.0 + Docker Compose | 课程统一环境 |
| 后端 | Node.js + Express（或 Next.js API Routes） | 轻量、易课堂演示 |
| 前端 | React + Vite（或 Next.js 全栈） | 组件化展示结构化答案 |
| ORM | 可选 mysql2 原生 SQL | MVP 阶段保持简单 |

> 若采用 **Next.js 全栈**，`app/api/` 即后端，可省略独立 `backend/` 目录，但 Mock AI 模块仍需独立文件以便第 10 节替换。

## 2.3 目录结构

```text
test-deep/
├── docker-compose.yml          # MySQL 容器
├── sql/
│   └── init.sql                # 建表 + 初始学科数据
├── .env.example                # 环境变量模板（无真实密钥）
├── .gitignore
├── README.md                   # 启动说明 + 第 10 节替换指引
├── docs/
│   ├── api.md                  # 接口契约
│   └── openspec/               # OpenSpec 规划文档
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── acceptance.md
├── backend/                    # 方案 A：独立后端
│   ├── src/
│   │   ├── index.js            # 入口、CORS、路由挂载
│   │   ├── db.js               # MySQL 连接池
│   │   ├── routes/
│   │   │   ├── subjects.js
│   │   │   ├── chat.js
│   │   │   └── history.js
│   │   └── services/
│   │       └── mockAi.js       # ★ 第 10 节替换点
│   └── package.json
└── frontend/                   # 方案 A：独立前端
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── SubjectSelect.jsx
    │       ├── GradeSelect.jsx
    │       ├── QuestionForm.jsx
    │       ├── AnswerPanel.jsx
    │       └── HistoryList.jsx
    └── package.json
```

## 2.4 数据库设计

**subjects**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增 |
| code | VARCHAR(30) UNIQUE | math / english / physics |
| name | VARCHAR(50) | 显示名 |
| grade_range | VARCHAR(50) | 如「高一-高三」 |
| created_at | DATETIME | 默认 CURRENT_TIMESTAMP |

**qa_records**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增，作为响应 `id` |
| subject_code | VARCHAR(30) | 学科 code |
| grade | VARCHAR(20) | 高一 / 高二 / 高三 |
| question | TEXT | 用户问题 |
| answer_json | JSON | 完整结构化答案 |
| answer_source | VARCHAR(20) | 默认 `mock` |
| created_at | DATETIME | 用于 history 排序 |

## 2.5 API 契约摘要

详见 [`../api.md`](../api.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/subjects` | 返回 `{ subjects: [{ code, name, gradeRange }] }` |
| POST | `/api/chat` | 请求 `{ subject, grade, question }`；响应 `{ id, source, answer }` |
| GET | `/api/history?limit=5` | 返回 `{ records: [{ id, subject, grade, question, source, createdAt }] }` |

**字段映射约定：**

- DB `subject_code` ↔ API `subject`
- DB `grade_range` ↔ API `gradeRange`
- DB `answer_source` ↔ API `source`
- DB `created_at` ↔ API `createdAt`（ISO 8601 字符串）

## 2.6 Mock AI 模块设计

`services/mockAi.js` 职责：

- 输入：`{ subject, grade, question }`
- 输出：固定结构的 `answer` 对象
- 可根据 `subject` 返回略有差异的模板（数学 / 英语 / 物理）
- **不访问外部网络**
- 第 10 节新建 `deepSeekService.js`，在 `chat` 路由中切换注入

## 2.7 安全与约束

- `.env` 存 DB 密码，加入 `.gitignore`
- 前端仅调用同源或配置 CORS 的后端 URL
- 不存储学生姓名、学号、联系方式
- `question` 仅为学习内容，不做用户画像

## 2.8 环境变量（`.env.example`）

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=subject_ai
DB_USER=subject_user
DB_PASSWORD=subject_pass

# 第 10 节 DeepSeek（本节留空）
# DEEPSEEK_API_KEY=
```
