// Retention Restore UI
import React, { useState } from 'react';
import { DatePicker, Button, Table, Spin, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function RetentionRestorePage() {
  const [from, setFrom] = useState<dayjs.Dayjs | null>(null);
  const [to, setTo] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  const handleRestore = async () => {
    if (!from || !to) {
      message.error('Select both dates');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/retention/restore?from=${from.format('YYYY-MM-DD')}&to=${to.format('YYYY-MM-DD')}`
      );
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      message.error('Restore failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/retention/download?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success(`Downloaded ${key}`);
    } catch {
      message.error('Download failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'File', dataIndex: 'key', key: 'key' },
    {
      title: 'Found',
      dataIndex: 'found',
      key: 'found',
      render: (v: boolean) => (v ? 'Yes' : 'No'),
    },
    { title: 'Size (bytes)', dataIndex: 'size', key: 'size' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) =>
        record.found ? (
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.key)}
            disabled={loading}
          >
            Download
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h2>Retention Restore</h2>
      <p>Restore historical logs/traces from S3 archive.</p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <DatePicker value={from} onChange={setFrom} placeholder="From" />
        <DatePicker value={to} onChange={setTo} placeholder="To" />
        <Button type="primary" onClick={handleRestore} disabled={loading}>
          Restore
        </Button>
      </div>
      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={files.map((f) => ({ ...f, key: f.key }))}
          columns={columns}
          pagination={false}
        />
      )}
    </div>
  );
}
