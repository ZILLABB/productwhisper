import { AxiosError } from 'axios';

/**
 * Error codes for API errors
 */
export enum ApiErrorCode {
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  SERVER_ERROR = 'server_error',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN = 'unknown_error',
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number | null;
  public readonly data: any;
  public readonly originalError: Error | null;

  constructor(
    message: string,
    code: ApiErrorCode = ApiErrorCode.UNKNOWN,
    status: number | null = null,
    data: any = null,
    originalError: Error | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
    this.originalError = originalError;

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create an ApiError from an AxiosError
   */
  static fromAxiosError(error: AxiosError): ApiError {
    // Network errors
    if (error.code === 'ECONNABORTED') {
      return new ApiError(
        'Request timed out. Please try again.',
        ApiErrorCode.TIMEOUT,
        null,
        null,
        error
      );
    }

    if (!error.response) {
      return new ApiError(
        'Network error. Please check your connection and try again.',
        ApiErrorCode.NETWORK_ERROR,
        null,
        null,
        error
      );
    }

    const { status, data } = error.response;
    const errorData = typeof data === 'object' ? data : null;
    const errorMessage = errorData?.message || error.message || 'An error occurred';

    // Map HTTP status codes to error codes
    let code: ApiErrorCode;
    switch (status) {
      case 401:
        code = ApiErrorCode.UNAUTHORIZED;
        break;
      case 403:
        code = ApiErrorCode.FORBIDDEN;
        break;
      case 404:
        code = ApiErrorCode.NOT_FOUND;
        break;
      case 422:
        code = ApiErrorCode.VALIDATION_ERROR;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = ApiErrorCode.SERVER_ERROR;
        break;
      default:
        code = ApiErrorCode.UNKNOWN;
    }

    return new ApiError(errorMessage, code, status, errorData, error);
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case ApiErrorCode.NETWORK_ERROR:
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case ApiErrorCode.TIMEOUT:
        return 'The request took too long to complete. Please try again.';
      case ApiErrorCode.UNAUTHORIZED:
        return 'You need to log in to access this feature.';
      case ApiErrorCode.FORBIDDEN:
        return 'You don\'t have permission to access this resource.';
      case ApiErrorCode.NOT_FOUND:
        return 'The requested resource was not found.';
      case ApiErrorCode.VALIDATION_ERROR:
        return this.data?.errors 
          ? `Please correct the following errors: ${Object.values(this.data.errors).join(', ')}`
          : 'The submitted data is invalid. Please check your inputs and try again.';
      case ApiErrorCode.SERVER_ERROR:
        return 'The server encountered an error. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred. Please try again.';
    }
  }
}
