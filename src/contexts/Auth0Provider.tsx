import React, { ReactNode, useEffect } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ProviderWithConfigProps {
  children: ReactNode;
}

export const Auth0ProviderWithConfig: React.FC<Auth0ProviderWithConfigProps> = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
  
  // The audience should be the identifier of your API in Auth0
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE || 'https://api.exelaki.com';
  
  // Use development redirect URI in development mode, production URI otherwise
  const isDevelopment = process.env.NODE_ENV === 'development';
  const redirectUri = isDevelopment 
    ? (process.env.REACT_APP_AUTH0_REDIRECT_URI_DEV || 'http://localhost:3000/callback')
    : (process.env.REACT_APP_AUTH0_REDIRECT_URI || 'https://exelaki-fe.onrender.com/callback');

  // Check if we're on the callback page
  const isCallback = window.location.pathname === '/callback';

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email',
        response_type: 'code',
      }}
      useRefreshTokens={false}
      cacheLocation="memory"
      skipRedirectCallback={!isCallback}
      onRedirectCallback={(appState) => {
        try {
          // Navigate to the intended route after callback processing
          if (appState?.returnTo) {
            window.history.replaceState({}, document.title, appState.returnTo);
          }
        } catch (error) {
        }
      }}
    >
      {children}
    </Auth0Provider>
  );
}; 