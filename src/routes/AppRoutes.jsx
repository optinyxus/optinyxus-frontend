import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DashboardHome from '../pages/dashboard/DashboardHome';
import PriceGenix from '../pages/dashboard/PriceGenix';
import MarketEdge from '../pages/dashboard/MarketEdge';
import OptiFlow from '../pages/dashboard/OptiFlow';
import EngageSync from '../pages/dashboard/EngageSync';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Redirect root based on auth status */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Dashboard Home - Shows all 4 products */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardHome />
        </ProtectedRoute>
      } />
      
      {/* Individual Product Dashboards */}
      <Route path="/dashboard/pricegenix" element={
        <ProtectedRoute>
          <PriceGenix />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/marketedge" element={
        <ProtectedRoute>
          <MarketEdge />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/optiflow" element={
        <ProtectedRoute>
          <OptiFlow />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/engagesync" element={
        <ProtectedRoute>
          <EngageSync />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
