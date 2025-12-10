import { describe, it, expect, beforeEach, vi } from 'vitest';
import { publishScheduledJob } from '../../../src/jobs/publishScheduled.job.js';
import { articleService } from '../../../src/services/article.service.js';

vi.mock('../../../src/services/article.service.js');

describe('publishScheduledJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should call article service to publish scheduled articles', async () => {
    // Arrange
    vi.mocked(articleService.publishScheduledArticles).mockResolvedValue(3);
    
    // Act
    await publishScheduledJob();
    
    // Assert
    expect(articleService.publishScheduledArticles).toHaveBeenCalled();
  });
  
  it('should handle when no articles are published', async () => {
    // Arrange
    vi.mocked(articleService.publishScheduledArticles).mockResolvedValue(0);
    
    // Act (it should not throw an error)
    await expect(publishScheduledJob()).resolves.not.toThrow();
    
    // Assert
    expect(articleService.publishScheduledArticles).toHaveBeenCalled();
  });
  
  it('should throw error if publishing fails', async () => {
    // Arrange
    vi.mocked(articleService.publishScheduledArticles).mockRejectedValue(
      new Error('Database connection lost')
    );
    
    // Act & Assert
    await expect(publishScheduledJob()).rejects.toThrow('Database connection lost');
  });
});