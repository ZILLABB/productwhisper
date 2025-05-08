/**
 * User search model interface
 */
export interface UserSearch {
  id: number;
  user_id: number;
  query: string;
  created_at: Date;
  results_count: number | null;
}

/**
 * User favorite model interface
 */
export interface UserFavorite {
  id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
}

/**
 * Search request DTO
 */
export interface SearchRequestDTO {
  query: string;
  filters?: {
    minScore?: number;
    sources?: string[];
    minConfidence?: number;
    sortBy?: 'score' | 'confidence' | 'mentions';
    category?: string;
    brand?: string;
    tags?: string[];
    priceMin?: number;
    priceMax?: number;
  };
}

/**
 * Search response DTO
 */
export interface SearchResponseDTO {
  query: string;
  results_count: number;
  results: ProductDetailDTO[];
}

/**
 * Product detail for search results
 */
interface ProductDetailDTO {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  brand: string | null;
  price: number | null;
  average_rating: number | null;
  scores: {
    overall: number;
    reddit: number;
    amazon: number;
    youtube: number;
    confidence: number;
    sample_size: number;
  };
  sources: string[];
  tags: string[];
}
