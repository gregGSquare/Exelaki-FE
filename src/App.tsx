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
  const token = localStorage.getItem("accessToken");
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    if (token) {
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
  }, [token]);

  return (
    <BudgetProvider>
      <Router>
        <HeaderWithNavigate />
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <WelcomePage
                  budgets={budgets} // Pass budgets
                  setBudgets={setBudgets} // Pass setBudgets to update the list
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/signup"
            element={<SignUp />}
          />
          <Route
            path="/dashboard/:id"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="*"
            element={token ? <Navigate to="/" /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </BudgetProvider>
  );
};

export default App;
