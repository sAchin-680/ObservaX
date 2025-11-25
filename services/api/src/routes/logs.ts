import { Router } from 'express';
const router = Router();

// GET /logs/search?q=
import clickhouse from '../clients/clickhouse';

router.get('/search', async (req, res) => {
  const q = (req.query.q as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  try {
    let query = 'SELECT * FROM logs';
    if (q) {
      query += ` WHERE message LIKE '%${q.replace(/'/g, '\'\'')}%'`;
    }
    query += ` ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`;
    const logs = await clickhouse.query(query).toPromise();
    res.json({
      logs,
      pagination: {
        page,
        limit,
        offset,
        count: logs.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
