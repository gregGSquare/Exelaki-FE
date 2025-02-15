import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import WelcomePage from "./pages/WelcomePage";
import api from "./services/axios";
import { BudgetProvider } from "./contexts/BudgetContext";
import { useAuth } from "./contexts/AuthContext";
import Footer from "./components/Footer";
import { Budget } from './types/budget';

const HeaderWithNavigate: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleHomeClick = () => {
    console.log('a navigate to welcome page from app')
    navigate("/");
  };

  return <Header onSignUpClick={handleSignUpClick} onHomeClick={handleHomeClick} />;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchBudgets = async () => {
        try {
          const response = await api.get("/budget");
          setBudgets(response.data);
        } catch (error) {
          console.error("Error fetching budgets:", error);
        }
      };
      fetchBudgets();
    }
  }, [isAuthenticated]);

  return (
    <BudgetProvider>
      <Router>
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
      </Router>
    </BudgetProvider>
  );
};

export default App;
