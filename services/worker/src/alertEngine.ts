import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import clickhouse from '../../api/src/clients/clickhouse';
import { sendNotification } from './notifier';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
const DB_NAME = 'observax';
const ALERTS_COLLECTION = 'alerts';

const redis = new Redis(REDIS_URI);

async function runAlertEngine() {
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);
  const alerts = await db.collection(ALERTS_COLLECTION).find({ enabled: true }).toArray();

  for (const alert of alerts) {
    // Execute ClickHouse query
    let result;
    try {
      result = await clickhouse.query(alert.query).toPromise();
    } catch (err) {
      console.error('ClickHouse query error:', err);
      continue;
    }
    // Evaluate alert condition
    const triggered =
      Array.isArray(result) && result.length > 0 && result[0].value > alert.threshold;
    const stateKey = `alert:${alert._id}:state`;
    const prevState = await redis.get(stateKey);
    if (triggered && prevState !== 'triggered') {
      await redis.set(stateKey, 'triggered');
      await sendNotification(alert, 'triggered', result);
    } else if (!triggered && prevState === 'triggered') {
      await redis.set(stateKey, 'resolved');
      await sendNotification(alert, 'resolved', result);
    }
  }
  await mongo.close();
}

setInterval(runAlertEngine, 15000);
