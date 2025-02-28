import { AxiosError, AxiosRequestConfig } from 'axios';
import { ErrorType, isErrorType, handleApiError } from '../errors';

/**
 * Configuration for the retry mechanism
 */
export interface RetryConfig {
  // Maximum number of retry attempts
  maxRetries: number;
  
  // Base delay between retries in milliseconds
  baseDelay: number;
  
  // Status codes that should trigger a retry
  statusCodesToRetry: number[];
  
  // Whether to use exponential backoff
  useExponentialBackoff?: boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  statusCodesToRetry: [408, 429, 500, 502, 503, 504],
  useExponentialBackoff: true
};

/**
 * Determines if a request should be retried based on the error
 * @param error - The error from the failed request
 * @param config - Retry configuration
 * @param retryCount - Current retry attempt count
 * @returns Whether the request should be retried
 */
export const shouldRetry = (
  error: unknown,
  config: RetryConfig,
  retryCount: number
): boolean => {
  // Don't retry if we've reached the maximum retry count
  if (retryCount >= config.maxRetries) {
    return false;
  }
  
  // Process the error
  const processedError = handleApiError(error);
  
  // Retry network errors
  if (isErrorType(processedError, ErrorType.NETWORK)) {
    return true;
  }
  
  // Retry based on status code
  if (processedError.statusCode && config.statusCodesToRetry.includes(processedError.statusCode)) {
    return true;
  }
  
  // Don't retry other errors
  return false;
};

/**
 * Calculates the delay before the next retry attempt
 * @param retryCount - Current retry attempt count
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export const getRetryDelay = (retryCount: number, config: RetryConfig): number => {
  const { baseDelay, useExponentialBackoff } = config;
  
  // Use exponential backoff if enabled
  if (useExponentialBackoff) {
    // Add some randomness to prevent all clients retrying simultaneously
    const jitter = Math.random() * 100;
    return Math.min(baseDelay * Math.pow(2, retryCount) + jitter, 30000);
  }
  
  // Use linear backoff
  return baseDelay;
};

/**
 * Creates a promise that resolves after a specified delay
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Executes a request with retry logic
 * @param requestFn - Function that returns a promise for the request
 * @param retryConfig - Retry configuration
 * @returns Promise that resolves with the request result or rejects with an error
 */
export const executeWithRetry = async <T>(
  requestFn: () => Promise<T>,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> => {
  let retryCount = 0;
  
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Attempt the request
      return await requestFn();
    } catch (error) {
      // Check if we should retry
      if (!shouldRetry(error, retryConfig, retryCount)) {
        throw error;
      }
      
      // Increment retry count
      retryCount++;
      
      // Calculate delay
      const retryDelay = getRetryDelay(retryCount, retryConfig);
      
      // Log retry attempt in development
      if (process.env.NODE_ENV !== 'production') {
        console.info(`Retrying request (attempt ${retryCount}/${retryConfig.maxRetries}) after ${retryDelay}ms`);
      }
      
      // Wait before retrying
      await delay(retryDelay);
    }
  }
}; 