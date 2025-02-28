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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderWithNavigate />
      <main className="pt-16 flex-grow">
        {budgetsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4" role="alert">
            <p>{budgetsError}</p>
          </div>
        )}
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
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes; 