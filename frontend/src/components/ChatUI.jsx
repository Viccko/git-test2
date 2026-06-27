const GRADES = ['高一', '高二', '高三'];

const SUBJECT_LABELS = {
  math: '数学',
  english: '英语',
  physics: '物理',
};

export default function SubjectSelect({ subjects, value, onChange }) {
  return (
    <label className="field">
      <span className="label">学科</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">请选择学科</option>
        {subjects.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function GradeSelect({ value, onChange }) {
  return (
    <label className="field">
      <span className="label">年级</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">请选择年级</option>
        {GRADES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QuestionForm({ question, onChange, onSubmit, loading }) {
  return (
    <div className="field">
      <label className="label" htmlFor="question">
        学习问题
      </label>
      <textarea
        id="question"
        rows={4}
        placeholder="例如：二次函数怎么求最值？"
        value={question}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" className="btn-primary" onClick={onSubmit} disabled={loading}>
        {loading ? '提交中…' : '提交问题'}
      </button>
    </div>
  );
}

export function AnswerPanel({ answer }) {
  if (!answer) return null;

  return (
    <section className="card answer-panel">
      <h2>结构化答案</h2>
      <p className="summary">{answer.summary}</p>

      <h3>知识点</h3>
      <ul>
        {answer.knowledgePoints.map((kp) => (
          <li key={kp}>{kp}</li>
        ))}
      </ul>

      <h3>解题步骤</h3>
      <ol>
        {answer.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <h3>例题</h3>
      <p className="example-q">{answer.example.question}</p>
      <p className="example-a">{answer.example.answer}</p>

      <p className="reminder">💡 {answer.reminder}</p>
    </section>
  );
}

export function HistoryList({ records }) {
  return (
    <section className="card history-panel">
      <h2>最近问答（最多 5 条）</h2>
      {records.length === 0 ? (
        <p className="empty">暂无历史记录，提交第一个问题吧。</p>
      ) : (
        <ul className="history-list">
          {records.map((r) => (
            <li key={r.id}>
              <span className="tag">{SUBJECT_LABELS[r.subject] || r.subject}</span>
              <span className="tag grade">{r.grade}</span>
              <p className="history-q">{r.question}</p>
              <span className="meta">
                {r.source} · {new Date(r.createdAt).toLocaleString('zh-CN')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
