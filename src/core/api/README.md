# API Architecture

This directory contains the API client implementation for the Exelaki application.

## Overview

The API architecture is designed to provide a consistent and type-safe way to interact with the backend API. It includes:

- A centralized API client configuration
- Request and response interceptors for authentication and error handling
- A service factory for creating feature-specific API services

## Files

- `client.ts`: Configures and exports the main Axios instance with interceptors
- `serviceFactory.ts`: Provides a factory function to create feature-specific API services
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

## Error Handling

All API errors are processed through the `handleApiError` utility, which standardizes error responses and provides type information for better error handling in the UI.

## Authentication

The API client automatically includes authentication tokens in requests when available, and handles authentication errors by redirecting to the login page when necessary. 