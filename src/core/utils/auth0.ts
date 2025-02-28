/**
 * Auth0 Utilities
 * This file contains utility functions for working with Auth0 authentication
 */

// Token storage key
const TOKEN_KEY = 'accessToken';

/**
 * Store the access token in local storage
 * @param token - The access token to store
 */
export const storeAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get the access token from local storage
 * @returns The access token or null if not found
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove the access token from local storage
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Parse a JWT token to extract its payload
 * @param token - The JWT token to parse
 * @returns The parsed token payload or null if invalid
 */
export const parseJwtToken = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Map Auth0 user profile to application user model
 * @param auth0User - The Auth0 user profile
 * @returns Mapped user object
 */
export const mapAuth0UserToAppUser = (auth0User: any): any => {
  if (!auth0User) return null;
  
  return {
    _id: auth0User.sub || '',
    email: auth0User.email || '',
    isAuth0User: true,
    auth0Id: auth0User.sub || '',
    name: auth0User.name || '',
    picture: auth0User.picture || '',
    updatedAt: auth0User.updated_at || '',
  };
};

/**
 * Check if a token is expired
 * @param token - The JWT token to check
 * @returns True if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwtToken(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}; 