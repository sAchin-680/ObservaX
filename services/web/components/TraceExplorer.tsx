import React from 'react';
import { fetchTraces, fetchTraceById } from '../lib/api';

export default function TraceExplorer() {
  const [service, setService] = React.useState('');
  const [traceId, setTraceId] = React.useState('');
  const [traces, setTraces] = React.useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const data = await fetchTraces(); // TODO: add service/time filter support
      setTraces(data.traces || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrace = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchTraceById(id);
      setSelectedTrace(data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleFilter();
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          className="border rounded px-2 py-1"
          placeholder="Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Trace ID"
          value={traceId}
          onChange={(e) => setTraceId(e.target.value)}
        />
        <input className="border rounded px-2 py-1" placeholder="Time Range" />
        <button
          className="bg-primary text-primary-foreground rounded px-4 py-2"
          onClick={handleFilter}
          disabled={loading}
        >
          Filter
        </button>
      </div>
      {/* Table */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">Traces Table</div>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Timestamp</th>
              <th>Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {traces.map((trace: any) => (
              <tr key={trace.trace_id}>
                <td>{trace.trace_id}</td>
                <td>{trace.service_name}</td>
                <td>{trace.timestamp}</td>
                <td>{trace.duration}</td>
                <td>
                  <button
                    className="underline text-primary"
                    onClick={() => handleSelectTrace(trace.trace_id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Waterfall view */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">Waterfall View</div>
        {selectedTrace ? (
          <pre className="bg-background p-2 rounded text-xs max-h-40 overflow-auto">
            {JSON.stringify(selectedTrace.waterfall, null, 2)}
          </pre>
        ) : (
          <div className="text-muted-foreground">Select a trace to view waterfall</div>
        )}
      </div>
      {/* Span details panel */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">Span Details</div>
        {selectedTrace ? (
          <pre className="bg-background p-2 rounded text-xs max-h-40 overflow-auto">
            {JSON.stringify(selectedTrace, null, 2)}
          </pre>
        ) : (
          <div className="text-muted-foreground">Select a trace to view details</div>
        )}
      </div>
    </div>
  );
}
