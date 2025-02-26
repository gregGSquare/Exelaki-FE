import React, { ReactNode } from 'react';
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
    ? (process.env.REACT_APP_AUTH0_REDIRECT_URI_DEV)
    : (process.env.REACT_APP_AUTH0_REDIRECT_URI);

  console.log('Auth0 redirect URI:', redirectUri);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Auth0 audience:', audience);

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
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}; 