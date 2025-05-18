import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated, requiredRole }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && localStorage.getItem('userRole') !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default ProtectedRoute;