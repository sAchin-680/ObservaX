import { Router } from 'express';
const router = Router();

// GET /services
import clickhouse from '../clients/clickhouse';

router.get('/', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT service_name FROM traces ORDER BY service_name ASC';
    const result = await clickhouse.query(query).toPromise();
    const services = result.map((row: any) => row.service_name);
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
