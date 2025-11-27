// Registration UI
import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useRouter } from 'next/router';

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Readonly', value: 'readonly' },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      message.success('Registration successful');
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
      <h2>Register</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          {' '}
          <Input.Password />{' '}
        </Form.Item>
        <Form.Item name="org" label="Organization" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          {' '}
          <Select options={roles} />{' '}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
