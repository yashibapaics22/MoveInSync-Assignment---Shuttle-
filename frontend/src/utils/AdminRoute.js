import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import AuthContext from '../context/auth/authContext';
import Spinner from '../components/layout/Spinner';

const AdminRoute = ({ component: Component, ...rest }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, user } = authContext;
  
  const isAdmin = user && user.isAdmin;

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <Spinner />
        ) : isAuthenticated && isAdmin ? (
          <Component {...props} />
        ) : isAuthenticated && !isAdmin ? (
          <Redirect to="/unauthorized" />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default AdminRoute; 