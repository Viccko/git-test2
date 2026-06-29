const API_BASE = '';

function getChatErrorMessage(error) {
  const messages = {
    'Invalid subject': '请选择正确的学科后再提交。',
    'Invalid grade': '请选择正确的年级后再提交。',
    'Question is required': '请输入学习问题后再提交。',
    'DeepSeek API key not configured': 'AI 服务还没有配置好，请联系老师或管理员。请稍后重试。',
    'AI response parse failed': 'AI 返回的内容格式异常，请稍后重试。',
    'DeepSeek API request failed': 'AI 服务暂时没有响应，请稍后重试。检查网络或服务端。',
    'Failed to save chat record': '问答记录保存失败，请稍后重试。检查网络或服务端。',
  };

  return messages[error] || '提交失败，请稍后重试。检查网络或服务端。';
}

export async function fetchSubjects() {
  const res = await fetch(`${API_BASE}/api/subjects`);
  if (!res.ok) throw new Error('加载学科失败');
  return res.json();
}

export async function submitChat({ subject, grade, question }) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, grade, question }),
    });
  } catch {
    throw new Error('无法连接服务端，请稍后重试。检查网络或服务端。');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(getChatErrorMessage(err.error));
  }
  return res.json();
}

export async function fetchHistory(limit = 5) {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error('加载历史失败');
  return res.json();
}
