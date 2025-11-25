# ObservaX — Distributed Observability Platform

<p align="center">
  <img src="https://img.shields.io/badge/status-building-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/OpenTelemetry-Compatible-purple?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Kafka-Streaming-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/ClickHouse-Analytics-orange?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Express.js-API-black?style=for-the-badge"/>
</p>

---

## Overview

**ObservaX** is a modern, open-source observability platform for distributed, cloud-native applications. Inspired by Datadog, it provides unified monitoring for logs, metrics, and traces, with powerful dashboards and alerting. Built for scale using OpenTelemetry, Kafka, ClickHouse, and Express.js.

---

## Key Capabilities

- Distributed tracing (Jaeger integration & ObservaX UI)
- Centralized log ingestion and filtering
- Real-time metrics dashboards
- Service dependency mapping (OpenTelemetry)
- Alerting (coming soon)

---

## Feature Progress

ObservaX is actively developed. Here’s the current status of major features:

| Feature                       | Status      | Description                                       |
| ----------------------------- | ----------- | ------------------------------------------------- |
| OTLP telemetry ingestion      | **Done**    | Collects logs, metrics, and traces via OTLP.      |
| Kafka buffering & streaming   | **Done**    | Reliable event streaming and buffering.           |
| Worker processing pipeline    | In Progress | Distributed processing of telemetry data.         |
| ClickHouse storage            | In Progress | High-performance storage for logs/traces/metrics. |
| Express.js Query API          | In Progress | Unified API for querying observability data.      |
| Next.js dashboard (UI)        | Planned     | Modern dashboard for visualization and analysis.  |
| Jaeger trace visualization    | Planned     | Deep trace analysis and visualization.            |
| Metrics explorer & dashboards | Planned     | Custom metrics dashboards and explorers.          |
| Service topology graph        | Planned     | Visualize service dependencies and topology.      |
| Alerts (threshold/anomaly)    | Planned     | Alerting on thresholds and anomalies.             |

---

## Architecture

```text
Apps Instrumented via OpenTelemetry SDK
                    │
                    ▼
         OpenTelemetry Collector
                    │
            OTLP → Kafka Topic
                    │
                    ▼
        ObservaX Worker (Node.js + TS)
                    │
                    ▼
      ┌──────────────┬──────────────┐
      │              │              │
 ClickHouse      MongoDB         Redis
(analytics DB) (metadata)   (cache/rate limit)
                    ▼
        ObservaX Express.js API Layer
                    ▼
        Next.js Dashboard (UI + Graphs)
 ┌─────────────────────────────────────────┐
 │ Jaeger • Prometheus • Grafana          │
 │   (Debugging, Metrics, Visualization)  │
 └─────────────────────────────────────────┘
```

---

## Tech Stack

| Type          | Tools                                             |
| ------------- | ------------------------------------------------- |
| Language      | Node.js, TypeScript                               |
| Frontend      | Next.js, Tailwind, shadcn                         |
| Backend       | Express.js                                        |
| Messaging     | Kafka                                             |
| Storage       | ClickHouse (telemetry), MongoDB (metadata), Redis |
| Observability | OpenTelemetry SDK & Collector, Jaeger             |
| Metrics       | Prometheus, Grafana                               |
| Deployment    | Docker, Kubernetes, Helm, Pulumi                  |

---

## Quickstart (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- pnpm (recommended)

### 1. Start Infrastructure

```bash
cd infra
docker-compose up -d
```

### 2. Start Worker

```bash
cd services/workers
pnpm install
pnpm dev
```

### 3. Start API

```bash
cd services/api
pnpm install
pnpm dev
```

### 4. Start Web Dashboard

```bash
cd services/web
pnpm install
pnpm dev
```

---

## Send Sample Telemetry

From `examples/node-service`:

```bash
node send-test.js
```

If successful, traces will appear in:

- Worker logs
- ClickHouse
- Jaeger UI (http://localhost:16686)

---

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for planned features and milestones.

---

## Contributing

We welcome all contributions!

```bash
git clone https://github.com/sAchin-680/observax.git
git checkout -b feature-name
```

Please follow the PR template and commit style conventions.

---

## License

MIT License — free for personal and commercial use.
