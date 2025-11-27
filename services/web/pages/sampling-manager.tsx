// Sampling Manager UI
import React, { useEffect, useState } from 'react';
import { Slider, Button, Table, Spin, message } from 'antd';

interface SamplingRule {
  service: string;
  rule: string;
  rate: number;
  conditions?: Record<string, any>;
  updatedAt?: string;
}

interface AnalyticsSuggestion {
  service: string;
  traceVolume: number;
  errorRate: number;
  avgLatency: number;
  suggestedRate: number;
}

export default function SamplingManager() {
  const [rules, setRules] = useState<SamplingRule[]>([]);
  const [suggestions, setSuggestions] = useState<AnalyticsSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const rulesRes = await fetch('/api/sampling/rules');
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules || []);
        const analyticsRes = await fetch('/api/sampling/analytics');
        const analyticsData = await analyticsRes.json();
        setSuggestions(analyticsData.suggestions || []);
      } catch (err) {
        message.error('Failed to load sampling data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleRateChange = async (service: string, rate: number) => {
    setUpdating(true);
    try {
      const rule = rules.find((r) => r.service === service);
      await fetch('/api/sampling/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          rule: rule?.rule || 'tail',
          rate,
          conditions: rule?.conditions || {},
        }),
      });
      message.success('Sampling rate updated');
      setRules(rules.map((r) => (r.service === service ? { ...r, rate } : r)));
    } catch (err) {
      message.error('Failed to update sampling rate');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { title: 'Service', dataIndex: 'service', key: 'service' },
    { title: 'Current Rate', dataIndex: 'rate', key: 'rate', render: (rate: number) => `${rate}` },
    {
      title: 'Suggested Rate',
      dataIndex: 'suggestedRate',
      key: 'suggestedRate',
      render: (_: any, record: any) => {
        const suggestion = suggestions.find((s) => s.service === record.service);
        return suggestion ? suggestion.suggestedRate : '-';
      },
    },
    {
      title: 'Trace Volume',
      dataIndex: 'traceVolume',
      key: 'traceVolume',
      render: (_: any, record: any) => {
        const suggestion = suggestions.find((s) => s.service === record.service);
        return suggestion ? suggestion.traceVolume : '-';
      },
    },
    {
      title: 'Error Rate',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (_: any, record: any) => {
        const suggestion = suggestions.find((s) => s.service === record.service);
        return suggestion ? suggestion.errorRate.toFixed(3) : '-';
      },
    },
    {
      title: 'Avg Latency (ms)',
      dataIndex: 'avgLatency',
      key: 'avgLatency',
      render: (_: any, record: any) => {
        const suggestion = suggestions.find((s) => s.service === record.service);
        return suggestion ? Math.round(suggestion.avgLatency) : '-';
      },
    },
    {
      title: 'Adjust Rate',
      key: 'adjust',
      render: (_: any, record: SamplingRule) => (
        <Slider
          min={0.01}
          max={1}
          step={0.01}
          value={record.rate}
          onChange={(value) => handleRateChange(record.service, Number(value))}
          disabled={updating}
          style={{ width: 120 }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h2>Sampling Manager</h2>
      <p>
        Adjust per-service sampling rates. Suggestions are based on trace volume, error rate, and
        latency.
      </p>
      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={rules.map((r) => ({ ...r, key: r.service }))}
          columns={columns}
          pagination={false}
        />
      )}
    </div>
  );
}
