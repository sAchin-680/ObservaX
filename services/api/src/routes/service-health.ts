// Service Health API route
import { Router } from 'express';
import { MongoClient } from 'mongodb';

const router = Router();
const mongo = new MongoClient(process.env.MONGO_URL || 'mongodb://mongodb:27017');
const DB_NAME = 'observax';
const COLLECTION = 'service_health';

router.get('/', async (req, res) => {
  try {
    await mongo.connect();
    const db = mongo.db(DB_NAME);
    const health = await db.collection(COLLECTION).find({}).toArray();
    res.json({ health });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
