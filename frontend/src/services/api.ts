import axios, { AxiosError, AxiosInstance } from 'axios';
import type { Article, PaginatedArticles, Category, Tag, Author, ApiResponse } from '../types';

// Base API URL (from environment or default)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create Axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Request Interceptor for adding auth tokens
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor for handling errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from ApiResponse wrapper
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data?.error;
      return Promise.reject({
        message: apiError?.message || 'An error occurred',
        statusCode: error.response.status,
        ...apiError,
      });
    }
    
    if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        statusCode: 0,
      });
    }
    
    // Request setup error
    return Promise.reject({
      message: error.message || 'Request failed',
      statusCode: 0,
    });
  }
);

/**
 * API Service
 * 
 * Typed methods for all API endpoints.
 */
export const api = {
  // -------------------------------------------------------------------------
  // Articles
  // -------------------------------------------------------------------------
  
  /**
   * Get published articles feed
   */
  getArticlesFeed: (page = 1, limit = 10) => {
    return apiClient.get<ApiResponse<PaginatedArticles>, PaginatedArticles>(
      `/articles/feed?page=${page}&limit=${limit}`
    );
  },
  
  /**
   * Get article by slug
   */
  getArticleBySlug: (slug: string) => {
    return apiClient.get<ApiResponse<Article>, Article>(`/articles/by-slug/${slug}`);
  },
  
  /**
   * Get article by ID
   */
  getArticleById: (id: string) => {
    return apiClient.get<ApiResponse<Article>, Article>(`/articles/${id}`);
  },
  
  /**
   * Search articles with filters
   */
  searchArticles: (params: {
    searchTerm?: string;
    categoryId?: string;
    tagIds?: string[];
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])
    ).toString();
    
    return apiClient.get<ApiResponse<PaginatedArticles>, PaginatedArticles>(
      `/articles?${queryString}`
    );
  },
  
  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  
  /**
   * Get all categories (flat list)
   */
  getCategories: () => {
    return apiClient.get<ApiResponse<Category[]>, Category[]>('/categories');
  },
  
  /**
   * Get category tree (hierarchical)
   */
  getCategoryTree: () => {
    return apiClient.get<ApiResponse<Category[]>, Category[]>('/categories/tree');
  },
  
  /**
   * Get category by ID
   */
  getCategoryById: (id: string) => {
    return apiClient.get<ApiResponse<Category>, Category>(`/categories/${id}`);
  },
  
  // -------------------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------------------
  
  /**
   * Get all tags
   */
  getTags: () => {
    return apiClient.get<ApiResponse<Tag[]>, Tag[]>('/tags');
  },
  
  /**
   * Get popular tags
   */
  getPopularTags: (limit = 20) => {
    return apiClient.get<ApiResponse<Tag[]>, Tag[]>(`/tags/popular?limit=${limit}`);
  },
  
  // -------------------------------------------------------------------------
  // Authors
  // -------------------------------------------------------------------------
  
  /**
   * Get all authors
   */
  getAuthors: () => {
    return apiClient.get<ApiResponse<Author[]>, Author[]>('/authors');
  },
  
  /**
   * Get author by slug
   */
  getAuthorBySlug: (slug: string) => {
    return apiClient.get<ApiResponse<Author>, Author>(`/authors/by-slug/${slug}`);
  },
};

export default apiClient;