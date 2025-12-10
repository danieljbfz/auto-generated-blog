import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Application logger with structured JSON output
 * 
 * @remarks
 * Uses Pino for high-performance logging.
 * In development, output is pretty-printed.
 * In production, outputs JSON for log aggregators.
 */
const logger = pino({
  level: env.LOG_LEVEL,
  
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
  
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export default logger;