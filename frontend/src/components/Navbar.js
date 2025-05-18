import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ userRole, onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <NavLink to="/dashboard" className="navbar-logo">
          Shuttle MS
        </NavLink>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className="mobile-menu-icon"></span>
        </button>
        
        <ul className={`navbar-nav ${mobileMenuOpen ? 'show' : ''}`}>
          <li className="nav-item">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </NavLink>
          </li>
          
          {userRole !== 'admin' && (
            <li className="nav-item">
              <NavLink 
                to="/book-ride" 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Ride
              </NavLink>
            </li>
          )}
          
          <li className="nav-item">
            <NavLink 
              to="/trip-history" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              Bookings
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/profile" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </NavLink>
          </li>
          {userRole === 'admin' && (
            <li className="nav-item">
              <NavLink 
                to="/admin" 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            <button onClick={handleLogout} className="btn">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;