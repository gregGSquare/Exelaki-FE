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

interface Budget {
  _id: string;
  name: string;
  month: number;
  year: number;
}

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
        <HeaderWithNavigate />
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
      </Router>
    </BudgetProvider>
  );
};

export default App;
