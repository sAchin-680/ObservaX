// collectorConfig.ts
// Utility to generate OTel Collector config from sampling rules and trigger reload
import fs from 'fs';
import path from 'path';
import SamplingRule from '../models/samplingRule.schema';

const COLLECTOR_CONFIG_PATH =
  process.env.COLLECTOR_CONFIG_PATH || '/etc/otel-collector/config.yaml';

export async function regenerateCollectorConfig() {
  const rules = await SamplingRule.find({});
  // Example: generate tail sampling config for each service
  const tailSamplingPolicies = rules.map((rule) => ({
    name: `${rule.service}-sampling`,
    type: rule.rule,
    rate: rule.rate,
    conditions: rule.conditions || {},
  }));
  // Build YAML config (simplified)
  const config = {
    processors: {
      tail_sampling: {
        policies: tailSamplingPolicies,
      },
    },
  };
  // Write config to file
  fs.writeFileSync(COLLECTOR_CONFIG_PATH, JSON.stringify(config, null, 2));
  // Trigger reload (send SIGHUP or call API)
  try {
    process.kill(parseInt(process.env.COLLECTOR_PID || '0'), 'SIGHUP');
  } catch (e) {
    // Log error or fallback
  }
}
