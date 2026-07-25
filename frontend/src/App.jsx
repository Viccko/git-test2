import { useCallback, useEffect, useState } from 'react';
import { fetchSubjects, submitChat, fetchHistory } from './api.js';
import SubjectSelect, {
  GradeSelect,
  QuestionForm,
  AnswerPanel,
  HistoryList,
  FavoriteList,
} from './components/ChatUI.jsx';

const FAVORITES_STORAGE_KEY = 'subject-ai-favorites';

function getFavoriteId({ subject, grade, question, createdAt }) {
  return [subject, grade, question, createdAt].join('|');
}

function loadSavedFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(loadSavedFavorites);
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

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function saveFavorite(item) {
    const favorite = {
      ...item,
      id: getFavoriteId(item),
    };

    setFavorites((current) => {
      if (current.some((saved) => saved.id === favorite.id)) {
        return current;
      }
      return [favorite, ...current];
    });
  }

  function removeFavorite(id) {
    setFavorites((current) => current.filter((item) => item.id !== id));
  }

  function clearFavorites() {
    setFavorites([]);
  }

  function isFavorite(item) {
    return favorites.some((saved) => saved.id === getFavoriteId(item));
  }

  async function handleSubmit() {
    setChatError('');
    if (!subject || !grade || !question.trim()) {
      setChatError('请先选择学科和年级，并输入学习问题。');
      return;
    }

    setLoading(true);
    try {
      const trimmedQuestion = question.trim();
      const result = await submitChat({ subject, grade, question: trimmedQuestion });
      setAnswer({
        ...result.answer,
        favoriteMeta: {
          subject,
          grade,
          question: trimmedQuestion,
          summary: result.answer.summary,
          createdAt: new Date().toISOString(),
        },
      });
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

        <AnswerPanel
          answer={answer}
          onSaveFavorite={saveFavorite}
          isFavorite={isFavorite}
        />
        <HistoryList
          records={history}
          onSaveFavorite={saveFavorite}
          isFavorite={isFavorite}
        />
        <FavoriteList
          favorites={favorites}
          onRemoveFavorite={removeFavorite}
          onClearFavorites={clearFavorites}
        />
      </main>

      <footer>
        <small>
        已接入 DeepSeek API
        </small>
      </footer>
    </div>
  );
}
