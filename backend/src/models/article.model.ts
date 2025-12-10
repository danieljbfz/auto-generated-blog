import { prisma } from '../config/database.js';
import { Article, ArticleQueryOptions, ArticleStatus, PaginatedArticles } from '../types/article.js';
import { Prisma } from '@prisma/client';

/**
 * Transform Prisma article to application Article type
 * - Flattens tags from junction table format
 * - Removes redundant articleId from stats
 */
function transformArticle(prismaArticle: any): Article {
  return {
    ...prismaArticle,
    tags: prismaArticle.tags?.map((at: any) => at.tag) || [],
    stats: prismaArticle.stats ? {
      views: prismaArticle.stats.views,
      updatedAt: prismaArticle.stats.updatedAt,
    } : null,
  };
}

/**
 * Article model using Prisma
 */
export class ArticleModel {
  /**
   * Find article by ID
   */
  async findById(id: string): Promise<Article | null> {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
        stats: true,
      },
    });
    
    if (!article) return null;
    return transformArticle(article);
  }
  
  /**
   * Find article by slug
   */
  async findBySlug(slug: string): Promise<Article | null> {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
        stats: true,
      },
    });
    
    if (!article) return null;
    return transformArticle(article);
  }
  
  /**
   * Find articles with filters
   */
  async findMany(options: ArticleQueryOptions = {}): Promise<PaginatedArticles> {
    const {
      status,
      categoryId,
      authorId,
      tagIds,
      searchTerm,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeCategory = true,
      includeTags = true,
      includeStats = true,
      includeAuthor = true,
    } = options;
    
    const where: Prisma.ArticleWhereInput = {};
    
    if (status) {
      where.status = Array.isArray(status) 
        ? { in: status }
        : status;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: tagIds },
        },
      };
    }
    
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { excerpt: { contains: searchTerm, mode: 'insensitive' } },
        { body: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    const include: Prisma.ArticleInclude = {
      author: includeAuthor,
      category: includeCategory,
      tags: includeTags ? { include: { tag: true } } : false,
      stats: includeStats,
    };
    
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: articles.map(transformArticle),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
  
  /**
   * Create article
   */
  async create(data: Prisma.ArticleCreateInput): Promise<Article> {
    const article = await prisma.article.create({
      data,
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
        stats: true,
      },
    });
    
    return transformArticle(article);
  }
  
  /**
   * Update article
   */
  async update(id: string, data: Prisma.ArticleUpdateInput): Promise<Article | null> {
    const article = await prisma.article.update({
      where: { id },
      data,
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
        stats: true,
      },
    });
    
    return transformArticle(article);
  }
  
  /**
   * Delete article
   */
  async delete(id: string): Promise<boolean> {
    await prisma.article.delete({ where: { id } });
    return true;
  }

  /**
   * Check if article exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { id } });
    return count > 0;
  }
  
  /**
   * Get published feed
   */
  async getPublishedFeed(page: number = 1, limit: number = 10): Promise<PaginatedArticles> {
    return this.findMany({
      status: ArticleStatus.PUBLISHED,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
      page,
      limit,
    });
  }
  
  /**
   * Publish scheduled articles
   */
  async publishScheduledArticles(): Promise<number> {
    const result = await prisma.article.updateMany({
      where: {
        status: ArticleStatus.SCHEDULED,
        scheduledPublishAt: { lte: new Date() },
        publishedAt: null,
      },
      data: {
        status: ArticleStatus.PUBLISHED,
      },
    });
    
    return result.count;
  }

  /**
   * Publish scheduled articles using the PostgreSQL stored function
   */
  async publishScheduledArticlesWithFunction(): Promise<number> {
    return prisma.$executeRaw`SELECT publish_scheduled_articles();`;
  }
  
  /**
   * Increment views
   */
  async incrementViews(articleId: string): Promise<void> {
    await prisma.articleStats.upsert({
      where: { articleId },
      create: { articleId, views: 1 },
      update: { views: { increment: 1 } },
    });
  }

  /**
   * Increment views using the PostgreSQL stored function
   */
  async incrementViewsWithFunction(articleId: string): Promise<void> {
    await prisma.$executeRaw`SELECT increment_article_views(${articleId}::UUID);`;
  }
  
  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    
    return !article;
  }
}

export const articleModel = new ArticleModel();