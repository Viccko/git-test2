import { useCallback, useEffect, useState } from 'react';
import { fetchSubjects, submitChat, fetchHistory } from './api.js';
import SubjectSelect, {
  GradeSelect,
  QuestionForm,
  AnswerPanel,
  HistoryList,
} from './components/ChatUI.jsx';

export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    const data = await fetchHistory(5);
    setHistory(data.records);
  }, []);

  useEffect(() => {
    fetchSubjects()
      .then((data) => {
        setSubjects(data.subjects);
        if (data.subjects.length > 0) {
          setSubject(data.subjects[0].code);
        }
      })
      .catch(() => setError('无法加载学科列表，请确认后端已启动。'));

    loadHistory().catch(() => setError('无法加载历史记录。'));
  }, [loadHistory]);

  async function handleSubmit() {
    setError('');
    if (!subject || !grade || !question.trim()) {
      setError('请选择学科、年级并输入问题。');
      return;
    }

    setLoading(true);
    try {
      const result = await submitChat({ subject, grade, question: question.trim() });
      setAnswer(result.answer);
      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>高中学科知识 AI</h1>
        <p className="subtitle">数学 · 英语 · 物理 · 第 9 节 Mock MVP</p>
      </header>

      <main>
        <section className="card form-panel">
          <div className="form-row">
            <SubjectSelect subjects={subjects} value={subject} onChange={setSubject} />
            <GradeSelect value={grade} onChange={setGrade} />
          </div>
          <QuestionForm
            question={question}
            onChange={setQuestion}
            onSubmit={handleSubmit}
            loading={loading}
          />
          {error && <p className="error">{error}</p>}
        </section>

        <AnswerPanel answer={answer} />
        <HistoryList records={history} />
      </main>

      <footer>
        <small>
          第 10 节将把后端 <code>backend/src/services/mockAi.js</code> 替换为 DeepSeek API。
        </small>
      </footer>
    </div>
  );
}
