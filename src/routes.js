import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './user/Dashboard';
import BrowseCars from './user/BrowseCars';
import MyBookings from './user/MyBookings';
import MyReturns from './user/MyReturns';
import Payments from './user/Payments';
import Profile from './user/Profile';

// Import Admin pages
import AdminDashboard from './admin/AdminDashboard';
import ManageVehicles from './admin/ManageVehicles';
import ManageCustomers from './admin/ManageCustomers';
import ManageBookings from './admin/ManageBookings';
import ManagePayments from './admin/ManagePayments';
import ManageReturns from './admin/ManageReturns';
import ManageReports from './admin/ManageReports';
import AdminSettings from './admin/AdminSettings';

const AuthLoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#444' }}>
    Checking your session...
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      
      {/* User Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/browse-cars" 
        element={
          <ProtectedRoute>
            <BrowseCars />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-bookings" 
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-returns" 
        element={
          <ProtectedRoute>
            <MyReturns />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/vehicles" 
        element={
          <AdminRoute>
            <ManageVehicles />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/customers" 
        element={
          <AdminRoute>
            <ManageCustomers />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/bookings" 
        element={
          <AdminRoute>
            <ManageBookings />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/payments" 
        element={
          <AdminRoute>
            <ManagePayments />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/returns" 
        element={
          <AdminRoute>
            <ManageReturns />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <AdminRoute>
            <ManageReports />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } 
      />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
