import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookingContext from '../../context/booking/bookingContext';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';
import Spinner from '../layout/Spinner';

const BookingDetails = ({ match, history }) => {
  const bookingContext = useContext(BookingContext);
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { getBooking, current, loading, updateBooking, error } = bookingContext;
  const { user } = authContext;
  const { setAlert } = alertContext;

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        await getBooking(match.params.id);
      } catch (err) {
        setAlert('Error loading booking details', 'danger');
        console.error('Error fetching booking:', err);
        history.push('/');
      }
    };
    
    fetchBooking();
    
    if (error) {
      setAlert(error, 'danger');
    }
    // eslint-disable-next-line
  }, [match.params.id, error]);

  if (loading || !current) {
    return <Spinner />;
  }

  const {
    _id,
    route,
    date,
    time,
    passengers,
    status,
    totalPrice,
    createdAt
  } = current;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
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

  const onApprove = async () => {
    try {
      await updateBooking({
        _id,
        status: 'approved'
      });
      setAlert('Booking approved successfully', 'success');
      history.push('/admin/bookings');
    } catch (err) {
      setAlert('Failed to approve booking', 'danger');
    }
  };

  const onReject = async () => {
    try {
      await updateBooking({
        _id,
        status: 'rejected'
      });
      setAlert('Booking rejected', 'success');
      history.push('/admin/bookings');
    } catch (err) {
      setAlert('Failed to reject booking', 'danger');
    }
  };

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Booking Details</h2>
      <div className="my-1">
        <h3 className="text-dark">Booking Information</h3>
        <p>
          <strong>Status: </strong>
          <span className={getStatusBadgeClass(status || 'pending')}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
          </span>
        </p>
        <p>
          <strong>Booking Date: </strong> {formatDate(createdAt)}
        </p>
        <p>
          <strong>Travel Date: </strong> {formatDate(date)}
        </p>
        <p>
          <strong>Travel Time: </strong> {time || 'Not specified'}
        </p>
        <p>
          <strong>Passengers: </strong> {passengers || 1}
        </p>
        <p>
          <strong>Total Price: </strong> ${totalPrice ? totalPrice.toFixed(2) : '0.00'}
        </p>
      </div>

      {route && (
        <div className="my-1">
          <h3 className="text-dark">Route Information</h3>
          <p>
            <strong>Route: </strong> {route.name || 'Not specified'}
          </p>
          <p>
            <strong>From: </strong> {route.from && route.from.name ? route.from.name : 'Origin not specified'}
          </p>
          <p>
            <strong>To: </strong> {route.to && route.to.name ? route.to.name : 'Destination not specified'}
          </p>
          <p>
            <strong>Distance: </strong> {route.distance ? `${route.distance} km` : 'Not specified'}
          </p>
          <p>
            <strong>Duration: </strong> {route.duration ? `${route.duration} minutes` : 'Not specified'}
          </p>
        </div>
      )}

      {user && user.isAdmin && status === 'pending' && (
        <div className="grid-2 my-2">
          <button className="btn btn-success" onClick={onApprove}>Approve Booking</button>
          <button className="btn btn-danger" onClick={onReject}>Reject Booking</button>
        </div>
      )}

      <div className="my-1">
        <Link to="/" className="btn btn-dark btn-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default BookingDetails; 