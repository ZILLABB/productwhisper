import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiFilter, FiCalendar, FiSearch } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { useToast } from '../components/common/Toast';

interface TrendDataPoint {
  date: string;
  value: number;
  confidence?: number;
}

interface TrendResponse {
  product_id: number;
  trend_type: string;
  period: string;
  data_points: TrendDataPoint[];
  error?: string;
}

interface AspectTrendDataPoint {
  date: string;
  aspects: {
    [key: string]: {
      count: number;
      sentiment: number;
    }
  }
}

interface AspectTrendResponse {
  product_id: number;
  trend_type: string;
  period: string;
  data_points: AspectTrendDataPoint[];
  error?: string;
}

interface AllTrendsResponse {
  product_id: number;
  period: string;
  sentiment: TrendResponse;
  mentions: TrendResponse;
  aspects: AspectTrendResponse;
}

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
}

const TrendsPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [trendData, setTrendData] = useState<AllTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(searchParams.get('period') || 'month'); // day, week, month, quarter, year
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Fetch product details and trend data
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setError('No product selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Update URL with period
        if (period !== searchParams.get('period')) {
          setSearchParams({ period });
        }

        // Fetch product details and trend data in parallel
        const [productDetails, trendsData] = await Promise.all([
          fetchProductDetails(parseInt(productId)),
          fetchTrendData(parseInt(productId), period)
        ]);

        setProduct(productDetails);
        setTrendData(trendsData);
      } catch (err) {
        setError('Failed to load trend data');
        console.error('Error fetching trend data:', err);
        showToast('error', 'Failed to load trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, period, searchParams]);

  // Fetch product details
  const fetchProductDetails = async (productId: number): Promise<Product> => {
    try {
      const response = await apiService.getProductDetails(productId);
      return response;
    } catch (error) {
      console.error('Error fetching product details:', error);

      // Return mock data for development
      return {
        id: productId,
        name: "Premium Wireless Headphones",
        brand: "SoundMaster",
        category: "Electronics",
        description: "Experience crystal-clear audio with our premium wireless headphones.",
        price: 249.99,
        rating: 4.7,
        reviewCount: 1243,
        sentimentScore: 0.85
      };
    }
  };

  // Fetch trend data
  const fetchTrendData = async (productId: number, period: string): Promise<AllTrendsResponse> => {
    try {
      const response = await apiService.get(`/trends/all/${productId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trend data:', error);

      // Generate mock trend data for development
      const generateMockTrendData = (days: number): TrendDataPoint[] => {
        const data: TrendDataPoint[] = [];
        const today = new Date();

        let baseValue = 0.7 + Math.random() * 0.1;

        for (let i = days; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);

          // Add some randomness to the data
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

      const generateMockMentionData = (days: number): TrendDataPoint[] => {
        const data: TrendDataPoint[] = [];
        const today = new Date();

        let baseMentions = 100 + Math.floor(Math.random() * 50);

        for (let i = days; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);

          // Add some randomness to the data
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

      const generateMockAspectData = (days: number): AspectTrendDataPoint[] => {
        const data: AspectTrendDataPoint[] = [];
        const today = new Date();
        const aspects = ['quality', 'price', 'design', 'performance', 'support'];

        for (let i = days; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);

          const aspectData: { [key: string]: { count: number; sentiment: number } } = {};

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

      const days = getPeriodDays(period);

      // Mock response
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
    }
  };

  // Helper function to get number of days from period
  const getPeriodDays = (period: string): number => {
    switch (period) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading trend data..." />
      </div>
    );
  }

  if (error || !product || !trendData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="flex items-center">
            <FiAlertCircle className="mr-2" />
            {error || "Product trend data not found"}
          </p>
        </div>

        {!productId && (
          <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <p>Please select a product to view trend data.</p>
            <Link to="/search" className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800">
              <FiSearch className="mr-1" />
              Browse Products
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Calculate sentiment trend direction and percentage change
  const calculateSentimentTrend = () => {
    const dataPoints = trendData.sentiment.data_points;
    if (dataPoints.length < 2) return { direction: 'neutral', change: 0 };

    const firstScore = dataPoints[0].value;
    const lastScore = dataPoints[dataPoints.length - 1].value;
    const change = ((lastScore - firstScore) / firstScore) * 100;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      change: Math.abs(change)
    };
  };

  // Calculate mention trend direction and percentage change
  const calculateMentionTrend = () => {
    const dataPoints = trendData.mentions.data_points;
    if (dataPoints.length < 2) return { direction: 'neutral', change: 0 };

    const firstCount = dataPoints[0].value;
    const lastCount = dataPoints[dataPoints.length - 1].value;
    const change = ((lastCount - firstCount) / firstCount) * 100;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      change: Math.abs(change)
    };
  };

  // Get average sentiment score
  const getAverageSentiment = () => {
    const dataPoints = trendData.sentiment.data_points;
    if (dataPoints.length === 0) return 0;

    const sum = dataPoints.reduce((total, point) => total + point.value, 0);
    return sum / dataPoints.length;
  };

  // Get total mentions
  const getTotalMentions = () => {
    return trendData.mentions.data_points.reduce((total, point) => total + point.value, 0);
  };

  // Get average daily mentions
  const getAverageDailyMentions = () => {
    const dataPoints = trendData.mentions.data_points;
    if (dataPoints.length === 0) return 0;

    return getTotalMentions() / dataPoints.length;
  };

  // Get top aspects by mention count
  const getTopAspects = () => {
    const aspectCounts: Record<string, { count: number, sentiment: number }> = {};

    trendData.aspects.data_points.forEach(point => {
      Object.entries(point.aspects).forEach(([aspect, data]) => {
        if (!aspectCounts[aspect]) {
          aspectCounts[aspect] = { count: 0, sentiment: 0 };
        }
        aspectCounts[aspect].count += data.count;
        aspectCounts[aspect].sentiment += data.sentiment;
      });
    });

    // Calculate average sentiment for each aspect
    Object.keys(aspectCounts).forEach(aspect => {
      const dataPoints = trendData.aspects.data_points.filter(point => point.aspects[aspect]).length;
      if (dataPoints > 0) {
        aspectCounts[aspect].sentiment /= dataPoints;
      }
    });

    // Sort by count and return top aspects
    return Object.entries(aspectCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([aspect, data]) => ({
        name: aspect,
        count: data.count,
        sentiment: data.sentiment
      }));
  };

  const sentimentTrend = calculateSentimentTrend();
  const mentionTrend = calculateMentionTrend();
  const topAspects = getTopAspects();



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
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{product.name}</h1>
                <p className="text-white/80 text-lg flex items-center">
                  <span className="font-medium">{product.brand}</span>
                  <span className="mx-2 text-white/40">•</span>
                  <span>{product.category}</span>
                </p>
              </div>

              <div className="mt-6 md:mt-0">
                <div className={`inline-flex items-center px-4 py-2 rounded-xl backdrop-blur-sm ${
                  sentimentTrend.direction === 'up'
                    ? 'bg-green-500/20 text-white border border-green-500/30'
                    : sentimentTrend.direction === 'down'
                    ? 'bg-red-500/20 text-white border border-red-500/30'
                    : 'bg-white/20 text-white border border-white/30'
                }`}>
                  {sentimentTrend.direction === 'up' ? (
                    <FiTrendingUp className="mr-2" size={20} />
                  ) : sentimentTrend.direction === 'down' ? (
                    <FiTrendingDown className="mr-2" size={20} />
                  ) : null}
                  <span className="font-medium">{sentimentTrend.change.toFixed(1)}% {sentimentTrend.direction === 'up' ? 'increase' : sentimentTrend.direction === 'down' ? 'decrease' : 'change'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time range filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center text-gray-700">
              <FiCalendar className="text-primary mr-2" size={18} />
              <span className="font-medium">Time Period:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['day', 'week', 'month', 'quarter', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p === 'day' ? 'Day' :
                   p === 'week' ? 'Week' :
                   p === 'month' ? 'Month' :
                   p === 'quarter' ? 'Quarter' : 'Year'}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiSearch size={16} />
                Search Products
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Sentiment Score Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-gray-900">Average Sentiment</h2>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <FiTrendingUp size={20} />
              </div>
            </div>

            <div className="flex items-end justify-between mb-6">
              <div className="text-4xl font-bold text-gray-900">
                {(getAverageSentiment() * 100).toFixed(1)}%
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                sentimentTrend.direction === 'up' ? 'bg-green-100 text-green-700' :
                sentimentTrend.direction === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {sentimentTrend.direction === 'up' ? (
                  <FiTrendingUp className="mr-1.5" size={14} />
                ) : sentimentTrend.direction === 'down' ? (
                  <FiTrendingDown className="mr-1.5" size={14} />
                ) : null}
                <span>{sentimentTrend.change.toFixed(1)}%</span>
              </div>
            </div>

            <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                style={{ width: '100%' }}
              ></div>
            </div>

            <div className="mt-2 flex justify-between text-xs font-medium">
              <span className="text-red-600">Negative</span>
              <span className="text-yellow-600">Neutral</span>
              <span className="text-green-600">Positive</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Based on {trendData.sentiment.data_points.length} days of data
              </div>
            </div>
          </div>

          {/* Mentions Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-gray-900">Total Mentions</h2>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary">
                <FiBarChart2 size={20} />
              </div>
            </div>

            <div className="flex items-end justify-between mb-6">
              <div className="text-4xl font-bold text-gray-900">
                {getTotalMentions().toLocaleString()}
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                mentionTrend.direction === 'up' ? 'bg-green-100 text-green-700' :
                mentionTrend.direction === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {mentionTrend.direction === 'up' ? (
                  <FiTrendingUp className="mr-1.5" size={14} />
                ) : mentionTrend.direction === 'down' ? (
                  <FiTrendingDown className="mr-1.5" size={14} />
                ) : null}
                <span>{mentionTrend.change.toFixed(1)}%</span>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Daily Average</span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round(getAverageDailyMentions()).toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Across {trendData.mentions.data_points.length} days of data
              </div>
            </div>
          </div>

          {/* Top Aspects Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-gray-900">Top Aspects</h2>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent">
                <FiFilter size={20} />
              </div>
            </div>

            <div className="space-y-4">
              {topAspects.slice(0, 4).map((aspect) => {
                // Calculate sentiment color
                const sentimentColor = aspect.sentiment > 0.7 ? 'text-green-600' :
                                      aspect.sentiment > 0.4 ? 'text-yellow-600' : 'text-red-600';

                return (
                  <div key={aspect.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-gray-800 capitalize">
                        {aspect.name}
                      </span>
                      <span className={`text-sm font-medium ${sentimentColor}`}>
                        {(aspect.sentiment * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          aspect.sentiment > 0.7 ? 'bg-green-500' :
                          aspect.sentiment > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${aspect.sentiment * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {aspect.count} mentions
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
                View all aspects →
              </button>
            </div>
          </div>
        </div>

        {/* Trend Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Sentiment Trend Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-display font-semibold text-gray-900">Sentiment Trend</h2>
                <p className="text-sm text-gray-500 mt-1">How sentiment has changed over time</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <FiFilter size={14} />
                Filter
              </button>
            </div>

            <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-transparent to-transparent"></div>
              </div>

              {/* Placeholder for actual chart */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FiTrendingUp className="text-primary" size={24} />
                </div>
                <p className="text-gray-500 text-sm">Interactive sentiment trend chart would appear here</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {trendData.sentiment.data_points.length} data points
              </div>
              <button className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
                View detailed report →
              </button>
            </div>
          </div>

          {/* Mentions Trend Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-display font-semibold text-gray-900">Mentions Trend</h2>
                <p className="text-sm text-gray-500 mt-1">How mention volume has changed over time</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <FiFilter size={14} />
                Filter
              </button>
            </div>

            <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-secondary via-transparent to-transparent"></div>
              </div>

              {/* Placeholder for actual chart */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FiBarChart2 className="text-secondary" size={24} />
                </div>
                <p className="text-gray-500 text-sm">Interactive mentions trend chart would appear here</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {trendData.mentions.data_points.length} data points
              </div>
              <button className="text-sm text-secondary font-medium hover:text-secondary-dark transition-colors">
                View detailed report →
              </button>
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 mb-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">Top Keywords</h2>
              <p className="text-sm text-gray-500 mt-1">Most frequently mentioned terms in reviews</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent">
              <FiSearch size={20} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Generate some mock keywords with varying sizes based on frequency */}
            {['quality', 'design', 'performance', 'battery life', 'price', 'comfort', 'durability',
              'features', 'sound quality', 'value', 'customer service', 'reliability', 'easy to use',
              'stylish', 'lightweight', 'premium', 'innovative'].map((keyword, i) => {
              // Calculate a size factor based on "importance"
              const importance = 1 - (i / 20); // Will range from 1 to ~0.15
              const fontSize = 0.8 + (importance * 0.7); // Will range from ~0.9rem to ~1.5rem
              const opacity = 0.7 + (importance * 0.3); // Will range from ~0.75 to 1

              return (
                <div
                  key={keyword}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    i % 3 === 0 ? 'bg-primary/10 text-primary' :
                    i % 3 === 1 ? 'bg-secondary/10 text-secondary' :
                    'bg-accent/10 text-accent'
                  } hover:shadow-sm transition-shadow cursor-pointer`}
                  style={{
                    fontSize: `${fontSize}rem`,
                    opacity
                  }}
                >
                  {keyword}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Based on {getTotalMentions().toLocaleString()} total mentions
            </div>
            <button className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
              Analyze keywords →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrendsPage;
