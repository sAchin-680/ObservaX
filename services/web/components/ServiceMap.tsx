import React from 'react';

// Example static data, replace with API call for real data
const nodes = [
  { id: 'api', label: 'API', x: 100, y: 100 },
  { id: 'web', label: 'Web', x: 300, y: 100 },
  { id: 'collector', label: 'Collector', x: 200, y: 250 },
];
const edges = [
  { source: 'api', target: 'web', thickness: 4 },
  { source: 'collector', target: 'api', thickness: 2 },
];

export default function ServiceMap() {
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);

  return (
    <div className="p-6">
      <div className="font-bold mb-2">Service Map</div>
      <div className="bg-card rounded shadow p-4 relative h-96">
        {/* Simple SVG graph, replace with React Flow for advanced features */}
        <svg width="100%" height="100%" viewBox="0 0 400 400">
          {edges.map((edge, idx) => (
            <line
              key={idx}
              x1={nodes.find((n) => n.id === edge.source)?.x}
              y1={nodes.find((n) => n.id === edge.source)?.y}
              x2={nodes.find((n) => n.id === edge.target)?.x}
              y2={nodes.find((n) => n.id === edge.target)?.y}
              stroke="#6366f1"
              strokeWidth={edge.thickness}
            />
          ))}
          {nodes.map((node) => (
            <g key={node.id} onClick={() => setSelectedNode(node.id)} style={{ cursor: 'pointer' }}>
              <circle
                cx={node.x}
                cy={node.y}
                r={28}
                fill={selectedNode === node.id ? '#6366f1' : '#e0e7ff'}
                stroke="#6366f1"
                strokeWidth={2}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="16"
                fill={selectedNode === node.id ? '#fff' : '#6366f1'}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-background border rounded p-2 shadow text-xs">
            <div className="font-bold mb-1">Service Details</div>
            <div>ID: {selectedNode}</div>
            {/* Add more details from API here */}
            <button
              className="mt-2 px-2 py-1 bg-primary text-primary-foreground rounded"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
