/**
 * Mock AI 服务 — 第 10 节替换点
 * 将本模块替换为 deepSeekService.js，chat 路由调用接口保持不变。
 */

const SUBJECT_TEMPLATES = {
  math: {
    knowledgePoints: ['二次函数', '顶点式', '配方法'],
    steps: [
      '先判断二次项系数 a 的正负。',
      '再求顶点横坐标 x = -b / 2a。',
      '把 x 代回函数得到最值。',
    ],
    example: {
      question: '求 y = x² - 4x + 1 的最小值。',
      answer: '配方得 y = (x - 2)² - 3，所以最小值是 -3。',
    },
    reminder: '考试中要写清楚取到最值时的 x。',
  },
  english: {
    knowledgePoints: ['定语从句', '关系代词', '先行词'],
    steps: [
      '找出句子中的先行词（被修饰的名词）。',
      '判断从句在句中作定语还是其他成分。',
      '选择合适的关系代词 who / which / that 等。',
    ],
    example: {
      question: 'The book ___ I bought yesterday is interesting.',
      answer: '填 which 或 that，修饰先行词 book。',
    },
    reminder: '注意区分限制性定语从句和非限制性定语从句的逗号用法。',
  },
  physics: {
    knowledgePoints: ['牛顿第二定律', '受力分析', '加速度'],
    steps: [
      '画出物体的受力示意图。',
      '建立坐标系，分解各力。',
      '列方程 F = ma，代入已知量求解。',
    ],
    example: {
      question: '质量 2 kg 的物体受 10 N 水平力，求加速度。',
      answer: 'a = F/m = 10/2 = 5 m/s²。',
    },
    reminder: '受力分析时不要忘记重力、支持力和摩擦力。',
  },
};

export function generateMockAnswer({ subject, grade, question }) {
  const template = SUBJECT_TEMPLATES[subject] || SUBJECT_TEMPLATES.math;

  return {
    summary: `针对${grade}「${question}」的问题，${getSubjectLabel(subject)}类题目通常需要结合核心概念逐步分析。`,
    knowledgePoints: template.knowledgePoints,
    steps: template.steps,
    example: template.example,
    reminder: template.reminder,
  };
}

function getSubjectLabel(subject) {
  const labels = { math: '数学', english: '英语', physics: '物理' };
  return labels[subject] || '学科';
}
