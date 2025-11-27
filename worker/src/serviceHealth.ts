// serviceHealth.ts
// Worker: Compute service health scores every 15s and store in MongoDB
import { ClickHouse } from 'clickhouse';
import { MongoClient } from 'mongodb';

const ch = new ClickHouse({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  basicAuth: {
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
  },
  isUseQueryString: true,
});
const mongo = new MongoClient(process.env.MONGO_URL || 'mongodb://mongodb:27017');
const DB_NAME = 'observax';
const COLLECTION = 'service_health';
const LATENCY_THRESHOLD = 500; // ms

async function computeScores() {
  await mongo.connect();
  const db = mongo.db(DB_NAME);
  // Get all services
  const servicesRaw = await ch.query('SELECT DISTINCT service_name FROM traces').toPromise();
  const services = Array.isArray(servicesRaw)
    ? servicesRaw.map((row: any) => row['service_name'])
    : [];
  for (const service of services) {
    // Get latency p95, error rate, downtime
    const statsRaw = await ch
      .query(
        `
      SELECT
        quantile(0.95)(duration) AS latency_p95,
        sum(error) / count() AS error_rate,
        sum(downtime_seconds) AS downtime_seconds
      FROM traces
      WHERE service_name = '${service}' AND timestamp > now() - 60
    `
      )
      .toPromise();
    const stats =
      Array.isArray(statsRaw) && statsRaw.length > 0 ? (statsRaw[0] as Record<string, any>) : {};
    const latency_p95 = stats['latency_p95'] || 0;
    const error_rate = stats['error_rate'] || 0;
    const downtime_seconds = stats['downtime_seconds'] || 0;
    // Health score formula
    let score = 100;
    if (latency_p95 > LATENCY_THRESHOLD) score -= 20;
    if (error_rate > 0.01) score -= 40;
    if (downtime_seconds > 60) score -= 30;
    score = Math.max(0, Math.min(100, score));
    await db.collection(COLLECTION).updateOne(
      { service },
      {
        $set: {
          service,
          score,
          latency_p95,
          error_rate,
          downtime_seconds,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }
}

export function startHealthScoreWorker() {
  setInterval(computeScores, 15000);
}
