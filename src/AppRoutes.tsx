import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DashboardV2 from './ui-v2/dashboard/DashboardV2';
import DataSetup from './ui-v2/setup/DataSetup';
import Projections from './ui-v2/projections/Projections';
import Callback from './pages/Callback';
import Settings from './ui-v2/pages/Settings';
import SignedOut from './pages/SignedOut';
import Landing from './pages/Landing';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/signed-out" element={<SignedOut />} />
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