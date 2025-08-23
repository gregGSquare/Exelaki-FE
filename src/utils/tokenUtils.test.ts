// Unit tests for token utility functions
import { setTokens, getAccessToken, getRefreshToken, clearTokens, refreshAccessToken } from './tokenUtils';

describe('tokenUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('stores and retrieves tokens', () => {
    setTokens('access', 'refresh');
    expect(getAccessToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
  });

  test('clears tokens', () => {
    setTokens('a', 'r');
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  test('refreshAccessToken returns null without refresh token', async () => {
    const token = await refreshAccessToken();
    expect(token).toBeNull();
  });

  test('refreshAccessToken fetches new token', async () => {
    localStorage.setItem('refreshToken', 'rt');
    const mockFetch = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'new-token' })
    } as any);

    const token = await refreshAccessToken();
    expect(token).toBe('new-token');
    expect(getAccessToken()).toBe('new-token');
    expect(mockFetch).toHaveBeenCalled();
  });
});
