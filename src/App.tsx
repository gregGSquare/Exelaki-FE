import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { BudgetProvider } from "./contexts/BudgetContext";
import { Auth0ProviderWithConfig } from './contexts/Auth0Provider';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './AppRoutes';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Auth0ProviderWithConfig>
        <AuthProvider>
          <BudgetProvider>
            <Router>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </Router>
          </BudgetProvider>
        </AuthProvider>
      </Auth0ProviderWithConfig>
    </ErrorBoundary>
  );
};

export default App;
