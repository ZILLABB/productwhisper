import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '../services/api';

// Product type
interface Product {
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

// Search filters type
interface SearchFilters {
  minScore?: number;
  sources?: string[];
  minConfidence?: number;
  sortBy?: 'score' | 'confidence' | 'mentions';
  category?: string;
  brand?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
}

// Recent search type
interface RecentSearch {
  id: number;
  query: string;
  created_at: string;
  results_count: number;
}

// Search context type
interface SearchContextType {
  searchResults: Product[];
  recentSearches: RecentSearch[];
  popularSearches: { query: string; count: number }[];
  favorites: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: SearchFilters;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  updateFilters: (newFilters: SearchFilters) => void;
  clearFilters: () => void;
  loadRecentSearches: () => Promise<void>;
  loadPopularSearches: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  addFavorite: (productId: number) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
}

// Create context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Search provider props
interface SearchProviderProps {
  children: ReactNode;
}

// Default filters
const defaultFilters: SearchFilters = {
  minScore: 0,
  sortBy: 'score',
};

// Search provider component
export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  // Search function
  const search = async (query: string, newFilters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    setSearchQuery(query);

    const searchFilters = newFilters || filters;

    try {
      const data = await apiService.searchProducts(query, searchFilters);
      setSearchResults(data.results);

      // Update filters if new ones were provided
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters: SearchFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // If there's an active search query, re-run the search
    if (searchQuery) {
      search(searchQuery, updatedFilters);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters(defaultFilters);

    // If there's an active search query, re-run the search
    if (searchQuery) {
      search(searchQuery, defaultFilters);
    }
  };

  // Load recent searches
  const loadRecentSearches = async () => {
    try {
      const data = await apiService.getRecentSearches();
      setRecentSearches(data);
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  };

  // Load popular searches
  const loadPopularSearches = async () => {
    try {
      const data = await apiService.getPopularSearches();
      setPopularSearches(data);
    } catch (err) {
      console.error('Failed to load popular searches:', err);
    }
  };

  // Load favorites
  const loadFavorites = async () => {
    try {
      const data = await apiService.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  // Add favorite
  const addFavorite = async (productId: number) => {
    try {
      await apiService.addFavorite(productId);
      await loadFavorites();
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  };

  // Remove favorite
  const removeFavorite = async (productId: number) => {
    try {
      await apiService.removeFavorite(productId);
      await loadFavorites();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  // Check if product is in favorites
  const isFavorite = (productId: number): boolean => {
    return favorites.some(fav => fav.product_id === productId);
  };

  // Context value
  const value = {
    searchResults,
    recentSearches,
    popularSearches,
    favorites,
    loading,
    error,
    searchQuery,
    filters,
    search,
    updateFilters,
    clearFilters,
    loadRecentSearches,
    loadPopularSearches,
    loadFavorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

// Custom hook to use search context
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }

  return context;
};
