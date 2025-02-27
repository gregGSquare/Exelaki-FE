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

  useEffect(() => {
    if (isAuthenticated) {
      const fetchBudgets = async () => {
        try {
          const response = await api.get('/budget');
          setBudgets(response.data);
        } catch (error) {
          // Handle the error appropriately
        }
      };
      fetchBudgets();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderWithNavigate />
      <main className="pt-16 flex-grow">
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