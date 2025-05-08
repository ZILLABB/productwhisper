import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  className = '',
  fullScreen = false,
  text,
}) => {
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };
  
  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50'
    : 'flex items-center justify-center';
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <p className={`mt-2 text-sm ${color === 'white' ? 'text-white' : 'text-gray-700'}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
