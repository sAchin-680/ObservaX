import React, { useEffect, useRef, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_LOGS_WS_URL || 'ws://localhost:4000/logs/live';

export default function LiveTailLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);
    wsRef.current.onmessage = (event) => {
      const log = JSON.parse(event.data);
      setLogs((prev) => (paused ? prev : [...prev, log]));
    };
    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    return () => {
      wsRef.current?.close();
    };
  }, [paused]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(
    (log) =>
      !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 flex flex-col gap-4 h-[80vh]">
      <div className="flex gap-2 items-center">
        <button
          className={`px-4 py-2 rounded ${
            paused ? 'bg-secondary' : 'bg-primary text-primary-foreground'
          }`}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          className={`px-4 py-2 rounded ${autoScroll ? 'bg-primary' : 'bg-secondary'}`}
          onClick={() => setAutoScroll((a) => !a)}
        >
          {autoScroll ? 'Auto-Scroll On' : 'Auto-Scroll Off'}
        </button>
        <input
          className="border rounded px-2 py-1"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="bg-card rounded shadow p-4 flex-1 overflow-auto text-xs">
        <ul>
          {filteredLogs.map((log, idx) => (
            <li
              key={idx}
              className={`py-1 border-b ${
                log.level === 'ERROR'
                  ? 'bg-red-100 text-red-700'
                  : log.level === 'WARN'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-background text-foreground'
              }`}
            >
              <span className="font-mono">[{log.timestamp}]</span> <b>{log.service_name}</b>{' '}
              <span className="font-bold">{log.level}</span>: {log.message}
            </li>
          ))}
          <div ref={logsEndRef} />
        </ul>
      </div>
    </div>
  );
}
