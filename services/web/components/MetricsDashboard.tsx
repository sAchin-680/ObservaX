import React from 'react';
import { Line } from 'react-chartjs-2';
import { fetchMetrics } from '../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MetricsDashboard() {
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [cpuData, setCpuData] = React.useState<any[]>([]);
  const [requestRateData, setRequestRateData] = React.useState<any[]>([]);
  const [latencyData, setLatencyData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      const [cpu, reqRate, latency] = await Promise.all([
        fetchMetrics('cpu_usage', start, end),
        fetchMetrics('request_rate', start, end),
        fetchMetrics('latency_percentile', start, end),
      ]);
      setCpuData(cpu || []);
      setRequestRateData(reqRate || []);
      setLatencyData(latency || []);
    } finally {
      setLoading(false);
    }
  };

  // Chart data helpers
  const lineChart = (data: any[], label: string) => ({
    labels: data.map((d) => d.timestamp),
    datasets: [
      {
        label,
        data: data.map((d) => d.value),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
      },
    ],
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Time selection */}
      <div className="flex gap-4">
        <input
          className="border rounded px-2 py-1"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button
          className="bg-primary text-primary-foreground rounded px-4 py-2"
          onClick={handleApply}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Apply'}
        </button>
      </div>
      {/* CPU chart */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">CPU Usage</div>
        {cpuData.length ? (
          <Line data={lineChart(cpuData, 'CPU Usage')} />
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}
      </div>
      {/* Request rate chart */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">Request Rate</div>
        {requestRateData.length ? (
          <Line data={lineChart(requestRateData, 'Request Rate')} />
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}
      </div>
      {/* Latency percentile chart */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">Latency Percentiles</div>
        {latencyData.length ? (
          <Line data={lineChart(latencyData, 'Latency Percentile')} />
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}
      </div>
      {/* Custom dashboards */}
      <div className="bg-card rounded shadow p-4">
        <div className="font-bold mb-2">Custom Dashboards</div>
        {/* Custom dashboard placeholder */}
      </div>
    </div>
  );
}
