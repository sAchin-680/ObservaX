// Organization Management UI
import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, message } from 'antd';

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/users/orgs');
      const data = await res.json();
      setOrgs(data.orgs || []);
    } catch {
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/users/orgs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      message.success('Organization created');
      fetchOrgs();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'ID', dataIndex: 'id', key: 'id' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '64px auto', padding: 32 }}>
      <h2>Organizations</h2>
      <Form layout="inline" onFinish={onFinish} style={{ marginBottom: 24 }}>
        <Form.Item name="name" label="Org Name" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Org
          </Button>
        </Form.Item>
      </Form>
      <Table
        dataSource={orgs.map((o) => ({ ...o, key: o.id }))}
        columns={columns}
        loading={loading}
        pagination={false}
      />
    </div>
  );
}
