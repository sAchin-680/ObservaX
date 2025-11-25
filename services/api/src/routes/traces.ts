import { Router } from 'express';
const router = Router();

// GET /traces/latest
import clickhouse from '../clients/clickhouse';

router.get('/latest', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  try {
    const query = `SELECT * FROM traces ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`;
    const traces = await clickhouse.query(query).toPromise();
    // Normalize response
    res.json({
      traces,
      pagination: {
        page,
        limit,
        offset,
        count: traces.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /traces/:id
router.get('/:id', async (req, res) => {
  const traceId = req.params.id;
  try {
    // Example: get all spans for the trace
    const query = `SELECT * FROM traces WHERE trace_id = '${traceId}' ORDER BY timestamp ASC`;
    const spans = await clickhouse.query(query).toPromise();
    // Normalize response
    res.json({
      traceId,
      waterfall: spans
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
