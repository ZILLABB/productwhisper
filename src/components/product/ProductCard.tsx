import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, BarChart2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../../common/components/Button';

interface ProductCardProps {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  sentimentScore?: number;
  image: string;
  description: string;
  inStock: boolean;
  discount?: number;
  tags?: string[];
  onAddToCompare?: () => void;
  onAddToFavorite?: () => void;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  brand,
  category,
  price,
  originalPrice,
  rating,
  reviewCount,
  sentimentScore = 0,
  image,
  description,
  inStock,
  discount = 0,
  tags = [],
  onAddToCompare,
  onAddToFavorite,
  viewMode = 'grid',
}) => {
  // Format price with currency
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate discounted price
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  // Get sentiment color based on score
  const getSentimentColor = () => {
    if (sentimentScore >= 0.8) return 'bg-green-100 text-green-700';
    if (sentimentScore >= 0.6) return 'bg-green-100 text-green-600';
    if (sentimentScore >= 0.4) return 'bg-yellow-100 text-yellow-700';
    if (sentimentScore >= 0.2) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <div className={`h-full overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white ${
        viewMode === 'list' ? 'flex' : ''
      }`}>
        {/* Product Image */}
        <div className={`${viewMode === 'list' ? 'w-1/3' : 'w-full'} relative`}>
          <Link to={`/product/${id}`}>
            <img
              src={image}
              alt={name}
              className="h-56 w-full object-cover"
            />
          </Link>
          
          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium px-3 py-1 rounded-md bg-black/40 backdrop-blur-sm">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-secondary text-white font-medium px-2.5 py-1">
              {discount}% OFF
            </Badge>
          )}
          
          {/* Sentiment Score Badge (if available) */}
          {sentimentScore > 0 && (
            <div className={`absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full ${getSentimentColor()}`}>
              <BarChart2 size={14} />
              <span className="text-xs font-medium">{Math.round(sentimentScore * 100)}%</span>
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className={`${viewMode === 'list' ? 'w-2/3' : 'w-full'} p-5 flex flex-col h-full`}>
          {/* Category & Brand */}
          <div className="mb-2">
            <p className="text-sm text-primary font-medium mb-1">{category}</p>
            <Link to={`/product/${id}`} className="block">
              <h3 className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors line-clamp-2">
                {name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">{brand}</p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={`${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({reviewCount.toLocaleString()})
            </span>
          </div>
          
          {/* Description (only in list view) */}
          {viewMode === 'list' && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
          )}
          
          {/* Price and Actions */}
          <div className="flex items-center justify-between mt-auto pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(finalPrice)}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(price)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {onAddToFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 hover:bg-primary/10 hover:text-primary"
                  onClick={onAddToFavorite}
                >
                  <Heart size={18} />
                </Button>
              )}
              
              {onAddToCompare && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-200 hover:bg-primary hover:text-white transition-colors"
                  onClick={onAddToCompare}
                >
                  Compare
                </Button>
              )}
              
              <Link to={`/product/${id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-200 hover:bg-primary hover:text-white transition-colors"
                >
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
