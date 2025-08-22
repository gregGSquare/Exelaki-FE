import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import DashboardV2 from './ui-v2/dashboard/DashboardV2';
import DataSetup from './ui-v2/setup/DataSetup';
import Projections from './ui-v2/projections/Projections';
import WelcomePage from './pages/WelcomePage';
import api from './services/axios';
import { Budget } from './types/budget';
import Callback from './pages/Callback';
import Settings from './ui-v2/pages/Settings';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsError, setBudgetsError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchBudgets = async () => {
        try {
          const response = await api.get('/budget');
          
          // Check if response.data is an array
          if (Array.isArray(response.data)) {
            setBudgets(response.data);
          } else if (response.data && typeof response.data === 'object') {
            // If it's an object with a data property that is an array
            if (Array.isArray(response.data.data)) {
              setBudgets(response.data.data);
            } else {
              setBudgets([]);
              setBudgetsError('Invalid data format received from server');
            }
          } else {
            setBudgets([]);
            setBudgetsError('Unexpected data format received from server');
          }
        } catch (error: any) {
          setBudgets([]);
          
          // Get the error message from the response
          if (error.response?.data?.message) {
            setBudgetsError(error.response.data.message);
          } else if (error.message) {
            setBudgetsError(error.message);
          } else {
            setBudgetsError('Failed to load budgets. Please try again later.');
          }
        }
      };
      fetchBudgets();
    } else {
      // Reset budgets when not authenticated
      setBudgets([]);
      setBudgetsError(null);
    }
  }, [isAuthenticated]);

  if (isLoading || isPageLoading) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white text-3xl font-bold animate-pulse">
            E
          </div>
          <div className="absolute -inset-4 border-4 border-primary-300 rounded-xl opacity-30 animate-ping"></div>
        </div>
        <p className="mt-6 text-neutral-600 font-medium">Loading Exelaki...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {budgetsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4 shadow-sm" role="alert">
            <div className="flex">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>{budgetsError}</p>
            </div>
          </div>
        )}

        <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  budgets.length > 0 ? (
                    <Navigate to={`/app/${budgets[0]._id}`} replace />
                  ) : (
                    <Navigate to="/settings" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/callback" element={<Callback />} />
            <Route
              path="/dashboard/:id"
              element={isAuthenticated ? <DashboardV2 /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/app/:id"
              element={isAuthenticated ? <DashboardV2 /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/app/:id/setup"
              element={isAuthenticated ? <DataSetup /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/app/:id/projections"
              element={isAuthenticated ? <Projections /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/settings"
              element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
      </main>
    </div>
  );
};

export default AppRoutes; 