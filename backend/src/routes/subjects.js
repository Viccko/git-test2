import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT code, name, grade_range FROM subjects ORDER BY id'
    );
    res.json({
      subjects: rows.map((row) => ({
        code: row.code,
        name: row.name,
        gradeRange: row.grade_range,
      })),
    });
  } catch (err) {
    console.error('GET /api/subjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

export default router;
