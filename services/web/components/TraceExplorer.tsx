import React, { useState } from 'react';
import { fetchTraces, fetchTraceById, fetchJaegerTraces, fetchJaegerTraceById } from '../lib/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Cell,
} from 'recharts';

function getWaterfallData(trace: any) {
  const spans = trace?.spans || trace?.waterfall || [];
  if (!spans.length) return [];
  const minStart = Math.min(...spans.map((s: any) => s.startTime || s.timestamp));
  return spans.map((span: any) => ({
    name: span.operationName || span.name,
    start: ((span.startTime || span.timestamp) - minStart) / 1000,
    duration: (span.duration || span.duration_ms || 0) / 1000,
    service: span.process?.serviceName || span.service_name,
    spanId: span.spanID || span.span_id,
    parentId: span.references?.[0]?.spanID || span.parent_span_id,
    error: !!(span.tags?.find?.((t: any) => t.key === 'error' && t.value === true) || span.error),
    meta: span,
  }));
}

export default function TraceExplorer() {
  const [service, setService] = React.useState('');
  const [traceId, setTraceId] = React.useState('');
  const [traces, setTraces] = React.useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [source, setSource] = React.useState<'clickhouse' | 'jaeger'>('clickhouse');
  const [expandedSpanId, setExpandedSpanId] = useState<string | null>(null);

  const handleFilter = async () => {
    setLoading(true);
    try {
      let data;
      if (source === 'jaeger') {
        data = await fetchJaegerTraces(service, 20);
        setTraces(data.data || []);
      } else {
        data = await fetchTraces();
        setTraces(data.traces || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrace = async (id: string) => {
    setLoading(true);
    try {
      let data;
      if (source === 'jaeger') {
        data = await fetchJaegerTraceById(id);
        setSelectedTrace(data.data || data);
      } else {
        data = await fetchTraceById(id);
        setSelectedTrace(data);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleFilter();
  }, [source]);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Source selector */}
      <div className="flex gap-4 items-center">
        <label>Source:</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="clickhouse">ClickHouse</option>
          <option value="jaeger">Jaeger</option>
        </select>
      </div>
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
        <input
          className="border rounded px-2 py-1"
          placeholder="Time Range (YYYY-MM-DD)"
          onChange={(e) => {
            /* implement time range filter logic here */
          }}
        />
        <select
          className="border rounded px-2 py-1"
          defaultValue="all"
          onChange={(e) => {
            /* implement error filter logic here */
          }}
        >
          <option value="all">All</option>
          <option value="error">Errors Only</option>
          <option value="ok">Non-Error Only</option>
        </select>
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
              <tr key={trace.traceID || trace.trace_id}>
                <td>{trace.traceID || trace.trace_id}</td>
                <td>{trace.process?.serviceName || trace.service_name}</td>
                <td>{trace.startTime || trace.timestamp}</td>
                <td>{trace.duration}</td>
                <td>
                  <button
                    className="underline text-primary"
                    onClick={() => handleSelectTrace(trace.traceID || trace.trace_id)}
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={getWaterfallData(selectedTrace)}
              layout="vertical"
              margin={{ left: 40, right: 40, top: 20, bottom: 20 }}
              onClick={(e: any) => setExpandedSpanId(e.activePayload?.[0]?.payload?.spanId || null)}
            >
              <XAxis
                type="number"
                dataKey="start"
                label={{ value: 'Start (s)', position: 'insideBottomRight' }}
              />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip
                content={({ payload }) =>
                  payload && payload.length ? (
                    <div className="p-2 text-xs">
                      <div>
                        <b>Service:</b> {payload[0].payload.service}
                      </div>
                      <div>
                        <b>Duration:</b> {payload[0].payload.duration}s
                      </div>
                      <div>
                        <b>Error:</b> {payload[0].payload.error ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="duration" fill="#8884d8">
                <LabelList dataKey="service" position="right" />
                {getWaterfallData(selectedTrace).map((span, idx) => (
                  <Cell key={span.spanId} fill={span.error ? '#e57373' : '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground">Select a trace to view waterfall</div>
        )}
        {/* Interactive span details */}
        {expandedSpanId && (
          <div className="mt-4 p-2 bg-background rounded border">
            <div className="font-bold">Span Metadata</div>
            <pre className="text-xs max-h-40 overflow-auto">
              {JSON.stringify(
                getWaterfallData(selectedTrace).find((s) => s.spanId === expandedSpanId)?.meta,
                null,
                2
              )}
            </pre>
            <button
              className="mt-2 px-2 py-1 rounded bg-primary text-primary-foreground"
              onClick={() => setExpandedSpanId(null)}
            >
              Close
            </button>
          </div>
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
      {/* Export/Share trace view */}
      <div className="flex gap-2 mt-2">
        <button
          className="bg-secondary text-secondary-foreground rounded px-4 py-2"
          disabled={!selectedTrace}
          onClick={() => {
            if (!selectedTrace) return;
            const dataStr =
              'data:text/json;charset=utf-8,' +
              encodeURIComponent(JSON.stringify(selectedTrace, null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute('href', dataStr);
            dlAnchor.setAttribute(
              'download',
              `trace-${selectedTrace.traceId || selectedTrace.traceID}.json`
            );
            dlAnchor.click();
          }}
        >
          Export JSON
        </button>
        <button
          className="bg-secondary text-secondary-foreground rounded px-4 py-2"
          disabled={!selectedTrace}
          onClick={() => {
            if (!selectedTrace) return;
            navigator.clipboard.writeText(
              window.location.href + `?traceId=${selectedTrace.traceId || selectedTrace.traceID}`
            );
            alert('Shareable link copied!');
          }}
        >
          Share Link
        </button>
      </div>
    </div>
  );
}
