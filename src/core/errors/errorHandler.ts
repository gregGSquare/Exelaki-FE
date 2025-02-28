import { AxiosError } from 'axios';
import { ErrorType, ErrorResponse, STATUS_CODE_TO_ERROR_TYPE } from './types';

/**
 * Processes API errors and returns a standardized error response
 * @param error - The error to process
 * @returns Standardized error response
 */
export const handleApiError = (error: unknown): ErrorResponse => {
  // Log errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', error);
  }
  
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    
    // Handle network errors (no response)
    if (error.code === 'ECONNABORTED' || !error.response) {
      return {
        type: ErrorType.NETWORK,
        message: 'Unable to connect to the server. Please check your internet connection.',
        originalError: error
      };
    }
    
    // Extract error message from response data
    let errorMessage = 'An unexpected error occurred';
    let fieldErrors: Record<string, string> | undefined;
    let errorCode: string | undefined;
    
    const responseData = error.response.data;
    
    if (responseData) {
      // Handle structured error responses
      if (responseData.message) {
        errorMessage = responseData.message;
      }
      
      // Extract field validation errors if available
      if (responseData.errors && typeof responseData.errors === 'object') {
        fieldErrors = {};
        
        // Convert array of errors to record
        if (Array.isArray(responseData.errors)) {
          responseData.errors.forEach((err: any) => {
            if (err.field && err.message) {
              fieldErrors![err.field] = err.message;
            }
          });
        } else {
          // Handle object format
          fieldErrors = responseData.errors;
        }
      }
      
      // Extract error code if available
      if (responseData.code) {
        errorCode = responseData.code;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Determine error type based on status code
    const errorType = statusCode ? STATUS_CODE_TO_ERROR_TYPE[statusCode] || ErrorType.UNKNOWN : ErrorType.UNKNOWN;
    
    return {
      type: errorType,
      message: errorMessage,
      statusCode,
      originalError: error,
      fieldErrors,
      code: errorCode
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error
    };
  }
  
  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: String(error),
    originalError: error
  };
};

/**
 * Gets a user-friendly message based on the error type
 * @param error - The error response
 * @returns User-friendly error message
 */
export const getUserFriendlyMessage = (error: ErrorResponse): string => {
  // Use the provided message by default
  if (error.message) {
    return error.message;
  }
  
  // Fallback messages based on error type
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Network error. Please check your internet connection and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Authentication error. Please log in again.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.SERVER:
      return 'Server error. Please try again later.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorType.BUSINESS:
      return 'Unable to complete the operation due to a business rule violation.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Checks if an error is of a specific type
 * @param error - The error response to check
 * @param type - The error type to check for
 * @returns True if the error is of the specified type
 */
export const isErrorType = (error: ErrorResponse, type: ErrorType): boolean => {
  return error.type === type;
};

/**
 * Creates a new error response
 * @param type - The error type
 * @param message - The error message
 * @param options - Additional error options
 * @returns New error response
 */
export const createError = (
  type: ErrorType,
  message: string,
  options?: Partial<Omit<ErrorResponse, 'type' | 'message'>>
): ErrorResponse => {
  return {
    type,
    message,
    ...options
  };
}; 