// Password Reset UI
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      message.success('Password reset successful');
      router.push('/login');
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
      <h2>Reset Password</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item name="org" label="Organization" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
          {' '}
          <Input.Password />{' '}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
