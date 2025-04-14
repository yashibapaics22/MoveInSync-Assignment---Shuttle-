import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookingContext from '../../context/booking/bookingContext';
import Spinner from '../layout/Spinner';

const SimpleBookingList = () => {
  const bookingContext = useContext(BookingContext);
  const { bookings, getBookings, loading, error } = bookingContext;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        console.log('SimpleBookingList: Loading bookings');
        await getBookings();
        console.log('SimpleBookingList: Loading complete');
      } catch (err) {
        console.error('SimpleBookingList: Loading failed', err);
      }
    };
    
    loadBookings();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Simple Booking List</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="my-2">
        <p>Loading state: {loading ? 'Loading...' : 'Finished'}</p>
        <p>Number of bookings: {bookings ? bookings.length : 'No bookings available'}</p>
      </div>
      
      {(!bookings || bookings.length === 0) ? (
        <div className="text-center p-2">
          <p className="lead">No bookings found</p>
          <Link to="/bookings/new" className="btn btn-primary">
            Book a Shuttle
          </Link>
        </div>
      ) : (
        <div>
          <ul className="list">
            {bookings.map(booking => (
              <li key={booking._id} className="card bg-white p-1 my-1">
                <div className="bg-light p">
                  <h3>
                    {booking.route && booking.route.name 
                      ? booking.route.name 
                      : 'Booking'}
                    <span 
                      className={`badge ${booking.status === 'approved' 
                        ? 'badge-success' 
                        : booking.status === 'pending' 
                          ? 'badge-warning' 
                          : 'badge-primary'}`}
                    >
                      {booking.status || 'status unknown'}
                    </span>
                  </h3>
                  <p>ID: {booking._id}</p>
                  <p>Date: {booking.date 
                    ? new Date(booking.date).toLocaleDateString() 
                    : 'Not specified'}</p>
                  <p>Time: {booking.time || 'Not specified'}</p>
                  <Link 
                    to={`/bookings/${booking._id}`} 
                    className="btn btn-dark btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center p-1">
            <Link to="/bookings/new" className="btn btn-primary">
              Book Another Shuttle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleBookingList; 