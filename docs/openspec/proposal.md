# Proposal（项目提案）

> 高中学科知识 AI 网站 MySQL/Git MVP · 第 9 节

---

## 1.1 背景

面向高中生的学科学习辅助网站。学生选择学科与年级、输入学习问题，系统返回**结构化答案**（摘要、知识点、步骤、例题、提醒），并保留最近问答历史。第 9 节以 **Mock AI** 实现完整链路；第 10 节仅替换 AI 提供方（DeepSeek），**接口契约不变**。

## 1.2 目标用户

- 高一至高三学生
- 无登录，匿名使用
- 不采集姓名、手机号等敏感个人信息

## 1.3 核心价值

| 能力 | 说明 |
|------|------|
| 学科问答 | 数学 / 英语 / 物理，按年级提问 |
| 结构化输出 | 便于理解与复习，非纯文本堆砌 |
| 持久化历史 | 数据存 MySQL，刷新不丢失 |
| 可演进架构 | Mock → DeepSeek 只改后端 AI 模块 |

## 1.4 范围（In Scope）

- Docker Compose 启动 MySQL
- 两张表：`subjects`、`qa_records`
- 三个 API：`GET /api/subjects`、`POST /api/chat`、`GET /api/history`
- 前端：学科 / 年级选择、提问、答案展示、历史列表
- 后端 Mock AI + 落库
- Git 分阶段提交

## 1.5 范围外（Out of Scope）

- 登录 / 注册 / 权限
- 真实 DeepSeek API（第 10 节）
- API Key 出现在前端
- LocalStorage 作为核心历史数据源
- 移动端专项适配、性能优化、部署上线

## 1.6 当前仓库进度

| 项 | 状态 |
|----|------|
| `docker-compose.yml` | ✅ 已完成 |
| `docs/api.md` | ✅ 已完成（3 个接口） |
| `sql/init.sql` | ⏳ 待确认 / 重建 |
| 后端 | ⬜ 未开始 |
| 前端 | ⬜ 未开始 |
| `.env.example` / `.gitignore` | ⬜ 未开始 |
| Git 分阶段 commit | ⬜ 未开始 |
