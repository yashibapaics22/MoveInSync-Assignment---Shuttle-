import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocations, getRouteOptions } from '../services/routeService';
import { createTrip } from '../services/tripService';
import { getWalletBalance } from '../services/walletService';
import LoadingSpinner from '../components/LoadingSpinner';

const BookRide = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState({ direct: null, withTransfer: [] });
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    sourceId: '',
    destinationId: '',
    routeIds: [],
    travelDate: '',
    isDirect: true
  });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Fetch initial data - locations and wallet balance
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch locations and wallet balance in parallel
        const [locationsResponse, walletResponse] = await Promise.all([
          getLocations(),
          getWalletBalance()
        ]);
        
        setLocations(locationsResponse.data || []);
        setWalletBalance(walletResponse.data.points || 0);
        setLoading(false);
        setWalletLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data. Please try again later.');
        setLoading(false);
        setWalletLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Fetch route options when source or destination changes
  useEffect(() => {
    const fetchRouteOptions = async () => {
      if (formData.sourceId && formData.destinationId) {
        setRoutesLoading(true);
        setSelectedRoute(null);
        setFormData(prev => ({ ...prev, routeIds: [] }));
        setTotalCost(0);
        
        try {
          const response = await getRouteOptions(formData.sourceId, formData.destinationId);
          console.log('Route options:', response.data);
          setAvailableRoutes(response.data || { direct: null, withTransfer: [] });
          setRoutesLoading(false);
        } catch (err) {
          console.error('Error fetching route options:', err);
          setError('Failed to load route options. Please try again later.');
          setRoutesLoading(false);
        }
      }
    };
    
    fetchRouteOptions();
  }, [formData.sourceId, formData.destinationId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset route selection when source or destination changes
    if (name === 'sourceId' || name === 'destinationId') {
      setFormData(prev => ({
        ...prev,
        routeIds: []
      }));
      setSelectedRoute(null);
      setTotalCost(0);
    }
  };
  
  const selectDirectRoute = () => {
    if (!availableRoutes.direct) return;
    
    const routeIds = availableRoutes.direct.routes.map(route => route._id);
    setFormData(prev => ({
      ...prev,
      routeIds,
      isDirect: true
    }));
    setSelectedRoute('direct');
    setTotalCost(availableRoutes.direct.totalPoints);
  };
  
  const selectTransferRoute = (index) => {
    if (!availableRoutes.withTransfer || !availableRoutes.withTransfer[index]) return;
    
    const routeIds = availableRoutes.withTransfer[index].routes.map(route => route._id);
    setFormData(prev => ({
      ...prev,
      routeIds,
      isDirect: false
    }));
    setSelectedRoute(`transfer-${index}`);
    setTotalCost(availableRoutes.withTransfer[index].totalPoints);
  };
  
  const formatDateTime = () => {
    const [date, time] = formData.travelDate.split('T');
    return new Date(`${date}T${time || '00:00'}:00.000Z`).toISOString();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (totalCost > walletBalance) {
      setError(`Insufficient balance. You need ${totalCost} points but have only ${walletBalance}.`);
      return;
    }
    
    setSubmitLoading(true);
    setError(null);
    
    try {
      // Convert date and time to ISO format
      const bookingData = {
        ...formData,
        travelDate: formatDateTime()
      };
      
      console.log('Booking data:', bookingData);
      const response = await createTrip(bookingData);
      console.log('Booking response:', response);
      
      setSubmitLoading(false);
      navigate('/trip-history', { 
        state: { 
          message: 'Ride booked successfully!',
          details: `${totalCost} points have been deducted from your wallet.` 
        } 
      });
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to book ride. Please try again.');
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }
  
  const isRouteSelected = selectedRoute !== null;
  const hasInsufficientBalance = totalCost > walletBalance;
  
  return (
    <div className="book-ride">
      <h1>Book a Ride</h1>
      
      {/* Wallet Balance Card */}
      <div className="wallet-status-card">
        <div className="wallet-info">
          <span className="wallet-label">Wallet Balance:</span>
          {walletLoading ? (
            <span>Loading...</span>
          ) : (
            <span className="wallet-amount">{walletBalance} points</span>
          )}
        </div>
        {totalCost > 0 && (
          <div className="trip-cost">
            <span className="cost-label">Trip Cost:</span>
            <span className={`cost-amount ${hasInsufficientBalance ? 'insufficient' : ''}`}>
              {totalCost} points
            </span>
            {hasInsufficientBalance && (
              <span className="insufficient-message">Insufficient balance</span>
            )}
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="book-ride-form">
        <div className="form-group">
          <label htmlFor="sourceId">Select Pickup Location</label>
          <select
            id="sourceId"
            name="sourceId"
            value={formData.sourceId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select pickup location --</option>
            {locations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="destinationId">Select Destination</label>
          <select
            id="destinationId"
            name="destinationId"
            value={formData.destinationId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select destination --</option>
            {locations.map((location) => (
              <option 
                key={location._id} 
                value={location._id}
                disabled={location._id === formData.sourceId}
              >
                {location.name}
              </option>
            ))}
          </select>
        </div>
        
        {routesLoading ? (
          <LoadingSpinner size="small" text="Loading route options..." />
        ) : (
          formData.sourceId && formData.destinationId && (
            <div className="available-routes-container">
              <h3>Available Routes</h3>
              
              {/* Direct Route */}
              {availableRoutes.direct ? (
                <div 
                  className={`route-card ${selectedRoute === 'direct' ? 'selected' : ''}`}
                  onClick={selectDirectRoute}
                >
                  <div className="route-header">
                    <h4>Direct Route</h4>
                    <span className="route-cost">{availableRoutes.direct.totalPoints} points</span>
                  </div>
                  <div className="route-details">
                    <div className="route-time">
                      <i className="far fa-clock"></i> {availableRoutes.direct.estimatedDuration} min
                    </div>
                    <div className="route-path">
                      {availableRoutes.direct.routes.map((route, idx) => (
                        <div key={route._id} className="route-segment">
                          <div className="segment-locations">
                            <span>{route.source?.name || 'Source'}</span>
                            <span className="segment-arrow">→</span>
                            <span>{route.destination?.name || 'Destination'}</span>
                          </div>
                          <div className="segment-details">
                            <span>{route.distance} km</span>
                            <span>{route.pointsCost} points</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-direct-route">No direct route available.</div>
              )}
              
              {/* Routes with Transfer */}
              {availableRoutes.withTransfer && availableRoutes.withTransfer.length > 0 ? (
                <div className="transfer-routes">
                  <h4>Routes with Transfer</h4>
                  {availableRoutes.withTransfer.map((option, index) => (
                    <div 
                      key={`transfer-${index}`}
                      className={`route-card ${selectedRoute === `transfer-${index}` ? 'selected' : ''}`}
                      onClick={() => selectTransferRoute(index)}
                    >
                      <div className="route-header">
                        <h4>Option {index + 1}</h4>
                        <span className="route-cost">{option.totalPoints} points</span>
                      </div>
                      <div className="route-details">
                        <div className="route-time">
                          <i className="far fa-clock"></i> {option.estimatedDuration} min (includes transfer time)
                        </div>
                        <div className="route-path">
                          {option.routes.map((route, idx) => (
                            <div key={`${route._id}-${idx}`} className="route-segment">
                              <div className="segment-locations">
                                <span>{route.source?.name || 'Source'}</span>
                                <span className="segment-arrow">→</span>
                                <span>{route.destination?.name || 'Destination'}</span>
                              </div>
                              <div className="segment-details">
                                <span>{route.distance} km</span>
                                <span>{route.pointsCost} points</span>
                              </div>
                              {idx < option.routes.length - 1 && (
                                <div className="transfer-indicator">
                                  <span>Transfer (10 min)</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-transfer-routes">No alternative routes available.</div>
              )}
              
              {(availableRoutes.direct || (availableRoutes.withTransfer && availableRoutes.withTransfer.length > 0)) ? (
                null
              ) : (
                <div className="no-routes-found">No routes available between selected locations.</div>
              )}
            </div>
          )
        )}
        
        <div className="form-group">
          <label htmlFor="travelDate">Travel Date & Time</label>
          <input
            type="datetime-local"
            id="travelDate"
            name="travelDate"
            value={formData.travelDate}
            onChange={handleChange}
            min={new Date().toISOString().split('.')[0].slice(0, -3)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary btn-block" 
          disabled={
            submitLoading || 
            !isRouteSelected || 
            !formData.travelDate || 
            hasInsufficientBalance
          }
        >
          {submitLoading ? 'Booking...' : 'Book Ride'}
        </button>
        
        {hasInsufficientBalance && (
          <div className="add-funds-prompt">
            <p>You don't have enough points for this ride.</p>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/dashboard')}
            >
              Add Funds
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookRide;
