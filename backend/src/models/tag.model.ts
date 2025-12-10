import { prisma } from '../config/database.js';

/**
 * Tag model using Prisma
 */
export class TagModel {
  
  /**
   * Find tag by ID
   */
  async findById(id: string) {
    return prisma.tag.findUnique({ where: { id } });
  }
  
  /**
   * Find tag by slug
   */
  async findBySlug(slug: string) {
    return prisma.tag.findUnique({ where: { slug } });
  }
  
  /**
   * Find all tags
   */
  async findAll() {
    return prisma.tag.findMany();
  }
  
  /**
   * Find or create tag
   */
  async findOrCreate(slug: string, name: string) {
    return prisma.tag.upsert({
      where: { slug },
      create: { slug, name },
      update: { name },
    });
  }
  
  /**
   * Get tags for article
   */
  async getArticleTags(articleId: string) {
    const articleTags = await prisma.articleTag.findMany({
      where: { articleId },
      include: { tag: true },
      orderBy: { tag: { name: 'asc' } },
    });
    
    return articleTags.map(at => at.tag);
  }
  
  /**
   * Set article tags (replace all)
   */
  async setArticleTags(articleId: string, tagIds: string[]) {
    await prisma.$transaction([
      prisma.articleTag.deleteMany({ where: { articleId } }),
      ...(tagIds.length > 0 ? [
        prisma.articleTag.createMany({
          data: tagIds.map(tagId => ({ articleId, tagId })),
        }),
      ] : []),
    ]);
  }
  
  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 20) {
    return prisma.tag.findMany({
      where: {
        articles: {
          some: {
            article: { status: 'published' },
          },
        },
      },
      take: limit,
      orderBy: {
        articles: { _count: 'desc' },
      },
    });
  }
  
  /**
   * Create tag
   */
  async create(data: any) {
    return prisma.tag.create({ data });
  }
  
  /**
   * Update tag
   */
  async update(id: string, data: any) {
    return prisma.tag.update({
      where: { id },
      data,
    });
  }
  
  /**
   * Delete tag
   */
  async delete(id: string) {
    await prisma.tag.delete({ where: { id } });
    return true;
  }

  /**
   * Check if tag exists
   */
  async exists(id: string) {
    const count = await prisma.tag.count({ where: { id } });
    return count > 0;
  }
  
  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string) {
    const tag = await prisma.tag.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    
    return !tag;
  }
}

export const tagModel = new TagModel();