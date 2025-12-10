import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateArticleJob } from '../../../src/jobs/generateArticle.job.js';
import { articleService } from '../../../src/services/article.service.js';
import { ArticleStatus } from '../../../src/types/article.js';

vi.mock('../../../src/services/article.service.js');

describe('generateArticleJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should call article service to generate and publish', async () => {
    // Arrange
    const mockArticle = {
      id: 'article-123',
      title: 'Test Article',
      slug: 'test-article',
      body: 'Content',
      status: ArticleStatus.PUBLISHED,
    };
    
    vi.mocked(articleService.generateAndPublishArticle).mockResolvedValue(mockArticle as any);
    
    // Act
    await generateArticleJob();
    
    // Assert
    expect(articleService.generateAndPublishArticle).toHaveBeenCalled();
  });
  
  it('should throw error if article generation fails', async () => {
    // Arrange
    vi.mocked(articleService.generateAndPublishArticle).mockRejectedValue(
      new Error('AI service unavailable')
    );
    
    // Act & Assert
    await expect(generateArticleJob()).rejects.toThrow('AI service unavailable');
  });
});