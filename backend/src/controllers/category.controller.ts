import { Request, Response } from 'express';
import { categoryService } from '../services/category.service.js';
import { getValidatedBody, getValidatedParams } from '../utils/request.js';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types/category.js';

/**
 * Category Controller
 * 
 * Handles HTTP requests related to categories.
 * 
 * Business logic lives in the service layer, not here.
 */
export class CategoryController {
  
  /**
   * Get All Categories (Flat List)
   * 
   * GET /api/categories
   * 
   * @returns 200 OK with list of all categories
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    const categories = await categoryService.getAllCategories();
    
    res.status(200).json({
      success: true,
      data: categories,
    });
  }
  
  /**
   * Get Category Tree
   * 
   * GET /api/categories/tree
   * 
   * @returns 200 OK with nested category tree
   * 
   * @example
   * [
   *   {
   *     id: "...",
   *     name: "Technology",
   *     children: [
   *       { id: "...", name: "Programming", children: [...] },
   *       { id: "...", name: "Hardware", children: [] }
   *     ]
   *   }
   * ]
   * 
   * @remarks
   * Returns hierarchical category structure for navigation menus.
   */
  async getTree(_req: Request, res: Response): Promise<void> {
    const tree = await categoryService.getCategoryTree();
    
    res.status(200).json({
      success: true,
      data: tree,
    });
  }
  
  /**
   * Get Root Categories
   * 
   * GET /api/categories/roots
   * 
   * @returns 200 OK with root categories
   * 
   * @remarks
   * Returns only top-level categories (no parent).
   * Useful for main navigation menu.
   */
  async getRoots(_req: Request, res: Response): Promise<void> {
    const roots = await categoryService.getRootCategories();
    
    res.status(200).json({
      success: true,
      data: roots,
    });
  }
  
  /**
   * Get Category by ID
   * 
   * GET /api/categories/:id
   * 
   * @param req.params.id - Category UUID
   * @returns 200 OK with category data (includes parent and children)
   * @throws 404 Not Found if the category doesn't exist (handled by the service)
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    const category = await categoryService.getCategoryById(id);
    
    res.status(200).json({
      success: true,
      data: category,
    });
  }
  
  /**
   * Get Children of Category
   * 
   * GET /api/categories/:id/children
   * 
   * @param req.params.id - Parent category UUID
   * @returns 200 OK with child categories
   */
  async getChildren(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    const children = await categoryService.getChildrenCategories(id);
    
    res.status(200).json({
      success: true,
      data: children,
    });
  }
  
  /**
   * Create Category
   * 
   * POST /api/categories
   * 
   * @param req.body - Category creation data (validated by middleware)
   * @returns 201 Created with category data
   * @throws 404 Not Found if the parent doesn't exist (handled by the service)
   * @throws 409 Conflict if new slug exists in the parent scope (handled by the service)
   */
  async create(req: Request, res: Response): Promise<void> {
    const data = getValidatedBody<CreateCategoryDTO>(req);
    
    const category = await categoryService.createCategory(data);
    
    res.status(201).json({
      success: true,
      data: category,
    });
  }
  
  /**
   * Update Category
   * 
   * PATCH /api/categories/:id
   * 
   * @param req.params.id - Category UUID
   * @param req.body - Update data (validated by middleware)
   * @returns 200 OK with updated category
   * @throws 404 Not Found if the category doesn't exist (handled by the service)
   * @throws 409 Conflict if new slug conflicts (handled by the service)
   * @throws 400 Validation Error if self-parentig is attempted (handled by the service)
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    const data = getValidatedBody<UpdateCategoryDTO>(req);
    
    const category = await categoryService.updateCategory(id, data);
    
    res.status(200).json({
      success: true,
      data: category,
    });
  }
  
  /**
   * Delete Category
   * 
   * DELETE /api/categories/:id
   * 
   * @param req.params.id - Category UUID
   * @returns 204 No Content
   * @throws 404 Not Found if the category doesn't exist (handled by the service)
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    await categoryService.deleteCategory(id);
    
    res.status(204).send();
  }
}

// Export singleton instance
export const categoryController = new CategoryController();