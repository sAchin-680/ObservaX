import { Router } from 'express';
const router = Router();

// POST /metrics/query
import clickhouse from '../clients/clickhouse';

router.post('/query', async (req, res) => {
  const { metric, start, end, filters, limit = 100 } = req.body;
  try {
    let query = `SELECT * FROM metrics WHERE name = '${metric}'`;
    if (start) query += ` AND timestamp >= '${start}'`;
    if (end) query += ` AND timestamp <= '${end}'`;
    if (filters && typeof filters === 'object') {
      for (const [key, value] of Object.entries(filters)) {
        query += ` AND ${key} = '${String(value).replace(/'/g, '\'\'')}'`;
      }
    }
    query += ` ORDER BY timestamp DESC LIMIT ${limit}`;
    const metrics = await clickhouse.query(query).toPromise();
    res.json({ metrics });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
