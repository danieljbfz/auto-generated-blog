import { ArticleTemplate } from '../types/ai.js';

/**
 * Article generation templates
 * 
 * @remarks
 * Defines category-topic pairs for AI article generation.
 * Each template produces one article when processed.
 */
export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  // Web Development
  { categorySlug: 'web-development', topic: 'Introduction to Modern Web Development' },
  { categorySlug: 'web-development', topic: 'Responsive Design Best Practices' },
  { categorySlug: 'web-development', topic: 'Web Accessibility Guidelines' },
  
  // JavaScript
  { categorySlug: 'javascript', topic: 'Understanding JavaScript Closures' },
  { categorySlug: 'javascript', topic: 'Async/Await vs Promises Explained' },
  { categorySlug: 'javascript', topic: 'Modern JavaScript Features' },
  
  // TypeScript
  { categorySlug: 'typescript', topic: 'TypeScript for JavaScript Developers' },
  { categorySlug: 'typescript', topic: 'Advanced TypeScript Types' },
  
  // React
  { categorySlug: 'react', topic: 'React Hooks Complete Guide' },
  { categorySlug: 'react', topic: 'React Performance Optimization' },
  
  // Backend
  { categorySlug: 'backend', topic: 'Building RESTful APIs with Node.js' },
  { categorySlug: 'backend', topic: 'API Authentication Best Practices' },
  { categorySlug: 'backend', topic: 'Microservices Architecture Patterns' },
  
  // Databases
  { categorySlug: 'databases', topic: 'PostgreSQL Performance Tuning' },
  { categorySlug: 'databases', topic: 'Database Indexing Strategies' },
  { categorySlug: 'databases', topic: 'SQL vs NoSQL: When to Use Each' },
  
  // DevOps
  { categorySlug: 'devops', topic: 'Docker Best Practices for Production' },
  { categorySlug: 'devops', topic: 'CI/CD Pipeline Setup Guide' },
  
  // Kubernetes
  { categorySlug: 'kubernetes', topic: 'Kubernetes Fundamentals' },
  { categorySlug: 'kubernetes', topic: 'Kubernetes Deployment Strategies' },
  
  // Testing
  { categorySlug: 'testing', topic: 'Introduction to Test-Driven Development' },
  { categorySlug: 'testing', topic: 'Unit Testing Best Practices' },
  
  // Security
  { categorySlug: 'security', topic: 'Web Security Fundamentals' },
  { categorySlug: 'security', topic: 'Common Security Vulnerabilities' },
  
  // Performance
  { categorySlug: 'performance', topic: 'Web Performance Optimization' },
  { categorySlug: 'performance', topic: 'Frontend Performance Metrics' },
  
  // Architecture
  { categorySlug: 'architecture', topic: 'Software Architecture Patterns' },
  { categorySlug: 'architecture', topic: 'Clean Architecture Principles' },
  
  // Cloud
  { categorySlug: 'cloud', topic: 'Introduction to Cloud Computing' },
  { categorySlug: 'cloud', topic: 'AWS vs Azure vs GCP Comparison' },
];

/**
 * JSON prompt template for AI generation
 * 
 * @remarks
 * Instructs AI to return valid JSON matching AIArticleResponse schema.
 * Uses placeholders: {topic}, {category}
 */
export const PROMPT_TEMPLATE = `You are a technical blog writer. Write a professional, informative article about the given topic.

Topic: {topic}
Category: {category}

You MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). Use this exact structure:

{
  "title": "A compelling article title (50-80 characters)",
  "excerpt": "A brief summary (120-160 characters)",
  "body": "Full article in Markdown (800-1200 words). Include:\\n- ## Introduction\\n- ## Main sections with ### subheadings\\n- Code examples if relevant\\n- ## Conclusion",
  "tags": ["tag1", "tag2", "tag3"]
}

Requirements:
- Title: Engaging, descriptive, SEO-friendly
- Excerpt: Concise summary for previews
- Body: Professional technical writing with Markdown formatting
- Tags: 3-5 relevant lowercase tags (e.g., "javascript", "react", "performance")

Return only the JSON object:`;

/**
 * AI generation configuration
 */
export const GENERATION_CONFIG = {
  /** Maximum tokens to generate */
  maxTokens: 8192,
  
  /** Sampling temperature (0.0-1.0) */
  temperature: 0.7,
  
  /** Request timeout in milliseconds */
  timeout: 45000,
} as const;

/**
 * Retry configuration for failed requests
 */
export const RETRY_CONFIG = {
  /** Maximum retry attempts */
  maxRetries: 3,
  
  /** Initial delay before first retry (ms) */
  initialDelay: 2000,
  
  /** Backoff multiplier for exponential backoff */
  backoffMultiplier: 2,
} as const;

/**
 * HuggingFace-specific configuration
 */
export const HUGGINGFACE_CONFIG = {
  /** Wait time for model cold start (ms) */
  coldStartWaitTime: 25000,
  
  /** Maximum retries for cold start (503 errors) */
  maxColdStartRetries: 2,
} as const;