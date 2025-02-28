import { useState, useCallback } from 'react';
import { handleApiError } from './errorHandler';
import { 
  extractFieldErrors, 
  FormFieldErrors, 
  shouldShowErrorToast,
  getToastErrorMessage,
  getErrorToastTitle
} from './errorDisplay';

// Import toast notification library if available
// For this example, we'll assume a generic showToast function
// Replace with your actual toast implementation
const showToast = (title: string, message: string, type: 'error' | 'warning' | 'info' | 'success') => {
  console.error(`${title}: ${message}`);
  // In a real implementation, you would call your toast library here
  // Example: toast.error(message, { title });
};

/**
 * Hook for handling errors in React components
 * @returns Object with error handling utilities
 */
export const useErrorHandler = () => {
  // State for field errors in forms
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  
  // State for general error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Clear all errors
  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setErrorMessage(null);
  }, []);
  
  // Handle an error
  const handleError = useCallback((error: unknown) => {
    // Process the error
    const processedError = handleApiError(error);
    
    // Extract field errors for forms
    const extractedFieldErrors = extractFieldErrors(processedError);
    setFieldErrors(extractedFieldErrors);
    
    // Set general error message
    if (processedError.message) {
      setErrorMessage(processedError.message);
    }
    
    // Show toast notification if appropriate
    if (shouldShowErrorToast(processedError)) {
      const title = getErrorToastTitle(processedError);
      const message = getToastErrorMessage(processedError);
      showToast(title, message, 'error');
    }
    
    // Return the processed error for additional handling if needed
    return processedError;
  }, []);
  
  // Check if a specific field has an error
  const hasError = useCallback((fieldName: string): boolean => {
    return !!fieldErrors[fieldName];
  }, [fieldErrors]);
  
  // Get error message for a specific field
  const getErrorMessage = useCallback((fieldName: string): string => {
    return fieldErrors[fieldName] || '';
  }, [fieldErrors]);
  
  return {
    fieldErrors,
    errorMessage,
    clearErrors,
    handleError,
    hasError,
    getErrorMessage
  };
};

export default useErrorHandler; 