import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useApi from '../hooks/useApi';
import ApiErrorFallback from '../components/common/ApiErrorFallback';
import AnimatedCircles from '../components/ui/AnimatedCircles';
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/components';

interface TrendingProduct {
  id: number;
  name: string;
  description: string;
  brand: string;
  category: string;
  score: number;
  mention_count: number;
}

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // References for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);

  // Check if sections are in view
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.3 });
  const trendingInView = useInView(trendingRef, { once: false, amount: 0.3 });

  // Use the useApi hook to fetch trending products with caching
  const { data, loading, error, refetch } = useApi(
    () => apiService.getTrendingProducts(6),
    {
      cacheKey: 'trending-products',
      cacheDuration: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Map the Product[] to TrendingProduct[] format
  const trendingProducts: TrendingProduct[] = data ? data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    brand: product.brand || '',
    category: product.category || '',
    score: product.sentimentScore || 0,
    mention_count: product.reviewCount || 0
  })) : [];

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero section */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-primary rounded-premium shadow-premium overflow-hidden mb-12"
      >
        <AnimatedCircles variant="primary" count={20} className="z-0" />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-28 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="font-display text-5xl font-bold text-white sm:text-6xl sm:tracking-tight lg:text-7xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Discover What People <span className="text-yellow-300">Really Think</span>
            </motion.h1>
            <motion.p
              className="mt-8 text-xl font-light text-white leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              ProductWhisper analyzes thousands of reviews and comments to give you the real story behind products, helping you make informed decisions.
            </motion.p>
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                <div className="flex shadow-premium rounded-premium overflow-hidden">
                  <div className="relative flex-grow focus-within:z-10">
                    <input
                      type="text"
                      className="block w-full border-0 py-4 px-6 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-lg font-medium"
                      placeholder="Search for a product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="rounded-l-none px-8 text-base font-semibold"
                    leftIcon={<MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />}
                  >
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features section */}
      <motion.div
        ref={featuresRef}
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-gray-50 relative overflow-hidden"
      >
        <AnimatedCircles variant="accent" count={15} className="opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="lg:text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={featuresInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase font-sans">Premium Features</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 font-display">
              Make Smarter Purchasing Decisions
            </p>
            <p className="mt-6 max-w-2xl text-xl text-gray-600 lg:mx-auto font-sans leading-relaxed">
              ProductWhisper helps you cut through marketing hype and discover what real users think about the products you're interested in.
            </p>
          </motion.div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <motion.div
                className="relative p-6 bg-white rounded-premium shadow-premium hover:shadow-premium-hover transition-shadow duration-300"
                initial={{ y: 50, opacity: 0 }}
                animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                  <MagnifyingGlassIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">Sentiment Analysis</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Our advanced AI analyzes thousands of reviews and comments to determine how people really feel about products, identifying both positive and negative aspects.
                </p>
              </motion.div>

              <motion.div
                className="relative p-6 bg-white rounded-premium shadow-premium hover:shadow-premium-hover transition-shadow duration-300"
                initial={{ y: 50, opacity: 0 }}
                animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                  <ChartBarIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">Trend Analysis</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Track how sentiment changes over time and spot emerging issues or improvements. Stay ahead of the curve with our real-time trend monitoring.
                </p>
              </motion.div>

              <motion.div
                className="relative p-6 bg-white rounded-premium shadow-premium hover:shadow-premium-hover transition-shadow duration-300"
                initial={{ y: 50, opacity: 0 }}
                animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 mb-6">
                  <ArrowsRightLeftIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">Product Comparison</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Compare products side-by-side based on real user sentiment and specific features. Make informed decisions with our comprehensive comparison tools.
                </p>
              </motion.div>
            </div>

            <motion.div
              className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div
                className="relative p-6 bg-white rounded-premium shadow-premium hover:shadow-premium-hover transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
                  <LightBulbIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">Smart Recommendations</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Get personalized product recommendations based on your preferences and the collective wisdom of thousands of real users.
                </p>
              </motion.div>

              <motion.div
                className="relative p-6 bg-white rounded-premium shadow-premium hover:shadow-premium-hover transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 text-yellow-600 mb-6">
                  <ChatBubbleLeftRightIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">Review Summarization</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Save time with our AI-powered review summarization that distills thousands of reviews into key insights and takeaways.
                </p>
              </motion.div>

              <motion.div
                className="relative p-6 bg-white rounded-premium shadow-premium hover:shadow-premium-hover transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-6">
                  <ShieldCheckIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">Fake Review Detection</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Our advanced algorithms identify and filter out fake or biased reviews, ensuring you get authentic insights from real users.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Trending products section */}
      <motion.div
        ref={trendingRef}
        initial={{ opacity: 0 }}
        animate={trendingInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-16 relative overflow-hidden"
      >
        <AnimatedCircles variant="primary" count={10} className="opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="lg:text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            animate={trendingInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase font-sans">Trending Now</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 font-display">
              Popular Products People Are Talking About
            </p>
            <p className="mt-6 max-w-2xl text-xl text-gray-600 lg:mx-auto font-sans leading-relaxed">
              Discover what's trending based on real user sentiment and mentions across the web.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" text="Loading trending products..." />
            </div>
          ) : error ? (
            <div className="max-w-lg mx-auto py-8">
              <ApiErrorFallback
                error={error instanceof Error ? error : new Error(String(error))}
                message="We couldn't load trending products at this time."
                retry={refetch}
              />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ y: 50, opacity: 0 }}
              animate={trendingInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              {trendingProducts.length > 0 ? (
                trendingProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={trendingInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="group block h-full bg-white rounded-premium shadow-premium overflow-hidden hover:shadow-premium-hover transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors font-display">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            <StarIcon className="h-4 w-4 fill-current" />
                            <span className="text-sm font-semibold">{(product.score * 5).toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="mt-3 text-base text-gray-600 line-clamp-2 font-sans leading-relaxed">
                          {product.description}
                        </p>
                        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-sm font-semibold text-gray-700">{product.brand}</span>
                          <span className="text-sm font-medium text-blue-600">{product.mention_count.toLocaleString()} mentions</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No trending products found at this time.
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={trendingInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              to="/search"
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              rightIcon={<MagnifyingGlassIcon className="h-5 w-5 ml-2" />}
            >
              Explore More Products
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Call to Action Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-gradient-secondary py-16 mt-12 rounded-premium mx-4 sm:mx-8 lg:mx-12 relative overflow-hidden"
      >
        <AnimatedCircles variant="secondary" count={25} className="opacity-80" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white font-display mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Ready to Make Smarter Purchasing Decisions?
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 font-light max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join thousands of smart shoppers who use ProductWhisper to cut through marketing hype and discover products that truly meet their needs.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              to="/register"
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-base font-semibold"
            >
              Sign Up Free
            </Button>
            <Button
              to="/about"
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-3 text-base font-semibold"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
