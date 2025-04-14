import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookingContext from '../../context/booking/bookingContext';
import BookingItem from './BookingItem';
import Spinner from '../layout/Spinner';

const BookingList = () => {
  const bookingContext = useContext(BookingContext);
  const { bookings, getBookings, loading } = bookingContext;

  useEffect(() => {
    getBookings();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="card bg-light">
        <p className="text-center lead">No bookings found</p>
        <Link to="/bookings/new" className="btn btn-primary">
          Book a Shuttle
        </Link>
      </div>
    );
  }

  return (
    <div className="grid-1">
      <div className="card bg-light">
        <h2 className="text-primary text-center">Your Bookings</h2>
        {bookings.map(booking => (
          <BookingItem key={booking._id} booking={booking} />
        ))}
        <div className="text-center p-1">
          <Link to="/bookings/new" className="btn btn-primary">
            Book a New Shuttle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingList; 