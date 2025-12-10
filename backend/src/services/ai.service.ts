import { z } from 'zod';
import { huggingface } from './ai/huggingface.js';
import { AIProvider, AIArticleResponse } from '../types/ai.js';
import { CreateArticleDTO, ArticleStatus } from '../types/article.js';
import { PROMPT_TEMPLATE, ARTICLE_TEMPLATES } from '../config/ai.js';
import { generateSlug } from '../utils/validation.js';
import { categoryModel } from '../models/category.model.js';
import { authorModel } from '../models/author.model.js';
import { InternalError } from '../utils/errors.js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Zod schema for AI response validation
 */
const AIResponseSchema = z.object({
  title: z.string().min(10).max(200),
  excerpt: z.string().min(50).max(300),
  body: z.string().min(500),
  tags: z.array(z.string()).min(1).max(10),
});

/**
 * AI Service
 */
export class AIService {
  private providers: AIProvider[];
  private aiAuthorId: string | null = null;
  private initialized = false;
  
  constructor() {
    this.providers = [huggingface];
  }
  
  /**
   * Initialize AI service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    await this.ensureAIAuthor();
    this.initialized = true;
    logger.info('AI Service initialized');
  }
  
  /**
   * Generate article creation DTO
   * 
   * @returns Article creation DTO
   */
  async generateArticle(): Promise<CreateArticleDTO> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const authorId = await this.getAIAuthorId();
    const template = this.selectRandomTemplate();
    
    const category = await categoryModel.findBySlug(template!.categorySlug);
    if (!category) {
      throw new InternalError(`Category not found: ${template!.categorySlug}`);
    }
    
    const aiResponse = await this.generateContent(template!.topic, category.name);
    const slug = generateSlug(aiResponse.title);
    
    return {
      authorId,
      categoryId: category.id,
      title: aiResponse.title,
      slug,
      excerpt: aiResponse.excerpt,
      body: aiResponse.body,
      status: ArticleStatus.PUBLISHED,
      tags: aiResponse.tags,
    };
  }
  
  /**
   * Generate article content using AI providers
   * 
   * @param topic - Article topic
   * @param category - Category name for context
   * @returns Validated article response
   */
  private async generateContent(topic: string, category: string): Promise<AIArticleResponse> {
    const prompt = this.buildPrompt(topic, category);
    
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        logger.debug({ provider: provider.name }, 'Provider unavailable');
        continue;
      }
      
      try {
        logger.info({ provider: provider.name }, 'Generating article');
        
        const result = await provider.generate(prompt);
        const validated = this.parseAndValidate(result.content);
        
        logger.info({ 
          provider: provider.name,
          title: validated.title,
        }, 'Article generated');
        
        return validated;
      } catch (error) {
        logger.warn({ err: error, provider: provider.name }, 'Provider failed');
        continue;
      }
    }
    
    throw new InternalError('All AI providers failed');
  }
  
  /**
   * Build generation prompt
   * 
   * @param topic - Article topic
   * @param category - Category name
   * @returns Formatted prompt string
   */
  private buildPrompt(topic: string, category: string): string {
    return PROMPT_TEMPLATE
      .replace('{topic}', topic)
      .replace('{category}', category);
  }
  
  /**
   * Parse and validate AI response
   * 
   * @param content - Raw AI output
   * @returns Validated article response
   * @throws Error if parsing or validation fails
   */
  private parseAndValidate(content: string): AIArticleResponse {
    let cleaned = content.trim();
    
    // Remove markdown code blocks if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }
    
    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      logger.error({ content: cleaned.substring(0, 200) }, 'Invalid JSON from AI');
      throw new Error('AI response is not valid JSON');
    }
    
    // Validate with Zod
    return AIResponseSchema.parse(parsed);
  }
  
  /**
   * Select random template from pool
   * 
   * @returns Random article template
   */
  private selectRandomTemplate() {
    const index = Math.floor(Math.random() * ARTICLE_TEMPLATES.length);
    return ARTICLE_TEMPLATES[index];
  }
  
  /**
   * Ensure AI author exists in database
   */
  private async ensureAIAuthor(): Promise<void> {
    const existing = await authorModel.findBySlug(env.AI_AUTHOR_SLUG);
    
    const data = {
      slug: env.AI_AUTHOR_SLUG,
      name: env.AI_AUTHOR_NAME,
      role: env.AI_AUTHOR_ROLE,
      bio: env.AI_AUTHOR_BIO,
      avatarUrl: env.AI_AUTHOR_AVATAR,
      type: 'ai',
      isActive: true,
    };
    
    if (existing) {
      await authorModel.update(existing.id, data);
      this.aiAuthorId = existing.id;
      logger.info({ id: existing.id }, 'AI author updated');
    } else {
      const created = await authorModel.create(data);
      this.aiAuthorId = created.id;
      logger.info({ id: created.id }, 'AI author created');
    }
  }
  
  /**
   * Get cached AI author ID
   * 
   * @returns AI author UUID
   * @throws Error if service not initialized
   */
  private async getAIAuthorId(): Promise<string> {
    if (!this.aiAuthorId) {
      throw new InternalError('AI Service not initialized');
    }
    return this.aiAuthorId;
  }
}

export const aiService = new AIService();