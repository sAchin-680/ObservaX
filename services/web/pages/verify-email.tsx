// Email Verification UI
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      message.success('Email verified');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '64px auto',
        padding: 32,
        background: '#fff',
        borderRadius: 8,
      }}
    >
      <h2>Verify Email</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item name="org" label="Organization" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item name="code" label="Verification Code" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Verify
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
