const GRADES = ['高一', '高二', '高三'];

const SUBJECT_LABELS = {
  math: '数学',
  english: '英语',
  physics: '物理',
};

const SOURCE_LABELS = {
  mock: 'Mock',
  deepseek: 'DeepSeek',
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
      {loading ? 'AI 正在思考…' : '提交问题'}
      </button>
    </div>
  );
}

export function AnswerPanel({ answer, onSaveFavorite, isFavorite }) {
  if (!answer) return null;

  const favoriteMeta = answer.favoriteMeta;
  const saved = favoriteMeta ? isFavorite(favoriteMeta) : false;

  return (
    <section className="card answer-panel">
      <div className="panel-heading">
        <h2>结构化答案</h2>
        {favoriteMeta && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onSaveFavorite(favoriteMeta)}
            disabled={saved}
          >
            {saved ? '已收藏' : '收藏答案'}
          </button>
        )}
      </div>
      <h3>总结</h3>
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
      {answer.disclaimer && (
        <p className="disclaimer">⚠️ {answer.disclaimer}</p>
      )}
    </section>
  );
}

export function HistoryList({ records, onSaveFavorite, isFavorite }) {
  return (
    <section className="card history-panel">
      <h2>最近问答（最多 5 条）</h2>
      {records.length === 0 ? (
        <p className="empty">暂无历史记录，提交第一个问题吧。</p>
      ) : (
        <ul className="history-list">
          {records.map((r) => {
            const favoriteMeta = {
              subject: r.subject,
              grade: r.grade,
              question: r.question,
              summary: `历史问题：${r.question}`,
              createdAt: r.createdAt,
            };
            const saved = isFavorite(favoriteMeta);

            return (
              <li key={r.id}>
                <div className="history-top">
                  <div>
                    <span className="tag">{SUBJECT_LABELS[r.subject] || r.subject}</span>
                    <span className="tag grade">{r.grade}</span>
                    {r.source && (
                      <span className="tag source">{SOURCE_LABELS[r.source] || r.source}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary compact"
                    onClick={() => onSaveFavorite(favoriteMeta)}
                    disabled={saved}
                  >
                    {saved ? '已收藏' : '收藏'}
                  </button>
                </div>
                <p className="history-q">{r.question}</p>
                <span className="meta">
                  {new Date(r.createdAt).toLocaleString('zh-CN')}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function FavoriteList({ favorites, onRemoveFavorite, onClearFavorites }) {
  return (
    <section className="card favorite-panel">
      <div className="panel-heading">
        <h2>我的收藏</h2>
        {favorites.length > 0 && (
          <button type="button" className="btn-danger compact" onClick={onClearFavorites}>
            清空收藏
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <p className="empty">暂无收藏，可以从答案或历史记录中添加。</p>
      ) : (
        <ul className="favorite-list">
          {favorites.map((item) => (
            <li key={item.id}>
              <div className="favorite-top">
                <div>
                  <span className="tag">{SUBJECT_LABELS[item.subject] || item.subject}</span>
                  <span className="tag grade">{item.grade}</span>
                </div>
                <button
                  type="button"
                  className="btn-secondary compact"
                  onClick={() => onRemoveFavorite(item.id)}
                >
                  取消收藏
                </button>
              </div>
              <p className="history-q">{item.question}</p>
              <p className="favorite-summary">{item.summary}</p>
              <span className="meta">
                {new Date(item.createdAt).toLocaleString('zh-CN')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
