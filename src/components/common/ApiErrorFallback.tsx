import React from 'react';
import { AlertTriangle as ExclamationTriangleIcon, RotateCw as ArrowPathIcon } from 'lucide-react';

interface ApiErrorFallbackProps {
  error?: Error | string;
  resetErrorBoundary?: () => void;
  message?: string;
  retry?: () => void;
}

/**
 * A fallback component to display when an API call fails
 */
const ApiErrorFallback: React.FC<ApiErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = 'We encountered an error while fetching data.',
  retry
}) => {
  const handleRetry = () => {
    if (retry) {
      retry();
    } else if (resetErrorBoundary) {
      resetErrorBoundary();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
      <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Loading Error</h3>
      <p className="text-gray-600 mb-4">{message}</p>

      {error && process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-left">
          <p className="text-red-600 text-sm font-mono break-all">
            {typeof error === 'string' ? error : error.message}
          </p>
        </div>
      )}

      {(retry || resetErrorBoundary) && (
        <button
          onClick={handleRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ApiErrorFallback;
