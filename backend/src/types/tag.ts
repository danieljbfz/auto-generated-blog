/**
 * Article Tags
 * 
 * Flat keywords for associating articles with shared themes. Helps readers
 * discover related material across categories.
 */
export interface Tag {
  id: string;
  slug: string;           // URL-friendly version (e.g. "react-hooks")
  name: string;           // Human-readable label (e.g. "React Hooks") 
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tag Creation Input (DTO)
 * 
 * Minimal data required to create a new tag.
 */
export interface CreateTagDTO {
  name: string;
  slug?: string;
}

/**
 * Tag Update Input (DTO)
 * 
 * Partial update allowing most fields to change. Excludes system-managed
 * and immutable fields (id, createdAt, updatedAt).
 */
export interface UpdateTagDTO {
  name?: string
  slug?: string;
}
