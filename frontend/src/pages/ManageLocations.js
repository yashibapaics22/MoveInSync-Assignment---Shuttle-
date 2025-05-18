import React, { useState, useEffect } from 'react';
import { getLocations, addLocation, updateLocation, toggleLocationStatus } from '../services/routeService';
import LoadingSpinner from '../components/LoadingSpinner';

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    coordinates: {
      lat: '',
      lng: ''
    }
  });
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getLocations();
        setLocations(response.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load locations. Please try again.');
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditing) {
        await updateLocation(formData.id, {
          name: formData.name,
          description: formData.description,
          coordinates: formData.coordinates
        });
        setSuccess('Location updated successfully!');
      } else {
        await addLocation({
          name: formData.name,
          description: formData.description,
          coordinates: formData.coordinates
        });
        setSuccess('Location added successfully!');
      }
      
      // Reset form and fetch updated locations
      setFormData({
        id: '',
        name: '',
        description: '',
        coordinates: {
          lat: '',
          lng: ''
        }
      });
      setIsEditing(false);
      setShowAddForm(false);
      
      // Fetch updated locations
      const response = await getLocations();
      setLocations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save location. Please try again.');
    }
  };
  
  const handleEdit = (location) => {
    setFormData({
      id: location._id,
      name: location.name,
      description: location.description || '',
      coordinates: {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      }
    });
    setIsEditing(true);
    setShowAddForm(true);
  };
  
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleLocationStatus(id, !currentStatus);
      
      // Update location in state
      setLocations(prevLocations => 
        prevLocations.map(location => 
          location._id === id 
            ? { ...location, active: !location.active } 
            : location
        )
      );
      
      setSuccess('Location status updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location status. Please try again.');
    }
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading locations..." />;
  }
  
  return (
    <div className="manage-locations">
      <div className="page-header">
        <h1>Manage Locations</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            if (showAddForm && isEditing) {
              // Reset form when canceling edit
              setFormData({
                id: '',
                name: '',
                description: '',
                coordinates: {
                  lat: '',
                  lng: ''
                }
              });
              setIsEditing(false);
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Location'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {showAddForm && (
        <div className="form-card">
          <h3>{isEditing ? 'Edit Location' : 'Add New Location'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Location Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lat">Latitude</label>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  value={formData.coordinates.lat}
                  onChange={handleChange}
                  step="0.000001"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lng">Longitude</label>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  value={formData.coordinates.lng}
                  onChange={handleChange}
                  step="0.000001"
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="locations-grid">
        {locations.length === 0 ? (
          <div className="empty-state">
            <p>No locations found. Add a location to get started.</p>
          </div>
        ) : (
          locations.map(location => (
            <div key={location._id} className="location-card">
              <div className="location-header">
                <h3>{location.name}</h3>
                <span className={`status-badge ${location.active ? 'active' : 'inactive'}`}>
                  {location.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="location-details">
                {location.description && (
                  <p className="location-description">{location.description}</p>
                )}
                
                <div className="location-coordinates">
                  <span>Lat: {location.coordinates.lat}</span>
                  <span>Lng: {location.coordinates.lng}</span>
                </div>
              </div>
              
              <div className="location-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleEdit(location)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleToggleStatus(location._id, location.active)}
                >
                  {location.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageLocations; 