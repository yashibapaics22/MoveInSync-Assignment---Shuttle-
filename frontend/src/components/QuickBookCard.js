import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes } from '../services/routeService';

const QuickBookCard = () => {
  const [routes, setRoutes] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await getRoutes();
        setRoutes(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching routes:', error);
        setLoading(false);
      }
    };
    
    fetchRoutes();
  }, []);
  
  const handleQuickBook = () => {
    navigate('/book-ride', { state: { source, destination } });
  };
  
  if (loading) {
    return <div className="dashboard-card">Loading...</div>;
  }
  
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Quick Book</h3>
      </div>
      <div className="quick-book-form">
        <div className="form-group">
          <label htmlFor="source" className="form-label">Source</label>
          <select 
            id="source" 
            className="form-input" 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Select source</option>
            {routes.map(route => (
              <option key={`source-${route._id}`} value={route.source._id}>
                {route.source.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="destination" className="form-label">Destination</label>
          <select 
            id="destination" 
            className="form-input" 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">Select destination</option>
            {routes.map(route => (
              <option key={`dest-${route._id}`} value={route.destination._id}>
                {route.destination.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          className="btn" 
          onClick={handleQuickBook}
          disabled={!source || !destination}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default QuickBookCard;