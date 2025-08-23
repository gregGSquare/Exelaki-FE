jest.mock('axios', () => {
  class AxiosError extends Error {
    code?: string;
    response?: any;
    constructor(message?: string, code?: string, config?: any, request?: any, response?: any) {
      super(message);
      this.code = code;
      this.response = response;
    }
  }
  return { AxiosError };
});

import { AxiosError } from 'axios';
import { handleApiError, ErrorType, getUserFriendlyMessage } from './errorHandler';

describe('errorHandler', () => {
  test('handles network errors', () => {
    const error = new AxiosError('network', 'ECONNABORTED');
    const result = handleApiError(error);
    expect(result.type).toBe(ErrorType.NETWORK);
  });

  test('handles authentication errors with message', () => {
    const response = { status: 401, data: { message: 'Unauthorized' }, statusText: '', headers: {}, config: {} };
    const error = new AxiosError('auth', 'ERR_BAD_REQUEST', {}, {}, response);
    const result = handleApiError(error);
    expect(result.type).toBe(ErrorType.AUTHENTICATION);
    expect(result.message).toBe('Unauthorized');
    expect(result.statusCode).toBe(401);
  });

  test('handles generic errors', () => {
    const result = handleApiError(new Error('boom'));
    expect(result.type).toBe(ErrorType.UNKNOWN);
    expect(result.message).toBe('boom');
  });

  test('getUserFriendlyMessage returns message', () => {
    const msg = getUserFriendlyMessage({ type: ErrorType.UNKNOWN, message: 'hello' });
    expect(msg).toBe('hello');
  });
});
