import { describe, it, expect, beforeAll } from 'vitest';
import { aiService } from '../../../src/services/ai.service.js';
import { prisma } from '../../../src/config/database.js';
import { env } from '../../../src/config/env.js';

/**
 * Integration Tests for AI Service
 * 
 * These tests make REAL API calls to HuggingFace.
 * 
 * Requirements:
 * - HUGGINGFACE_API_KEY must be set
 * - Database must be running
 * - Seed data must exist (categories, AI author)
 */
describe('AIService Integration Tests', () => {
  beforeAll(async () => {
    // Skip all tests if there is no API key
    if (!env.HUGGINGFACE_API_KEY) {
      console.warn('Skipping integration tests: No valid HUGGINGFACE_API_KEY');
      return;
    }

    // Ensure database is connected
    await prisma.$connect();
    
    // Initialize AI service (creates/updates author)
    await aiService.initialize();
  });
  
  
  it('should generate real article from HuggingFace', async () => {
    // Real API call (may take 20-30 seconds)
    const article = await aiService.generateArticle();
    
    // Assert
    expect(article).toBeDefined();
    expect(article.title).toBeTruthy();
    expect(article.body.length).toBeGreaterThan(500);
    expect(article.excerpt).toBeTruthy();
    expect(article.tags).toBeInstanceOf(Array);
    expect(article.tags?.length).toBeGreaterThan(0);
    expect(article.slug).toBeTruthy();
    expect(article.authorId).toBeTruthy();
    expect(article.categoryId).toBeTruthy();
    expect(article.status).toBe('published');

    console.log('Generated article:', {
      title: article.title,
      slug: article.slug,
      bodyLength: article.body.length,
      wordCount: article.body.split(' ').length,
      tags: article.tags,
    });
  }, 60000); // 60 second timeout for API call

  it.skip('should handle API rate limiting gracefully', async () => {
    // Make multiple rapid requests
    const requests = Array(3).fill(null).map(() => aiService.generateArticle());
    
    // Some may fail due to rate limiting
    const articles = await Promise.allSettled(requests);
    
    // At least one should succeed
    const successful = articles.filter(a => a.status === 'fulfilled');
    expect(successful.length).toBeGreaterThan(0);
    
    console.log(`${successful.length}/3 requests succeeded`);
  }, 120000);
});