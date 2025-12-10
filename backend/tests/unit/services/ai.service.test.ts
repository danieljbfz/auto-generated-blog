import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { AIService } from '../../../src/services/ai.service.js';
import { authorModel } from '../../../src/models/author.model.js';
import { categoryModel } from '../../../src/models/category.model.js';
import { ArticleStatus } from '../../../src/types/article.js';

// Mock models
vi.mock('../../../src/models/author.model.js');
vi.mock('../../../src/models/category.model.js');

// Mock AI providers by mocking the entire modules
vi.mock('../../../src/services/ai/huggingface.js', () => ({
  huggingface: {
    name: 'huggingface',
    isAvailable: vi.fn(),
    generate: vi.fn(),
  },
}));

// Import after mocks are set up
import { huggingface } from '../../../src/services/ai/huggingface.js';

describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    aiService = new AIService();
    vi.clearAllMocks();
  });
  
  describe('initialize', () => {
    it('should create AI author when not exists', async () => {
      // Arrange
      vi.mocked(authorModel.findBySlug).mockResolvedValue(null);
      vi.mocked(authorModel.create).mockResolvedValue({
        id: 'author-123',
        slug: 'ai-writer',
        name: 'AI Writer',
        type: 'ai',
        isActive: true,
      } as any);
      
      // Act
      await aiService.initialize();
      
      // Assert
      expect(authorModel.findBySlug).toHaveBeenCalledWith('ai-writer');
      expect(authorModel.create).toHaveBeenCalled();
    });
    
    it('should update existing AI author from env', async () => {
      // Arrange
      const existingAuthor = {
        id: 'author-123',
        slug: 'ai-writer',
        name: 'Old Name',
      };
      vi.mocked(authorModel.findBySlug).mockResolvedValue(existingAuthor as any);
      vi.mocked(authorModel.update).mockResolvedValue({} as any);
      
      // Act
      await aiService.initialize();
      
      // Assert
      expect(authorModel.update).toHaveBeenCalledWith(
        'author-123',
        expect.objectContaining({ slug: 'ai-writer' })
      );
    });
    
    it('should only initialize once', async () => {
      // Arrange
      vi.mocked(authorModel.findBySlug).mockResolvedValue({ id: 'author-123' } as any);
      vi.mocked(authorModel.update).mockResolvedValue({} as any);
      
      // Act
      await aiService.initialize();
      await aiService.initialize();
      
      // Assert
      expect(authorModel.findBySlug).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('generateArticle', () => {
    beforeEach(async () => {
      // Setup common mocks for article generation
      vi.mocked(authorModel.findBySlug).mockResolvedValue({ id: 'author-123' } as any);
      vi.mocked(authorModel.update).mockResolvedValue({} as any);
      
      vi.mocked(categoryModel.findBySlug).mockResolvedValue({
        id: 'category-123',
        name: 'Web Development',
        slug: 'web-development',
      } as any);
      
      await aiService.initialize();
    });
    
    it('should generate valid article DTO', async () => {
      // Arrange
      (huggingface.isAvailable as Mock).mockReturnValue(true);
      (huggingface.generate as Mock).mockResolvedValue({
        content: JSON.stringify({
          title: 'Test Article Title',
          excerpt: 'A comprehensive test excerpt for the article that meets length requirements.',
          body: 'This is the full body content of the test article with sufficient length to pass validation. '.repeat(10),
          tags: ['test', 'article'],
        }),
        metadata: {
          model: 'test-model',
          provider: 'huggingface',
          durationMs: 1000,
        },
      });
      
      // Act
      const result = await aiService.generateArticle();
      
      // Assert
      expect(result.authorId).toBe('author-123');
      expect(result.categoryId).toBe('category-123');
      expect(result.status).toBe(ArticleStatus.PUBLISHED);
      expect(result.slug).toBeTruthy();
    });
    
    it('should throw error when category not found', async () => {
      // Arrange
      vi.mocked(categoryModel.findBySlug).mockResolvedValue(null);
      
      // Act & Assert
      await expect(aiService.generateArticle()).rejects.toThrow('Category not found');
    });
    
    it('should parse AI response with markdown code blocks', async () => {
      // Arrange
      (huggingface.isAvailable as Mock).mockReturnValue(true);
      const jsonWithCodeBlocks = '```json\n{"title":"Markdown Test Title","excerpt":"Test excerpt with enough length to pass validation requirements","body":"' + 'Test body with enough content. '.repeat(50) + '","tags":["markdown"]}\n```';
      (huggingface.generate as Mock).mockResolvedValue({
        content: jsonWithCodeBlocks,
        metadata: { model: 'test', provider: 'huggingface', durationMs: 100 },
      });
      
      // Act
      const result = await aiService.generateArticle();
      
      // Assert
      expect(result.title).toBe('Markdown Test Title');
      expect(result.tags).toEqual(['markdown']);
    });
    
    it('should reject invalid AI response schema', async () => {
      // Arrange
      (huggingface.isAvailable as Mock).mockReturnValue(true);
      const invalidResponse = JSON.stringify({
        title: 'Short',
        excerpt: 'Too short',
        body: 'Also too short',
        tags: [],
      });
      (huggingface.generate as Mock).mockResolvedValue({
        content: invalidResponse,
        metadata: { model: 'test', provider: 'huggingface', durationMs: 100 },
      });
      
      // Act & Assert
      await expect(aiService.generateArticle()).rejects.toThrow('All AI providers failed');
    });
    
    it('should reject malformed JSON response', async () => {
      // Arrange
      (huggingface.isAvailable as Mock).mockReturnValue(true);
      (huggingface.generate as Mock).mockResolvedValue({
        content: 'This is not JSON at all',
        metadata: { model: 'test', provider: 'huggingface', durationMs: 100 },
      });
      
      // Act & Assert
      await expect(aiService.generateArticle()).rejects.toThrow('All AI providers failed');
    });
  });
});