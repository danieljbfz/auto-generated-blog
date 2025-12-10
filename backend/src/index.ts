import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { testConnection, closeConnection } from './config/database.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';
import { startScheduler, stopScheduler } from 'jobs/scheduler.js';
import routes from '@routes/index.js';

const app = express();

/**
 * Middleware
 */
app.use(helmet({
  contentSecurityPolicy: false,   // Disable CSP for API (frontend will handle it)
}));
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(compression());

/**
 * Request Logging (Pino HTTP)
 */
app.use(pinoHttp({
  logger,
  autoLogging: true,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    }
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'info';
    }
    return 'info';
  },
}));

/**
 * Body Parsing
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Health check
 */
app.get(['/', '/health'], (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

/**
 * Error handling
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Graceful Shutdown Handler
 */
async function shutdown(server: http.Server, signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received. Starting graceful shutdown...');
  
  // 1. Close HTTP server (prevents new connections)
  await new Promise<void>((resolve) => {
    server.close(() => {
      logger.info('HTTP server closed');
      resolve();
    });
  });
  
  // 2. Stop scheduled jobs
  stopScheduler();
  
  // 3. Close database connection
  await closeConnection();
  
  logger.info('Shutdown complete. Exiting process.');
  process.exit(0);
}

/**
 * Start server
 */
async function start(): Promise<void> {
  // 1. Environment validation happens in env.ts (already validated)
  logger.info({ env: env.NODE_ENV, port: env.PORT }, 'Starting application...');

  // 2. Connect to the database
  await testConnection();

  // 3. Start scheduled jobs
  await startScheduler();

  // 4. Start the HTTP server
  const server: http.Server = app.listen(env.PORT, () => {
    logger.info({
      port: env.PORT,
      env: env.NODE_ENV,
      nodeVersion: process.version,
    }, 'Server started successfully');
      
    logger.info({
      api: `http://localhost:${env.PORT}/api`,
      health: `http://localhost:${env.PORT}/health`,
      docs: `http://localhost:${env.PORT}/api`,
      }, 'Available endpoints');
  });

  // 5. Listen for termination signals
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => shutdown(server, 'SIGINT'));

  // 6. Listen for uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception');
    shutdown(server, 'uncaughtException');
  });

  // 7. Listen for unhandled rejection
  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({
      err: reason,
      promise,
    }, 'Unhandled rejection');
    shutdown(server, 'unhandledRejection');
  });

}

// Start the application
start().catch((error) => {
  logger.fatal({ err: error }, 'Server failed to start');
  process.exit(1);
});