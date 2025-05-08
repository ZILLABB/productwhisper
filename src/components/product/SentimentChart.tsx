import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface SentimentChartProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

const SentimentChart: React.FC<SentimentChartProps> = ({
  score,
  size = 'md',
  showLabel = true,
  showIcon = true,
  className = '',
}) => {
  // Ensure score is between 0 and 1
  const normalizedScore = Math.max(0, Math.min(1, score));
  
  // Size classes
  const sizeClasses = {
    sm: 'h-2 w-24',
    md: 'h-3 w-32',
    lg: 'h-4 w-48',
  };
  
  // Get color based on score
  const getColor = () => {
    if (normalizedScore >= 0.8) return 'bg-green-500';
    if (normalizedScore >= 0.6) return 'bg-green-400';
    if (normalizedScore >= 0.4) return 'bg-yellow-400';
    if (normalizedScore >= 0.2) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  // Get text color based on score
  const getTextColor = () => {
    if (normalizedScore >= 0.8) return 'text-green-700';
    if (normalizedScore >= 0.6) return 'text-green-600';
    if (normalizedScore >= 0.4) return 'text-yellow-700';
    if (normalizedScore >= 0.2) return 'text-orange-700';
    return 'text-red-700';
  };
  
  // Get label based on score
  const getLabel = () => {
    if (normalizedScore >= 0.8) return 'Excellent';
    if (normalizedScore >= 0.6) return 'Good';
    if (normalizedScore >= 0.4) return 'Average';
    if (normalizedScore >= 0.2) return 'Poor';
    return 'Very Poor';
  };
  
  // Get icon based on score
  const getIcon = () => {
    if (normalizedScore >= 0.5) {
      return <ThumbsUp size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-green-500" />;
    } else {
      return <ThumbsDown size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-red-500" />;
    }
  };
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0">
          <BarChart2 size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} className={getTextColor()} />
        </div>
      )}
      
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-semibold ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} ${getTextColor()}`}>
            {Math.round(normalizedScore * 100)}%
          </span>
          
          {showLabel && (
            <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} text-gray-600`}>
              {getLabel()}
            </span>
          )}
          
          <div className="ml-auto">
            {getIcon()}
          </div>
        </div>
        
        <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <motion.div
            className={`h-full rounded-full ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${normalizedScore * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;
