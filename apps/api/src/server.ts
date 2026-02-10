import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initRedis } from './lib/redis.js';

const app = express();

// Security headers with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors({
  origin: config.webUrl,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request timeout (30s)
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000);
  res.setTimeout(30000, () => {
    res.status(408).json({
      success: false,
      error: { code: 'REQUEST_TIMEOUT', message: 'Request timed out' },
    });
  });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Onyx Report API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/v1/docs',
  });
});

// API routes
app.use('/api/v1', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

(async () => {
  await initRedis();
  app.listen(PORT, () => {
    logger.info(`🚀 API server running on http://localhost:${PORT}`);
    logger.info(`📝 Environment: ${config.nodeEnv}`);
    logger.info(`🔗 Web URL: ${config.webUrl}`);
  });
})();

export default app;
