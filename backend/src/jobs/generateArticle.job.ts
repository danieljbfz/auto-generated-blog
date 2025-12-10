import { articleService } from '../services/article.service.js';
import logger from '../utils/logger.js';

/**
 * Generate and publish one article
 * 
 * @remarks
 * This job runs daily to create new content automatically.
 * Uses AI to generate article, then publishes it immediately.
 */
export async function generateArticleJob(): Promise<void> {
  logger.info('Article generation job started');
  
  const article = await articleService.generateAndPublishArticle();
  
  logger.info({
    articleId: article.id,
    title: article.title,
    slug: article.slug,
  }, 'Article generated successfully');
}