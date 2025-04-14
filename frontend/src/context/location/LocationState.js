import React, { useReducer } from 'react';
import LocationContext from './locationContext';
import locationReducer from './locationReducer';
import LocationService, {
  fetchAllLocations,
  createLocation,
  updateLocation,
  deleteLocation as deleteLocationAPI
} from '../../utils/LocationService';
import {
  GET_LOCATIONS,
  ADD_LOCATION,
  DELETE_LOCATION,
  UPDATE_LOCATION,
  LOCATION_ERROR
} from '../types';

const LocationState = props => {
  const initialState = {
    locations: null,
    error: null,
    loading: true
  };

  const [state, dispatch] = useReducer(locationReducer, initialState);

  // Get Locations
  const getLocations = async () => {
    try {
      console.log('LocationState: Fetching locations from service');
      const locations = await fetchAllLocations();
      console.log('LocationState: Received locations:', locations);

      dispatch({
        type: GET_LOCATIONS,
        payload: locations
      });
      
      return locations;
    } catch (err) {
      console.error('LocationState: Error fetching locations:', err);
      
      dispatch({
        type: LOCATION_ERROR,
        payload: 'Failed to load locations'
      });
      
      throw err;
    }
  };

  // Add Location
  const addLocation = async location => {
    try {
      console.log('LocationState: Adding location:', location);
      const newLocation = await createLocation(location);
      console.log('LocationState: Location added successfully:', newLocation);

      dispatch({
        type: ADD_LOCATION,
        payload: newLocation
      });
      
      return newLocation;
    } catch (err) {
      console.error('LocationState: Error adding location:', err);
      
      dispatch({
        type: LOCATION_ERROR,
        payload: 'Failed to add location'
      });
      
      throw err;
    }
  };

  // Delete Location
  const deleteLocation = async id => {
    try {
      await deleteLocationAPI(id);
      console.log('LocationState: Location deleted:', id);

      dispatch({
        type: DELETE_LOCATION,
        payload: id
      });
    } catch (err) {
      console.error('LocationState: Error deleting location:', err);
      
      dispatch({
        type: LOCATION_ERROR,
        payload: 'Failed to delete location'
      });
      
      throw err;
    }
  };

  // Update Location
  const updateLocationState = async location => {
    try {
      const updated = await updateLocation(location._id, location);
      console.log('LocationState: Location updated:', updated);

      dispatch({
        type: UPDATE_LOCATION,
        payload: updated
      });
      
      return updated;
    } catch (err) {
      console.error('LocationState: Error updating location:', err);
      
      dispatch({
        type: LOCATION_ERROR,
        payload: 'Failed to update location'
      });
      
      throw err;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        locations: state.locations,
        error: state.error,
        loading: state.loading,
        getLocations,
        addLocation,
        deleteLocation,
        updateLocation: updateLocationState
      }}
    >
      {props.children}
    </LocationContext.Provider>
  );
};

export default LocationState; 