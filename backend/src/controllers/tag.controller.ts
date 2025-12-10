import { Request, Response } from 'express';
import { tagService } from '../services/tag.service.js';
import { getValidatedBody, getValidatedParams } from '../utils/request.js';
import { CreateTagDTO, UpdateTagDTO } from '../types/tag.js';

/**
 * Tag Controller
 * 
 * Handles HTTP requests related to tags.
 * 
 * Business logic lives in the service layer, not here.
 */
export class TagController {
  
  /**
   * Get All Tags
   * 
   * GET /api/tags
   * 
   * @returns 200 OK with list of all tags
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    const tags = await tagService.getAllTags();
    
    res.status(200).json({
      success: true,
      data: tags,
    });
  }
  
  /**
   * Get Popular Tags
   * 
   * GET /api/tags/popular?limit=20
   * 
   * @param req.query.limit - Maximum number of tags to return (default: 20)
   * @returns 200 OK with popular tags
   * 
   * @remarks
   * Returns tags ordered by number of published articles.
   * Useful for tag clouds or suggested tags.
   */
  async getPopular(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 20;
    
    const tags = await tagService.getPopularTags(limit);
    
    res.status(200).json({
      success: true,
      data: tags,
    });
  }
  
  /**
   * Get Tag by ID
   * 
   * GET /api/tags/:id
   * 
   * @param req.params.id - Tag UUID
   * @returns 200 OK with tag data
   * @throws 404 Not Found if the tag doesn't exist (handled by the service)
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    const tag = await tagService.getTagById(id);
    
    res.status(200).json({
      success: true,
      data: tag,
    });
  }
  
  /**
   * Get Tag by Slug
   * 
   * GET /api/tags/by-slug/:slug
   * 
   * @param req.params.slug - Tag slug
   * @returns 200 OK with tag data
   * @throws 404 Not Found if the tag doesn't exist (handled by the service)
   */
  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = getValidatedParams<{ slug: string }>(req);
    
    const tag = await tagService.getTagBySlug(slug);
    
    res.status(200).json({
      success: true,
      data: tag,
    });
  }
  
  /**
   * Create Tag
   * 
   * POST /api/tags
   * 
   * @param req.body - Tag creation data (validated by middleware)
   * @returns 201 Created with tag data
   * @throws 409 Conflict if slug already exists (handled by service)
   */
  async create(req: Request, res: Response): Promise<void> {
    const data = getValidatedBody<CreateTagDTO>(req);
    
    const tag = await tagService.createTag(data);
    
    res.status(201).json({
      success: true,
      data: tag,
    });
  }
  
  /**
   * Update Tag
   * 
   * PATCH /api/tags/:id
   * 
   * @param req.params.id - Tag UUID
   * @param req.body - Update data (validated by middleware)
   * @returns 200 OK with updated tag
   * @throws 404 Not Found if the tag doesn't exist (handled by the service)
   * @throws 409 Conflict if the new slug already exists (handled by the service)
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    const data = getValidatedBody<UpdateTagDTO>(req);
    
    const tag = await tagService.updateTag(id, data);
    
    res.status(200).json({
      success: true,
      data: tag,
    });
  }
  
  /**
   * Delete Tag
   * 
   * DELETE /api/tags/:id
   * 
   * @param req.params.id - Tag UUID
   * @returns 204 No Content
   * @throws 404 Not Found if the tag doesn't exist (handled by the service)
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = getValidatedParams<{ id: string }>(req);
    
    await tagService.deleteTag(id);
    
    res.status(204).send();
  }
}

// Export singleton instance
export const tagController = new TagController();