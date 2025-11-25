import React from 'react';
import { fetchServices } from '../lib/api';

export default function ServiceSelector({ onSelect }: { onSelect?: (service: string) => void }) {
  const [services, setServices] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState('');

  React.useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  React.useEffect(() => {
    if (selected && onSelect) onSelect(selected);
  }, [selected, onSelect]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="service-select" className="text-sm font-medium">
        Service:
      </label>
      <select
        id="service-select"
        className="border rounded px-2 py-1 bg-background text-foreground"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="" disabled>
          Select a service
        </option>
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>
    </div>
  );
}
