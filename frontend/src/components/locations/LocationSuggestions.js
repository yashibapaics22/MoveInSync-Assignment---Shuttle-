import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlertContext from '../../context/alert/alertContext';
import AuthContext from '../../context/auth/authContext';
import LocationContext from '../../context/location/locationContext';
import Spinner from '../layout/Spinner';

const LocationSuggestions = () => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  const locationContext = useContext(LocationContext);
  
  const { setAlert } = alertContext;
  const { user } = authContext;
  const { addLocation } = locationContext;
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Load suggestions from localStorage
    try {
      const storedSuggestions = JSON.parse(localStorage.getItem('locationSuggestions') || '[]');
      setSuggestions(storedSuggestions);
    } catch (error) {
      console.error('Error loading location suggestions:', error);
      setAlert('Error loading location suggestions', 'danger');
    } finally {
      setLoading(false);
    }
  }, [refreshKey, setAlert]);
  
  const handleApprove = async (suggestion) => {
    try {
      // Format the suggestion into a location object
      const locationData = {
        name: suggestion.name,
        address: suggestion.address,
        coordinates: {
          lat: suggestion.coordinates.lat || 0,
          lng: suggestion.coordinates.lng || 0
        }
      };
      
      // Add the location using the existing context method
      const result = await addLocation(locationData);
      console.log('Location approved and added:', result);
      
      // Remove the suggestion from localStorage
      removeSuggestion(suggestion);
      
      setAlert('Location approved and added successfully', 'success');
    } catch (error) {
      console.error('Error approving location:', error);
      setAlert('Error approving location. Please try again.', 'danger');
    }
  };
  
  const handleReject = (suggestion) => {
    if (window.confirm('Are you sure you want to reject this location suggestion?')) {
      removeSuggestion(suggestion);
      setAlert('Location suggestion rejected', 'success');
    }
  };
  
  const removeSuggestion = (suggestionToRemove) => {
    try {
      // Remove the suggestion from the array
      const updatedSuggestions = suggestions.filter(
        suggestion => suggestion.suggestedAt !== suggestionToRemove.suggestedAt
      );
      
      // Update localStorage
      localStorage.setItem('locationSuggestions', JSON.stringify(updatedSuggestions));
      
      // Update state to trigger re-render
      setSuggestions(updatedSuggestions);
    } catch (error) {
      console.error('Error removing suggestion:', error);
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  if (!user || !user.isAdmin) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">Location Suggestions</h2>
        <div className="alert alert-danger">
          <p>You need administrator privileges to view this page.</p>
        </div>
        <div className="text-center p-1">
          <Link to="/locations" className="btn btn-dark">
            Back to Locations
          </Link>
        </div>
      </div>
    );
  }
  
  if (suggestions.length === 0) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">Location Suggestions</h2>
        <p className="text-center lead">No location suggestions found</p>
        <div className="text-center p-1">
          <Link to="/locations" className="btn btn-dark">
            Back to Locations
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Location Suggestions</h2>
      <p className="text-center lead">Review and approve location suggestions</p>
      
      <div className="grid-locations">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="card bg-white location-item">
            <div className="location-header">
              <h3>{suggestion.name}</h3>
            </div>
            <p>
              <strong>Address: </strong> {suggestion.address}
            </p>
            <p>
              <strong>Coordinates: </strong>
              {suggestion.coordinates && suggestion.coordinates.lat
                ? `${suggestion.coordinates.lat}, ${suggestion.coordinates.lng}`
                : 'Not specified'}
            </p>
            {suggestion.notes && (
              <p>
                <strong>Notes: </strong> {suggestion.notes}
              </p>
            )}
            <p>
              <strong>Suggested By: </strong> {suggestion.suggestedBy || 'Anonymous'}
            </p>
            {suggestion.userEmail && (
              <p>
                <strong>Email: </strong> {suggestion.userEmail}
              </p>
            )}
            <p>
              <strong>Suggested At: </strong> {new Date(suggestion.suggestedAt).toLocaleString()}
            </p>
            
            <div className="grid-2 mt-2">
              <button
                className="btn btn-success"
                onClick={() => handleApprove(suggestion)}
              >
                Approve
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleReject(suggestion)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center p-1">
        <Link to="/locations" className="btn btn-dark">
          Back to Locations
        </Link>
      </div>
    </div>
  );
};

export default LocationSuggestions; 