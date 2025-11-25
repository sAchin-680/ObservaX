import React from 'react';
import { searchLogs } from '../lib/api';

export default function LogsViewer() {
  const [query, setQuery] = React.useState('');
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchLogs(query);
      setLogs(data.logs || []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleSearch();
    // Optionally, set up streaming with setInterval
    // const interval = setInterval(handleSearch, 5000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Streaming & Filtering */}
      <div className="flex gap-4">
        <input
          className="border rounded px-2 py-1"
          placeholder="Search logs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-primary text-primary-foreground rounded px-4 py-2"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Stream'}
        </button>
      </div>
      {/* Virtualized list */}
      <div className="bg-card rounded shadow p-4 max-h-64 overflow-auto">
        <div className="font-bold mb-2">Logs</div>
        <ul className="text-xs">
          {logs.map((log, idx) => (
            <li key={idx} className="border-b py-1 cursor-pointer" onClick={() => setLogs([log])}>
              {log.message}
            </li>
          ))}
        </ul>
      </div>
      {/* JSON highlighting */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">Log Details</div>
        {logs.length > 0 ? (
          <pre className="bg-background p-2 rounded text-xs">
            {JSON.stringify(logs[0], null, 2)}
          </pre>
        ) : (
          <div className="text-muted-foreground">Select a log to view details</div>
        )}
      </div>
    </div>
  );
}
