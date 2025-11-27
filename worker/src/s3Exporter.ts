// s3Exporter.ts
// Worker: Daily export of logs/traces to S3 as Parquet files
import AWS from 'aws-sdk';
import { ClickHouse } from 'clickhouse';
import parquet from 'parquetjs-lite';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const clickhouse = new ClickHouse({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  basicAuth: {
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
  },
  isUseQueryString: true,
});

async function queryClickHouse(date: string) {
  const sql = `SELECT * FROM traces WHERE toDate(timestamp) = toDate('${date}')`;
  return await clickhouse.query(sql).toPromise();
}

async function toParquet(data: any[]) {
  // Define Parquet schema (example for traces)
  const schema = new parquet.ParquetSchema({
    trace_id: { type: 'UTF8' },
    service_name: { type: 'UTF8' },
    operation_name: { type: 'UTF8' },
    timestamp: { type: 'TIMESTAMP_MILLIS' },
    duration: { type: 'INT64' },
    error: { type: 'BOOLEAN', optional: true },
    // Add more fields as needed
  });
  const writer = await parquet.ParquetWriter.openFile(schema, '/tmp/export.parquet');
  for (const row of data) {
    await writer.appendRow(row);
  }
  await writer.close();
  const fs = require('fs');
  return fs.readFileSync('/tmp/export.parquet');
}

export async function exportToS3Parquet(date: string) {
  const data = await queryClickHouse(date);
  const parquetBuffer = await toParquet(data);
  await s3
    .upload({ Bucket: 'observax-archive', Key: `traces-${date}.parquet`, Body: parquetBuffer })
    .promise();
}

export async function exportToGlacier(date: string) {
  // TODO: Move S3 object to Glacier storage class
  await s3
    .copyObject({
      Bucket: 'observax-archive',
      CopySource: `observax-archive/traces-${date}.parquet`,
      Key: `traces-${date}.parquet`,
      StorageClass: 'GLACIER',
    })
    .promise();
}

export async function dailyExportWorker() {
  // Run every 24h
  setInterval(async () => {
    const date = new Date().toISOString().slice(0, 10);
    await exportToS3Parquet(date);
  }, 24 * 60 * 60 * 1000);
}
