import { Router } from 'express';
import { pool } from '../infra/database.js';

const router = Router();

router.get('/live', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'indisponivel' });
  }
});

export default router;
