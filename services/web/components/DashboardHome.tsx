import React from 'react';
// Placeholder for cards, charts, live counters
export default function DashboardHome() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cards */}
      <div className="bg-card rounded shadow p-4 flex flex-col gap-2">
        <div className="font-bold text-lg">Services</div>
        <div className="text-2xl">12</div>
      </div>
      <div className="bg-card rounded shadow p-4 flex flex-col gap-2">
        <div className="font-bold text-lg">Traces</div>
        <div className="text-2xl">1,234</div>
      </div>
      <div className="bg-card rounded shadow p-4 flex flex-col gap-2">
        <div className="font-bold text-lg">Logs</div>
        <div className="text-2xl">56,789</div>
      </div>
      <div className="bg-card rounded shadow p-4 flex flex-col gap-2">
        <div className="font-bold text-lg">Metrics</div>
        <div className="text-2xl">8,765</div>
      </div>
      {/* Charts */}
      <div className="col-span-1 md:col-span-2">
        <div className="font-bold mb-2">CPU Usage</div>
        {/* ChartContainer can be reused here */}
      </div>
      {/* Live counters */}
      <div className="col-span-1 md:col-span-2 flex gap-4">
        <div className="bg-primary text-primary-foreground rounded p-4 flex-1 text-center">
          Live Requests: 42/sec
        </div>
        <div className="bg-secondary text-secondary-foreground rounded p-4 flex-1 text-center">
          Live Errors: 3/sec
        </div>
      </div>
    </div>
  );
}
