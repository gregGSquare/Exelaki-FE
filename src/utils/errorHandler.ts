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
  details?: string;
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
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: error.message
      };
    }
    
    // Extract API error message if available
    const apiErrorMessage = error.response?.data?.message || error.message;
    
    // If the error message is an object, try to stringify it or extract useful properties
    const formattedErrorMessage = typeof apiErrorMessage === 'object' 
      ? JSON.stringify(apiErrorMessage) 
      : apiErrorMessage;
    
    // Handle different status codes
    switch (statusCode) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: 'The request contains invalid data.',
          details: formattedErrorMessage,
          statusCode
        };
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Your session has expired. Please log in again.',
          details: formattedErrorMessage,
          statusCode
        };
      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: 'You do not have permission to perform this action.',
          details: formattedErrorMessage,
          statusCode
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: 'The requested resource was not found.',
          details: formattedErrorMessage,
          statusCode
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          message: 'Something went wrong on our end. Please try again later.',
          details: formattedErrorMessage,
          statusCode
        };
      default:
        return {
          type: ErrorType.UNKNOWN,
          message: 'An unexpected error occurred. Please try again.',
          details: formattedErrorMessage,
          statusCode
        };
    }
  }
  
  // Handle other types of errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred. Please try again.',
      details: error.message
    };
  }
  
  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    details: String(error)
  };
};

/**
 * Gets a user-friendly message based on the error type
 */
export const getUserFriendlyMessage = (error: ErrorResponse): string => {
  // If we have a specific error message from the API, use it
  if (error.details) {
    // If the details start with a curly brace, it might be a stringified JSON
    if (typeof error.details === 'string' && error.details.startsWith('{')) {
      try {
        const parsedDetails = JSON.parse(error.details);
        // Try to extract a message from the parsed object
        if (parsedDetails.message) {
          return parsedDetails.message;
        }
      } catch (e) {
        // If parsing fails, just use the details as is
      }
    }
    return error.details;
  }
  
  // Otherwise, use a generic message based on the error type
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Network connection issue. Please check your internet connection and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Authentication error. Please log in again.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.VALIDATION:
      return 'The information provided is invalid. Please check and try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested information could not be found.';
    case ErrorType.SERVER:
      return 'We\'re experiencing technical difficulties. Please try again later.';
    default:
      return 'Something went wrong. Please try again or contact support if the issue persists.';
  }
}; 