import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import LocationContext from '../../context/location/locationContext';
import AlertContext from '../../context/alert/alertContext';

const LocationForm = () => {
  const locationContext = useContext(LocationContext);
  const alertContext = useContext(AlertContext);
  const history = useHistory();

  const { addLocation, error, locations, getLocations } = locationContext;
  const { setAlert } = alertContext;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load locations on initial render
  useEffect(() => {
    if (!locations) {
      getLocations().catch(err => {
        console.error('Failed to load locations:', err);
      });
    }
    // eslint-disable-next-line
  }, []);

  // Handle errors from context
  useEffect(() => {
    if (error) {
      setAlert(error, 'danger');
      setIsSubmitting(false);
    }
    // eslint-disable-next-line
  }, [error]);

  const [location, setLocation] = useState({
    name: '',
    address: '',
    coordinates: {
      lat: '',
      lng: ''
    }
  });

  const { name, address, coordinates } = location;

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
      // Provide default coordinates if not specified
      const locationData = {
        ...location,
        coordinates: {
          lat: coordinates.lat ? parseFloat(coordinates.lat) : 0,
          lng: coordinates.lng ? parseFloat(coordinates.lng) : 0
        }
      };
      
      console.log('Submitting location:', locationData);
      const result = await addLocation(locationData);
      console.log('Location added:', result);
      
      setAlert('Location added successfully', 'success');
      
      // Clear form
      setLocation({
        name: '',
        address: '',
        coordinates: {
          lat: '',
          lng: ''
        }
      });

      // Refresh locations list
      await getLocations();
      
      // Redirect to locations list
      history.push('/locations');
    } catch (err) {
      console.error('Error adding location:', err);
      setAlert('Failed to add location. Please try again.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">
        Add New Location
      </h2>
      <p className="text-center lead">Enter details of a new pickup/drop-off location</p>
      
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
        
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Location...' : 'Add Location'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm; 