import { articleModel } from '../models/article.model.js';
import { tagModel } from '../models/tag.model.js';
import { aiService } from './ai.service.js';
import { CreateArticleDTO, Article, ArticleStatus, ArticleQueryOptions, PaginatedArticles } from '../types/article.js';
import { generateSlug } from '../utils/validation.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Article Service
 * 
 * Handles article business logic, including the creation, updates,
 * tag management, and AI-powered article generation.
 */
export class ArticleService {
 
  /**
   * Creates an article and attaches its tags.
   * 
   * @param data - The article creation data.
   * @returns The created article.
   * @throws ConflictError if the slug already exists.
   */
  async createArticle(data: CreateArticleDTO): Promise<Article> {
    // Generate the slug from the title if it is not provided.
    if (!data.slug) {
      data.slug = generateSlug(data.title);
    }
    const slugAvailable = await articleModel.isSlugAvailable(data.slug);
    
    // Throw an error if the slug is already in use.
    if (!slugAvailable) {
      throw new ConflictError('The article slug already exists', { slug: data.slug });
    }
    
    const article = await articleModel.create({
      author: { connect: { id: data.authorId } },
      category: { connect: { id: data.categoryId } },
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      body: data.body,
      status: data.status || ArticleStatus.DRAFT,
      metadata: {},
    });
    
    if (data.tags && data.tags.length > 0) {
      await this.attachTags(article.id, data.tags);
    }
    
    logger.info({ 
      articleId: article.id,
      title: article.title,
      status: article.status,
    }, 'Article created');
    
    return article;
  }
 
  /**
   * Generates and publishes an article using the AI service.
   * 
   * @returns The created and published article.
   */
  async generateAndPublishArticle(): Promise<Article> {
    logger.info('Starting AI article generation');
    
    const dto = await aiService.generateArticle();
    
    // Generate the slug from the title if it is not provided by the AI.
    if (!dto.slug) {
        dto.slug = generateSlug(dto.title);
        logger.debug({ title: dto.title }, 'Generated a missing slug from the title');
    }
    let slug = dto.slug;
    const slugAvailable = await articleModel.isSlugAvailable(slug);
    
    // Generate a unique slug with a timestamp if the original slug is unavailable.
    if (!slugAvailable) {
      const timestamp = Date.now().toString(36);
      slug = `${dto.slug}-${timestamp}`;
      logger.debug({ originalSlug: dto.slug, newSlug: slug }, 'Slug conflict detected, appended a timestamp');
    }
    
    dto.slug = slug;
    
    const article = await this.createArticle(dto);
    
    logger.info({
      articleId: article.id,
      title: article.title,
      slug: article.slug,
    }, 'An AI article was successfully published');
    
    return article;
  }
 
  /**
   * Retrieves an article by its ID, including relations.
   *
   * @param id - The article UUID.
   * @returns The article with relations.
   * @throws NotFoundError if the article does not exist.
   */
  async getArticleById(id: string): Promise<Article> {
    const article = await articleModel.findById(id);
    
    if (!article) {
      throw new NotFoundError('The article was not found', { id });
    }
    
    return article;
  }
 
  /**
   * Retrieves an article by its slug, including relations, and increments the view count.
   * 
   * @param slug - The article slug.
   * @returns The article with relations.
   * @throws NotFoundError if the article does not exist.
   */
  async getArticleBySlug(slug: string): Promise<Article> {
    const article = await articleModel.findBySlug(slug);
    
    if (!article) {
      throw new NotFoundError('The article was not found', { slug });
    }
    
    // Asynchronously attempt to increment the view count.
    articleModel.incrementViews(article.id).catch(err => {
      logger.warn({ err, articleId: article.id }, 'Failed to increment the article view count');
    });
    
    return article;
  }
 
  /**
   * Finds articles based on filters and pagination options.
   * 
   * @param options - The query options for filtering and pagination.
   * @returns A list of paginated articles.
   */
  async findArticles(options: ArticleQueryOptions = {}): Promise<PaginatedArticles> {
    return articleModel.findMany(options);
  }
 
  /**
   * Retrieves a feed of published articles.
   * 
   * @param page - The page number.
   * @param limit - The items per page limit.
   * @returns A list of paginated published articles.
   */
  async getPublishedFeed(page = 1, limit = 10): Promise<PaginatedArticles> {
    return articleModel.getPublishedFeed(page, limit);
  }
 
  /**
   * Updates an existing article.
   * 
   * @param id - The article UUID.
   * @param data - The update data.
   * @returns The updated article.
   * @throws NotFoundError if the article does not exist.
   * @throws ConflictError if the new slug conflicts with another article.
   */
  async updateArticle(id: string, data: Partial<CreateArticleDTO>): Promise<Article> {
    // 1. Extract the tags field and prepare the remaining data for update.
    const { tags, ...updateData } = data;
    
    // 2. Check if the article exists.
    const exists = await articleModel.exists(id);
    if (!exists) {
      throw new NotFoundError('The article was not found', { id });
    }
    
    // 3. Check for a slug conflict only if a new slug is provided in the update data.
    if (updateData.slug) {
      // Fetch the existing article to compare its current slug.
      const existing = await articleModel.findById(id); 
      
      if (!existing) {
        throw new NotFoundError('The article was not found during the slug check', { id });
      }

      // Check for conflict only if the slug value has actually changed.
      if (updateData.slug !== existing.slug) {
        const slugAvailable = await articleModel.isSlugAvailable(updateData.slug, id);
        if (!slugAvailable) {
          throw new ConflictError('The slug already exists', { slug: updateData.slug });
        }
      }
    }
    
    // 4. Perform the update operation.
    const updated = await articleModel.update(id, updateData);
    
    if (!updated) {
      throw new NotFoundError('The article was not found after the update operation', { id });
    }
    
    // 5. Handle the relations update (tags).
    if (tags) {
      await this.replaceTags(id, tags);
    }
    
    logger.info({ articleId: id }, 'The article was successfully updated');
    
    return updated;
  }
 
  /**
   * Deletes an article by its ID.
   * 
   * @param id - The article UUID.
   * @throws NotFoundError if the article does not exist.
   */
  async deleteArticle(id: string): Promise<void> {
    const exists = await articleModel.exists(id);
    if (!exists) {
      throw new NotFoundError('The article was not found', { id });
    }
    
    await articleModel.delete(id);
    
    logger.info({ articleId: id }, 'The article was deleted');
  }
 
  /**
   * Publishes all articles that have met their scheduled publication time.
   * 
   * @returns The number of articles that were published.
   */
  async publishScheduledArticles(): Promise<number> {
    const count = await articleModel.publishScheduledArticles();
    
    if (count > 0) {
      logger.info({ count }, 'Published scheduled articles');
    }
    
    return count;
  }
 
  /**
   * Attaches tags to an article, creating the tags if they do not exist.
   * 
   * @param articleId - The article UUID.
   * @param tagNames - An array of tag names or slugs.
   * 
   * @remarks
   * This operation is optimized for batch processing.
   */
  private async attachTags(articleId: string, tagNames: string[]): Promise<void> {
    // Batch create or find all tags.
    const tagPromises = tagNames.map(name => 
      tagModel.findOrCreate(generateSlug(name), name)
    );
    
    const tags = await Promise.all(tagPromises);
    const tagIds = tags.map(tag => tag.id);
    
    await tagModel.setArticleTags(articleId, tagIds);
  }
 
  /**
   * Replaces the existing tags of an article with a new set of tags.
   * 
   * @param articleId - The article UUID.
   * @param tagNames - An array of new tag names or slugs.
   */
  private async replaceTags(articleId: string, tagNames: string[]): Promise<void> {
    // Delegates to attachTags, which handles the full replacement logic in the model layer.
    await this.attachTags(articleId, tagNames);
  }
}

export const articleService = new ArticleService();