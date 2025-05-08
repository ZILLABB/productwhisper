import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBarChart2,
  FiHeart,
  FiShare2,
  FiShoppingCart,
  FiInfo,
  FiCheck,
  FiX,
  FiTrendingUp,
  FiMessageCircle,
  FiList,
  FiThumbsUp
} from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import useApi from '../hooks/useApi';
import ApiErrorFallback from '../components/common/ApiErrorFallback';
import LazyImage from '../components/common/LazyImage';
import SentimentChart from '../components/product/SentimentChart';
import ReviewCard from '../components/product/ReviewCard';

// Import types from API
import type { Product } from '../types/api';

// Use the Product interface from API for our component
interface ProductData extends Product {
  // Add any additional properties needed for the component
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  // Use the useApi hook to fetch product data with caching
  const { data: product, loading, error, refetch } = useApi<ProductData>(
    () => apiService.getProductDetails(parseInt(id || '1')),
    {
      cacheKey: `product-${id}`,
      dependencies: [id],
      onError: (err) => console.error('Error fetching product:', err)
    }
  );

  // Memoize the sentiment color function to prevent unnecessary recalculations
  const getSentimentColor = useMemo(() => (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    if (score >= 0.2) return 'text-orange-500';
    return 'text-red-500';
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ApiErrorFallback
          error={error instanceof Error ? error : new Error(String(error))}
          message="We couldn't load this product's information."
          retry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Product Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
              <p className="text-gray-600 mt-1">By {product.brand} • {product.category}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="flex items-center mr-4">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="font-semibold">{product.rating}</span>
                <span className="text-gray-500 ml-1">({product.reviewCount} reviews)</span>
              </div>
              <div className={`flex items-center ${getSentimentColor(product.sentimentScore)}`}>
                <FiBarChart2 className="mr-1" />
                <span className="font-semibold">{Math.round(product.sentimentScore * 100)}%</span>
                <span className="text-gray-500 ml-1">sentiment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
          {/* Product Image */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <motion.div
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 aspect-square"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <LazyImage
                  src={product.imageUrl || "https://via.placeholder.com/600x600?text=Product+Image"}
                  alt={product.name || "Product Image"}
                  className="w-full h-full object-cover"
                  fallbackSrc="https://via.placeholder.com/600x600?text=Product+Image"
                />
              </motion.div>

              <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {product.originalPrice && (
                      <span className="text-gray-500 line-through text-sm mr-2">${product.originalPrice.toFixed(2)}</span>
                    )}
                    <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        Save ${(product.originalPrice - product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Add to favorites"
                    >
                      <FiHeart size={18} />
                    </motion.button>
                    <motion.button
                      className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Share product"
                    >
                      <FiShare2 size={18} />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.button
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center shadow-sm transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiShoppingCart className="mr-2" size={18} />
                    Add to Cart
                  </motion.button>

                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <FiInfo size={14} className="mr-1.5" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>
              </div>

              {/* Sentiment Summary Card */}
              <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-full mr-3 ${
                    product.sentimentScore > 0.7 ? 'bg-green-100 text-green-700' :
                    product.sentimentScore > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <FiBarChart2 size={18} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">Sentiment Summary</h3>
                </div>

                {/* Use SentimentChart component */}
                <SentimentChart score={product.sentimentScore} size="lg" />

                <div className="space-y-3 mt-4">

                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700 block mb-2">Top Strengths</span>
                    <div className="space-y-1.5">
                      {product.positiveAttributes?.slice(0, 3).map((attr, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <FiCheck className="text-green-500 mr-1.5 flex-shrink-0" size={14} />
                          <span className="text-gray-600">{attr.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-7">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <nav className="flex border-b border-gray-100">
                {[
                  { id: 'overview', label: 'Overview', icon: FiInfo },
                  { id: 'sentiment', label: 'Sentiment Analysis', icon: FiBarChart2 },
                  { id: 'specifications', label: 'Specifications', icon: FiList },
                  { id: 'reviews', label: 'Reviews', icon: FiMessageCircle }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-4 font-medium text-sm flex items-center flex-1 justify-center transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary/5 text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="mr-2" size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary mr-3">
                      <FiInfo size={18} />
                    </div>
                    <h2 className="text-xl font-semibold font-display text-gray-900">Product Overview</h2>
                  </div>

                  <p className="text-gray-700 mb-8 leading-relaxed">{product.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                      <h3 className="font-semibold text-lg mb-4 text-green-700 flex items-center">
                        <FiCheck className="mr-2" />
                        What People Love
                      </h3>
                      <ul className="space-y-3">
                        {product.positiveAttributes?.map((attr, index) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-white p-1 rounded-full text-green-500 mr-3 mt-0.5 shadow-sm">
                              <FiCheck size={14} />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{attr.name}</span>
                              <div className="flex items-center mt-1">
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                                  <div
                                    className="bg-green-500 h-1.5 rounded-full"
                                    style={{ width: `${attr.score * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{attr.mentions} mentions</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                      <h3 className="font-semibold text-lg mb-4 text-red-700 flex items-center">
                        <FiX className="mr-2" />
                        Common Complaints
                      </h3>
                      <ul className="space-y-3">
                        {product.negativeAttributes?.map((attr, index) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-white p-1 rounded-full text-red-500 mr-3 mt-0.5 shadow-sm">
                              <FiX size={14} />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{attr.name}</span>
                              <div className="flex items-center mt-1">
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                                  <div
                                    className="bg-red-500 h-1.5 rounded-full"
                                    style={{ width: `${(1 - attr.score) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{attr.mentions} mentions</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'sentiment' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary mr-3">
                      <FiBarChart2 size={18} />
                    </div>
                    <h2 className="text-xl font-semibold font-display text-gray-900">Sentiment Analysis</h2>
                  </div>

                  <p className="text-gray-700 mb-6">
                    Our AI has analyzed {product.reviewCount.toLocaleString()} reviews to understand what users really think about this product.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Overall Sentiment Card */}
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-gray-100">
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">Overall Sentiment</h3>

                      <div className="flex items-center justify-center mb-6">
                        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-8 ${
                          product.sentimentScore > 0.7 ? 'border-green-500 text-green-700' :
                          product.sentimentScore > 0.4 ? 'border-yellow-500 text-yellow-700' :
                          'border-red-500 text-red-700'
                        }`}>
                          <span className="text-3xl font-bold">{Math.round(product.sentimentScore * 100)}%</span>
                          <div className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md">
                            <FiBarChart2 size={18} className={
                              product.sentimentScore > 0.7 ? 'text-green-500' :
                              product.sentimentScore > 0.4 ? 'text-yellow-500' :
                              'text-red-500'
                            } />
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-gray-700 text-sm">
                        <p>Based on {product.reviewCount.toLocaleString()} verified reviews</p>
                        <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Sentiment Distribution */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">Sentiment Distribution</h3>

                      <div className="space-y-4">
                        {[
                          { label: 'Very Positive', percentage: 65, color: 'bg-green-500' },
                          { label: 'Positive', percentage: 20, color: 'bg-green-300' },
                          { label: 'Neutral', percentage: 8, color: 'bg-gray-300' },
                          { label: 'Negative', percentage: 5, color: 'bg-red-300' },
                          { label: 'Very Negative', percentage: 2, color: 'bg-red-500' }
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{item.label}</span>
                              <span className="font-medium text-gray-900">{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${item.color}`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Over Time */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">Sentiment Trends</h3>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiTrendingUp className="mr-1" />
                        <span>Last 6 months</span>
                      </div>
                    </div>

                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                      <p className="text-gray-500">Sentiment trend visualization would appear here</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary mr-3">
                      <FiList size={18} />
                    </div>
                    <h2 className="text-xl font-semibold font-display text-gray-900">Product Specifications</h2>
                  </div>

                  <p className="text-gray-700 mb-6">
                    Detailed technical specifications for the {product.name}.
                  </p>

                  <div className="space-y-6">
                    {product.specifications?.map((specGroup, groupIndex) => (
                      <div key={groupIndex} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                          <h3 className="font-medium text-gray-900">{specGroup.category}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {specGroup.items.map((spec, specIndex) => (
                            <div key={specIndex} className="px-6 py-4 flex flex-wrap">
                              <div className="w-full sm:w-1/3 text-gray-500 text-sm mb-1 sm:mb-0">{spec.name}</div>
                              <div className="w-full sm:w-2/3 text-gray-900 font-medium">{spec.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-500 flex items-center">
                    <FiInfo className="mr-2 flex-shrink-0" />
                    <p>Specifications are provided by the manufacturer and may vary by region or model variant.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full text-primary mr-3">
                        <FiMessageCircle size={18} />
                      </div>
                      <h2 className="text-xl font-semibold font-display text-gray-900">Customer Reviews</h2>
                    </div>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">{product.rating}</span>
                      <span className="text-gray-500 ml-1">({product.reviewCount.toLocaleString()})</span>
                    </div>
                  </div>

                  {/* Review Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">All Reviews</button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button key={rating} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        {rating} {rating === 1 ? 'Star' : 'Stars'}
                      </button>
                    ))}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {product.reviews?.map((review) => (
                      <ReviewCard
                        key={review.id}
                        id={review.id.toString()}
                        author={review.user}
                        date={review.date}
                        rating={review.rating}
                        title={review.title}
                        content={review.comment}
                        sentimentScore={review.sentiment}
                        verified={true}
                        helpfulCount={review.helpful}
                        unhelpfulCount={0}
                        onMarkHelpful={() => console.log('Marked as helpful', review.id)}
                        onMarkUnhelpful={() => console.log('Marked as unhelpful', review.id)}
                        onReport={() => console.log('Reported review', review.id)}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  <div className="mt-8 text-center">
                    <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Load More Reviews
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold font-display text-gray-900">Related Products</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="aspect-square bg-gray-100">
                    <LazyImage
                      src={relatedProduct.imageUrl || "https://via.placeholder.com/300x300?text=Related+Product"}
                      alt={relatedProduct.name || "Related Product"}
                      className="w-full h-full object-cover"
                      fallbackSrc="https://via.placeholder.com/300x300?text=Related+Product"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">${relatedProduct.price.toFixed(2)}</span>
                      <Link
                        to={`/product/${relatedProduct.id}`}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
