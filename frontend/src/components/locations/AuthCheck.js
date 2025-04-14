import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const AuthCheck = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { user, isAuthenticated, loading } = authContext;
  const { setAlert } = alertContext;
  const [authInfo, setAuthInfo] = useState({
    token: localStorage.getItem('token') || 'Not found',
    hasToken: !!localStorage.getItem('token'),
    isAuthenticated: false,
    isAdmin: false,
    userId: null,
    userName: null
  });
  
  useEffect(() => {
    if (!loading && user) {
      setAuthInfo({
        token: localStorage.getItem('token') || 'Not found',
        hasToken: !!localStorage.getItem('token'),
        isAuthenticated: isAuthenticated,
        isAdmin: user?.isAdmin || false,
        userId: user?._id || null,
        userName: user?.name || null
      });
    }
  }, [user, isAuthenticated, loading]);
  
  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Authentication Check</h2>
      <div className="p-2">
        <h3>Current Auth Status:</h3>
        <ul className="list">
          <li><strong>Has Token:</strong> {authInfo.hasToken ? 'Yes' : 'No'}</li>
          <li><strong>Is Authenticated:</strong> {authInfo.isAuthenticated ? 'Yes' : 'No'}</li>
          <li><strong>Is Admin:</strong> {authInfo.isAdmin ? 'Yes' : 'No'}</li>
          <li><strong>User ID:</strong> {authInfo.userId || 'Not logged in'}</li>
          <li><strong>User Name:</strong> {authInfo.userName || 'Not logged in'}</li>
        </ul>
        
        <div className="alert alert-info">
          <p><strong>Note:</strong> Adding locations requires admin privileges.</p>
          {!authInfo.isAdmin && (
            <p className="text-danger">
              You don't have admin privileges, so you cannot add locations directly.
            </p>
          )}
        </div>
        
        <div className="btn-group">
          <button
            className="btn btn-dark"
            onClick={() => {
              console.log('Current token:', localStorage.getItem('token'));
              setAlert('Token info logged to console', 'success');
            }}
          >
            Log Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCheck; 