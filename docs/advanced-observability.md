# ObservaX — Advanced Observability Features

## Overview

This document describes the architecture, flows, and implementation details for elite observability features in ObservaX, designed to rival Datadog, Grafana, New Relic, and Honeycomb.

---

## 1. Live Tail Logs (WebSocket Streaming)

**Purpose:** Real-time log streaming (like `kubectl logs -f` or Datadog Live Tail)

**Architecture:**

- Producer → Kafka (`logs.raw`) → Worker → ClickHouse
- WebSocket Stream Server (Express.js WS)

**Implementation:**

- Express.js WebSocket server: `ws://api.observax.dev/logs/live`
- Filters: service, log level, text search, time range (initial fetch)
- Worker duplicates logs to ClickHouse and WebSocket
- Next.js UI: Live Tail viewer (auto-scroll, pause, highlighting, search)

**Verification:**

- Multi-service tail, low-latency (<150ms), Kafka→WS pipeline at 30k msg/sec

---

## 2. Alerts (Rule-Based + Threshold)

**Purpose:** Production-grade alerting engine

**Architecture:**

- ClickHouse (metrics/logs)
- Redis (alert state/rate-limiting)
- Worker (Alert Engine)
- Notifier (Slack, Teams, Webhook, Email)

**Implementation:**

- Alert schema (MongoDB)
- Alert engine worker (15s interval)
- Notification worker (multi-channel)
- Express.js API routes

**Verification:**

- Create, trigger, resolve, debounce, multi-channel notifications

---

## 3. Metric Visualizer (PromQL-like UI)

**Purpose:** PromQL-like metrics visualization

**Architecture:**

- AST Parser → Query Engine → ClickHouse → Time Series API → UI Chart

**Implementation:**

- PromQL-lite parser, operators, filters, range selectors
- PromQL→ClickHouse SQL translator
- Express.js API (`/metrics/query`)
- Next.js UI: Monaco Editor, charts, time filters

**Verification:**

- Complex queries, multi-series, fast response (<150ms)

---

## 4. Sampling Controls (Dynamic Sampling Manager)

**Purpose:** Prevent cost explosion by controlling trace volumes

**Architecture:**

- MongoDB (sampling rules)
- Sampling Control API → OTel Collector reload
- ClickHouse analytics → Suggest sampling changes

**Implementation:**

- Sampling rules config, API endpoints, collector config auto-generation/reload
- Next.js UI: per-service rules, slider, suggestions

**Verification:**

- Stable ingestion, hot-reload, analytics-driven suggestions

---

## 5. Service Health Score (SRE-style)

**Purpose:** Automatic scoring system (Datadog APM Health score)

**Architecture:**

- Worker computes scores every 15s
- Stores in MongoDB
- UI: indicator badges, heatmap

**Implementation:**

- Health score formula: `score = 100 - (latency_p95 > threshold ? 20 : 0) - (error_rate > 1% ? 40 : 0) - (downtime_seconds > 60 ? 30 : 0)`
- Color-coded UI: Green, Yellow, Orange, Red

**Verification:**

- Live updates, degradation reflected within 30s

---

## 6. Retention Policies (Hot/Warm Tiering)

**Purpose:** Control storage costs

**Architecture:**

- ClickHouse TTL Move → S3
- Worker → Glacier transition
- Express API → restore historical data

**Implementation:**

- ClickHouse TTL rules
- S3 exporter: Parquet files, daily export, Glacier transition
- Restore API (`/retention/restore`)
- Next.js UI: retention controls, restore, download, notifications

**Verification:**

- End-to-end tiering, restore, download

---

## Final Deliverables

- Complete backend implementations (workers, exporters, analytics)
- Complete Express.js API routes
- Complete Next.js UI pages for all features

---

## Getting Started

1. **Backend:**
   - Start API server: `npm run dev --prefix services/api`
   - Start worker: `npm run dev --prefix services/worker`
2. **Frontend:**
   - Start Next.js UI: `npm run dev --prefix services/web`
3. **Kafka, ClickHouse, MongoDB, Redis:**
   - Use provided Docker Compose in `infra/`
4. **Retention:**
   - Apply ClickHouse TTL migration: `infra/clickhouse/retention.sql`
   - Configure AWS credentials for S3/Glacier

---

## API Endpoints

- `/logs/live` (WebSocket)
- `/alerts/*`
- `/metrics/query`
- `/sampling/*`
- `/services/health`
- `/retention/*`

## UI Pages

- Live Tail Logs
- Alerts builder
- Metrics explorer
- Sampling dashboard
- Service health map
- Retention controls

---

## Monitoring & Automation

- All workers and exporters run on schedule (15s, 24h)
- Notifications and restore UI provide feedback and progress

---

## Support & Extensibility

- Easily add new alert channels, metrics, retention tiers
- Modular architecture for future features

---

For more details, see code comments and individual feature docs.
