import { categoryModel } from '../models/category.model.js';
import { Category, CreateCategoryDTO, UpdateCategoryDTO, CategoryTreeItem } from '../types/category.js';
import { generateSlug } from '../utils/validation.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Category Service
 *
 * Handles the category business logic, including creation, validation,
 * retrieval, and management of the hierarchical structure.
 */
export class CategoryService {
 
  /**
   * Creates a new category with slug validation scoped to the parent.
   *
   * @param data - The category creation data.
   * @returns The created category.
   * @throws ConflictError if the slug already exists within the same parent scope.
   * @throws NotFoundError if the parent category ID is invalid.
   */
  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    const parentId = data.parentId || null;
    
    // Ensure that the parent category exists if a parent ID was provided.
    if (parentId !== null) {
      const parentExists = await categoryModel.exists(parentId);
      if (!parentExists) {
        throw new NotFoundError('The parent category was not found', { parentId });
      }
    }
    
    // Generate the slug from the name if it is not already provided.
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }
    
    // Check if the slug is available within the parent scope.
    const slugAvailable = await categoryModel.isSlugAvailable(data.slug, parentId);
    
    if (!slugAvailable) {
      throw new ConflictError('The category slug already exists under this parent scope', { slug: data.slug, parentId });
    }
    
    const category = await categoryModel.create({
      ...data,
      parentId,
    });
    
    logger.info({
      categoryId: category.id,
      name: category.name,
      parentId: category.parentId,
    }, 'The category was created');
    
    return category;
  }
 
  /**
   * Retrieves a category by its ID, including its parent and children relations.
   *
   * @param id - The category UUID.
   * @returns The category object with relations.
   * @throws NotFoundError if the category does not exist.
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await categoryModel.findById(id);
    
    if (!category) {
      throw new NotFoundError('The category was not found', { id });
    }
    
    return category;
  }
 
  /**
   * Retrieves a category by its unique slug, scoped by its parent.
   *
   * @param slug - The category slug.
   * @param parentId - The optional parent category UUID.
   * @returns The category object.
   * @throws NotFoundError if the category does not exist in the specified scope.
   */
  async getCategoryBySlug(slug: string, parentId?: string | null): Promise<Category> {
    const category = await categoryModel.findBySlug(slug, parentId);
    
    if (!category) {
      throw new NotFoundError('The category was not found', { slug, parentId });
    }
    
    return category;
  }
 
  /**
   * Retrieves a list of all categories.
   * 
   * @returns An array of all category objects.
   */
  async getAllCategories(): Promise<Category[]> {
    return categoryModel.findAll();
  }
 
  /**
   * Retrieves all root categories (categories with no parent).
   *
   * @returns An array of root category objects.
   */
  async getRootCategories(): Promise<Category[]> {
    return categoryModel.findRoots();
  }
  
  /**
   * Retrieves all active children categories for a given parent ID.
   *
   * @param parentId - The UUID of the parent category.
   * @returns An array of child category objects.
   */
  async getChildrenCategories(parentId: string): Promise<Category[]> {
    return categoryModel.findChildren(parentId);
  }
  
  /**
   * Retrieves the full category tree structure for active categories.
   *
   * @returns A hierarchical array representing the category tree.
   */
  async getCategoryTree(): Promise<CategoryTreeItem[]> {
    return categoryModel.getTree();
  }
 
  /**
   * Updates an existing category.
   *
   * @param id - The category UUID.
   * @param data - The update data.
   * @returns The updated category.
   * @throws NotFoundError if the category or its new parent does not exist.
   * @throws ConflictError if the new slug conflicts within the target parent scope.
   * @throws ValidationError if the category attempts to become its own child or parent.
   */
  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<Category> {
    // 1. Check if the category exists.
    const exists = await categoryModel.exists(id);
    if (!exists) {
      throw new NotFoundError('The category was not found', { id });
    }
    
    const newParentId = data.parentId === undefined ? null : data.parentId;
    
    // 2. Validate the Parent ID and prevent self-parenting.
    if (newParentId !== null && newParentId !== undefined) {
      if (newParentId === id) {
        throw new ValidationError('A category cannot be its own parent.', { id, parentId: newParentId });
      }
      const parentExists = await categoryModel.exists(newParentId);
      if (!parentExists) {
        throw new NotFoundError('The new parent category was not found', { parentId: newParentId });
      }
    }
    
    // 3. Prepare the slug and check for conflicts.
    let slugToCheck = data.slug;
    
    if (data.name && !data.slug) {
        // If the name is changed but the slug is not provided, generate a new slug.
        slugToCheck = generateSlug(data.name);
    }
    
    if (slugToCheck) {
        const isAvailable = await categoryModel.isSlugAvailable(slugToCheck, newParentId, id);
        if (!isAvailable) {
            throw new ConflictError('The slug already exists under the new parent scope', { slug: slugToCheck, parentId: newParentId });
        }
        data.slug = slugToCheck; // Assign the checked/newly generated slug back to data.
    }
    
    // 4. Perform the update operation.
    const updated = await categoryModel.update(id, data);
    
    if (!updated) {
        throw new NotFoundError('The category was not found after the update operation', { id });
    }
    
    logger.info({ categoryId: id }, 'The category was updated');
    
    return updated;
  }
 
  /**
   * Deletes a category by its ID.
   *
   * @param id - The category UUID.
   * @throws NotFoundError if the category does not exist.
   */
  async deleteCategory(id: string): Promise<void> {
    const exists = await categoryModel.exists(id);
    if (!exists) {
      throw new NotFoundError('The category was not found', { id });
    }
    
    // The model is assumed to handle cascading deletion or re-parenting of children.
    await categoryModel.delete(id);
    
    logger.info({ categoryId: id }, 'The category was deleted');
  }
}

export const categoryService = new CategoryService();