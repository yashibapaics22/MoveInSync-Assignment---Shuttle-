import React, { useReducer } from 'react';
import RouteContext from './routeContext';
import routeReducer from './routeReducer';
import RouteService, {
  fetchAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute as deleteRouteAPI
} from '../../utils/RouteService';
import {
  GET_ROUTES,
  ADD_ROUTE,
  DELETE_ROUTE,
  UPDATE_ROUTE,
  ROUTE_ERROR
} from '../types';

const RouteState = props => {
  const initialState = {
    routes: null,
    error: null,
    loading: true
  };

  const [state, dispatch] = useReducer(routeReducer, initialState);

  // Get Routes
  const getRoutes = async () => {
    try {
      console.log('RouteState: Fetching routes from service');
      const routes = await fetchAllRoutes();
      console.log('RouteState: Received routes:', routes);

      dispatch({
        type: GET_ROUTES,
        payload: routes
      });
      
      return routes;
    } catch (err) {
      console.error('RouteState: Error fetching routes:', err);
      
      dispatch({
        type: ROUTE_ERROR,
        payload: 'Failed to load routes'
      });
      
      throw err;
    }
  };

  // Add Route
  const addRoute = async route => {
    try {
      console.log('RouteState: Adding route:', route);
      const newRoute = await createRoute(route);
      console.log('RouteState: Route added successfully:', newRoute);

      dispatch({
        type: ADD_ROUTE,
        payload: newRoute
      });
      
      return newRoute;
    } catch (err) {
      console.error('RouteState: Error adding route:', err);
      
      dispatch({
        type: ROUTE_ERROR,
        payload: 'Failed to add route'
      });
      
      throw err;
    }
  };

  // Delete Route
  const deleteRoute = async id => {
    try {
      await deleteRouteAPI(id);
      console.log('RouteState: Route deleted:', id);

      dispatch({
        type: DELETE_ROUTE,
        payload: id
      });
    } catch (err) {
      console.error('RouteState: Error deleting route:', err);
      
      dispatch({
        type: ROUTE_ERROR,
        payload: 'Failed to delete route'
      });
      
      throw err;
    }
  };

  // Update Route
  const updateRouteState = async route => {
    try {
      const updated = await updateRoute(route._id, route);
      console.log('RouteState: Route updated:', updated);

      dispatch({
        type: UPDATE_ROUTE,
        payload: updated
      });
      
      return updated;
    } catch (err) {
      console.error('RouteState: Error updating route:', err);
      
      dispatch({
        type: ROUTE_ERROR,
        payload: 'Failed to update route'
      });
      
      throw err;
    }
  };

  return (
    <RouteContext.Provider
      value={{
        routes: state.routes,
        error: state.error,
        loading: state.loading,
        getRoutes,
        addRoute,
        deleteRoute,
        updateRoute: updateRouteState
      }}
    >
      {props.children}
    </RouteContext.Provider>
  );
};

export default RouteState; 