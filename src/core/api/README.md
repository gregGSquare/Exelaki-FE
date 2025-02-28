# API Architecture

This directory contains the API client implementation for the Exelaki application.

## Overview

The API architecture is designed to provide a consistent and type-safe way to interact with the backend API. It includes:

- A centralized API client configuration
- Request and response interceptors for authentication and error handling
- A service factory for creating feature-specific API services
- Automatic retry mechanism for handling network errors and server failures

## Files

- `client.ts`: Configures and exports the main Axios instance with interceptors
- `serviceFactory.ts`: Provides a factory function to create feature-specific API services
- `retry.ts`: Implements the retry mechanism for handling transient errors
- `index.ts`: Exports all API-related utilities

## Usage

### Basic Usage

```typescript
import { apiClient } from '@/core/api';

// Make a direct API request
const response = await apiClient.get('/some-endpoint');
```

### Creating a Feature Service

```typescript
import { createApiService } from '@/core/api';

// Create a service for a specific feature
export const userService = {
  api: createApiService('/users'),
  
  async getUsers() {
    return this.api.get('/');
  },
  
  async getUserById(id: string) {
    return this.api.get(`/${id}`);
  }
};
```

### Using the Retry Mechanism Directly

```typescript
import { executeWithRetry } from '@/core/api';

// Execute a function with retry logic
const result = await executeWithRetry(
  async () => {
    // Your async operation here
    return await someAsyncFunction();
  },
  {
    maxRetries: 5,
    baseDelay: 500,
    statusCodesToRetry: [500, 502, 503, 504],
    useExponentialBackoff: true
  }
);
```

## Retry Configuration

The API client automatically retries requests that fail due to network issues or server errors. The default configuration includes:

- Maximum of 3 retry attempts
- Exponential backoff with jitter to prevent thundering herd problems
- Retries on status codes 408 (Request Timeout), 429 (Too Many Requests), and 5xx server errors

You can customize the retry behavior by modifying the `API_CONFIG.retry` object in `client.ts`.

## Error Handling

All API errors are processed through the `handleApiError` utility, which standardizes error responses and provides type information for better error handling in the UI.

## Authentication

The API client automatically includes authentication tokens in requests when available, and handles authentication errors by redirecting to the login page when necessary. 