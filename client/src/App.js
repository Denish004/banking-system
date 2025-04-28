import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Components
import CustomerLogin from "./components/auth/CustomerLogin";
import BankerLogin from "./components/auth/BankerLogin";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import BankerDashboard from "./components/banker/BankerDashboard";
import CustomerTransactions from "./components/customer/CustomerTransactions";
import BankerUserDetails from "./components/banker/BankerUserDetails";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/banker/login" element={<BankerLogin />} />

          {/* Protected Customer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute userRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute userRole="customer">
                <CustomerTransactions />
              </ProtectedRoute>
            }
          />

          {/* Protected Banker Routes */}
          <Route
            path="/banker/dashboard"
            element={
              <ProtectedRoute userRole="banker">
                <BankerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/banker/users/:userId"
            element={
              <ProtectedRoute userRole="banker">
                <BankerUserDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
