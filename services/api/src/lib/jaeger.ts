// Jaeger API client for ObservaX
import axios from 'axios';

const JAEGER_API_URL = process.env.JAEGER_API_URL || 'http://localhost:16686/api/traces';

export async function fetchJaegerTraces(service = '', limit = 20, start = '', end = '') {
  const params: any = { limit };
  if (service) params.service = service;
  if (start) params.start = start;
  if (end) params.end = end;
  const res = await axios.get(JAEGER_API_URL, { params });
  return res.data;
}

export async function fetchJaegerTraceById(traceId: string) {
  const url = `${JAEGER_API_URL}/${traceId}`;
  const res = await axios.get(url);
  return res.data;
}
