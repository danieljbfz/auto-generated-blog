import { tagModel } from '../models/tag.model.js';
import { Tag, CreateTagDTO, UpdateTagDTO } from '../types/tag.js';
import { generateSlug } from '../utils/validation.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Tag Service
 *
 * Handles the tag business logic, including creation, slug validation,
 * retrieval, and management of the popular tags.
 */
export class TagService {
 
  /**
   * Creates a new tag.
   *
   * @param data - The tag creation data.
   * @returns The created tag.
   * @throws ConflictError if the slug already exists.
   */
  async createTag(data: CreateTagDTO): Promise<Tag> {
    // Generate the slug from the name if it is not already provided.
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }
    
    const slugAvailable = await tagModel.isSlugAvailable(data.slug);
    
    if (!slugAvailable) {
      throw new ConflictError('The tag slug already exists', { slug: data.slug });
    }
    
    const tag = await tagModel.create(data);
    
    logger.info({
      tagId: tag.id,
      name: tag.name,
      slug: tag.slug,
    }, 'The tag was created');
    
    return tag;
  }
 
  /**
   * Retrieves a tag by its ID.
   *
   * @param id - The tag UUID.
   * @returns The tag object.
   * @throws NotFoundError if the tag does not exist.
   */
  async getTagById(id: string): Promise<Tag> {
    const tag = await tagModel.findById(id);
    
    if (!tag) {
      throw new NotFoundError('The tag was not found', { id });
    }
    
    return tag;
  }
 
  /**
   * Retrieves a tag by its unique slug.
   *
   * @param slug - The tag slug.
   * @returns The tag object.
   * @throws NotFoundError if the tag does not exist.
   */
  async getTagBySlug(slug: string): Promise<Tag> {
    const tag = await tagModel.findBySlug(slug);
    
    if (!tag) {
      throw new NotFoundError('The tag was not found', { slug });
    }
    
    return tag;
  }
 
  /**
   * Retrieves a list of all tags.
   *
   * @returns An array of all tag objects.
   */
  async getAllTags(): Promise<Tag[]> {
    return tagModel.findAll();
  }
  
  /**
   * Retrieves a list of the most popular tags based on published articles count.
   *
   * @param limit - The maximum number of tags to return.
   * @returns An array of popular tag objects.
   */
  async getPopularTags(limit: number = 20): Promise<Tag[]> {
    return tagModel.getPopularTags(limit);
  }
 
  /**
   * Updates an existing tag.
   *
   * @param id - The tag UUID.
   * @param data - The update data.
   * @returns The updated tag.
   * @throws NotFoundError if the tag does not exist.
   * @throws ConflictError if the new slug conflicts with another tag.
   */
  async updateTag(id: string, data: UpdateTagDTO): Promise<Tag> {
    // 1. Check if the tag exists.
    const exists = await tagModel.exists(id);
    if (!exists) {
      throw new NotFoundError('The tag was not found', { id });
    }
    
    // 2. Prepare the slug and check for conflicts.
    let slugToCheck = data.slug;
    
    if (data.name && !data.slug) {
        // If the name is changed but the slug is not provided, generate a new slug.
        slugToCheck = generateSlug(data.name);
    }
    
    if (slugToCheck) {
        const isAvailable = await tagModel.isSlugAvailable(slugToCheck, id);
        if (!isAvailable) {
            throw new ConflictError('The slug already exists for another tag', { slug: slugToCheck });
        }
        data.slug = slugToCheck; // Assign the checked/newly generated slug back to data.
    }
    
    // 3. Perform the update operation.
    const updated = await tagModel.update(id, data);
    
    if (!updated) {
        throw new NotFoundError('The tag was not found after the update operation', { id });
    }
    
    logger.info({ tagId: id }, 'The tag was updated');
    
    return updated;
  }
 
  /**
   * Deletes a tag by its ID.
   *
   * @param id - The tag UUID.
   * @throws NotFoundError if the tag does not exist.
   */
  async deleteTag(id: string): Promise<void> {
    const exists = await tagModel.exists(id);
    
    if (!exists) {
      throw new NotFoundError('The tag was not found', { id });
    }
    
    await tagModel.delete(id);
    
    logger.info({ tagId: id }, 'The tag was deleted');
  }
}

export const tagService = new TagService();