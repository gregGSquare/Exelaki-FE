import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import WelcomePage from './pages/WelcomePage';
import HeaderWithNavigate from './components/Header';
import Footer from './components/Footer';
import api from './services/axios';
import { Budget } from './types/budget';
import Callback from './pages/Callback';

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-70 -z-10"></div>
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary-100/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-secondary-100/20 to-transparent"></div>
        <svg className="absolute top-0 left-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>
      
      <HeaderWithNavigate />
      
      <main className="pt-16 flex-grow">
        {budgetsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4 mb-4 shadow-sm" role="alert">
            <div className="flex">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>{budgetsError}</p>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <WelcomePage
                    budgets={budgets}
                    setBudgets={setBudgets}
                  />
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
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AppRoutes; 