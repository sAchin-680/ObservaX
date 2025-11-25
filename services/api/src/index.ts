import 'dotenv/config';
import express from 'express';
import tracesRouter from './routes/traces';
import logsRouter from './routes/logs';
import metricsRouter from './routes/metrics';
import servicesRouter from './routes/services';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

const app = express();
app.use(express.json());

app.use('/traces', tracesRouter);
app.use('/logs', logsRouter);
app.use('/metrics', metricsRouter);
app.use('/services', servicesRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Query API listening on port ${PORT}`);
});
