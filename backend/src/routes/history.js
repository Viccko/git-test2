import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 50);

  try {
    const [rows] = await pool.query(
      `SELECT id, subject_code, grade, question, answer_source, created_at
       FROM qa_records
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      records: rows.map((row) => ({
        id: row.id,
        subject: row.subject_code,
        grade: row.grade,
        question: row.question,
        source: row.answer_source,
        createdAt: new Date(row.created_at).toISOString(),
      })),
    });
  } catch (err) {
    console.error('GET /api/history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
