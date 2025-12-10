import { prisma } from '../config/database.js';

/**
 * Category model using Prisma
 */
export class CategoryModel {
  
  /**
   * Find category by ID
   */
  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }
  
  /**
   * Find category by slug
   */
  async findBySlug(slug: string, parentId?: string | null) {
    return prisma.category.findFirst({
      where: {
        slug,
        ...(parentId !== undefined && { parentId }),
      },
    });
  }
  
  /**
   * Find all categories
   */
  async findAll() {
    return prisma.category.findMany();
  }
  
  /**
   * Find root categories (no parent)
   */
  async findRoots() {
    return prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
  
  /**
   * Find children of category
   */
  async findChildren(parentId: string) {
    return prisma.category.findMany({
      where: {
        parentId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
  
  /**
   * Get full category tree
   */
  async getTree() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' },
      ],
    });
    
    const categoryMap = new Map();
    const roots: any[] = [];
    
    for (const cat of categories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }
    
    for (const cat of categories) {
      const node = categoryMap.get(cat.id);
      
      if (!cat.parentId) {
        roots.push(node);
        continue;
      }
      
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
    
    return roots;
  }
  
  /**
   * Create category
   */
  async create(data: any) {
    return prisma.category.create({ data });
  }
  
  /**
   * Update category
   */
  async update(id: string, data: any) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }
  
  /**
   * Delete category
   */
  async delete(id: string) {
    await prisma.category.delete({ where: { id } });
    return true;
  }
  
  /**
   * Check if category exists
   */
  async exists(id: string) {
    const count = await prisma.category.count({ where: { id } });
    return count > 0;
  }
  
  /**
   * Check if slug is available within parent scope
   */
  async isSlugAvailable(slug: string, parentId: string | null, excludeId?: string) {
    const category = await prisma.category.findFirst({
      where: {
        slug,
        parentId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    
    return !category;
  }
}

export const categoryModel = new CategoryModel();