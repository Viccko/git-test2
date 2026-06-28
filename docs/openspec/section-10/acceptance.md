# 验收标准（Acceptance Criteria）

> 高中学科知识 AI 网站 · DeepSeek 接入 · 第 10 节

---

## 4.1 必验项

| # | 验收项 | 验证方式 | 通过 |
|---|--------|----------|------|
| 1 | `.env.example` 含 DeepSeek 占位符，无真实 Key | 目视 + `grep sk- .env.example` 应无真实 Key | ☐ |
| 2 | `.env` 含真实 Key 且未被 Git 跟踪 | `git check-ignore -v .env` | ☐ |
| 3 | `POST /api/chat` 调用 DeepSeek 而非 Mock | 响应 `source` 为 `deepseek`；答案内容与问题相关 | ☐ |
| 4 | 答案含六字段 | `summary`、`knowledgePoints`、`steps`、`example`、`reminder`、`disclaimer` | ☐ |
| 5 | 落库 `answer_source = deepseek` | SQL 查最新记录 | ☐ |
| 6 | `answer_json` 含完整结构化 JSON | `JSON_VALID` 或 `JSON_EXTRACT` 验证 | ☐ |
| 7 | 前端请求体与第 9 节一致 | DevTools Network 查看 POST body | ☐ |
| 8 | 前端 loading 状态 | 提交中按钮禁用、文案「提交中…」 | ☐ |
| 9 | 前端 success 状态 | 成功后展示结构化答案 | ☐ |
| 10 | 前端 error 状态 | 停后端或删 Key 后提交，可见错误提示 | ☐ |
| 11 | JSON 解析失败提示 | 模拟或触发 502 `AI response parse failed`，前端有明确文案 | ☐ |
| 12 | 历史记录含 `deepseek` 来源 | 页面与 `GET /api/history` 一致 | ☐ |
| 13 | Git 无 `.env`、无真实 API Key | `git status` + 代码搜索 `sk-` | ☐ |
| 14 | 前端无 DeepSeek 直连 | 搜索 `deepseek.com`、`DEEPSEEK` 于 frontend/ | ☐ |

---

## 4.2 接口级验收

### POST /api/chat（DeepSeek 路径）

**正常路径：**

- 请求：`{ "subject": "math", "grade": "高一", "question": "..." }`
- HTTP 200
- 响应：

```json
{
  "id": <number>,
  "source": "deepseek",
  "answer": {
    "summary": "<string>",
    "knowledgePoints": ["..."],
    "steps": ["..."],
    "example": { "question": "...", "answer": "..." },
    "reminder": "...",
    "disclaimer": "..."
  }
}
```

- `qa_records` 新增 1 行，`answer_source = 'deepseek'`

**异常路径：**

| 条件 | HTTP | `error` 含意 |
|------|------|--------------|
| 缺少 / 无效 subject、grade、question | 400 | 参数错误 |
| 未配置 `DEEPSEEK_API_KEY` | 503 | Key 未配置 |
| DeepSeek 不可用 | 502 | API 请求失败 |
| 模型返回非 JSON | 502 | AI response parse failed |
| DB 写入失败 | 500 | Failed to save chat record |

### GET /api/subjects、GET /api/history

- 行为与第 9 节一致，无 breaking change
- history 中可同时存在 `source: mock`（旧数据）与 `source: deepseek`（新数据）

---

## 4.3 前端 UX 验收

- [ ] 提交问题 → loading → 成功展示六段结构化内容（含 disclaimer）
- [ ] 提交失败 → 红色错误区，不清空已选学科/年级
- [ ] JSON 解析失败 → 专用提示，非通用「提交失败」
- [ ] 历史区域自动刷新，新记录 `source` 显示 `deepseek`
- [ ] 页面无 Mock 专属文案（或已更新为 DeepSeek）
- [ ] 前端代码无 API Key、无 `fetch('https://api.deepseek.com')`

---

## 4.4 安全验收

- [ ] `.env` 在 `.gitignore` 且未 staged
- [ ] `.env.example` 中 Key 为 `your_deepseek_api_key_here`
- [ ] 后端日志不打印完整 Key
- [ ] `git log -p` 历史提交中无意外泄露 Key（若曾误提交需 rotate Key）

---

## 4.5 学生自测 8 问（第 10 节）

1. DeepSeek API Key 是否只写在 `.env`，且 `.env` 未提交 Git？
2. 前端是否仍只请求 `/api/chat`，而不是直接请求 DeepSeek？
3. `POST /api/chat` 返回的 `source` 是否为 `deepseek`？
4. 数据库最新记录的 `answer_source` 是否为 `deepseek`？
5. 答案是否包含 `disclaimer` 字段？
6. 提交问题时是否能看到 loading 状态？
7. API 失败或 JSON 解析失败时，页面是否有明确错误提示？
8. 第 9 节的 history、subjects 接口是否仍能正常使用？

**全部回答「是」即为通过。**

---

## 4.6 非功能验收

- 无登录注册相关代码增量
- 无数据库 schema 变更
- Mock 模块可保留但非默认生产路径
- 单次问答响应时间可接受（课堂演示：< 30s，视网络与模型而定）
