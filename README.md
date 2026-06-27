# 高中学科知识 AI 网站

第 9 节课堂 MVP：前端 + 后端 + MySQL + Mock AI。

## 功能

- 选择学科（数学 / 英语 / 物理）和年级（高一 / 高二 / 高三）
- 输入学习问题，调用 `POST /api/chat` 获取结构化 Mock 答案
- 展示最近 5 条历史记录（来自 `GET /api/history`，存 MySQL）
- 前端不生成答案、不使用 LocalStorage 存历史、不含 API Key

## 快速启动

### 1. 启动 MySQL

```bash
docker compose up -d
docker exec -i subject_ai_mysql mysql -u subject_user -psubject_pass subject_ai < sql/init.sql
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

### 3. 启动后端（端口 3000）

```bash
cd backend
npm install
npm run dev
```

### 4. 启动前端（端口 5173）

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 http://localhost:5173

## 部署到阿里云

详见 [docs/deploy-aliyun.md](docs/deploy-aliyun.md)。

简要步骤：ECS 安装 Docker / Node / Nginx → `git clone` → 配置 Nginx → 运行 `bash deploy/deploy.sh`。


| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/subjects` | 学科列表 |
| POST | `/api/chat` | 提交问题，Mock 回复并落库 |
| GET | `/api/history?limit=5` | 最近问答历史 |

详见 [docs/api.md](docs/api.md)。

## 第 10 节：Mock → DeepSeek 替换指引

**替换位置：** `backend/src/services/mockAi.js`

当前 `POST /api/chat` 路由（`backend/src/routes/chat.js`）调用：

```js
import { generateMockAnswer } from '../services/mockAi.js';
```

第 10 节步骤：

1. 新建 `backend/src/services/deepSeekService.js`
2. 在 `.env` 中配置 `DEEPSEEK_API_KEY`（仅服务端，勿提交 Git）
3. 在 `chat.js` 中将 `generateMockAnswer` 替换为 DeepSeek 调用
4. 写入 `qa_records` 时把 `answer_source` 改为 `deepseek`
5. **保持** API 请求体、响应体结构不变

## 项目结构

```text
test-deep/
├── docker-compose.yml
├── sql/init.sql
├── .env.example
├── backend/src/services/mockAi.js   ← 第 10 节替换点
├── frontend/
└── docs/
```

## Git 提交建议

```bash
git commit -m "chore: add mysql environment for subject ai website"
git commit -m "feat: add subject ai mvp backend and database records"
git commit -m "feat: add subject question UI and history view"
```
