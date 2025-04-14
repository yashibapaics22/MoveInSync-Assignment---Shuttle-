import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RouteContext from '../../context/route/routeContext';
import AuthContext from '../../context/auth/authContext';
import Spinner from '../layout/Spinner';

const RouteList = () => {
  const routeContext = useContext(RouteContext);
  const authContext = useContext(AuthContext);
  const { routes, getRoutes, loading, deleteRoute } = routeContext;
  const { user } = authContext;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      setIsLoading(true);
      try {
        await getRoutes();
      } catch (error) {
        console.error('Error loading routes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRoutes();
    // eslint-disable-next-line
  }, []);

  const onDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteRoute(id);
    }
  };

  if (isLoading || loading) {
    return <Spinner />;
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">Available Routes</h2>
        <p className="text-center lead">No routes found</p>
        {user && user.isAdmin && (
          <div className="text-center p-1">
            <Link to="/routes/add" className="btn btn-primary">
              Add Route
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Available Routes</h2>
      <div className="grid-locations">
        {routes.map((route) => (
          <div key={route._id} className="card bg-white">
            <div className="location-header">
              <h3>{route.name}</h3>
              {user && user.isAdmin && (
                <div>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => onDelete(route._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
            <div className="route-details">
              <p>
                <strong>From: </strong> 
                {route.from && route.from.name ? route.from.name : 'Unknown'}
              </p>
              <p>
                <strong>To: </strong> 
                {route.to && route.to.name ? route.to.name : 'Unknown'}
              </p>
              <p>
                <strong>Distance: </strong> 
                {route.distance ? `${route.distance} km` : 'Not specified'}
              </p>
              <p>
                <strong>Duration: </strong> 
                {route.duration ? `${route.duration} minutes` : 'Not specified'}
              </p>
              <p>
                <strong>Price: </strong> 
                ${route.price ? route.price.toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="text-center mt-2">
              <Link to={`/bookings/new?route=${route._id}`} className="btn btn-primary">
                Book This Route
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {user && user.isAdmin && (
        <div className="text-center p-1">
          <Link to="/routes/add" className="btn btn-primary">
            Add New Route
          </Link>
        </div>
      )}
    </div>
  );
};

export default RouteList; 