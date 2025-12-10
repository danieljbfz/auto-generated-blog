/**
 * Paginated Response Wrapper
 * 
 * A consistent format for API responses that return a list of items along
 * with metadata for navigating large datasets.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}