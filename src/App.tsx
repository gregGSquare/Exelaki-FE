import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { BudgetProvider } from "./contexts/BudgetContext";
import { Auth0ProviderWithConfig } from './contexts/Auth0Provider';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorProviderV2 } from './ui-v2/error-v2/ErrorProvider';
import { ErrorBoundaryV2 } from './ui-v2/error-v2/ErrorBoundaryV2';
import AppRoutes from './AppRoutes';
import { ThemeProvider } from './ui-v2/state/ThemeContext';
import { PreferencesProvider } from './ui-v2/state/PreferencesContext';

const App: React.FC = () => {
  return (
    <ErrorProviderV2>
      <ErrorBoundaryV2>
        <Auth0ProviderWithConfig>
          <AuthProvider>
            <BudgetProvider>
              <Router>
                <NotificationProvider>
                  <ThemeProvider>
                    <PreferencesProvider>
                      <AppRoutes />
                    </PreferencesProvider>
                  </ThemeProvider>
                </NotificationProvider>
              </Router>
            </BudgetProvider>
          </AuthProvider>
        </Auth0ProviderWithConfig>
      </ErrorBoundaryV2>
    </ErrorProviderV2>
  );
};

export default App;
