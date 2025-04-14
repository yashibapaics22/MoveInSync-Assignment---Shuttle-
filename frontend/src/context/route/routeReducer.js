import {
  GET_ROUTES,
  ADD_ROUTE,
  DELETE_ROUTE,
  UPDATE_ROUTE,
  ROUTE_ERROR
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case GET_ROUTES:
      return {
        ...state,
        routes: action.payload,
        loading: false
      };
    case ADD_ROUTE:
      return {
        ...state,
        routes: [action.payload, ...state.routes],
        loading: false
      };
    case UPDATE_ROUTE:
      return {
        ...state,
        routes: state.routes.map(route =>
          route._id === action.payload._id ? action.payload : route
        ),
        loading: false
      };
    case DELETE_ROUTE:
      return {
        ...state,
        routes: state.routes.filter(
          route => route._id !== action.payload
        ),
        loading: false
      };
    case ROUTE_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
}; 