import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import logger from '../utils/logger.js';
import { env } from './env.js';

/**
 * PostgreSQL connection pool
 * 
 * Prisma 7 uses a driver adapter pattern.
 * We create the pg pool and pass it to Prisma.
 */
const pool = new Pool({
  connectionString: `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
  max: env.DB_MAX_CONNECTIONS,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

/**
 * Prisma adapter for PostgreSQL
 */
const adapter = new PrismaPg(pool);

/**
 * Prisma client instance
 * 
 * Singleton pattern (only one instance for the whole app)
 */
export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' 
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ]
    : [{ emit: 'event', level: 'error' }],
});

/**
 * Log queries in development
 */
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug({
      query: e.query,
      duration: e.duration,
      params: e.params,
    }, 'Prisma query');
  });
}

prisma.$on('error', (e) => {
  logger.error({ err: e }, 'Prisma error');
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<void> {
  await prisma.$queryRaw`SELECT NOW() as now, current_database() as db`;
  logger.info('Database connected via Prisma');
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
  logger.info('Prisma disconnected');
}

export default prisma;