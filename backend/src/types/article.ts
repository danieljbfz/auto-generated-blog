
import { Author } from "./author.js";
import { Category } from "./category.js";
import { Tag } from "./tag.js";
import { PaginatedResponse } from "./paginated.js";

/**
 * The Publishing Workflow
 *
 * Defines the specific stages an article must pass through during its lifecycle.
 * Each value acts as a strict logic gate. For example, an article cannot be
 * published unless it is in the "published" state.
 */
export enum ArticleStatus {
  DRAFT = "draft",          // Not yet ready for publication.
  SCHEDULED = "scheduled",  // Ready to be published in the future.
  PUBLISHED = "published",  // Live and visible to the public.
  ARCHIVED = "archived",    // No longer public, but kept for records.
}

/**
 * Article Statistics
 *
 * Separated from main article content to prevent database row-locking during
 * high-traffic periods and enable independent scaling.
 * 
 * Aggregate stats in memory/cache (Redis is perfect for this) and flush to 
 * the database periodically (e.g., every 5 minutes or every 100 views).
 */
export interface ArticleStats {
  articleId?: string;
  views: bigint;
  // likes: number;
  // shares?: number;
  // comments?: number;
  updatedAt: Date;
}

/**
 * The Article Model
 *
 * Complete representation of an article in the application layer. Connects
 * the content (what was written) to the context (who wrote it, where it 
 * belongs, and how it should be displayed).
 */
export interface Article {
  id: string;

  // Relationships
  authorId: string;
  categoryId: string;

  // Auditing
  // reviewedBy?: string;
  // reviewedAt?: string;
  // isHumanEdited?: boolean;

  // Identity
  title: string;
  slug: string;                     // The URL-friendly version of the title.
  excerpt?: string | null;          // A short summary used in cards or search results.

  // Content Strategy
  body: string;                     // The main content of the article (Markdown).

  // Visuals
  featuredImage?: string | null;    // URL to the hero image.
  imageAlt?: string | null;         // Alt text for accessibility and SEO.

  // Workflow
  status: string | ArticleStatus;

  // SEO & Settings
  metadata: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    // Easy to extend later (ogImage, robots, etc.) without breaking the schema.
    [key: string]: any;
  };

  // AI Provenance
  generatedBy?: {
    model: string;                      // e.g. "grok-4", "claude-3.5-sonnet", etc.
    provider: string;                   // e.g. "openai", "huggingface", "ollama", etc.
    promptHash?: string;                // SHA-256 hex digest of the final prompt (used for deduping).
    temperature?: number;               // Sampling temperature (0.0-2.0).
    tokensUsed?: number;                // Number of tokens used by the model.
    durationMs?: number;                // Inference duration in milliseconds.
    costUsd?: number;                   // Exact cost in USD.
    topic?: string;                     // The topic of the article.
  };

  // Metrics
  readingTimeMinutes?: number | null;   // Estimated reading time in minutes.
  wordCount?: number | null;            // Number of words in the article body.
  seoScore?: number| null;              // SEO quality score (0-100).

  // Timeline
  scheduledPublishAt?: Date | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Computed/Joined Fields (populated at runtime)
  author?: Author;
  category?: Category;
  tags?: Tag[];
  stats?: ArticleStats | null;
}

/**
 * Article Creation Input (DTO)
 *
 * Minimal data required to start a new draft. Users can begin writing
 * immediately without worrying about SEO, images, or scheduling.
 */
export interface CreateArticleDTO {
  authorId: string;
  categoryId: string;
  title: string;
  // slug is often generated from the name.
  slug?: string;
  excerpt?: string;
  body: string;
  status?: ArticleStatus;
  tags?: string[];      // Array of Tag IDs.
  // Everything else (images, SEO, schedule) can come in a follow-up update.
}

/**
 * Article Update Input (DTO)
 *
 * Partial update allowing most fields to change. Excludes system-managed
 * and immutable fields (id, authorId, createdAt, updatedAt).
 */
export interface UpdateArticleDTO extends Partial<Omit<Article, 'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'stats'>> {
  tagIds?: string[];    // To replace the existing tags.
}

/**
 * Article Query Options
 * 
 * Used for filtering, sorting, and pagination when fetching articles.
 * Designed to be serializable (URL-safe) and extensible.
 */
export interface ArticleQueryOptions {
  // Filtering
  status?: ArticleStatus | ArticleStatus[];
  categoryId?: string | null;
  authorId?: string;
  tagIds?: string[];
  publishedAfter?: string;
  publishedBefore?: string;
  
  // Search
  searchTerm?: string;    // Searches against title, excerpt, and body.
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'views' | 'trending';
  sortOrder?: 'asc' | 'desc';
  
  // Includes
  includeCategory?: boolean;
  includeTags?: boolean;
  includeStats?: boolean;
  includeAuthor?: boolean;
}

/**
 * Paginated Articles
 * 
 * The specific response shape for fetching a list of articles, including
 * pagination details for navigating the dataset.
 */
export type PaginatedArticles = PaginatedResponse<Article>;


/* 
 * TODO:
 * Content Blocks (e.g., Code Snippets, Embeds, etc.)
 * Article Versioning and History
 * Related Articles
 */