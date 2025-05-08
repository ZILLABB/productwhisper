import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiUsers, FiShoppingBag, FiMessageSquare, FiTrendingUp, FiCalendar, FiFilter, FiDownload } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalReviews: number;
  averageSentiment: number;
  userGrowth: number;
  reviewGrowth: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userChartData, setUserChartData] = useState<ChartData | null>(null);
  const [sentimentChartData, setSentimentChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock dashboard stats
        const mockStats: DashboardStats = {
          totalUsers: 12458,
          activeUsers: 8723,
          totalProducts: 4562,
          totalReviews: 28945,
          averageSentiment: 0.78,
          userGrowth: 12.5,
          reviewGrowth: 18.3
        };
        
        // Mock user chart data
        const mockUserChartData: ChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'New Users',
              data: [450, 520, 580, 620, 710, 850]
            },
            {
              label: 'Active Users',
              data: [1200, 1350, 1450, 1600, 1750, 1900]
            }
          ]
        };
        
        // Mock sentiment chart data
        const mockSentimentChartData: ChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Average Sentiment',
              data: [0.72, 0.74, 0.73, 0.76, 0.77, 0.78]
            }
          ]
        };
        
        setStats(mockStats);
        setUserChartData(mockUserChartData);
        setSentimentChartData(mockSentimentChartData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeRange]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading dashboard data..." />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-md shadow-sm">
              <FiCalendar className="ml-3 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-input border-0 focus:ring-0"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FiDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Users</h2>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUsers className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold">{stats?.totalUsers.toLocaleString()}</p>
              <p className="ml-2 text-sm text-gray-500">total</p>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex items-center text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>{stats?.userGrowth}%</span>
              </div>
              <span className="ml-2 text-sm text-gray-500">vs. previous period</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Active Users</span>
                <span className="font-medium">{stats?.activeUsers.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600"
                  style={{ width: `${(stats?.activeUsers || 0) / (stats?.totalUsers || 1) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
          
          {/* Products Card */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Products</h2>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiShoppingBag className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold">{stats?.totalProducts.toLocaleString()}</p>
              <p className="ml-2 text-sm text-gray-500">total</p>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex items-center text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>8.2%</span>
              </div>
              <span className="ml-2 text-sm text-gray-500">vs. previous period</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Categories</span>
                <span className="font-medium">24</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
          </motion.div>
          
          {/* Reviews Card */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Reviews</h2>
              <div className="p-3 bg-green-100 rounded-full">
                <FiMessageSquare className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold">{stats?.totalReviews.toLocaleString()}</p>
              <p className="ml-2 text-sm text-gray-500">total</p>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex items-center text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>{stats?.reviewGrowth}%</span>
              </div>
              <span className="ml-2 text-sm text-gray-500">vs. previous period</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Processed</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600"
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
          </motion.div>
          
          {/* Sentiment Card */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Sentiment</h2>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiBarChart2 className="text-yellow-600 text-xl" />
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold">{(stats?.averageSentiment || 0) * 100}%</p>
              <p className="ml-2 text-sm text-gray-500">positive</p>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex items-center text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>2.5%</span>
              </div>
              <span className="ml-2 text-sm text-gray-500">vs. previous period</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Sentiment Range</span>
                <span className="font-medium">65% - 92%</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">User Growth</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <FiFilter />
              </button>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">User growth chart visualization would appear here</p>
            </div>
          </div>
          
          {/* Sentiment Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Sentiment Trend</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <FiFilter />
              </button>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Sentiment trend chart visualization would appear here</p>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { event: 'New Review', user: 'John Doe', product: 'Wireless Headphones', time: '5 minutes ago' },
                  { event: 'Product Added', user: 'Admin', product: 'Smart Watch Pro', time: '1 hour ago' },
                  { event: 'User Registered', user: 'Sarah Smith', product: '-', time: '3 hours ago' },
                  { event: 'Sentiment Alert', user: 'System', product: 'Laptop XPS 15', time: '5 hours ago' },
                  { event: 'New Review', user: 'Michael Brown', product: 'Gaming Mouse', time: '1 day ago' }
                ].map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.event}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
