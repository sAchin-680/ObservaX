CREATE TABLE IF NOT EXISTS logs (
    log_id String,
    timestamp DateTime,
    service_name String,
    level String,
    message String,
    trace_id String,
    span_id String,
    attributes_key Array(String),
    attributes_value Array(String)
) ENGINE = MergeTree()
ORDER BY (log_id, timestamp);
