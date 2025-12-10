import { Request, Response } from 'express';
import { authorService } from '../services/author.service.js';
import { getValidatedBody, getValidatedParams } from '../utils/request.js';
import { CreateAuthorDTO, UpdateAuthorDTO } from '../types/author.js';

/**
 * Author Controller
 * 
 * Handles HTTP requests related to authors.
 * 
 * Business logic lives in the service layer, not here.
 */
export class AuthorController {
  
  /**
   * Get All Authors
   * 
   * GET /api/authors
   * 
   * @returns 200 OK with list of all active authors
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    const authors = await authorService.getAllActiveAuthors();
    
    res.status(200).json({
      success: true,
      data: authors,
    });
  }
  
  /**
   * Get Author by ID
   * 
   * GET /api/authors/:id
   * 
   * @param req.params.id - Author UUID
   * @returns 200 OK with author data
   * @throws 404 Not Found if the author doesn't exist (handled by the service)
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    const author = await authorService.getAuthorById(id);
    
    res.status(200).json({
      success: true,
      data: author,
    });
  }
  
  /**
   * Get Author by Slug
   * 
   * GET /api/authors/by-slug/:slug
   * 
   * @param req.params.slug - Author slug
   * @returns 200 OK with author data
   * @throws 404 Not Found if the author doesn't exist (handled by the service)
   */
  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = getValidatedParams<{ slug: string }>(req);
    
    const author = await authorService.getAuthorBySlug(slug);
    
    res.status(200).json({
      success: true,
      data: author,
    });
  }
  
  /**
   * Create Author
   * 
   * POST /api/authors
   * 
   * @param req.body - Author creation data (validated by middleware)
   * @returns 201 Created with author data
   * @throws 409 Conflict if the slug already exists (handled by the service)
   */
  async create(req: Request, res: Response): Promise<void> {
    const data = getValidatedBody<CreateAuthorDTO>(req);
    
    const author = await authorService.createAuthor(data);
    
    res.status(201).json({
      success: true,
      data: author,
    });
  }
  
  /**
   * Update Author
   * 
   * PATCH /api/authors/:id
   * 
   * @param req.params.id - Author UUID
   * @param req.body - Update data (validated by middleware)
   * @returns 200 OK with updated author
   * @throws 404 Not Found if the author doesn't exist (handled by the service)
   * @throws 409 Conflict if the new slug already exists (handled by the service)
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    const data = getValidatedBody<UpdateAuthorDTO>(req);
    
    const author = await authorService.updateAuthor(id, data);
    
    res.status(200).json({
      success: true,
      data: author,
    });
  }
  
  /**
   * Delete Author
   * 
   * DELETE /api/authors/:id
   * 
   * @param req.params.id - Author UUID
   * @returns 204 No Content
   * @throws 404 Not Found if the author doesn't exist (handled by the service)
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    await authorService.deleteAuthor(id);
    
    res.status(204).send();
  }
}

// Export singleton instance
export const authorController = new AuthorController();