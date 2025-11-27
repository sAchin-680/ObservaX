import 'dotenv/config';
import express from 'express';
import http from 'http';
import tracesRouter from './routes/traces';
import logsRouter from './routes/logs';
import metricsRouter from './routes/metrics';
import servicesRouter from './routes/services';
import samplingRouter from './routes/sampling';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { setupLogsLiveWebSocket } from './ws/logsLive';
import logsStreamRouter from './routes/logsStream';
import serviceHealthRouter from './routes/service-health';

const app = express();
app.use(express.json());

app.use('/traces', tracesRouter);
app.use('/logs', logsRouter);
app.use('/logs', logsStreamRouter);
app.use('/metrics', metricsRouter);
app.use('/services', servicesRouter);
app.use('/sampling', samplingRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/service-health', serviceHealthRouter);

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
// Setup WebSocket for live logs
setupLogsLiveWebSocket(server);
server.listen(PORT, () => {
  console.log(`Query API + WS listening on port ${PORT}`);
});
