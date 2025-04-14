import React, { useContext, useEffect, useState } from 'react';
import BookingContext from '../../context/booking/bookingContext';
import Spinner from '../layout/Spinner';
import axios from 'axios';

const BookingDebug = () => {
  const bookingContext = useContext(BookingContext);
  const { bookings, getBookings, loading, error } = bookingContext;
  const [directBookings, setDirectBookings] = useState(null);
  const [directLoading, setDirectLoading] = useState(true);
  const [directError, setDirectError] = useState(null);

  // Load bookings via context
  useEffect(() => {
    console.log('Loading bookings via context');
    getBookings();
    // eslint-disable-next-line
  }, []);

  // Also try loading bookings directly
  useEffect(() => {
    const loadBookingsDirect = async () => {
      setDirectLoading(true);
      try {
        console.log('Loading bookings directly with axios');
        const res = await axios.get('/api/bookings');
        console.log('Direct axios result:', res.data);
        setDirectBookings(res.data);
        setDirectError(null);
      } catch (err) {
        console.error('Direct axios error:', err);
        setDirectError(err.message || 'Error loading bookings directly');
      } finally {
        setDirectLoading(false);
      }
    };

    loadBookingsDirect();
  }, []);

  if (loading && directLoading) {
    return <Spinner />;
  }

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Booking Debug Info</h2>
      
      <div className="grid-2">
        <div className="card bg-white">
          <h3>Context Bookings</h3>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error ? error : 'None'}</p>
          <p>Bookings Count: {bookings ? bookings.length : 'null'}</p>
          
          {bookings && bookings.length > 0 ? (
            <div>
              <h4>Booking IDs:</h4>
              <ul>
                {bookings.map(booking => (
                  <li key={booking._id}>
                    {booking._id} - {booking.status || 'No status'} - 
                    Route: {booking.route ? (booking.route.name || 'Unnamed') : 'No route'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No bookings found in context</p>
          )}
        </div>
        
        <div className="card bg-white">
          <h3>Direct API Bookings</h3>
          <p>Loading: {directLoading ? 'Yes' : 'No'}</p>
          <p>Error: {directError ? directError : 'None'}</p>
          <p>Bookings Count: {directBookings ? directBookings.length : 'null'}</p>
          
          {directBookings && directBookings.length > 0 ? (
            <div>
              <h4>Booking IDs:</h4>
              <ul>
                {directBookings.map(booking => (
                  <li key={booking._id}>
                    {booking._id} - {booking.status || 'No status'} - 
                    Route: {booking.route ? (booking.route.name || 'Unnamed') : 'No route'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No bookings found via direct API call</p>
          )}
        </div>
      </div>
      
      <div className="card bg-white">
        <h3>JSON Data</h3>
        <p>This shows the raw booking data</p>
        <div style={{ overflowX: 'auto' }}>
          <pre>{JSON.stringify({ context: bookings, direct: directBookings }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default BookingDebug; 