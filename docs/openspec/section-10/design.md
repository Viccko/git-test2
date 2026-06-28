# Design（技术设计）

> 高中学科知识 AI 网站 · DeepSeek 接入 · 第 10 节

---

## 2.1 系统架构（第 10 节）

```text
┌─────────────┐     HTTP      ┌─────────────────────┐     HTTPS      ┌──────────────┐
│   前端 UI   │ ────────────► │  后端 API           │ ─────────────► │  DeepSeek    │
│  (浏览器)   │ ◄──────────── │  + deepSeekService  │ ◄───────────── │  Chat API    │
└─────────────┘               └──────────┬──────────┘                └──────────────┘
                                         │ SQL
                                         ▼
                               ┌─────────────────────┐
                               │   MySQL qa_records  │
                               │ answer_source=      │
                               │   deepseek          │
                               └─────────────────────┘
```

**与第 9 节的唯一架构变化：** `POST /api/chat` 内部由 `mockAi.js` 切换为 `deepSeekService.js`。前端、历史接口、数据库 schema 不变。

## 2.2 数据流（一次 DeepSeek 问答）

1. 前端 `POST /api/chat`，请求体 `{ subject, grade, question }`（与第 9 节相同）
2. `chat.js` 校验 subject / grade / question（逻辑不变）
3. `deepSeekService.generateAnswer({ subject, grade, question })`：
   - 读取 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`
   - 组装 system + user prompt，要求模型**仅输出 JSON**
   - `POST {BASE_URL}/v1/chat/completions`（OpenAI 兼容格式）
   - 从 `choices[0].message.content` 提取文本
   - 解析 JSON，校验必填字段
4. 解析成功 → `INSERT qa_records`，`answer_source = 'deepseek'`
5. 响应 `{ id, source: 'deepseek', answer }`（结构与第 9 节相同，answer 多 `disclaimer` 字段）
6. 前端展示答案并刷新历史；历史列表 `source` 显示 `deepseek`

## 2.3 替换点与文件职责

| 文件 | 第 9 节 | 第 10 节 |
|------|---------|----------|
| `backend/src/routes/chat.js` | 调用 `generateMockAnswer` | 调用 `generateDeepSeekAnswer` |
| `backend/src/services/mockAi.js` | 生产路径 | 保留文件，不再作为默认路径（可选 dev fallback） |
| `backend/src/services/deepSeekService.js` | 不存在 | **新建**，封装 DeepSeek 调用与 JSON 解析 |
| `frontend/src/api.js` | 不变 | 不变（仍调 `/api/chat`） |
| `frontend/src/App.jsx` | 已有 loading/error | 补充 success 反馈、细化错误文案 |
| `frontend/src/components/ChatUI.jsx` | AnswerPanel 五字段 | 增加 `disclaimer` 展示 |

## 2.4 DeepSeek 服务模块设计

**文件：** `backend/src/services/deepSeekService.js`

**导出函数：**

```js
export async function generateDeepSeekAnswer({ subject, grade, question })
// 成功 → 返回 answer 对象
// 失败 → throw 带 code 的 Error（供 chat 路由映射 HTTP 状态）
```

**环境变量（从项目根 `.env` 读取，已在 `index.js` 通过 dotenv 加载）：**

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `DEEPSEEK_API_KEY` | 是 | — | Bearer Token，缺失时 chat 返回 503 |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com` | API 根地址，不含 `/v1` |
| `DEEPSEEK_MODEL` | 否 | `deepseek-v4-flash` | 模型名 |

**HTTP 请求（OpenAI 兼容）：**

```text
POST {DEEPSEEK_BASE_URL}/v1/chat/completions
Authorization: Bearer {DEEPSEEK_API_KEY}
Content-Type: application/json

{
  "model": "{DEEPSEEK_MODEL}",
  "messages": [
    { "role": "system", "content": "<结构化 JSON 指令>" },
    { "role": "user", "content": "<学科+年级+问题>" }
  ],
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

> 若目标模型不支持 `response_format`，则在 prompt 中强制要求纯 JSON，并用正则 / `JSON.parse` 提取首个 `{...}` 块作为降级。

## 2.5 Prompt 与 Answer Schema

**System Prompt 要点：**

- 角色：高中学科辅导老师（数学 / 英语 / 物理）
- 语言：简体中文
- 必须返回**单个 JSON 对象**，无 markdown 代码块、无多余说明
- 字段与类型固定（见下表）
- `disclaimer` 固定语义：AI 生成内容仅供参考，请以教材与教师讲解为准

**Answer 对象 schema（写入 `answer_json` 并返回前端）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `summary` | string | 2–4 句概括 |
| `knowledgePoints` | string[] | 2–5 个知识点 |
| `steps` | string[] | 3–6 步解题或分析步骤 |
| `example` | `{ question: string, answer: string }` | 相关例题与简答 |
| `reminder` | string | 易错点或考试提醒 |
| `disclaimer` | string | AI 免责声明（短句） |

**User Prompt 模板：**

```text
学科：{subjectLabel}（code: {subject}）
年级：{grade}
问题：{question}

请针对上述问题给出适合该年级水平的结构化解答。
```

`subjectLabel` 映射：`math→数学`，`english→英语`，`physics→物理`。

## 2.6 JSON 解析与校验

**解析流程：**

1. 取模型返回的 `content` 字符串，`trim()`
2. 若以 ` ```json ` 包裹，先剥离 fence
3. `JSON.parse(content)`
4. 校验必填字段存在且类型正确（可写轻量 `validateAnswer(obj)`）
5. 缺字段 → throw `AnswerParseError`
6. `JSON.parse` 失败 → throw `AnswerParseError`

**不在落库前写入不完整 JSON。**

## 2.7 chat 路由错误映射

| 场景 | HTTP | 响应 `error` 示例 |
|------|------|-------------------|
| 参数校验失败 | 400 | `Invalid subject` / `Question is required`（已有） |
| 未配置 `DEEPSEEK_API_KEY` | 503 | `DeepSeek API key not configured` |
| DeepSeek 网络 / 4xx / 5xx | 502 | `DeepSeek API request failed` |
| 模型返回无法解析的 JSON | 502 | `AI response parse failed` |
| 数据库写入失败 | 500 | `Failed to save chat record`（已有） |

前端将 502 且 `AI response parse failed` 映射为用户可见的「AI 返回格式异常，请重试」。

## 2.8 前端交互设计（增量）

**保持不变：**

- 请求 URL、Method、Body：`POST /api/chat`
- 学科 / 年级 / 问题表单
- 历史刷新逻辑

**增强项：**

| 状态 | 行为 |
|------|------|
| loading | 提交按钮禁用 + 「提交中…」（已有，保持） |
| success | 展示 `AnswerPanel`；可选短暂 success 提示「回答已生成」 |
| error（网络 / 4xx / 5xx） | 红色 `error` 区域展示 `err.message` |
| error（JSON 解析失败） | 展示「AI 返回格式异常，请稍后重试或换一个问题」 |
| disclaimer | 在答案区底部以小字展示 `answer.disclaimer` |

**前端不得：**

- 引入 DeepSeek SDK 或直接请求 `api.deepseek.com`
- 读取或硬编码任何 API Key

## 2.9 数据库与 API 契约

**数据库：** 无 migration。`answer_json` 存完整 answer（含 `disclaimer`）；`answer_source` 新记录写 `deepseek`。

**API 契约变更（仅示例值，非 breaking change）：**

- 响应 `source`：由 `"mock"` 变为 `"deepseek"`
- 响应 `answer`：新增可选字段 `disclaimer`（前端向后兼容：无则隐藏）

详见 [`../../api.md`](../../api.md) 第 10 节更新说明。

## 2.10 安全与 Git 约束

- `.env` 已在 `.gitignore`，禁止 `git add .env`
- `.env.example` 仅含 `your_deepseek_api_key_here` 占位符
- 提交前执行：

```bash
git status          # 确认无 .env
git diff            # 确认无 sk- 开头的真实 Key
grep -r "sk-" --include="*.js" --include="*.jsx" --include="*.md" . \
  --exclude-dir=node_modules
```

- 后端日志禁止 `console.log` 完整 API Key
- DeepSeek 错误日志可记录 status code，不记录 Authorization header

## 2.11 Mock 模块处置

**推荐策略（MVP）：**

- 默认：`chat.js` 仅调用 `deepSeekService`
- `mockAi.js` 保留在仓库，README 注明可用于本地单元测试
- 可选环境变量 `USE_MOCK_AI=true` 用于无 Key 演示（非必做）

## 2.12 环境变量完整清单（`.env.example`）

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=subject_ai
DB_USER=subject_user
DB_PASSWORD=subject_pass

PORT=3000

# DeepSeek（第 10 节，复制到 .env 后填写真实 Key）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```
