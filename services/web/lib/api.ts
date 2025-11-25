// ObservaX frontend API client
export async function fetchServices() {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  const data = await res.json();
  return data.services;
}

export async function fetchMetrics(
  metric: string,
  start?: string,
  end?: string,
  filters?: Record<string, any>,
  limit = 100
) {
  const res = await fetch('/api/metrics/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metric, start, end, filters, limit }),
  });
  if (!res.ok) throw new Error('Failed to fetch metrics');
  const data = await res.json();
  return data.metrics;
}

export async function searchLogs(q: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  const res = await fetch(`/api/logs/search?${params}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  const data = await res.json();
  return data;
}

export async function fetchTraces(page = 1, limit = 20) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`/api/traces/latest?${params}`);
  if (!res.ok) throw new Error('Failed to fetch traces');
  const data = await res.json();
  return data;
}

export async function fetchTraceById(id: string) {
  const res = await fetch(`/api/traces/${id}`);
  if (!res.ok) throw new Error('Failed to fetch trace');
  const data = await res.json();
  return data;
}
