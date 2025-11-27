// promqlToClickhouse.ts
// Converts parsed PromQLQuery to ClickHouse SQL
import { PromQLQuery } from './promqlParser';

export function promqlToClickhouseSQL(parsed: PromQLQuery): string {
  const { operator, metric, range, filters } = parsed;
  let where = `name = '${metric}'`;
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      where += ` AND ${key} = '${value.replace(/'/g, '\'\'')}'`;
    }
  }
  let timeWindow = '';
  if (range) {
    // Convert [5m] to seconds
    const unit = range.slice(-1);
    const value = parseInt(range.slice(0, -1));
    let seconds = value;
    if (unit === 'm') seconds *= 60;
    else if (unit === 'h') seconds *= 3600;
    else if (unit === 'd') seconds *= 86400;
    timeWindow = ` AND timestamp > now() - ${seconds}`;
  }
  let select = '*';
  if (operator === 'rate' || operator === 'irate') {
    select = `count()/${range ? parseInt(range) * 60 : 60}`;
  } else if (operator === 'sum') {
    select = 'sum(value)';
  } else if (operator === 'avg') {
    select = 'avg(value)';
  }
  return `SELECT ${select} FROM metrics WHERE ${where}${timeWindow} ORDER BY timestamp DESC LIMIT 100`;
}
