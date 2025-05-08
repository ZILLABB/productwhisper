/**
 * Tag model interface
 */
export interface Tag {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
}

/**
 * Product-Tag relationship interface
 */
export interface ProductTag {
  id: number;
  product_id: number;
  tag_id: number;
  created_at: Date;
}

/**
 * Tag creation DTO
 */
export interface CreateTagDTO {
  name: string;
  description?: string;
}

/**
 * Tag update DTO
 */
export interface UpdateTagDTO {
  name?: string;
  description?: string;
}
