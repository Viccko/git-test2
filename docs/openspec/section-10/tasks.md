# Tasks（任务清单）

> 高中学科知识 AI 网站 · DeepSeek 接入 · 第 10 节

---

## Phase 0：环境与密钥（部分已完成）

| # | 任务 | 说明 | Git |
|---|------|------|-----|
| 0.1 | 更新 `.env.example` | 追加 DeepSeek 三行占位符 | ✅ 可提交 |
| 0.2 | 配置本地 `.env` | 填写真实 `DEEPSEEK_API_KEY`，确认无 `sk-sk-` 重复前缀 | ❌ 不提交 |
| 0.3 | 确认 `.gitignore` 含 `.env` | 已有则跳过 | — |
| 0.4 | 重启后端 | 修改 `.env` 后必须重启 `npm start` | — |

**Commit（若 0.1 尚未提交）：** `chore: add deepseek env vars to env example`

---

## Phase 1：DeepSeek 服务模块

| # | 任务 | 说明 |
|---|------|------|
| 1.1 | 新建 `deepSeekService.js` | 读取 env、构造 prompt、调用 Chat Completions |
| 1.2 | 实现 JSON 提取与校验 | 剥离 markdown fence、`validateAnswer` |
| 1.3 | 定义错误类型 | `ApiKeyMissingError`、`DeepSeekApiError`、`AnswerParseError` |
| 1.4 | 本地单测 / 脚本探测 | `node -e` 或临时脚本调用一次，确认 Key 有效（不提交脚本中的 Key） |

**Commit：** `feat: add deepseek service for structured answers`

---

## Phase 2：chat 路由切换

| # | 任务 | 说明 |
|---|------|------|
| 2.1 | 修改 `chat.js` | `generateMockAnswer` → `generateDeepSeekAnswer` |
| 2.2 | 设置 `ANSWER_SOURCE = 'deepseek'` | 落库与响应 `source` 一致 |
| 2.3 | 错误映射 | 503 / 502 / 500 按 design 2.7 返回 |
| 2.4 | curl 验证 | 见下方命令 |

**curl 自测：**

```bash
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"subject":"math","grade":"高一","question":"二次函数怎么求最值？"}' | jq .
```

**SQL 验证：**

```sql
SELECT id, answer_source, JSON_EXTRACT(answer_json, '$.disclaimer') AS disclaimer
FROM qa_records ORDER BY id DESC LIMIT 1;
```

**Commit：** `feat: wire /api/chat to deepseek and persist records`

---

## Phase 3：前端体验增强

| # | 任务 | 说明 |
|---|------|------|
| 3.1 | 细化 `api.js` 错误信息 | 502 + `AI response parse failed` → 友好中文 |
| 3.2 | `App.jsx` success 反馈 | 回答成功后可选 toast / 绿色提示 |
| 3.3 | `AnswerPanel` 展示 `disclaimer` | 答案区底部小字 |
| 3.4 | 更新页面 subtitle | 「第 10 节 DeepSeek」替换 Mock 文案 |
| 3.5 | 历史列表 | 确认 `source: deepseek` 正常显示 |

**Commit：** `feat: improve chat UX for deepseek loading and errors`

---

## Phase 4：文档与 Git 安全

| # | 任务 | Git |
|---|------|-----|
| 4.1 | 更新 `docs/api.md` | `source` 示例、`disclaimer` 字段说明 |
| 4.2 | 更新 `README.md` | DeepSeek 配置步骤、重启说明 |
| 4.3 | 提交前安全检查 | 见下方清单 |
| 4.4 | 本节验收自测 | 对照 `acceptance.md` |

**提交前安全检查：**

```bash
git status                    # 无 .env
git diff --cached             # 无 sk- 真实 Key
git check-ignore -v .env      # 确认被 ignore
```

**Commit：** `docs: update api and readme for deepseek integration`

---

## 建议执行顺序

```text
.env 配置 → deepSeekService → chat 路由切换 → curl/SQL 验证
→ 前端错误与 disclaimer → 文档 → Git 安全检查 → 验收
```

**禁止：**

- 在前端代码中调用 DeepSeek
- 将 `.env` 或真实 Key 提交到 Git
- 修改 `qa_records` 表结构或 `/api/history` 接口

---

## 下一步

确认本节 OpenSpec 无误后，按 Phase 0 → 4 顺序分步编码；每 Phase 完成后自测再 commit。
