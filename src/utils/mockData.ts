/**
 * Mock data utilities for ProductWhisper
 * 
 * This file contains mock data and utility functions for generating mock data
 * to be used as fallbacks when API calls fail or during development.
 */

import { Product, TrendData, SearchResult } from '../types/api';

/**
 * Generate a mock product with the given ID
 */
export const getMockProduct = (id: number): Product => {
  return {
    id,
    name: `Premium Product ${id}`,
    brand: id % 2 === 0 ? "SoundMaster" : "AudioPro",
    description: "Experience crystal-clear audio with our premium wireless headphones. Featuring industry-leading active noise cancellation, 30-hour battery life, and comfortable over-ear design for extended listening sessions.",
    price: 199.99 + (id * 10),
    originalPrice: 249.99 + (id * 10),
    rating: 4.0 + (Math.random() * 1.0),
    reviewCount: 500 + (id * 50),
    sentimentScore: 0.7 + (Math.random() * 0.2),
    imageUrl: `https://source.unsplash.com/random/600x600/?electronics&sig=${id}`,
    category: "Electronics",
    subcategory: "Audio",
    features: {
      "Sound Quality": { value: "Excellent", score: 0.92 },
      "Battery Life": { value: "30 hours", score: 0.88 },
      "Comfort": { value: "Very Good", score: 0.87 },
      "Noise Cancellation": { value: "Excellent", score: 0.90 },
      "Build Quality": { value: "Premium", score: 0.85 },
      "Connectivity": { value: "Bluetooth 5.0", score: 0.82 }
    },
    positiveAttributes: [
      { name: "Sound quality", score: 0.92, mentions: 987 },
      { name: "Battery life", score: 0.89, mentions: 845 },
      { name: "Comfort", score: 0.87, mentions: 756 }
    ],
    negativeAttributes: [
      { name: "Price", score: 0.42, mentions: 345 },
      { name: "Bluetooth connectivity", score: 0.38, mentions: 187 }
    ],
    pros: ["Exceptional sound clarity", "Long battery life", "Comfortable for extended use", "Effective noise cancellation"],
    cons: ["Expensive", "Occasional Bluetooth connectivity issues", "Bulky case"],
    specifications: [
      {
        category: "Audio",
        items: [
          { name: "Driver Size", value: "40mm" },
          { name: "Frequency Response", value: "4Hz-40,000Hz" },
          { name: "Impedance", value: "32 ohms" }
        ]
      },
      {
        category: "Battery",
        items: [
          { name: "Battery Life", value: "30 hours (ANC on)" },
          { name: "Charging Time", value: "3 hours" },
          { name: "Quick Charge", value: "5 hours playback from 10 min charge" }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        user: "AudioEnthusiast",
        date: "2023-10-15",
        rating: 5,
        title: "Best headphones I've ever owned",
        comment: "The sound quality is absolutely incredible, and the noise cancellation is on another level.",
        helpful: 42,
        sentiment: 0.95
      },
      {
        id: 2,
        user: "CasualListener",
        date: "2023-09-22",
        rating: 4,
        title: "Great sound but pricey",
        comment: "These headphones sound amazing and are very comfortable, but they are quite expensive compared to competitors.",
        helpful: 28,
        sentiment: 0.75
      }
    ],
    relatedProducts: [
      { id: id + 1, name: "SoundMaster True Wireless Earbuds", imageUrl: "https://source.unsplash.com/random/300x300/?earbuds", price: 149.99 },
      { id: id + 2, name: "AudioPro Studio Headphones", imageUrl: "https://source.unsplash.com/random/300x300/?headphones", price: 199.99 },
      { id: id + 3, name: "SoundMaster Bluetooth Speaker", imageUrl: "https://source.unsplash.com/random/300x300/?speaker", price: 129.99 }
    ]
  };
};

/**
 * Generate mock trending products
 */
export const getMockTrendingProducts = (limit: number = 6): Product[] => {
  return Array(limit).fill(0).map((_, index) => ({
    id: index + 1,
    name: `Trending Product ${index + 1}`,
    brand: index % 2 === 0 ? "SoundMaster" : "AudioPro",
    category: "Electronics",
    description: "A popular trending product with great features and excellent user reviews.",
    price: 99.99 + (index * 20),
    rating: 4.0 + (Math.random() * 1.0),
    reviewCount: 100 + (index * 50),
    sentimentScore: 0.7 + (Math.random() * 0.2),
    imageUrl: `https://source.unsplash.com/random/300x300/?electronics&sig=${index}`,
    features: {
      "Quality": { value: "Good", score: 0.8 }
    },
    pros: ["Popular", "Good value"],
    cons: ["Limited availability"]
  }));
};

/**
 * Generate mock search results
 */
export const getMockSearchResults = (query: string): SearchResult => {
  const products = Array(5).fill(0).map((_, index) => ({
    id: index + 1,
    name: `${query} Product ${index + 1}`,
    brand: index % 2 === 0 ? "SoundMaster" : "AudioPro",
    category: "Electronics",
    description: `High-quality ${query} with premium features and excellent performance.`,
    price: 149.99 + (index * 50),
    rating: 4.0 + (Math.random() * 1.0),
    reviewCount: 200 + (index * 100),
    sentimentScore: 0.7 + (Math.random() * 0.2),
    imageUrl: `https://source.unsplash.com/random/300x300/?${query.toLowerCase()}&sig=${index}`,
    features: {
      "Quality": { value: "Excellent", score: 0.85 },
      "Design": { value: "Premium", score: 0.9 }
    },
    pros: ["Great quality", "Premium design"],
    cons: ["Premium price"]
  }));

  return {
    products,
    total: products.length,
    page: 1,
    pageSize: 10,
    filters: {
      categories: [{ name: "Electronics", count: products.length }],
      subcategories: [{ name: "Audio", count: products.length }],
      brands: [
        { name: "SoundMaster", count: Math.ceil(products.length / 2) },
        { name: "AudioPro", count: Math.floor(products.length / 2) }
      ],
      priceRange: [149.99, 349.99]
    }
  };
};

/**
 * Helper function to get number of days from period
 */
export const getPeriodDays = (period: string): number => {
  switch (period) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return 30;
    case 'quarter': return 90;
    case 'year': return 365;
    default: return 30;
  }
};

/**
 * Generate mock trend data
 */
export const getMockTrendData = (productId: number, period: string): any => {
  const days = getPeriodDays(period);
  
  // Generate mock sentiment trend data
  const generateMockTrendData = (days: number) => {
    const data = [];
    const today = new Date();
    let baseValue = 0.7 + Math.random() * 0.1;

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const randomChange = (Math.random() - 0.5) * 0.05;
      baseValue = Math.max(0, Math.min(1, baseValue + randomChange));

      data.push({
        date: date.toISOString().split('T')[0],
        value: baseValue,
        confidence: 0.8 + (Math.random() * 0.15)
      });
    }
    return data;
  };

  // Generate mock mention data
  const generateMockMentionData = (days: number) => {
    const data = [];
    const today = new Date();
    let baseMentions = 100 + Math.floor(Math.random() * 50);

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const mentionChange = Math.floor((Math.random() - 0.5) * 20);
      baseMentions = Math.max(50, baseMentions + mentionChange);

      data.push({
        date: date.toISOString().split('T')[0],
        value: baseMentions,
        confidence: 0.9
      });
    }
    return data;
  };

  // Generate mock aspect data
  const generateMockAspectData = (days: number) => {
    const data = [];
    const today = new Date();
    const aspects = ['quality', 'price', 'design', 'performance', 'support'];

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const aspectData = {};

      aspects.forEach(aspect => {
        aspectData[aspect] = {
          count: 10 + Math.floor(Math.random() * 40),
          sentiment: 0.4 + Math.random() * 0.5
        };
      });

      data.push({
        date: date.toISOString().split('T')[0],
        aspects: aspectData
      });
    }
    return data;
  };

  // Return mock trend data
  return {
    product_id: productId,
    period: period,
    sentiment: {
      product_id: productId,
      trend_type: 'sentiment',
      period: period,
      data_points: generateMockTrendData(days)
    },
    mentions: {
      product_id: productId,
      trend_type: 'mentions',
      period: period,
      data_points: generateMockMentionData(days)
    },
    aspects: {
      product_id: productId,
      trend_type: 'aspects',
      period: period,
      data_points: generateMockAspectData(days)
    }
  };
};
