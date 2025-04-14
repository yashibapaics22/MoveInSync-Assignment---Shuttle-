import {
  GET_LOCATIONS,
  ADD_LOCATION,
  DELETE_LOCATION,
  UPDATE_LOCATION,
  LOCATION_ERROR
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case GET_LOCATIONS:
      return {
        ...state,
        locations: action.payload,
        loading: false
      };
    case ADD_LOCATION:
      return {
        ...state,
        locations: [action.payload, ...state.locations],
        loading: false
      };
    case UPDATE_LOCATION:
      return {
        ...state,
        locations: state.locations.map(location =>
          location._id === action.payload._id ? action.payload : location
        ),
        loading: false
      };
    case DELETE_LOCATION:
      return {
        ...state,
        locations: state.locations.filter(
          location => location._id !== action.payload
        ),
        loading: false
      };
    case LOCATION_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
}; 