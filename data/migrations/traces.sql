CREATE TABLE IF NOT EXISTS traces (
    trace_id String,
    span_id String,
    parent_span_id String,
    service_name String,
    operation_name String,
    start_time DateTime,
    duration_ms UInt32,
    attributes_key Array(String),
    attributes_value Array(String)
) ENGINE = MergeTree()
ORDER BY (trace_id, span_id);
