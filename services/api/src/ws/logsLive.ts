import { Server } from 'ws';
import http from 'http';
import url from 'url';
import clickhouse from '../clients/clickhouse';

// This should be called from your Express app setup
export function setupLogsLiveWebSocket(server: http.Server) {
  const wss = new Server({ server, path: '/logs/live' });

  // Store connected clients
  const clients = new Set<any>();

  wss.on('connection', (ws, req) => {
    // Parse filters from query string
    const { query } = url.parse(req.url || '', true);
    (ws as any).filters = query || {};
    // Time range filter for initial fetch
    if ((ws as any).filters.start && (ws as any).filters.end) {
      // Fetch logs from ClickHouse for initial time range
      const start = (ws as any).filters.start;
      const end = (ws as any).filters.end;
      const queryStr = `SELECT * FROM logs WHERE timestamp >= '${start}' AND timestamp <= '${end}' ORDER BY timestamp ASC LIMIT 1000`;
      clickhouse
        .query(queryStr)
        .toPromise()
        .then((logs: any[]) => {
          logs.forEach((log) => ws.send(JSON.stringify(log)));
        });
    }
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast function for worker to call
  function broadcastLog(log: any) {
    for (const ws of clients) {
      const { service, level, text } = (ws as any).filters;
      if (service && log.service_name !== service) continue;
      if (level && log.level !== level) continue;
      if (text && !log.message.includes(text)) continue;
      ws.send(JSON.stringify(log));
    }
  }

  // Expose broadcast for worker
  (wss as any).broadcastLog = broadcastLog;

  return wss;
}
