import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArticleService } from '../../../src/services/article.service.js';
import { articleModel } from '../../../src/models/article.model.js';
import { tagModel } from '../../../src/models/tag.model.js';
import { aiService } from '../../../src/services/ai.service.js';
import { ArticleStatus } from '../../../src/types/article.js';
import { NotFoundError, ConflictError } from '../../../src/utils/errors.js';

vi.mock('../../../src/models/article.model.js');
vi.mock('../../../src/models/tag.model.js');
vi.mock('../../../src/services/ai.service.js');

describe('ArticleService', () => {
  let articleService: ArticleService;
  
  beforeEach(() => {
    articleService = new ArticleService();
    vi.clearAllMocks();
  });
  
  describe('createArticle', () => {
    it('should create article successfully', async () => {
      // Arrange
      const articleData = {
        authorId: 'author-123',
        categoryId: 'category-123',
        title: 'Test Article',
        slug: 'test-article',
        body: 'Test body content',
        status: ArticleStatus.PUBLISHED,
      };
      
      vi.mocked(articleModel.isSlugAvailable).mockResolvedValue(true);
      vi.mocked(articleModel.create).mockResolvedValue({
        id: 'article-123',
        ...articleData,
      } as any);
      
      // Act
      const result = await articleService.createArticle(articleData);
      
      // Assert
      expect(result.id).toBe('article-123');
      expect(articleModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Article',
          slug: 'test-article',
        })
      );
    });
    
    it('should throw ConflictError when slug exists', async () => {
      // Arrange
      vi.mocked(articleModel.isSlugAvailable).mockResolvedValue(false);
      
      // Act & Assert
      await expect(
        articleService.createArticle({
          authorId: 'author-123',
          categoryId: 'category-123',
          title: 'Test',
          slug: 'existing-slug',
          body: 'Test body',
        })
      ).rejects.toThrow(ConflictError);
    });
    
    it('should create and attach tags in parallel', async () => {
      // Arrange
      vi.mocked(articleModel.isSlugAvailable).mockResolvedValue(true);
      vi.mocked(articleModel.create).mockResolvedValue({ id: 'article-123' } as any);
      
      // Mock tag creation for multiple tags
      vi.mocked(tagModel.findOrCreate)
        .mockResolvedValueOnce({ id: 'tag-1', slug: 'javascript', name: 'javascript' } as any)
        .mockResolvedValueOnce({ id: 'tag-2', slug: 'nodejs', name: 'nodejs' } as any);
      
      vi.mocked(tagModel.setArticleTags).mockResolvedValue();
      
      // Act
      await articleService.createArticle({
        authorId: 'author-123',
        categoryId: 'category-123',
        title: 'Test',
        slug: 'test',
        body: 'Test body',
        tags: ['javascript', 'nodejs'],
      });
      
      // Assert
      expect(tagModel.findOrCreate).toHaveBeenCalledTimes(2);
      expect(tagModel.setArticleTags).toHaveBeenCalledWith(
        'article-123',
        ['tag-1', 'tag-2']
      );
    });
  });
  
  describe('generateAndPublishArticle', () => {
    it('should generate and publish article from AI', async () => {
      // Arrange
      const aiGeneratedData = {
        authorId: 'author-123',
        categoryId: 'category-123',
        title: 'AI Generated Article',
        slug: 'ai-generated-article',
        body: 'AI generated content',
        status: ArticleStatus.PUBLISHED,
        tags: ['ai'],
      };
      
      vi.mocked(aiService.generateArticle).mockResolvedValue(aiGeneratedData);
      vi.mocked(articleModel.isSlugAvailable).mockResolvedValue(true);
      vi.mocked(articleModel.create).mockResolvedValue({
        id: 'article-123',
        title: 'AI Generated Article',
      } as any);
      vi.mocked(tagModel.findOrCreate).mockResolvedValue({ id: 'tag-123' } as any);
      vi.mocked(tagModel.setArticleTags).mockResolvedValue();
      
      // Act
      const result = await articleService.generateAndPublishArticle();
      
      // Assert
      expect(result.id).toBe('article-123');
      expect(aiService.generateArticle).toHaveBeenCalled();
    });
    
    it('should append timestamp to slug on collision', async () => {
      // Arrange
      vi.mocked(aiService.generateArticle).mockResolvedValue({
        authorId: 'author-123',
        categoryId: 'category-123',
        title: 'Test',
        slug: 'duplicate-slug',
        body: 'Test',
        status: ArticleStatus.PUBLISHED,
      });
      
      // First call (in generateAndPublishArticle) returns false
      // Second call (in createArticle with modified slug) returns true
      vi.mocked(articleModel.isSlugAvailable)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      
      vi.mocked(articleModel.create).mockResolvedValue({ id: 'article-123' } as any);
      
      // Act
      await articleService.generateAndPublishArticle();
      
      // Assert
      const createCall = vi.mocked(articleModel.create).mock.calls[0][0];
      expect(createCall.slug).toMatch(/^duplicate-slug-[a-z0-9]+$/);
    });
  });
  
  describe('getArticleBySlug', () => {
    it('should return article and increment views asynchronously', async () => {
      // Arrange
      const mockArticle = {
        id: 'article-123',
        slug: 'test-article',
        title: 'Test Article',
      };
      vi.mocked(articleModel.findBySlug).mockResolvedValue(mockArticle as any);
      vi.mocked(articleModel.incrementViews).mockResolvedValue();
      
      // Act
      const result = await articleService.getArticleBySlug('test-article');
      
      // Assert
      expect(result.id).toBe('article-123');
      expect(articleModel.incrementViews).toHaveBeenCalledWith('article-123');
    });
    
    it('should throw NotFoundError when article missing', async () => {
      // Arrange
      vi.mocked(articleModel.findBySlug).mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        articleService.getArticleBySlug('missing-slug')
      ).rejects.toThrow(NotFoundError);
    });
    
    it('should not fail when view increment fails', async () => {
      // Arrange
      vi.mocked(articleModel.findBySlug).mockResolvedValue({ id: 'article-123' } as any);
      vi.mocked(articleModel.incrementViews).mockRejectedValue(new Error('DB error'));
      
      // Act
      const result = await articleService.getArticleBySlug('test');
      
      // Assert - should still return article
      expect(result.id).toBe('article-123');
    });
  });
  
  describe('updateArticle', () => {
    it('should update article fields', async () => {
      // Arrange
      const existingArticle = { id: 'article-123', slug: 'old-slug' };
      vi.mocked(articleModel.findById).mockResolvedValue(existingArticle as any);
      vi.mocked(articleModel.isSlugAvailable).mockResolvedValue(true);
      vi.mocked(articleModel.update).mockResolvedValue({
        id: 'article-123',
        title: 'Updated Title',
      } as any);
      
      // Act
      const result = await articleService.updateArticle('article-123', {
        title: 'Updated Title',
        slug: 'new-slug',
      });
      
      // Assert
      expect(result.title).toBe('Updated Title');
      expect(articleModel.update).toHaveBeenCalled();
    });
    
    it('should throw NotFoundError when article missing', async () => {
      // Arrange
      vi.mocked(articleModel.findById).mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        articleService.updateArticle('missing-id', { title: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });
    
    it('should throw ConflictError when new slug taken', async () => {
      // Arrange
      vi.mocked(articleModel.findById).mockResolvedValue({
        id: 'article-123',
        slug: 'old-slug',
      } as any);
      vi.mocked(articleModel.isSlugAvailable).mockResolvedValue(false);
      
      // Act & Assert
      await expect(
        articleService.updateArticle('article-123', { slug: 'taken-slug' })
      ).rejects.toThrow(ConflictError);
    });
    
    it('should replace tags when provided', async () => {
      // Arrange
      vi.mocked(articleModel.findById).mockResolvedValue({ id: 'article-123' } as any);
      vi.mocked(articleModel.update).mockResolvedValue({ id: 'article-123' } as any);
      vi.mocked(tagModel.findOrCreate).mockResolvedValue({ id: 'tag-123' } as any);
      vi.mocked(tagModel.setArticleTags).mockResolvedValue();
      
      // Act
      await articleService.updateArticle('article-123', {
        tags: ['new-tag'],
      });
      
      // Assert
      expect(tagModel.setArticleTags).toHaveBeenCalledWith(
        'article-123',
        expect.any(Array)
      );
    });
  });
  
  describe('deleteArticle', () => {
    it('should delete existing article', async () => {
      // Arrange
      vi.mocked(articleModel.exists).mockResolvedValue(true);
      vi.mocked(articleModel.delete).mockResolvedValue(true);
      
      // Act
      await articleService.deleteArticle('article-123');
      
      // Assert
      expect(articleModel.delete).toHaveBeenCalledWith('article-123');
    });
    
    it('should throw NotFoundError when article missing', async () => {
      // Arrange
      vi.mocked(articleModel.exists).mockResolvedValue(false);
      
      // Act & Assert
      await expect(
        articleService.deleteArticle('missing-id')
      ).rejects.toThrow(NotFoundError);
    });
  });
  
  describe('publishScheduledArticles', () => {
    it('should publish scheduled articles and return count', async () => {
      // Arrange
      vi.mocked(articleModel.publishScheduledArticles).mockResolvedValue(3);
      
      // Act
      const count = await articleService.publishScheduledArticles();
      
      // Assert
      expect(count).toBe(3);
    });
    
    it('should return zero when no articles to publish', async () => {
      // Arrange
      vi.mocked(articleModel.publishScheduledArticles).mockResolvedValue(0);
      
      // Act
      const count = await articleService.publishScheduledArticles();
      
      // Assert
      expect(count).toBe(0);
    });
  });
});