import React from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageCircle } from 'lucide-react';
import SentimentChart from './SentimentChart';

interface ReviewCardProps {
  id: string;
  author: string;
  date: string;
  rating: number;
  title?: string;
  content: string;
  sentimentScore: number;
  verified: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  avatarUrl?: string;
  source?: string;
  onMarkHelpful?: () => void;
  onMarkUnhelpful?: () => void;
  onReport?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  author,
  date,
  rating,
  title,
  content,
  sentimentScore,
  verified,
  helpfulCount,
  unhelpfulCount,
  avatarUrl,
  source,
  onMarkHelpful,
  onMarkUnhelpful,
  onReport,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get source icon
  const getSourceIcon = () => {
    switch (source?.toLowerCase()) {
      case 'amazon':
        return '🛒';
      case 'reddit':
        return '🤖';
      case 'youtube':
        return '📺';
      case 'twitter':
        return '🐦';
      default:
        return '💬';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-100 rounded-lg p-5 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Review Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={author} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 font-medium">{author.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{author}</span>
              {verified && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              )}
              {source && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>{getSourceIcon()}</span>
                  <span>{source}</span>
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">{formatDate(date)}</div>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={`${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Review Title */}
      {title && (
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      )}
      
      {/* Review Content */}
      <p className="text-gray-700 mb-4">{content}</p>
      
      {/* Sentiment Analysis */}
      <div className="mb-4">
        <SentimentChart score={sentimentScore} size="sm" />
      </div>
      
      {/* Review Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Helpful Button */}
          <button
            onClick={onMarkHelpful}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600"
          >
            <ThumbsUp size={16} />
            <span>{helpfulCount}</span>
          </button>
          
          {/* Unhelpful Button */}
          <button
            onClick={onMarkUnhelpful}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
          >
            <ThumbsDown size={16} />
            <span>{unhelpfulCount}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Reply Button */}
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
            <MessageCircle size={16} />
            <span>Reply</span>
          </button>
          
          {/* Report Button */}
          <button
            onClick={onReport}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
          >
            <Flag size={16} />
            <span>Report</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
