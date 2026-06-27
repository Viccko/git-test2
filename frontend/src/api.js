const API_BASE = '';

export async function fetchSubjects() {
  const res = await fetch(`${API_BASE}/api/subjects`);
  if (!res.ok) throw new Error('加载学科失败');
  return res.json();
}

export async function submitChat({ subject, grade, question }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, grade, question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '提交失败');
  }
  return res.json();
}

export async function fetchHistory(limit = 5) {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error('加载历史失败');
  return res.json();
}
