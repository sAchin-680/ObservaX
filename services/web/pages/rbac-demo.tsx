// RBAC UI Demo
import React from 'react';
import { Card, Tag } from 'antd';

const roles = [
  { label: 'Admin', value: 'admin', color: 'red' },
  { label: 'User', value: 'user', color: 'blue' },
  { label: 'Readonly', value: 'readonly', color: 'gray' },
];

export default function RBACDemoPage() {
  return (
    <div style={{ maxWidth: 600, margin: '64px auto', padding: 32 }}>
      <h2>RBAC Role Demo</h2>
      <Card>
        <p>Role-based access control is enforced via JWT and middleware.</p>
        <ul>
          {roles.map(r => (
            <li key={r.value}>
              <Tag color={r.color}>{r.label}</Tag> — {r.value}
            </li>
          ))}
        </ul>
        <p>Try logging in as different roles to see access restrictions in the UI and API.</p>
      </Card>
    </div>
  );
}
