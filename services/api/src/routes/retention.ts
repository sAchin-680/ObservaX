// Retention API: restore historical data from S3
import { Router } from 'express';
import AWS from 'aws-sdk';

const router = Router();
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// GET /retention/restore?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/restore', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from/to date.' });
  }
  try {
    // List and fetch Parquet files from S3 for the date range
    const files = [];
    const start = new Date(from as string);
    const end = new Date(to as string);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      files.push(`traces-${dateStr}.parquet`);
    }
    const results = await Promise.all(
      files.map(async (key) => {
        try {
          const obj = await s3.getObject({ Bucket: 'observax-archive', Key: key }).promise();
          return { key, found: true, size: obj.ContentLength };
        } catch {
          return { key, found: false };
        }
      })
    );
    res.json({ files: results });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
