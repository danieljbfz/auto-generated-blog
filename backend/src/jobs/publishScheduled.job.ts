import { articleService } from '../services/article.service.js';
import logger from '../utils/logger.js';

/**
 * Publish articles that are scheduled for now or earlier
 * 
 * @remarks
 * Runs every minute to check for articles ready to go live.
 * Database trigger handles setting published_at timestamp.
 */
export async function publishScheduledJob(): Promise<void> {
  const count = await articleService.publishScheduledArticles();
  
  if (count > 0) {
    logger.info({ count }, 'Published scheduled articles');
  }
}