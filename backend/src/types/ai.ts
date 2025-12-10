/**
 * AI generation result
 * 
 * @remarks
 * Raw output from AI provider before parsing/validation
 */
export interface AIGenerationResult {
  /** Raw AI output (typically JSON string) */
  content: string;
  
  /** Generation metadata */
  metadata: {
    model: string;
    provider: string;
    durationMs: number;
    temperature?: number;
    tokensUsed?: number;
    costUsd?: number;
  };
}

/**
 * Parsed AI article response
 * 
 * @remarks
 * Structure expected in AI JSON response.
 */
export interface AIArticleResponse {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
}

/**
 * Article generation template
 * 
 * @remarks
 * Defines category and topic for AI generation
 */
export interface ArticleTemplate {
  categorySlug: string;
  topic: string;
}

/**
 * AI Provider Interface
 * 
 * @remarks
 * Adapter pattern for different AI providers.
 * Implement this interface to add new providers (OpenAI, Replicate, etc.)
 */
export interface AIProvider {
  /**
   * The name of the provider (e.g., 'huggingface', 'openai')
   */
  readonly name: string;
  
  /**
   * Generate text based on a prompt
   * 
   * @param prompt - The generation prompt
   * @returns Generated content with metadata
   */
  generate(prompt: string): Promise<AIGenerationResult>;
  
  /**
   * Check if the provider is available
   * 
   * @returns True if the provider can be used
   */
  isAvailable(): boolean;
}