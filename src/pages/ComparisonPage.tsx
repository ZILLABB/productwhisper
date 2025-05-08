import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheck, FiX, FiAlertCircle, FiPlus, FiSearch } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { useToast } from '../components/common/Toast';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  sentimentScore: number;
  features: {
    [key: string]: {
      value: string;
      score?: number;
    };
  };
  pros: string[];
  cons: string[];
}

const ComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  // Search functionality
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productIds = searchParams.get('ids')?.split(',').filter(id => id) || [];

        if (productIds.length < 2) {
          setError('Please select at least two products to compare');
          setLoading(false);
          return;
        }

        try {
          // Use the API service to fetch product details
          const productPromises = productIds.map(id =>
            apiService.getProductDetails(parseInt(id))
          );

          const productsData = await Promise.all(productPromises);
          setProducts(productsData);

          // Extract all unique features
          const allFeatures = new Set<string>();
          productsData.forEach(product => {
            if (product.features) {
              Object.keys(product.features).forEach(feature => {
                allFeatures.add(feature);
              });
            }
          });

          setFeatures(Array.from(allFeatures));
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Failed to fetch product details from the API');

          // Fallback to mock data for development
          const mockProducts: Product[] = [
            {
              id: 1,
              name: "Premium Wireless Headphones",
              brand: "SoundMaster",
              category: "Electronics",
              description: "Experience crystal-clear audio with our premium wireless headphones.",
              price: 249.99,
              rating: 4.7,
              reviewCount: 1243,
              sentimentScore: 0.85,
              features: {
                "Sound Quality": { value: "Excellent", score: 0.92 },
                "Battery Life": { value: "30 hours", score: 0.88 },
                "Noise Cancellation": { value: "Active", score: 0.90 },
                "Connectivity": { value: "Bluetooth 5.0", score: 0.75 },
                "Comfort": { value: "Memory foam", score: 0.82 },
                "Durability": { value: "High", score: 0.78 },
                "Water Resistance": { value: "IPX4", score: 0.65 }
              },
              pros: ["Exceptional sound clarity", "Long battery life", "Comfortable for extended use"],
              cons: ["Expensive", "Occasional Bluetooth connectivity issues"]
            },
            {
              id: 2,
              name: "Ultra Noise Cancelling Headphones",
              brand: "AudioPro",
              category: "Electronics",
              description: "Block out the world with our advanced noise cancelling technology.",
              price: 299.99,
              rating: 4.5,
              reviewCount: 876,
              sentimentScore: 0.82,
              features: {
                "Sound Quality": { value: "Very Good", score: 0.85 },
                "Battery Life": { value: "25 hours", score: 0.80 },
                "Noise Cancellation": { value: "Advanced", score: 0.95 },
                "Connectivity": { value: "Bluetooth 5.1", score: 0.88 },
                "Comfort": { value: "Protein leather", score: 0.75 },
                "Durability": { value: "Medium", score: 0.70 },
                "Water Resistance": { value: "IPX5", score: 0.78 }
              },
              pros: ["Best-in-class noise cancellation", "Premium build quality", "Great app support"],
              cons: ["Heavy", "Less comfortable for long sessions", "Higher price point"]
            },
            {
              id: 3,
              name: "Sport Wireless Earbuds",
              brand: "FitSound",
              category: "Electronics",
              description: "Designed for active lifestyles with secure fit and water resistance.",
              price: 179.99,
              rating: 4.3,
              reviewCount: 2156,
              sentimentScore: 0.79,
              features: {
                "Sound Quality": { value: "Good", score: 0.78 },
                "Battery Life": { value: "8 hours (24 with case)", score: 0.82 },
                "Noise Cancellation": { value: "Passive", score: 0.60 },
                "Connectivity": { value: "Bluetooth 5.0", score: 0.85 },
                "Comfort": { value: "Silicone tips", score: 0.88 },
                "Durability": { value: "Very High", score: 0.92 },
                "Water Resistance": { value: "IPX7", score: 0.95 }
              },
              pros: ["Excellent for workouts", "Secure fit", "Fully waterproof"],
              cons: ["Average sound quality", "Limited noise isolation"]
            }
          ];

          // Filter products based on IDs from URL
          const filteredProducts = mockProducts.filter(product =>
            productIds.includes(product.id.toString())
          );

          setProducts(filteredProducts);

          // Extract all unique features
          const allFeatures = new Set<string>();
          filteredProducts.forEach(product => {
            Object.keys(product.features).forEach(feature => {
              allFeatures.add(feature);
            });
          });

          setFeatures(Array.from(allFeatures));
        }
      } catch (err) {
        setError('Failed to load product data for comparison');
        console.error('Error fetching products for comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Search for products to add to comparison
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const response = await apiService.searchProducts(searchQuery);
      setSearchResults(response.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
      showToast('error', 'Failed to search products');

      // Fallback mock search results for development
      setSearchResults([
        {
          id: 4,
          name: "Budget Wireless Headphones",
          brand: "ValueAudio",
          category: "Electronics",
          description: "Affordable wireless headphones with decent sound quality.",
          price: 79.99,
          rating: 4.0,
          reviewCount: 3421,
          sentimentScore: 0.72,
          features: {},
          pros: ["Affordable", "Good battery life"],
          cons: ["Average sound quality", "Basic build quality"]
        },
        {
          id: 5,
          name: "Professional Studio Headphones",
          brand: "ProSound",
          category: "Electronics",
          description: "Professional-grade studio headphones for audio production.",
          price: 349.99,
          rating: 4.8,
          reviewCount: 567,
          sentimentScore: 0.91,
          features: {},
          pros: ["Exceptional sound accuracy", "Durable build"],
          cons: ["Expensive", "Requires amplifier for best performance"]
        }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add product to comparison
  const addProduct = (product: Product) => {
    if (products.length >= 4) {
      showToast('warning', 'You can compare up to 4 products at a time');
      return;
    }

    if (products.some(p => p.id === product.id)) {
      showToast('info', 'This product is already in your comparison');
      return;
    }

    // Get current product IDs and add the new one
    const currentIds = searchParams.get('ids')?.split(',').filter(id => id) || [];
    const newIds = [...currentIds, product.id.toString()];

    // Update URL with new product IDs
    setSearchParams({ ids: newIds.join(',') });

    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  // Remove product from comparison
  const removeProduct = (productId: number) => {
    // Get current product IDs and remove the specified one
    const currentIds = searchParams.get('ids')?.split(',').filter(id => id) || [];
    const newIds = currentIds.filter(id => parseInt(id) !== productId);

    if (newIds.length < 2) {
      // If less than 2 products remain, show a message
      showToast('info', 'At least two products are required for comparison');
      return;
    }

    // Update URL with remaining product IDs
    setSearchParams({ ids: newIds.join(',') });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading comparison data..." />
      </div>
    );
  }

  if (error || products.length < 2) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="flex items-center">
            <FiAlertCircle className="mr-2" />
            {error || "Please select at least two products to compare"}
          </p>
        </div>
      </div>
    );
  }

  // Helper function to get sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    if (score >= 0.2) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Hero Section */}
        <div className="relative mb-10 bg-gradient-primary rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary/30 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Product Comparison</h1>
                <p className="text-white/80 text-lg">
                  Compare features, specs, and sentiment across multiple products
                </p>
              </div>

              {/* Add product button */}
              {products.length < 4 && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-6 md:mt-0 flex items-center px-5 py-3 bg-white text-primary rounded-xl hover:bg-gray-100 transition-colors shadow-md"
                >
                  <FiPlus className="mr-2" size={18} />
                  Add Product
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Currently comparing section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex items-center text-gray-700 mb-4">
            <span className="font-medium text-lg">Currently Comparing:</span>
            <span className="ml-2 px-2.5 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {products.length} Products
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {products.map(product => (
              <div
                key={`chip-${product.id}`}
                className="flex items-center bg-gray-100 rounded-full pl-3 pr-1 py-1 text-sm"
              >
                <span className="mr-1">{product.name}</span>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-display font-semibold text-gray-900">Add Product to Compare</h2>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for a product..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </form>

                <div className="max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="medium" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {searchResults.map(product => (
                        <li key={product.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                              <div className="flex items-center mt-1">
                                <p className="text-sm text-gray-500 mr-3">{product.brand}</p>
                                <div className="flex items-center text-sm">
                                  <span className="text-yellow-400 mr-1">★</span>
                                  <span className="text-gray-700">{product.rating.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => addProduct(product)}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery ? (
                    <div className="text-center py-10 px-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <FiSearch className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-500 mb-4">No products found matching "{searchQuery}"</p>
                      <p className="text-sm text-gray-400">Try a different search term or browse popular products below</p>
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <FiSearch className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-500 mb-4">Search for products to compare</p>
                      <p className="text-sm text-gray-400">Try searching for product names, brands, or categories</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-10">
          {/* Product Headers */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_repeat(auto-fill,minmax(220px,1fr))]">
            <div className="bg-gray-50 p-6 font-medium text-gray-700 border-b border-gray-100">
              <h3 className="text-lg font-display font-semibold">Product Details</h3>
            </div>
            {products.map((product, index) => (
              <div key={product.id} className="p-6 border-l border-b border-gray-100 relative">
                {/* Product Image */}
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={`https://source.unsplash.com/random/300x300/?${product.category.toLowerCase()}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="font-bold text-xl mb-1 pr-6 text-gray-900">{product.name}</h2>
                <p className="text-gray-600 text-sm mb-3">{product.brand} • {product.category}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xl text-primary">${product.price.toFixed(2)}</span>
                  <div className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                    product.sentimentScore > 0.7 ? 'bg-green-100 text-green-700' :
                    product.sentimentScore > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <div className="flex items-center">
                      <FiBarChart2 className="mr-1.5" size={14} />
                      <span>{Math.round(product.sentimentScore * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm ml-2">({product.reviewCount.toLocaleString()})</span>
                  </div>

                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove product"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-[220px_repeat(auto-fill,minmax(220px,1fr))]">
              <div className="p-6 font-medium text-gray-700 bg-gray-50">
                <h3 className="text-lg font-display font-semibold">Key Features</h3>
              </div>
              <div className="col-span-full md:col-auto"></div>
            </div>

            {features.map((feature, featureIndex) => (
              <div
                key={feature}
                className={`grid grid-cols-1 md:grid-cols-[220px_repeat(auto-fill,minmax(220px,1fr))] ${
                  featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="p-6 font-medium text-gray-700">
                  {feature}
                </div>
                {products.map((product) => {
                  const featureData = product.features[feature];
                  return (
                    <div key={`${product.id}-${feature}`} className="p-6 border-l border-gray-100">
                      {featureData ? (
                        <div className="space-y-2">
                          <div className="font-medium">{featureData.value}</div>
                          {featureData.score !== undefined && (
                            <div className="flex items-center mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    featureData.score > 0.7 ? 'bg-green-500' :
                                    featureData.score > 0.4 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${featureData.score * 100}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-medium ${getSentimentColor(featureData.score)}`}>
                                {Math.round(featureData.score * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-100">
            {/* Pros Section */}
            <div className="border-r border-gray-100">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h3 className="text-lg font-display font-semibold text-green-600 flex items-center">
                  <FiCheck className="mr-2" /> Pros
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                {products.map((product) => (
                  <div key={`${product.id}-pros`} className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-3">{product.name}</h4>
                    <ul className="space-y-2">
                      {product.pros && product.pros.length > 0 ? (
                        product.pros.map((pro, index) => (
                          <li key={index} className="flex items-start">
                            <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                            <span className="text-gray-700">{pro}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">No pros listed</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Cons Section */}
            <div>
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h3 className="text-lg font-display font-semibold text-red-600 flex items-center">
                  <FiX className="mr-2" /> Cons
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                {products.map((product) => (
                  <div key={`${product.id}-cons`} className="p-6 border-b md:border-b-0 md:border-r border-gray-100 last:border-r-0">
                    <h4 className="font-medium text-gray-900 mb-3">{product.name}</h4>
                    <ul className="space-y-2">
                      {product.cons && product.cons.length > 0 ? (
                        product.cons.map((con, index) => (
                          <li key={index} className="flex items-start">
                            <FiX className="text-red-500 mr-2 mt-1 flex-shrink-0" size={16} />
                            <span className="text-gray-700">{con}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">No cons listed</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation Section */}
          <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">Our Recommendation</h3>
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {products.map((product) => {
                // Calculate a recommendation score based on sentiment, rating, and price
                const recommendationScore = (product.sentimentScore * 0.5) + ((product.rating / 5) * 0.3) + (1 - (product.price / 500) * 0.2);
                const isRecommended = recommendationScore === Math.max(...products.map(p =>
                  (p.sentimentScore * 0.5) + ((p.rating / 5) * 0.3) + (1 - (p.price / 500) * 0.2)
                ));

                return (
                  <div
                    key={`${product.id}-recommendation`}
                    className={`p-4 rounded-lg ${isRecommended ? 'bg-primary/10 border border-primary/20' : 'bg-white border border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      {isRecommended && (
                        <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                          Top Pick
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className={`h-2.5 rounded-full ${isRecommended ? 'bg-primary' : 'bg-gray-400'}`}
                          style={{ width: `${recommendationScore * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {Math.round(recommendationScore * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isRecommended
                        ? `Best overall choice based on sentiment analysis, user ratings, and value for money.`
                        : `Good option with some trade-offs in ${product.sentimentScore < 0.7 ? 'user sentiment' : product.rating < 4.3 ? 'ratings' : 'price'}.`
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ComparisonPage;
