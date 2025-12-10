import { Request, Response } from 'express';
import { articleService } from '../services/article.service.js';
import { CreateArticleDTO, ArticleQueryOptions } from '../types/article.js';
import { generateSlug } from '../utils/validation.js';
import { getValidatedBody, getValidatedQuery, getValidatedParams } from '../utils/request.js';
import logger from '../utils/logger.js';

/**
 * Article Controller
 * 
 * Handles HTTP requests related to articles.
 * 
 * This controller manages the flow of data by:
 * - Extracting and validating request data (handled by middleware).
 * - Calling the appropriate service methods.
 * - Formatting responses consistently.
 * - Handling HTTP-specific concerns (e.g., status codes, headers).
 * 
 * Business logic lives in the service layer, not here.
 */
export class ArticleController {
  
  /**
   * Create Article
   * 
   * POST /api/articles
   * 
   * @param req.body - Article creation data (validated by middleware)
   * @returns 201 Created with article data
   */
  async create(req: Request, res: Response): Promise<void> {
    const data = getValidatedBody<CreateArticleDTO>(req);
    
    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.title);
    }
    
    const article = await articleService.createArticle(data);
    
    res.status(201).json({
      success: true,
      data: article,
    });
  }
  
  /**
   * Get All Articles (with filters)
   * 
   * GET /api/articles?status=published&page=1&limit=10
   * 
   * @param req.query - Filter and pagination options (validated by middleware)
   * @returns 200 OK with paginated articles
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const options = getValidatedQuery<ArticleQueryOptions>(req);
    
    const result = await articleService.findArticles(options);
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
  
  /**
   * Get Published Feed
   * 
   * GET /api/articles/feed?page=1&limit=10
   * 
   * @returns 200 OK with paginated published articles
   */
  async getFeed(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await articleService.getPublishedFeed(
      Number(page),
      Number(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
  
  /**
   * Get Article by ID
   * 
   * GET /api/articles/:id
   * 
   * @param req.params.id - Article UUID (validated by middleware)
   * @returns 200 OK with article data
   * @throws 404 Not Found if article doesn't exist
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    const article = await articleService.getArticleById(id);
    
    res.status(200).json({
      success: true,
      data: article,
    });
  }
  
  /**
   * Get Article by Slug
   * 
   * GET /api/articles/by-slug/:slug
   * 
   * @param req.params.slug - Article slug (validated by middleware)
   * @returns 200 OK with article data
   * @throws 404 Not Found if article doesn't exist
   * 
   * @remarks
   * This endpoint also increments the view counter automatically.
   */
  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = getValidatedParams<{ slug: string }>(req);
    
    const article = await articleService.getArticleBySlug(slug);
    
    res.status(200).json({
      success: true,
      data: article,
    });
  }
  
  /**
   * Update Article
   * 
   * PATCH /api/articles/:id
   * 
   * @param req.params.id - Article UUID
   * @param req.body - Update data (validated by middleware)
   * @returns 200 OK with updated article
   * @throws 404 Not Found if article doesn't exist
   * @throws 409 Conflict if new slug already exists
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    const data = getValidatedBody<Partial<CreateArticleDTO>>(req);
    
    const article = await articleService.updateArticle(id, data);
    
    res.status(200).json({
      success: true,
      data: article,
    });
  }
  
  /**
   * Delete Article
   * 
   * DELETE /api/articles/:id
   * 
   * @param req.params.id - Article UUID
   * @returns 204 No Content
   * @throws 404 Not Found if article doesn't exist
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    await articleService.deleteArticle(id);
    
    res.status(204).send();
  }
  
  /**
   * Generate Article (AI)
   * 
   * POST /api/articles/generate
   * 
   * @returns 201 Created with generated article
   * @throws 500 Internal Server Error if generation fails
   * 
   * @remarks
   * We should rate limit this endpoint in production to prevent abuse.
   */
  async generate(_req: Request, res: Response): Promise<void> {
    logger.info('Manual article generation triggered');
    
    const article = await articleService.generateAndPublishArticle();
    
    res.status(201).json({
      success: true,
      data: article,
      message: 'Article generated and published successfully',
    });
  }
  
  /**
   * Publish Scheduled Articles
   * 
   * POST /api/articles/publish-scheduled
   * 
   * @returns 200 OK with count of published articles
   */
  async publishScheduled(_req: Request, res: Response): Promise<void> {
    const count = await articleService.publishScheduledArticles();
    
    res.status(200).json({
      success: true,
      data: { count },
      message: `Published ${count} scheduled article(s)`,
    });
  }
}

// Export singleton instance
export const articleController = new ArticleController();