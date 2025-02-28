# Error Handling System

This directory contains the error handling system for the Exelaki application. It provides a structured approach to handling errors throughout the application, with a focus on API errors.

## Overview

The error handling system consists of:

- **Error Types**: Enumeration of different error categories (network, authentication, validation, etc.)
- **Error Response Interface**: Standardized structure for error objects
- **Error Handler Utilities**: Functions to process and transform errors
- **Error Display Utilities**: Functions to help display errors in the UI
- **React Error Hook**: A custom hook for handling errors in React components

## Key Files

- `types.ts`: Defines error types, interfaces, and mappings
- `errorHandler.ts`: Contains utility functions for handling errors
- `errorDisplay.ts`: Contains utilities for displaying errors in the UI
- `useErrorHandler.ts`: React hook for handling errors in components
- `index.ts`: Exports all error handling utilities

## Usage Examples

### Handling API Errors

```typescript
import { handleApiError } from '@/core/errors';

try {
  // API call
  const response = await apiClient.get('/some-endpoint');
  return response.data;
} catch (error) {
  // Convert to standardized error
  const standardError = handleApiError(error);
  
  // Handle based on error type
  if (standardError.type === ErrorType.AUTHENTICATION) {
    // Handle authentication error
  }
  
  // Or rethrow for higher-level handling
  throw standardError;
}
```

### Displaying User-Friendly Messages

```typescript
import { handleApiError, getUserFriendlyMessage } from '@/core/errors';

try {
  // API call
  await apiClient.post('/some-endpoint', data);
} catch (error) {
  const standardError = handleApiError(error);
  
  // Get user-friendly message
  const message = getUserFriendlyMessage(standardError);
  
  // Display in UI
  showToast(message);
}
```

### Using the Error Hook in React Components

```typescript
import { useErrorHandler } from '@/core/errors';

function LoginForm() {
  const { handleError, hasError, getErrorMessage, clearErrors } = useErrorHandler();
  
  const handleSubmit = async (data) => {
    try {
      clearErrors(); // Clear previous errors
      await authService.login(data);
      // Handle successful login
    } catch (error) {
      // This will process the error, extract field errors, and show toast if needed
      handleError(error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="email" 
        className={hasError('email') ? 'error' : ''} 
      />
      {hasError('email') && (
        <div className="error-message">{getErrorMessage('email')}</div>
      )}
      
      <input 
        name="password" 
        type="password" 
        className={hasError('password') ? 'error' : ''} 
      />
      {hasError('password') && (
        <div className="error-message">{getErrorMessage('password')}</div>
      )}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Creating Custom Errors

```typescript
import { createError, ErrorType } from '@/core/errors';

// Create a custom error
const customError = createError(
  ErrorType.VALIDATION,
  'Invalid input data',
  {
    fieldErrors: {
      email: 'Invalid email format',
      password: 'Password must be at least 8 characters'
    }
  }
);

// Use in error handling
handleError(customError);
```

### Error Type Checking

```typescript
import { isErrorType, ErrorType } from '@/core/errors';

function handleError(error) {
  const standardError = handleApiError(error);
  
  if (isErrorType(standardError, ErrorType.NETWORK)) {
    // Handle network errors
  } else if (isErrorType(standardError, ErrorType.VALIDATION)) {
    // Handle validation errors
    const fieldErrors = standardError.fieldErrors;
    // Update form with field errors
  }
}
```

## Integration with API Client

The error handling system is integrated with the API client through interceptors, automatically converting API errors to the standardized format. 