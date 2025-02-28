/**
 * Error Types
 * This file defines the error types and interfaces used throughout the application
 */

/**
 * Enum for different types of errors that can occur in the application
 */
export enum ErrorType {
  // Network-related errors (connection issues, timeouts)
  NETWORK = 'NETWORK',
  
  // Authentication errors (invalid credentials, expired tokens)
  AUTHENTICATION = 'AUTHENTICATION',
  
  // Authorization errors (insufficient permissions)
  AUTHORIZATION = 'AUTHORIZATION',
  
  // Validation errors (invalid input data)
  VALIDATION = 'VALIDATION',
  
  // Server errors (internal server errors, service unavailable)
  SERVER = 'SERVER',
  
  // Resource not found errors
  NOT_FOUND = 'NOT_FOUND',
  
  // Business logic errors (specific to application rules)
  BUSINESS = 'BUSINESS',
  
  // Unknown or unclassified errors
  UNKNOWN = 'UNKNOWN'
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  // The type of error
  type: ErrorType;
  
  // User-friendly error message
  message: string;
  
  // HTTP status code (if applicable)
  statusCode?: number;
  
  // Original error object (for debugging)
  originalError?: any;
  
  // Field-specific validation errors
  fieldErrors?: Record<string, string>;
  
  // Error code (for specific error identification)
  code?: string;
}

/**
 * Validation error field structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Maps HTTP status codes to error types
 */
export const STATUS_CODE_TO_ERROR_TYPE: Record<number, ErrorType> = {
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTHENTICATION,
  403: ErrorType.AUTHORIZATION,
  404: ErrorType.NOT_FOUND,
  500: ErrorType.SERVER,
  502: ErrorType.SERVER,
  503: ErrorType.SERVER,
  504: ErrorType.SERVER
}; 