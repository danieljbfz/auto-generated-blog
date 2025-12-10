import { prisma } from '../config/database.js';

/**
 * Author model using Prisma
 */
export class AuthorModel {
  
  /**
   * Find author by ID
   */
  async findById(id: string) {
    return prisma.author.findUnique({ where: { id } });
  }
  
  /**
   * Find author by slug
   */
  async findBySlug(slug: string) {
    return prisma.author.findUnique({ where: { slug } });
  }
  
  /**
   * Find all authors
   */
  async findAll() {
    return prisma.author.findMany();
  }
  
  /**
   * Find all active authors
   */
  async findAllActive() {
    return prisma.author.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
  
  /**
   * Create author
   */
  async create(data: any) {
    return prisma.author.create({ data });
  }
  
  /**
   * Update author
   */
  async update(id: string, data: any) {
    return prisma.author.update({
      where: { id },
      data,
    });
  }
  
  /**
   * Delete author
   */
  async delete(id: string) {
    await prisma.author.delete({ where: { id } });
    return true;
  }

  /**
   * Check if author exists
   */
  async exists(id: string) {
    const count = await prisma.author.count({ where: { id } });
    return count > 0;
  }
  
  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string) {
    const author = await prisma.author.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    
    return !author;
  }
}

export const authorModel = new AuthorModel();