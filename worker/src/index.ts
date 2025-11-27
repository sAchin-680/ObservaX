import express from 'express';
import ClickHouse from '@apla/clickhouse';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import type { Db } from 'mongodb';
import { connectLogsWebSocket, broadcastLog } from './wsClient';
import { startHealthScoreWorker } from './serviceHealth';
import { dailyExportWorker } from './s3Exporter';

const app = express();
app.use(express.json());

const ch = new ClickHouse({ url: 'http://clickhouse:8123' });
const mongo = new MongoClient(process.env.MONGO_URL || 'mongodb://mongodb:27017');
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

let db: Db | undefined;
mongo.connect().then(() => {
  db = mongo.db('observax');
});
connectLogsWebSocket();

// Start health score worker
startHealthScoreWorker();

// Start daily S3 export worker
dailyExportWorker();

app.post('/telemetry', async (req, res) => {
  const { type, payload } = req.body;

  // Cache telemetry payload in Redis
  await redis.set(`telemetry:${type}:${Date.now()}`, JSON.stringify(payload));

  try {
    if (type === 'trace') {
      await ch.query(`
        INSERT INTO traces VALUES (
          '${payload.trace_id}',
          '${payload.span_id}',
          '${payload.parent_span_id}',
          '${payload.service_name}',
          '${payload.operation_name}',
          '${payload.start_time}',
          ${payload.duration_ms},
          ${JSON.stringify(payload.attributes?.key)},
          ${JSON.stringify(payload.attributes?.value)}
        )
      `);
    }

    if (type === 'log') {
      await ch.query(`
        INSERT INTO logs VALUES (
          '${payload.log_id}',
          '${payload.timestamp}',
          '${payload.service_name}',
          '${payload.level}',
          '${payload.message}',
          '${payload.trace_id}',
          '${payload.span_id}',
          ${JSON.stringify(payload.attributes?.key)},
          ${JSON.stringify(payload.attributes?.value)}
        )
      `);
      // Broadcast to WebSocket
      broadcastLog(payload);
    }

    if (type === 'metric') {
      await ch.query(`
        INSERT INTO metrics VALUES (
          '${payload.metric_id}',
          '${payload.timestamp}',
          '${payload.service_name}',
          '${payload.metric_name}',
          ${payload.value},
          ${JSON.stringify(payload.labels?.key)},
          ${JSON.stringify(payload.labels?.value)}
        )
      `);
    }

    if (type === 'metadata' && db) {
      await db
        .collection(payload.collection)
        .updateOne({ _id: payload.id }, { $set: payload.data }, { upsert: true });
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

app.listen(3000, () => console.log('Worker up on 3000'));
