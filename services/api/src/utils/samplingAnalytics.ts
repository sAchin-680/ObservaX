// samplingAnalytics.ts
// Utility to query ClickHouse for trace analytics and suggest sampling rates
import clickhouse from '../clients/clickhouse';

export interface ServiceAnalytics {
  service: string;
  traceVolume: number;
  errorRate: number;
  avgLatency: number;
}

export async function getServiceAnalytics(): Promise<ServiceAnalytics[]> {
  // Query ClickHouse for trace volume, error rate, and avg latency per service
  const query = `
    SELECT
      service_name,
      count() AS traceVolume,
      avg(duration) AS avgLatency,
      sum(error) / count() AS errorRate
    FROM traces
    GROUP BY service_name
    ORDER BY traceVolume DESC
    LIMIT 100
  `;
  const result = await clickhouse.query(query).toPromise();
  return result.map((row: any) => ({
    service: row.service_name,
    traceVolume: row.traceVolume,
    errorRate: Number(row.errorRate),
    avgLatency: Number(row.avgLatency),
  }));
}

export function suggestSamplingRate(analytics: ServiceAnalytics): number {
  // Example: lower sampling rate if trace volume is high, error rate is low, latency is low
  // Increase sampling if error rate or latency is high
  let rate = 0.1; // default
  if (analytics.traceVolume > 10000 && analytics.errorRate < 0.01 && analytics.avgLatency < 200) {
    rate = 0.01;
  } else if (analytics.errorRate > 0.05 || analytics.avgLatency > 1000) {
    rate = 0.5;
  } else if (analytics.errorRate > 0.01 || analytics.avgLatency > 500) {
    rate = 0.2;
  }
  return Math.max(0.01, Math.min(1, rate));
}
