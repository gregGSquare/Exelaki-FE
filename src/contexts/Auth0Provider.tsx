import React, { ReactNode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { AUTH0_CONFIG } from '../core/config/auth0';

interface Auth0ProviderWithConfigProps {
  children: ReactNode;
}

/**
 * Auth0Provider with configuration
 * This component wraps the Auth0Provider with our application's configuration
 */
export const Auth0ProviderWithConfig: React.FC<Auth0ProviderWithConfigProps> = ({ children }) => {
  return (
    <Auth0Provider
      domain={AUTH0_CONFIG.domain}
      clientId={AUTH0_CONFIG.clientId}
      authorizationParams={{
        redirect_uri: AUTH0_CONFIG.redirectUri,
        audience: AUTH0_CONFIG.audience,
        scope: AUTH0_CONFIG.scope,
        response_type: AUTH0_CONFIG.responseType,
      }}
      useRefreshTokens={AUTH0_CONFIG.useRefreshTokens}
      cacheLocation={AUTH0_CONFIG.cacheLocation}
    >
      {children}
    </Auth0Provider>
  );
}; 