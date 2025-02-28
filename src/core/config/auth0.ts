/**
 * Auth0 Configuration
 * This file centralizes all Auth0-related configuration settings
 */

export const AUTH0_CONFIG = {
  // Auth0 domain from environment variables
  domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
  
  // Auth0 client ID from environment variables
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
  
  // API audience (identifier) for Auth0
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://api.exelaki.com',
  
  // Redirect URI based on environment
  redirectUri: process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_AUTH0_REDIRECT_URI_DEV
    : process.env.REACT_APP_AUTH0_REDIRECT_URI,
    
  // Default scopes to request
  scope: 'openid profile email',
  
  // Response type for the OAuth flow
  responseType: 'code',
  
  // Cache location for tokens
  cacheLocation: 'localstorage' as const,
  
  // Whether to use refresh tokens
  useRefreshTokens: true,
  
  // Default return URL after login
  defaultReturnTo: '/'
};

/**
 * Get Auth0 login configuration with optional overrides
 */
export const getLoginConfig = (returnTo?: string) => ({
  authorizationParams: {
    redirect_uri: AUTH0_CONFIG.redirectUri,
    scope: AUTH0_CONFIG.scope,
    audience: AUTH0_CONFIG.audience,
  },
  appState: {
    returnTo: returnTo || AUTH0_CONFIG.defaultReturnTo
  }
});

/**
 * Get Auth0 logout configuration
 */
export const getLogoutConfig = (returnTo?: string) => ({
  logoutParams: {
    returnTo: returnTo || window.location.origin
  }
}); 