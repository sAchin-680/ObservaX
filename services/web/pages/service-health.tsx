// Service Health UI
import React, { useEffect, useState } from 'react';
import { Table, Badge, Spin } from 'antd';
import { Heatmap } from 'react-heatmap-grid';

interface ServiceHealth {
  service: string;
  score: number;
  latency_p95: number;
  error_rate: number;
  downtime_seconds: number;
  updatedAt: string;
}

function getHealthColor(score: number): 'success' | 'warning' | 'orange' | 'error' {
  if (score >= 90) return 'success';
  if (score >= 70) return 'warning';
  if (score >= 40) return 'orange';
  return 'error';
}

function getHealthLabel(score: number): string {
  if (score >= 90) return 'Green';
  if (score >= 70) return 'Yellow';
  if (score >= 40) return 'Orange';
  return 'Red';
}

function buildHeatmapData(health: ServiceHealth[]) {
  // Example: columns are time buckets, rows are services, values are scores
  // For demo, use last 10 updates (simulate with repeated scores)
  const services = health.map((h) => h.service);
  const times = Array.from({ length: 10 }, (_, i) => `T-${10 - i}`);
  const data = services.map((s) => {
    const h = health.find((hh) => hh.service === s);
    return Array(10).fill(h ? h.score : 0);
  });
  return { xLabels: times, yLabels: services, data };
}

export default function ServiceHealthPage() {
  const [health, setHealth] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function fetchHealth() {
      setLoading(true);
      try {
        const res = await fetch('/api/service-health');
        const data = await res.json();
        setHealth(data.health || []);
      } catch {
        setHealth([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
    timer = setInterval(fetchHealth, 15000);
    return () => clearInterval(timer);
  }, []);

  const columns = [
    { title: 'Service', dataIndex: 'service', key: 'service' },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Badge color={getHealthColor(score)} text={`${score} (${getHealthLabel(score)})`} />
      ),
    },
    {
      title: 'Latency p95 (ms)',
      dataIndex: 'latency_p95',
      key: 'latency_p95',
      render: (v: number) => Math.round(v),
    },
    {
      title: 'Error Rate',
      dataIndex: 'error_rate',
      key: 'error_rate',
      render: (v: number) => `${(v * 100).toFixed(2)}%`,
    },
    { title: 'Downtime (s)', dataIndex: 'downtime_seconds', key: 'downtime_seconds' },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (v: string) => new Date(v).toLocaleTimeString(),
    },
  ];

  const heatmap = buildHeatmapData(health);

  return (
    <div style={{ padding: 32 }}>
      <h2>Service Health</h2>
      <p>Live health scores for all services. Color badges reflect SRE-style health status.</p>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Table
            dataSource={health.map((h) => ({ ...h, key: h.service }))}
            columns={columns}
            pagination={false}
          />
          <div style={{ marginTop: 32 }}>
            <h3>Health Score Heatmap (last 10 intervals)</h3>
            <Heatmap
              xLabels={heatmap.xLabels}
              yLabels={heatmap.yLabels}
              data={heatmap.data}
              cellStyle={(background, value, min, max, row, col) => ({
                background:
                  value >= 90
                    ? '#52c41a'
                    : value >= 70
                    ? '#faad14'
                    : value >= 40
                    ? '#fa8c16'
                    : '#f5222d',
                color: '#fff',
                fontWeight: 'bold',
              })}
              cellRender={(value) => value}
              height={30}
            />
          </div>
        </>
      )}
    </div>
  );
}
