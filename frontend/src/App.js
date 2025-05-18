import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookRide from './pages/BookRide';
import TripHistory from './pages/TripHistory';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import ManageStudents from './pages/ManageStudents';
import ManageRoutes from './pages/ManageRoutes';
import ManageBookings from './pages/ManageBookings';
import ManageLocations from './pages/ManageLocations';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      setIsAuthenticated(true);
      setUserRole(user.role || '');
    }
  }, []);
  
  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify({
      id: userData.user.id,
      name: userData.user.name,
      email: userData.user.email,
      role: userData.user.role
    }));
    
    setIsAuthenticated(true);
    setUserRole(userData.user.role || '');
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole('');
  };
  
  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar userRole={userRole} onLogout={logout} />}
        <div className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
            />
            
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={login} />} 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/book-ride" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <BookRide />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/trip-history" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <TripHistory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
                  <ManageStudents />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/routes" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
                  <ManageRoutes />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
                  <ManageBookings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/locations" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
                  <ManageLocations />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;