import React, { useState, useContext, useEffect } from 'react';
import RouteContext from '../../context/route/routeContext';
import LocationContext from '../../context/location/locationContext';
import AlertContext from '../../context/alert/alertContext';
import Spinner from '../layout/Spinner';

const RouteForm = () => {
  const routeContext = useContext(RouteContext);
  const locationContext = useContext(LocationContext);
  const alertContext = useContext(AlertContext);

  const { addRoute, error } = routeContext;
  const { locations, getLocations, loading } = locationContext;
  const { setAlert } = alertContext;

  useEffect(() => {
    getLocations();
    if (error) {
      setAlert(error, 'danger');
    }
    // eslint-disable-next-line
  }, [error]);

  const [route, setRoute] = useState({
    name: '',
    from: '',
    to: '',
    distance: '',
    duration: '',
    price: ''
  });

  const { name, from, to, distance, duration, price } = route;

  const onChange = e => {
    setRoute({
      ...route,
      [e.target.name]: e.target.value
    });
  };

  const onSubmit = e => {
    e.preventDefault();
    if (
      name === '' ||
      from === '' ||
      to === '' ||
      distance === '' ||
      duration === '' ||
      price === ''
    ) {
      setAlert('Please fill in all fields', 'danger');
    } else if (from === to) {
      setAlert('Origin and destination cannot be the same', 'danger');
    } else {
      // Convert string values to numbers
      const routeData = {
        ...route,
        distance: parseFloat(distance),
        duration: parseFloat(duration),
        price: parseFloat(price)
      };
      
      addRoute(routeData);
      setAlert('Route added successfully', 'success');
      
      // Clear form
      setRoute({
        name: '',
        from: '',
        to: '',
        distance: '',
        duration: '',
        price: ''
      });
    }
  };

  if (loading || !locations) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-primary">Add Route</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Route Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            placeholder="Route Name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="from">Origin</label>
          <select name="from" value={from} onChange={onChange} required>
            <option value="">Select Origin</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="to">Destination</label>
          <select name="to" value={to} onChange={onChange} required>
            <option value="">Select Destination</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="distance">Distance (km)</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            name="distance"
            value={distance}
            onChange={onChange}
            placeholder="Distance in kilometers"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            type="number"
            step="1"
            min="1"
            name="duration"
            value={duration}
            onChange={onChange}
            placeholder="Duration in minutes"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="price"
            value={price}
            onChange={onChange}
            placeholder="Price in dollars"
            required
          />
        </div>
        <div>
          <input
            type="submit"
            value="Add Route"
            className="btn btn-primary btn-block"
          />
        </div>
      </form>
    </div>
  );
};

export default RouteForm; 