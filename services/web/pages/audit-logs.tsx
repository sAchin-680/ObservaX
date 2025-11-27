// Audit Logs UI
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/users/audit-logs')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (v: string) => new Date(v).toLocaleString(),
    },
    { title: 'Action', dataIndex: 'action', key: 'action' },
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Org', dataIndex: 'org', key: 'org' },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (d: any) => JSON.stringify(d),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '64px auto', padding: 32 }}>
      <h2>Audit Logs</h2>
      <Table
        dataSource={logs.map((l) => ({ ...l, key: l.timestamp + l.action }))}
        columns={columns}
        loading={loading}
        pagination={false}
      />
    </div>
  );
}
