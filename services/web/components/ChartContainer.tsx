import React from 'react';
import { fetchMetrics, fetchTraces } from '../lib/api';
import { Line } from 'react-chartjs-2';
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

export default function ChartContainer({
  metric = 'cpu_usage',
  service,
  children,
}: {
  metric?: string;
  service?: string;
  children?: React.ReactNode;
}) {
  const [metrics, setMetrics] = React.useState<any[]>([]);
  const [traces, setTraces] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchMetrics(metric, undefined, undefined, service ? { service_name: service } : undefined),
      fetchTraces(),
    ])
      .then(([metricsData, tracesData]) => {
        setMetrics(metricsData || []);
        setTraces(tracesData.traces || []);
      })
      .finally(() => setLoading(false));
  }, [metric, service]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!metrics.length) return null;
    return {
      labels: metrics.map((m: any) => m.timestamp),
      datasets: [
        {
          label: metric,
          data: metrics.map((m: any) => m.value),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
        },
      ],
    };
  }, [metrics, metric]);

  return (
    <section className="w-full p-4 bg-card rounded-lg shadow">
      {loading ? (
        <div className="text-muted-foreground">Loading chart data...</div>
      ) : (
        <>
          <div className="mb-4">
            <div className="font-semibold">Metrics ({metric})</div>
            {chartData ? (
              <Line
                data={chartData}
                options={{ responsive: true, plugins: { legend: { display: true } } }}
              />
            ) : (
              <div className="text-muted-foreground">No metric data</div>
            )}
          </div>
          <div>
            <div className="font-semibold">Traces</div>
            <pre className="text-xs bg-background p-2 rounded max-h-40 overflow-auto">
              {JSON.stringify(traces, null, 2)}
            </pre>
          </div>
        </>
      )}
      {children}
    </section>
  );
}
