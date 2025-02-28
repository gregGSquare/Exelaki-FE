import { ErrorResponse, ErrorType } from './types';
import { getUserFriendlyMessage, isErrorType } from './errorHandler';

/**
 * Interface for form field errors
 */
export interface FormFieldErrors {
  [field: string]: string;
}

/**
 * Extracts field errors from an error response for form validation
 * @param error - The error response
 * @returns Object mapping field names to error messages
 */
export const extractFieldErrors = (error: ErrorResponse): FormFieldErrors => {
  if (isErrorType(error, ErrorType.VALIDATION) && error.fieldErrors) {
    return error.fieldErrors;
  }
  return {};
};

/**
 * Checks if a specific field has an error
 * @param fieldErrors - The field errors object
 * @param fieldName - The name of the field to check
 * @returns True if the field has an error
 */
export const hasFieldError = (fieldErrors: FormFieldErrors, fieldName: string): boolean => {
  return !!fieldErrors[fieldName];
};

/**
 * Gets the error message for a specific field
 * @param fieldErrors - The field errors object
 * @param fieldName - The name of the field
 * @returns The error message or empty string if no error
 */
export const getFieldErrorMessage = (fieldErrors: FormFieldErrors, fieldName: string): string => {
  return fieldErrors[fieldName] || '';
};

/**
 * Determines if an error should be displayed as a toast/notification
 * @param error - The error response
 * @returns True if the error should be displayed as a toast
 */
export const shouldShowErrorToast = (error: ErrorResponse): boolean => {
  // Don't show toasts for validation errors (they should be shown inline)
  if (isErrorType(error, ErrorType.VALIDATION)) {
    return false;
  }
  
  // Show toasts for all other error types
  return true;
};

/**
 * Gets the appropriate message to display in a toast/notification
 * @param error - The error response
 * @returns The message to display
 */
export const getToastErrorMessage = (error: ErrorResponse): string => {
  return getUserFriendlyMessage(error);
};

/**
 * Gets the appropriate title for an error toast/notification
 * @param error - The error response
 * @returns The title for the toast
 */
export const getErrorToastTitle = (error: ErrorResponse): string => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorType.AUTHORIZATION:
      return 'Access Denied';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.SERVER:
      return 'Server Error';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.BUSINESS:
      return 'Operation Failed';
    default:
      return 'Error';
  }
}; 