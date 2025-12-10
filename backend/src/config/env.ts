import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3001),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('autoblog'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().min(1),
  DB_MAX_CONNECTIONS: z.coerce.number().min(1).max(100).default(20),
  
  // AI Service
  HUGGINGFACE_API_KEY: z.string().min(1),
  HUGGINGFACE_MODEL: z.string().default('moonshotai/Kimi-K2-Instruct-0905'),
  
  // AI Author Configuration
  AI_AUTHOR_NAME: z.string().default('AI Content Assistant'),
  AI_AUTHOR_SLUG: z.string().default('ai-writer'),
  AI_AUTHOR_ROLE: z.string().default('Automated Content Generator'),
  AI_AUTHOR_BIO: z.string().default('Powered by AI to deliver fresh technical content daily'),
  AI_AUTHOR_AVATAR: z.string().url().default('https://api.dicebear.com/7.x/bottts/svg?seed=ai'),
  
  // Feature Flags
  AI_GENERATION_ENABLED: z.coerce.boolean().default(true),
  ARTICLE_AUTO_PUBLISH: z.coerce.boolean().default(true),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

/**
 * Parsed and validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse environment variables
 * 
 * @throws {Error} If validation fails
 */
function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(JSON.stringify(z.treeifyError(result.error), null, 2));
    process.exit(1);
  }
  
  return result.data;
}

export const env = parseEnv();