import { prisma } from '../src/config/database';

async function testPrismaConnection() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful.');
    
    // Count the number of articles
    const articleCount = await prisma.article.count();
    console.log(`Number of articles: ${articleCount}`);

    // Count the number of categories
    const categoryCount = await prisma.category.count();
    console.log(`Number of categories: ${categoryCount}`);
    
    // Count the number of tags
    const tagCount = await prisma.tag.count();
    console.log(`Number of tags: ${tagCount}`);
    
    // Count the number of authors
    const authorCount = await prisma.author.count();
    console.log(`Number of authors: ${authorCount}`);
    
  } catch (error) {
    console.error('Database Connection/Query Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();