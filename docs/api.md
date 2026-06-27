# API 文档

高中学科知识 AI 网站 MVP 接口说明。

---

## 接口 1：GET /api/subjects

**用途：** 获取可选学科列表

**请求：** 无请求体

**响应示例：**

```json
{
  "subjects": [
    { "code": "math", "name": "数学", "gradeRange": "高一-高三" },
    { "code": "english", "name": "英语", "gradeRange": "高一-高三" },
    { "code": "physics", "name": "物理", "gradeRange": "高一-高三" }
  ]
}
```

---

## 接口 2：POST /api/chat

**用途：** 提交学习问题，获取结构化答案，并写入数据库

**请求体：**

```json
{
  "subject": "math",
  "grade": "高一",
  "question": "二次函数怎么求最值？"
}
```

**响应体：**

```json
{
  "id": 1,
  "source": "mock",
  "answer": {
    "summary": "二次函数最值通常由开口方向和顶点决定。",
    "knowledgePoints": ["二次函数", "顶点式", "配方法"],
    "steps": [
      "先判断二次项系数 a 的正负。",
      "再求顶点横坐标 x = -b / 2a。",
      "把 x 代回函数得到最值。"
    ],
    "example": {
      "question": "求 y = x^2 - 4x + 1 的最小值。",
      "answer": "配方得 y = (x - 2)^2 - 3，所以最小值是 -3。"
    },
    "reminder": "考试中要写清楚取到最值时的 x。"
  }
}
```

---

## 接口 3：GET /api/history?limit=5

**用途：** 获取最近问答历史

**响应示例：**

```json
{
  "records": [
    {
      "id": 1,
      "subject": "math",
      "grade": "高一",
      "question": "二次函数怎么求最值？",
      "source": "mock",
      "createdAt": "2026-06-01T10:00:00.000Z"
    }
  ]
}
```
