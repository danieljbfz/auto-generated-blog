/**
 * Frontend Types
 *
 * @remarks
 * We need to keep these in sync with the backend.
 */

export enum ArticleStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  slug: string;
  name: string;
  role?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  type: 'ai' | 'human';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleStats {
  articleId?: string;
  views: number;
  updatedAt: string;
}

export interface Article {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  featuredImage?: string | null;
  imageAlt?: string | null;
  status: ArticleStatus | string;
  metadata: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    [key: string]: any;
  };
  generatedBy?: {
    model: string;
    provider: string;
    promptHash?: string;
    temperature?: number;
    tokensUsed?: number;
    durationMs?: number;
    costUsd?: number;
    topic?: string;
  };
  readingTimeMinutes?: number | null;
  wordCount?: number | null;
  seoScore?: number | null;
  scheduledPublishAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations (populated in responses)
  author?: Author;
  category?: Category;
  tags?: Tag[];
  stats?: ArticleStats | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export type PaginatedArticles = PaginatedResponse<Article>;

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode: number;
    metadata?: Record<string, any>;
  };
}

// Paginated API Response
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}