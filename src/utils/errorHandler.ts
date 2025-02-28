import { AxiosError } from 'axios';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

// Error response structure
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  statusCode?: number;
}

/**
 * Processes API errors and returns a standardized error response
 */
export const handleApiError = (error: unknown): ErrorResponse => {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    
    // Network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      return {
        type: ErrorType.NETWORK,
        message: 'Unable to connect to the server. Please check your internet connection.'
      };
    }
    
    // Extract error message from the consistent backend format
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response?.data?.message) {
      // New consistent error format: { message, success, timestamp }
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Determine error type based on status code
    let errorType = ErrorType.UNKNOWN;
    
    switch (statusCode) {
      case 400:
        errorType = ErrorType.VALIDATION;
        break;
      case 401:
        errorType = ErrorType.AUTHENTICATION;
        break;
      case 403:
        errorType = ErrorType.AUTHORIZATION;
        break;
      case 404:
        errorType = ErrorType.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = ErrorType.SERVER;
        break;
    }
    
    return {
      type: errorType,
      message: errorMessage,
      statusCode
    };
  }
  
  // Handle other types of errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message
    };
  }
  
  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: String(error)
  };
};

/**
 * Gets a user-friendly message based on the error type
 */
export const getUserFriendlyMessage = (error: ErrorResponse): string => {
  // Always use the message from the error response
  return error.message;
};