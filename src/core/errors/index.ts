/**
 * Error handling module
 * 
 * This module exports all error handling utilities, types, and interfaces
 * used throughout the application for consistent error management.
 */

// Export error types and interfaces
export * from './types';

// Export error handling utilities
export * from './errorHandler';

// Export error display utilities
export * from './errorDisplay';

// Export error hook
export { default as useErrorHandler } from './useErrorHandler'; 