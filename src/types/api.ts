/**
 * Product interface
 */
export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  sentimentScore: number;
  imageUrl?: string;
  features: {
    [key: string]: {
      value: string;
      score?: number;
    };
  };
  positiveAttributes?: ProductAttribute[];
  negativeAttributes?: ProductAttribute[];
  pros: string[];
  cons: string[];
  specifications?: ProductSpecification[];
  reviews?: ProductReview[];
  relatedProducts?: RelatedProduct[];
}

/**
 * Product attribute interface
 */
export interface ProductAttribute {
  name: string;
  score: number;
  mentions: number;
}

/**
 * Product specification interface
 */
export interface ProductSpecification {
  category: string;
  items: { name: string; value: string }[];
}

/**
 * Product review interface
 */
export interface ProductReview {
  id: number;
  user: string;
  date: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  sentiment: number;
}

/**
 * Related product interface
 */
export interface RelatedProduct {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
}

/**
 * Search filters interface
 */
export interface SearchFilters {
  category?: string;
  subcategory?: string;
  brand?: string[];
  priceRange?: [number, number];
  rating?: number;
  sentimentScore?: number;
  sortBy?: 'price' | 'rating' | 'sentiment' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search result interface
 */
export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    categories: { name: string; count: number }[];
    subcategories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRange: [number, number];
  };
}

/**
 * Trend data interface
 */
export interface TrendData {
  sentimentTrends: {
    period: string;
    data: {
      category: string;
      sentiment: number;
    }[];
  }[];
  mentionCounts: {
    category: string;
    count: number;
  }[];
  aspectAnalysis: {
    aspect: string;
    sentiment: number;
    mentions: number;
  }[];
}

/**
 * User interface
 */
export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Auth tokens interface
 */
export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  createdAt: Date;
}
