import { Router } from 'express';
import pool from '../db.js';
import { generateDeepSeekAnswer } from '../services/deepSeekService.js';

const router = Router();
const VALID_SUBJECTS = new Set(['math', 'english', 'physics']);
const VALID_GRADES = new Set(['高一', '高二', '高三']);
const ANSWER_SOURCE = 'deepseek';

router.post('/', async (req, res) => {
  const { subject, grade, question } = req.body || {};

  if (!subject || !VALID_SUBJECTS.has(subject)) {
    return res.status(400).json({ error: 'Invalid subject' });
  }
  if (!grade || !VALID_GRADES.has(grade)) {
    return res.status(400).json({ error: 'Invalid grade' });
  }
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const trimmedQuestion = question.trim();

  let answer;
  try {
    answer = await generateDeepSeekAnswer({ subject, grade, question: trimmedQuestion });
  } catch (err) {
    if (err.code === 'CONFIG_ERROR') {
      return res.status(503).json({ error: 'DeepSeek API key not configured' });
    }
    if (err.code === 'PARSE_ERROR') {
      return res.status(502).json({ error: 'AI response parse failed' });
    }
    console.error('DeepSeek error:', err.message);
    return res.status(502).json({ error: 'DeepSeek API request failed' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO qa_records (subject_code, grade, question, answer_json, answer_source)
       VALUES (?, ?, ?, ?, ?)`,
      [subject, grade, trimmedQuestion, JSON.stringify(answer), ANSWER_SOURCE]
    );

    res.json({
      id: result.insertId,
      source: ANSWER_SOURCE,
      answer,
    });
  } catch (err) {
    console.error('POST /api/chat error:', err);
    res.status(500).json({ error: 'Failed to save chat record' });
  }
});

export default router;
