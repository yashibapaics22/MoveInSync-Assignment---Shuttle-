import {
  GET_BOOKINGS,
  GET_BOOKING,
  ADD_BOOKING,
  DELETE_BOOKING,
  UPDATE_BOOKING,
  BOOKING_ERROR,
  SET_CURRENT,
  CLEAR_CURRENT,
  CLEAR_BOOKINGS
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case GET_BOOKINGS:
      return {
        ...state,
        bookings: action.payload,
        loading: false
      };
    case GET_BOOKING:
      return {
        ...state,
        current: action.payload,
        loading: false
      };
    case ADD_BOOKING:
      return {
        ...state,
        bookings: [action.payload, ...state.bookings],
        loading: false
      };
    case UPDATE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        ),
        loading: false
      };
    case DELETE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.filter(
          booking => booking._id !== action.payload
        ),
        loading: false
      };
    case CLEAR_BOOKINGS:
      return {
        ...state,
        bookings: null,
        error: null,
        current: null
      };
    case SET_CURRENT:
      return {
        ...state,
        current: action.payload
      };
    case CLEAR_CURRENT:
      return {
        ...state,
        current: null
      };
    case BOOKING_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
}; 