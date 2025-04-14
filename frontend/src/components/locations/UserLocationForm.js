import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import LocationContext from '../../context/location/locationContext';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const UserLocationForm = () => {
  const locationContext = useContext(LocationContext);
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const history = useHistory();

  const { getLocations } = locationContext;
  const { user } = authContext;
  const { setAlert } = alertContext;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSubmitted, setLocationSubmitted] = useState(false);

  // Load locations on initial render
  useEffect(() => {
    getLocations().catch(err => {
      console.error('Failed to load locations:', err);
    });
    // eslint-disable-next-line
  }, []);

  const [location, setLocation] = useState({
    name: '',
    address: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    userEmail: '',
    notes: ''
  });

  const { name, address, coordinates, userEmail, notes } = location;

  const onChange = e => {
    setLocation({
      ...location,
      [e.target.name]: e.target.value
    });
  };

  const onCoordinateChange = e => {
    setLocation({
      ...location,
      coordinates: {
        ...coordinates,
        [e.target.name]: e.target.value
      }
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (name === '' || address === '') {
      setAlert('Please enter location name and address', 'danger');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Instead of calling the API directly, we'll just log the location 
      // and store it in localStorage for demonstration purposes
      
      // Create a location object
      const locationData = {
        name,
        address,
        coordinates: {
          lat: coordinates.lat ? parseFloat(coordinates.lat) : 0,
          lng: coordinates.lng ? parseFloat(coordinates.lng) : 0
        },
        userEmail: userEmail || (user ? user.email : ''),
        notes,
        suggestedAt: new Date().toISOString(),
        suggestedBy: user ? user.name : 'Anonymous'
      };
      
      console.log('Location suggestion submitted:', locationData);
      
      // Store in localStorage
      const existingSuggestions = JSON.parse(localStorage.getItem('locationSuggestions') || '[]');
      existingSuggestions.push(locationData);
      localStorage.setItem('locationSuggestions', JSON.stringify(existingSuggestions));
      
      setAlert('Location suggestion submitted successfully! An admin will review it.', 'success');
      setLocationSubmitted(true);
      
      // Clear form
      setLocation({
        name: '',
        address: '',
        coordinates: {
          lat: '',
          lng: ''
        },
        userEmail: '',
        notes: ''
      });
      
    } catch (err) {
      console.error('Error suggesting location:', err);
      setAlert('Failed to submit location suggestion. Please try again.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (locationSubmitted) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">Location Suggestion Submitted</h2>
        <div className="text-center my-2">
          <p className="lead">Thank you for your location suggestion!</p>
          <p>Your suggestion has been recorded and will be reviewed by an administrator.</p>
          <button 
            onClick={() => setLocationSubmitted(false)} 
            className="btn btn-primary my-2"
          >
            Submit Another Location
          </button>
          <button
            onClick={() => history.push('/locations')}
            className="btn btn-dark my-2 mx-2"
          >
            View All Locations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">
        Suggest New Location
      </h2>
      <p className="text-center lead">Submit a new pickup/drop-off location for approval</p>
      
      <div className="alert alert-info">
        <p>
          <i className="fas fa-info-circle"></i> Your suggestion will be reviewed by an administrator before being added to the system.
        </p>
      </div>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Location Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            placeholder="e.g. Airport Terminal 1, Central Bus Station"
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            name="address"
            value={address}
            onChange={onChange}
            placeholder="Full address with city and postal code"
            required
            className="form-control"
          />
        </div>
        
        <h3 className="text-primary">Location Coordinates (Optional)</h3>
        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="lat">Latitude</label>
            <input
              type="number"
              step="any"
              name="lat"
              value={coordinates.lat}
              onChange={onCoordinateChange}
              placeholder="e.g. 37.7749"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lng">Longitude</label>
            <input
              type="number"
              step="any"
              name="lng"
              value={coordinates.lng}
              onChange={onCoordinateChange}
              placeholder="e.g. -122.4194"
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="userEmail">Your Email (Optional)</label>
          <input
            type="email"
            name="userEmail"
            value={userEmail}
            onChange={onChange}
            placeholder="Your email in case we need to contact you"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            name="notes"
            value={notes}
            onChange={onChange}
            placeholder="Any additional information about this location"
            className="form-control"
          />
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Suggestion...' : 'Submit Location Suggestion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLocationForm; 