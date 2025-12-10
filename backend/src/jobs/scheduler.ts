import cron from 'node-cron';
import { generateArticleJob } from './generateArticle.job.js';
import { publishScheduledJob } from './publishScheduled.job.js';
import { aiService } from '../services/ai.service.js';
import logger from '../utils/logger.js';

/**
 * Active cron tasks
 */
const tasks: cron.ScheduledTask[] = [];

/**
 * Wrap job execution with error handling
 */
async function runJob(name: string, job: () => Promise<void>): Promise<void> {
  try {
    await job();
  } catch (error) {
    logger.error({ err: error, job: name }, 'Job failed');
  }
}

/**
 * Start all scheduled jobs
 * 
 * @remarks
 * Call once on app startup after database connection is ready
 */
export async function startScheduler(): Promise<void> {
  await aiService.initialize();
  
  // Daily article at 2 AM UTC
  const dailyTask = cron.schedule('0 2 * * *', () => {
    runJob('generate-article', generateArticleJob);
  });
  tasks.push(dailyTask);
  
  // Check scheduled articles every minute
  const publishTask = cron.schedule('* * * * *', () => {
    runJob('publish-scheduled', publishScheduledJob);
  });
  tasks.push(publishTask);
  
  logger.info('Scheduler started');
}

/**
 * Stop all scheduled jobs
 * 
 * @remarks
 * Call during graceful shutdown
 */
export function stopScheduler(): void {
  for (const task of tasks) {
    task.stop();
  }
  
  tasks.length = 0;
  logger.info('Scheduler stopped');
}