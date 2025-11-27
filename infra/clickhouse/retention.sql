-- ClickHouse TTL for hot/warm tiering
ALTER TABLE traces
MODIFY COLUMN timestamp DateTime TTL timestamp + INTERVAL 30 DAY TO VOLUME 'warm';
-- You can run this in your ClickHouse migration/init scripts.
