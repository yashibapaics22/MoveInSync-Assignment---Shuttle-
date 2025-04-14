import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LocationContext from '../../context/location/locationContext';
import AuthContext from '../../context/auth/authContext';
import Spinner from '../layout/Spinner';

const LocationList = () => {
  const locationContext = useContext(LocationContext);
  const authContext = useContext(AuthContext);
  const { locations, getLocations, loading, deleteLocation, error } = locationContext;
  const { user } = authContext;
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh

  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      try {
        console.log('LocationList: Loading locations');
        await getLocations();
        console.log('LocationList: Locations loaded successfully');
      } catch (error) {
        console.error('LocationList: Error loading locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocations();
    // eslint-disable-next-line
  }, [refreshKey]); // Refresh when refreshKey changes

  const onDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
        // Trigger a refresh after deletion
        setRefreshKey(prevKey => prevKey + 1);
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (isLoading || loading) {
    return (
      <div className="card bg-light text-center">
        <h2 className="text-primary">Locations</h2>
        <p>Loading locations...</p>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">Locations</h2>
        <div className="alert alert-danger">{error}</div>
        <div className="text-center">
          <button onClick={handleRefresh} className="btn btn-dark">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">Locations</h2>
        <p className="text-center lead">No locations found</p>
        <div className="text-center p-1">
          <Link to="/locations/add" className="btn btn-primary">
            Add Location
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Locations</h2>
      
      <div className="my-1 text-right">
        <button onClick={handleRefresh} className="btn btn-dark btn-sm">
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>
      
      <p className="text-center">Showing {locations.length} locations</p>
      
      <div className="grid-locations">
        {locations.map((location) => (
          <div key={location._id} className="card bg-white location-item">
            <div className="location-header">
              <h3>{location.name}</h3>
              {user && user.isAdmin && (
                <div>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => onDelete(location._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
            <p>
              <strong>Address: </strong> {location.address}
            </p>
            <p>
              <strong>Coordinates: </strong>
              {location.coordinates && location.coordinates.lat !== undefined 
                ? `${location.coordinates.lat}, ${location.coordinates.lng}` 
                : 'Not specified'}
            </p>
          </div>
        ))}
      </div>
      
      <div className="text-center p-1">
        <Link to="/locations/add" className="btn btn-primary">
          Add New Location
        </Link>
      </div>
    </div>
  );
};

export default LocationList; 