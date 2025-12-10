/**
 * Article Categories
 *
 * Hierarchical organization (e.g., "Databases" sits inside "Programming").
 * Used for navigation menus and breadcrumbs.
 */
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Creation Input (DTO)
 * 
 * Minimal data required to create a new category.
 */
export interface CreateCategoryDTO extends Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>> {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

/**
 * Category Update Input (DTO)
 * 
 * Partial update allowing most fields to change. Excludes system-managed
 * and immutable fields (id, createdAt, updatedAt).
 */
export interface UpdateCategoryDTO extends Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>> {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

/**
 * Category Tree Item
 * 
 * Used to represent the full category tree structure for active categories.
 */
export interface CategoryTreeItem extends Category {
    children: CategoryTreeItem[];
}