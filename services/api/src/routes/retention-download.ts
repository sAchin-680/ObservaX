// Retention Download API
import { Router } from 'express';
import AWS from 'aws-sdk';

const router = Router();
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

router.get('/download', async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'Missing key' });
  try {
    const obj = await s3.getObject({ Bucket: 'observax-archive', Key: key as string }).promise();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
    res.send(obj.Body);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
