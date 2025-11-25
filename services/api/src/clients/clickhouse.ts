import { ClickHouse } from 'clickhouse';

const clickhouse = new ClickHouse({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  basicAuth: {
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
  },
  isUseQueryString: true,
});

export default clickhouse;
