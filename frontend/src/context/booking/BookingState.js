import React, { useReducer } from 'react';
import BookingContext from './bookingContext';
import bookingReducer from './bookingReducer';
import BookingService, { 
  fetchAllBookings,
  fetchBookingById,
  createBooking,
  updateBooking,
  deleteBooking as deleteBookingAPI
} from '../../utils/BookingService';
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

const BookingState = props => {
  const initialState = {
    bookings: null,
    current: null,
    error: null,
    loading: true
  };

  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Get Bookings
  const getBookings = async () => {
    try {
      console.log('BookingState: Fetching bookings from service');
      const bookings = await fetchAllBookings();
      console.log('BookingState: Received bookings:', bookings);

      dispatch({
        type: GET_BOOKINGS,
        payload: bookings
      });
      
      return bookings;
    } catch (err) {
      console.error('BookingState: Error fetching bookings:', err);
      
      let errorMsg = 'Failed to load bookings';
      
      dispatch({
        type: BOOKING_ERROR,
        payload: errorMsg
      });
      
      throw err; // Rethrow to allow components to handle it
    }
  };

  // Get Booking
  const getBooking = async id => {
    try {
      const booking = await fetchBookingById(id);

      dispatch({
        type: GET_BOOKING,
        payload: booking
      });
      
      return booking;
    } catch (err) {
      console.error('Error getting booking by ID:', err);
      
      dispatch({
        type: BOOKING_ERROR,
        payload: 'Failed to load booking details'
      });
      
      throw err;
    }
  };

  // Add Booking
  const addBooking = async booking => {
    try {
      const newBooking = await createBooking(booking);
      console.log('New booking created:', newBooking);

      dispatch({
        type: ADD_BOOKING,
        payload: newBooking
      });
      
      return newBooking;
    } catch (err) {
      console.error('Error creating booking:', err);
      
      dispatch({
        type: BOOKING_ERROR,
        payload: 'Failed to create booking'
      });
      
      throw err;
    }
  };

  // Delete Booking
  const deleteBooking = async id => {
    try {
      await deleteBookingAPI(id);
      console.log('Booking deleted:', id);

      dispatch({
        type: DELETE_BOOKING,
        payload: id
      });
    } catch (err) {
      console.error('Error deleting booking:', err);
      
      dispatch({
        type: BOOKING_ERROR,
        payload: 'Failed to delete booking'
      });
      
      throw err;
    }
  };

  // Update Booking
  const updateBookingState = async (bookingData) => {
    try {
      const updated = await updateBooking(bookingData._id, bookingData);
      console.log('Booking updated:', updated);

      dispatch({
        type: UPDATE_BOOKING,
        payload: updated
      });
      
      return updated;
    } catch (err) {
      console.error('Error updating booking:', err);
      
      dispatch({
        type: BOOKING_ERROR,
        payload: 'Failed to update booking'
      });
      
      throw err;
    }
  };

  // Clear Bookings
  const clearBookings = () => {
    dispatch({ type: CLEAR_BOOKINGS });
  };

  // Set Current Booking
  const setCurrent = booking => {
    dispatch({ type: SET_CURRENT, payload: booking });
  };

  // Clear Current Booking
  const clearCurrent = () => {
    dispatch({ type: CLEAR_CURRENT });
  };

  return (
    <BookingContext.Provider
      value={{
        bookings: state.bookings,
        current: state.current,
        error: state.error,
        loading: state.loading,
        getBookings,
        getBooking,
        addBooking,
        deleteBooking,
        updateBooking: updateBookingState,
        setCurrent,
        clearCurrent,
        clearBookings
      }}
    >
      {props.children}
    </BookingContext.Provider>
  );
};

export default BookingState; 