CREATE TABLE IF NOT EXISTS metrics (
    metric_id String,
    timestamp DateTime,
    service_name String,
    metric_name String,
    value Float64,
    labels_key Array(String),
    labels_value Array(String)
) ENGINE = MergeTree()
ORDER BY (metric_id, timestamp);
