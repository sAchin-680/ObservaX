import { Router } from 'express';
import clickhouse from '../clients/clickhouse';

const router = Router();

// SSE endpoint for live logs
router.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Example: poll ClickHouse for new logs every second
  let lastTimestamp = Date.now() - 10000;
  const interval = setInterval(async () => {
    try {
      const query = `SELECT * FROM logs WHERE timestamp > '${lastTimestamp}' ORDER BY timestamp ASC LIMIT 100`;
      const logs = await clickhouse.query(query).toPromise();
      logs.forEach((log: any) => {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
        lastTimestamp = Math.max(lastTimestamp, new Date(log.timestamp).getTime());
      });
    } catch (err) {
      res.write(`event: error\ndata: ${JSON.stringify(err)}\n\n`);
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;
