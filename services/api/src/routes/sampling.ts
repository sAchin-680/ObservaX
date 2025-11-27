import { Router } from 'express';
import SamplingRule from '../models/samplingRule.schema';
import { regenerateCollectorConfig } from '../utils/collectorConfig';
import { getServiceAnalytics, suggestSamplingRate } from '../utils/samplingAnalytics';

const router = Router();

// GET /sampling/analytics - fetch per-service analytics and sampling suggestions
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await getServiceAnalytics();
    const suggestions = analytics.map((a) => ({
      service: a.service,
      traceVolume: a.traceVolume,
      errorRate: a.errorRate,
      avgLatency: a.avgLatency,
      suggestedRate: suggestSamplingRate(a),
    }));
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /sampling/rules - fetch all sampling rules
router.get('/rules', async (req, res) => {
  try {
    const rules = await SamplingRule.find({});
    res.json({ rules });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /sampling/update - add or update a sampling rule
router.post('/update', async (req, res) => {
  const { service, rule, rate, conditions } = req.body;
  if (!service || !rule || typeof rate !== 'number') {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const updated = await SamplingRule.findOneAndUpdate(
      { service },
      { rule, rate, conditions, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    await regenerateCollectorConfig();
    res.json({ rule: updated });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
