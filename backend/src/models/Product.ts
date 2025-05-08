/**
 * Product model interface
 */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  external_ids: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
  price: number | null;
  brand: string | null;
  average_rating: number | null;
}

/**
 * Product scores model interface
 */
export interface ProductScore {
  id: number;
  product_id: number;
  overall_score: number | null;
  reddit_score: number | null;
  amazon_score: number | null;
  youtube_score: number | null;
  confidence_score: number | null;
  sample_size: number | null;
  last_updated: Date;
}

/**
 * Product mention model interface
 */
export interface ProductMention {
  id: number;
  product_id: number;
  source: string;
  source_id: string;
  content: string | null;
  sentiment_score: number | null;
  url: string | null;
  created_at: Date | null;
  processed_at: Date;
}

/**
 * Product creation DTO
 */
export interface CreateProductDTO {
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  external_ids?: Record<string, any>;
  price?: number;
  brand?: string;
}

/**
 * Product update DTO
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  category?: string;
  image_url?: string;
  external_ids?: Record<string, any>;
  price?: number;
  brand?: string;
  average_rating?: number;
}

/**
 * Product with scores and mentions response DTO
 */
export interface ProductDetailDTO extends Product {
  scores: ProductScore | null;
  mentions: ProductMention[];
  tags: string[];
}
