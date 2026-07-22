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
  const [chatError, setChatError] = useState('');
  const [pageError, setPageError] = useState('');

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
      .catch(() => setPageError('无法加载学科列表，请稍后刷新页面。检查网络或服务端。'));

    loadHistory().catch(() => setPageError('无法加载历史记录，请稍后刷新页面。检查网络或服务端。'));
  }, [loadHistory]);

  async function handleSubmit() {
    setChatError('');
    if (!subject || !grade || !question.trim()) {
      setChatError('请先选择学科和年级，并输入学习问题。');
      return;
    }

    setLoading(true);
    try {
      const result = await submitChat({ subject, grade, question: question.trim() });
      setAnswer(result.answer);
      loadHistory().catch(() => {
        setPageError('答案已生成，但历史记录暂时无法刷新。请稍后重试。检查网络或服务端。');
      });
    } catch (err) {
      setChatError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>高中学科知识 AI</h1>
        <p className="subtitle">数学 · 英语 · 物理 · DeepSeek AI 答疑</p>
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
          {chatError && (
            <div className="error" role="alert">
              <strong>提交遇到问题</strong>
              <span>{chatError}</span>
            </div>
          )}
        </section>

        {pageError && (
          <div className="error page-error" role="alert">
            <strong>页面提示</strong>
            <span>{pageError}</span>
          </div>
        )}

        <AnswerPanel answer={answer} />
        <HistoryList records={history} />
      </main>

      <footer>
        <small>
        已接入 DeepSeek API
        </small>
      </footer>
    </div>
  );
}
