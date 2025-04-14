import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import BookingContext from '../../context/booking/bookingContext';
import AuthContext from '../../context/auth/authContext';

const BookingItem = ({ booking }) => {
  const bookingContext = useContext(BookingContext);
  const authContext = useContext(AuthContext);

  const { deleteBooking } = bookingContext;
  const { user } = authContext;

  const { _id, route, date, time, status, totalPrice } = booking;

  const onDelete = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      deleteBooking(_id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge badge-warning';
      case 'approved':
        return 'badge badge-success';
      case 'rejected':
        return 'badge badge-danger';
      case 'completed':
        return 'badge badge-primary';
      default:
        return 'badge badge-light';
    }
  };

  // Safe accessor for nested properties
  const getRouteInfo = () => {
    if (!route) return 'Route information unavailable';
    
    if (route.from && route.to && route.from.name && route.to.name) {
      return `From ${route.from.name} to ${route.to.name}`;
    } else if (route.name) {
      return route.name;
    } else {
      return 'Route details unavailable';
    }
  };

  return (
    <div className="booking-item">
      <div className="booking-header">
        <h3 className="text-primary">
          {route && route.name ? route.name : 'Shuttle Booking'}
        </h3>
        <span className={getStatusBadgeClass(status)}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
        </span>
      </div>
      
      <div className="booking-body">
        <ul className="list">
          <li>
            <i className="fas fa-map-marker-alt"></i> {' '}
            {getRouteInfo()}
          </li>
          <li>
            <i className="fas fa-calendar-day"></i> {' '}
            {formatDate(date)}
          </li>
          <li>
            <i className="fas fa-clock"></i> {' '}
            {time || 'Time not specified'}
          </li>
          <li>
            <i className="fas fa-dollar-sign"></i> {' '}
            Total Price: ${totalPrice ? totalPrice.toFixed(2) : '0.00'}
          </li>
        </ul>
      </div>
      
      <div className="booking-footer">
        <Link to={`/bookings/${_id}`} className="btn btn-dark btn-sm">
          View Details
        </Link>
        {status === 'pending' && (
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            Cancel
          </button>
        )}
        {user && user.isAdmin && status === 'pending' && (
          <>
            <button className="btn btn-success btn-sm">
              Approve
            </button>
            <button className="btn btn-danger btn-sm">
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

BookingItem.propTypes = {
  booking: PropTypes.object.isRequired
};

export default BookingItem; 