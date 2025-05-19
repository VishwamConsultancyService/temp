import express, { Request, Response, NextFunction } from 'express';
import { correlationIdMiddleware } from './middleware/correlationId.middleware';
import logger from './logger';

const app = express();

app.use(express.json());
app.use(correlationIdMiddleware);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  const correlationId = res.locals.correlationId;
  res.status(200).json({ status: 'UP', correlationId });
});

// Your other routes here
// app.use('/some-route', someRouter);

// Catch-all 404 handler
app.use((req: Request, res: Response) => {
  const correlationId = res.locals.correlationId;
  logger.warn({
    code: 'NOT_FOUND',
    reason: 'Route not found',
    message: `No route matched for ${req.method} ${req.originalUrl}`,
    correlationId,
  });

  res.status(404).json({
    code: 'NOT_FOUND',
    reason: 'Route not found',
    message: `No route matched for ${req.method} ${req.originalUrl}`,
    correlationId,
  });
});

// Optional: error handler middleware for unexpected errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const correlationId = res.locals.correlationId;
  logger.error({
    code: 'INTERNAL_SERVER_ERROR',
    reason: err.name,
    message: err.message,
    correlationId,
  });

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    reason: err.name,
    message: 'An unexpected error occurred',
    correlationId,
  });
});

export default app;
