import { ApiError } from '../services/apiError';
import { useToast } from '../components/common';

/**
 * Handle API errors in a consistent way
 * @param error The error to handle
 * @param fallbackMessage A fallback message if the error is not an ApiError
 * @param showToast The showToast function from useToast
 * @returns The error message
 */
export const handleApiError = (
  error: unknown, 
  fallbackMessage: string = 'An unexpected error occurred',
  showToast?: ReturnType<typeof useToast>['showToast']
): string => {
  let errorMessage: string;
  
  if (error instanceof ApiError) {
    errorMessage = error.getUserMessage();
  } else if (error instanceof Error) {
    errorMessage = error.message || fallbackMessage;
  } else {
    errorMessage = fallbackMessage;
  }
  
  // Show toast if provided
  if (showToast) {
    showToast({
      type: 'error',
      title: 'Error',
      message: errorMessage
    });
  }
  
  // Log error in development
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }
  
  return errorMessage;
};

/**
 * Custom hook for handling API errors
 * @returns Object with handleError function
 */
export const useErrorHandler = () => {
  const { showToast } = useToast();
  
  const handleError = (error: unknown, fallbackMessage?: string): string => {
    return handleApiError(error, fallbackMessage, showToast);
  };
  
  return { handleError };
};
