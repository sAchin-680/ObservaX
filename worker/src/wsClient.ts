import WebSocket from 'ws';

// Connect to the Express.js WebSocket server
const LOGS_WS_URL = process.env.LOGS_WS_URL || 'ws://localhost:4000/logs/live';
let ws: WebSocket | null = null;

export function connectLogsWebSocket() {
  ws = new WebSocket(LOGS_WS_URL);
  ws.on('open', () => {
    console.log('Connected to logs WebSocket');
  });
  ws.on('error', (err: Error) => {
    console.error('WebSocket error:', err);
  });
  ws.on('close', () => {
    console.log('WebSocket closed, reconnecting in 2s...');
    setTimeout(connectLogsWebSocket, 2000);
  });
}

export function broadcastLog(log: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(log));
  }
}
