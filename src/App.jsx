import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Pricing from "./pages/Pricing";
import Discounts from "./pages/Discounts"; // (Create simpler file similar to Users)
import { AuthProvider, useAuth } from "./context/authContext";
import PurchasePlans from "./pages/PurchasePlans";

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading)
    return (
      <div className="h-screen w-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  if (!user || !isAdmin) return <Navigate to="/login" />;
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-grow overflow-y-auto h-screen">{children}</div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/users" />} />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-plans"
            element={
              <ProtectedRoute>
                <PurchasePlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discounts"
            element={
              <ProtectedRoute>
                <Discounts />
              </ProtectedRoute> // Assumes Discounts.jsx exists
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
