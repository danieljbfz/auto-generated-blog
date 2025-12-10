import { authorModel } from '../models/author.model.js';
import { Author, CreateAuthorDTO, UpdateAuthorDTO } from '../types/author.js';
import { generateSlug } from '../utils/validation.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Author Service
 *
 * Handles the author business logic, including creation, validation,
 * retrieval, and updating the author profile.
 */
export class AuthorService {
 
  /**
   * Creates a new author.
   * 
   * @param data - The author creation data.
   * @returns The created author.
   * @throws ConflictError if the slug already exists.
   */
  async createAuthor(data: CreateAuthorDTO): Promise<Author> {
    // Generate the slug from the name if it is not provided.
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }
    
    const slugAvailable = await authorModel.isSlugAvailable(data.slug);
    
    if (!slugAvailable) {
      throw new ConflictError('The author slug already exists', { slug: data.slug });
    }
    
    const author = await authorModel.create(data);
    
    logger.info({ 
      authorId: author.id,
      name: author.name,
      slug: author.slug,
    }, 'The author was created');
    
    return author;
  }
 
  /**
   * Retrieves an author by their ID.
   * 
   * @param id - The author UUID.
   * @returns The author object.
   * @throws NotFoundError if the author does not exist.
   */
  async getAuthorById(id: string): Promise<Author> {
    const author = await authorModel.findById(id);
    
    if (!author) {
      throw new NotFoundError('The author was not found', { id });
    }
    
    return author;
  }
 
  /**
   * Retrieves an author by their unique slug.
   * 
   * @param slug - The author slug.
   * @returns The author object.
   * @throws NotFoundError if the author does not exist.
   */
  async getAuthorBySlug(slug: string): Promise<Author> {
    const author = await authorModel.findBySlug(slug);
    
    if (!author) {
      throw new NotFoundError('The author was not found', { slug });
    }
    
    return author;
  }
 
  /**
   * Retrieves a list of all authors.
   * 
   * @returns An array of all author objects.
   */
  async getAllAuthors(): Promise<Author[]> {
    return authorModel.findAll();
  }
 
  /**
   * Retrieves a list of all active authors.
   * 
   * @returns An array of active author objects, sorted by name.
   */
  async getAllActiveAuthors(): Promise<Author[]> {
    return authorModel.findAllActive();
  }
 
  /**
   * Updates an existing author.
   * 
   * @param id - The author UUID.
   * @param data - The update data.
   * @returns The updated author.
   * @throws NotFoundError if the author does not exist.
   * @throws ConflictError if the new slug conflicts with another author.
   */
  async updateAuthor(id: string, data: UpdateAuthorDTO): Promise<Author> {
    // 1. Check if the author exists.
    const exists = await authorModel.exists(id);
    if (!exists) {
      throw new NotFoundError('The author was not found', { id });
    }

    // 2. Prepare the slug and check for conflicts.
    let slugToCheck = data.slug;
    
    if (data.name && !data.slug) {
      // If the name is changed but the slug is not provided, generate a new slug.
      slugToCheck = generateSlug(data.name);
    }
    
    if (slugToCheck) {
      const isAvailable = await authorModel.isSlugAvailable(slugToCheck, id);
      
      if (!isAvailable) {
        // Handle conflict if the provided/generated slug is already taken.
        throw new ConflictError('The slug already exists for another author', { slug: slugToCheck });
      }
      
      data.slug = slugToCheck;
    }
    
    // 3. Perform the update operation.
    const updated = await authorModel.update(id, data);
    
    if (!updated) {
      // This should ideally not happen if the existence check passed, but acts as a safeguard.
      throw new NotFoundError('The author was not found after the update operation', { id });
    }
    
    logger.info({ authorId: id }, 'The author was updated');
    
    return updated;
  }
 
  /**
   * Deletes an author by their ID.
   * 
   * @param id - The author UUID.
   * @throws NotFoundError if the author does not exist.
   */
  async deleteAuthor(id: string): Promise<void> {
    const exists = await authorModel.exists(id);
    if (!exists) {
      throw new NotFoundError('The author was not found', { id });
    }
    
    await authorModel.delete(id);
    
    logger.info({ authorId: id }, 'The author was deleted');
  }
}

export const authorService = new AuthorService();