import React from 'react';
import { searchLogs } from '../lib/api';

export default function SearchBar({
  placeholder = 'Search logs...',
  onSearch,
}: {
  placeholder?: string;
  onSearch?: (value: string) => void;
}) {
  const [value, setValue] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const data = await searchLogs(query);
      setResults(data.logs || []);
      onSearch?.(query);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full max-w-md gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full bg-background text-foreground"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(value);
          }}
        />
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => handleSearch(value)}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="bg-card p-2 rounded shadow text-xs max-h-40 overflow-auto">
          <ul>
            {results.map((log, idx) => (
              <li key={idx}>{log.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
