import React, { useState, useEffect } from 'react';
import { getRoutes, addRoute, updateRoute, deleteRoute, getLocations } from '../services/routeService';
import LoadingSpinner from '../components/LoadingSpinner';

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    source: '',
    destination: '',
    distance: '',
    pointsCost: '',
    estimatedDuration: '',
    active: true
  });
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [routesResponse, locationsResponse] = await Promise.all([
        getRoutes(),
        getLocations()
      ]);
      
      console.log('Routes response:', routesResponse.data);
      
      // Make sure all routes have the active property
      const routesWithActiveStatus = routesResponse.data.map(route => ({
        ...route,
        active: route.active !== undefined ? route.active : true
      }));
      
      console.log('Routes with active status:', routesWithActiveStatus);
      
      setRoutes(routesWithActiveStatus || []);
      setLocations(locationsResponse.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load routes and locations. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Log the form data to verify what we're sending
      console.log('Form data being submitted:', formData);
      
      const routeData = {
        name: formData.name,
        sourceId: formData.source,
        destinationId: formData.destination,
        distance: parseFloat(formData.distance),
        pointsCost: parseInt(formData.pointsCost, 10),
        estimatedDuration: parseInt(formData.estimatedDuration, 10),
        active: formData.active
      };
      
      console.log('Route data to be sent:', routeData);
      
      if (isEditing) {
        const response = await updateRoute(formData.id, routeData);
        console.log('Update response:', response);
        setSuccess('Route updated successfully!');
      } else {
        const response = await addRoute(routeData);
        console.log('Add response:', response);
        setSuccess('Route added successfully!');
      }
      
      setFormData({ 
        id: '', 
        name: '', 
        source: '', 
        destination: '', 
        distance: '', 
        pointsCost: '', 
        estimatedDuration: '',
        active: true
      });
      setIsEditing(false);
      
      // Wait a moment before fetching updated routes
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error saving route:', error);
      setError(error.response?.data?.message || 'Failed to save route. Please try again.');
    }
  };
  
  const handleEdit = (route) => {
    console.log('Route being edited:', route);
    setFormData({
      id: route._id,
      name: route.name,
      source: route.source._id || route.source,
      destination: route.destination._id || route.destination,
      distance: route.distance,
      pointsCost: route.pointsCost,
      estimatedDuration: route.estimatedDuration,
      active: route.active !== undefined ? route.active : true
    });
    setIsEditing(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute(id);
        setSuccess('Route deleted successfully!');
        fetchData();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete route. Please try again.');
      }
    }
  };
  
  const handleCancel = () => {
    setFormData({ 
      id: '', 
      name: '', 
      source: '', 
      destination: '', 
      distance: '', 
      pointsCost: '', 
      estimatedDuration: '',
      active: true
    });
    setIsEditing(false);
  };
  
  const toggleRouteStatus = async (route) => {
    try {
      console.log('Toggling route status. Current active state:', route.active);
      
      // Extract source and destination IDs
      const sourceId = route.source._id || route.source;
      const destinationId = route.destination._id || route.destination;
      
      const updatedRouteData = {
        name: route.name,
        sourceId: sourceId,
        destinationId: destinationId,
        distance: route.distance,
        pointsCost: route.pointsCost,
        estimatedDuration: route.estimatedDuration,
        active: !route.active
      };
      
      console.log('Sending updated route data:', updatedRouteData);
      
      const response = await updateRoute(route._id, updatedRouteData);
      console.log('Toggle response:', response);
      
      setSuccess(`Route ${route.active ? 'deactivated' : 'activated'} successfully!`);
      
      // Update the routes in the state immediately for better UX
      setRoutes(prevRoutes => 
        prevRoutes.map(r => 
          r._id === route._id 
            ? { ...r, active: !r.active } 
            : r
        )
      );
      
      // Fetch updated data after a short delay
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error updating route status:', error);
      setError(error.response?.data?.message || 'Failed to update route status. Please try again.');
    }
  };
  
  const filteredRoutes = () => {
    if (statusFilter === 'all') return routes;
    if (statusFilter === 'active') return routes.filter(route => route.active);
    if (statusFilter === 'inactive') return routes.filter(route => !route.active);
    return routes;
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading data..." />;
  }
  
  return (
    <div className="manage-routes">
      <h1>Manage Routes</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {/* Debug section */}
      <div className="card" style={{marginBottom: '20px'}}>
        <h3>Routes Debug Info</h3>
        <p>Total Routes: {routes.length}</p>
        <p>Active Routes: {routes.filter(r => r.active).length}</p>
        <p>Inactive Routes: {routes.filter(r => !r.active).length}</p>
        <div style={{marginTop: '10px'}}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => {
              console.log('All routes:', routes);
            }}
          >
            Log All Routes
          </button>
        </div>
      </div>
      
      <div className="card">
        <h2>{isEditing ? 'Edit Route' : 'Add New Route'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Route Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="source" className="form-label">Source Location</label>
            <select
              id="source"
              name="source"
              className="form-input"
              value={formData.source}
              onChange={handleChange}
              required
            >
              <option value="">Select source location</option>
              {locations.map(location => (
                <option key={`source-${location._id}`} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="destination" className="form-label">Destination Location</label>
            <select
              id="destination"
              name="destination"
              className="form-input"
              value={formData.destination}
              onChange={handleChange}
              required
            >
              <option value="">Select destination location</option>
              {locations.map(location => (
                <option 
                  key={`destination-${location._id}`}
                  value={location._id}
                >
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="distance" className="form-label">Distance</label>
            <input
              type="text"
              id="distance"
              name="distance"
              className="form-input"
              value={formData.distance}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pointsCost" className="form-label">Points Cost</label>
            <input
              type="text"
              id="pointsCost"
              name="pointsCost"
              className="form-input"
              value={formData.pointsCost}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="estimatedDuration" className="form-label">Estimated Duration</label>
            <input
              type="text"
              id="estimatedDuration"
              name="estimatedDuration"
              className="form-input"
              value={formData.estimatedDuration}
              onChange={handleChange}
              required
            />
          </div>
          
          {isEditing && (
            <div className="form-group">
              <label htmlFor="active" className="form-label">Status</label>
              <select
                id="active"
                name="active"
                className="form-input"
                value={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Add'} Route</button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel} style={{marginLeft: '10px'}}>
              Cancel
            </button>
          )}
        </form>
      </div>
      
      <div className="card" style={{marginTop: '20px'}}>
        <h2>All Routes</h2>
        
        <div className="filter-controls" style={{marginBottom: '15px'}}>
          <div className="form-group" style={{margin: '0', maxWidth: '200px'}}>
            <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
            <select
              id="statusFilter"
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Routes</option>
              <option value="active">Active Routes</option>
              <option value="inactive">Inactive Routes</option>
            </select>
          </div>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Distance</th>
              <th>Points</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes().length === 0 ? (
              <tr>
                <td colSpan="8" style={{textAlign: 'center'}}>No routes found</td>
              </tr>
            ) : (
              filteredRoutes().map(route => (
                <tr key={route._id} className={!route.active ? 'inactive-row' : ''}>
                  <td>{route.name}</td>
                  <td>{route.source?.name || 'Unknown'}</td>
                  <td>{route.destination?.name || 'Unknown'}</td>
                  <td>{route.distance} km</td>
                  <td>{route.pointsCost} points</td>
                  <td>{route.estimatedDuration} min</td>
                  <td>
                    <span className={`status-badge ${route.active ? 'active' : 'inactive'}`}>
                      {route.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-secondary" 
                        onClick={() => handleEdit(route)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`btn btn-sm ${route.active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleRouteStatus(route)}
                      >
                        {route.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(route._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRoutes;