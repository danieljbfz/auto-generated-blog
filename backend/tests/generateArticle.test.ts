import { testConnection, closeConnection } from '../src/config/database.js';
import { aiService } from '../src/services/ai.service.js';
import { articleService } from '../src/services/article.service.js';

/**
 * Test article generation manually
 * 
 * @remarks
 * Run: npx tsx src/tests/generate.article.test.ts
 */
async function main() {
  console.log('Testing article generation\n');
  
  await testConnection();
  console.log('Database connected\n');
  
  await aiService.initialize();
  console.log('AI service ready\n');
  
  console.log('Generating article...\n');
  const start = Date.now();
  
  const article = await articleService.generateAndPublishArticle();
  
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  
  console.log('Article generated!\n');
  console.log('Details:');
  console.log(`  Title:    ${article.title}`);
  console.log(`  Slug:     ${article.slug}`);
  console.log(`  Status:   ${article.status}`);
  console.log(`  Duration: ${duration}s\n`);
  
  await closeConnection();
  console.log('Database disconnected\n');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});