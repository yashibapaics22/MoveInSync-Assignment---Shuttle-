import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getUserTrips, cancelTrip } from '../services/tripService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const TripHistory = () => {
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [tripToCancel, setTripToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState(location.state?.message || null);
  
  const fetchTrips = async (page = 1) => {
    try {
      const response = await getUserTrips({ page, limit: 10 });
      setTrips(response.data);
      
      // Check if pagination info is available
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load booking history. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTrips(currentPage);
    
    // Clear location state message after 5 seconds
    if (location.state?.message) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, location.state]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleCancelRequest = (trip) => {
    setTripToCancel(trip);
    setShowCancelDialog(true);
  };
  
  const handleCancelConfirm = async () => {
    if (!tripToCancel) return;
    
    setCancelLoading(true);
    try {
      await cancelTrip(tripToCancel._id);
      
      // Update the trip status in the UI
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip._id === tripToCancel._id 
            ? { ...trip, status: 'cancelled' } 
            : trip
        )
      );
      
      setToast('Booking cancelled successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
      setShowCancelDialog(false);
      setTripToCancel(null);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading booking history..." />;
  }
  
  return (
    <div className="trip-history">
      <h1>Booking History</h1>
      
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {error && <div className="error-message">{error}</div>}
      
      {trips.length === 0 ? (
        <div className="card empty-state">
          <p>No bookings found. Book a ride to see your booking history.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {trips.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-date">
                  <div className="booking-label">Travel Date</div>
                  <div className="booking-value">{formatDate(booking.travelDate)}</div>
                </div>
                <div className="booking-status">
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
              
              <div className="booking-details">
                <div className="booking-route">
                  <div className="booking-label">Route</div>
                  <div className="booking-value">
                    {booking.source?.name || 'Unknown'} → {booking.destination?.name || 'Unknown'}
                  </div>
                </div>
                
                <div className="booking-time">
                  <div className="booking-label">Time</div>
                  <div className="booking-value">{formatTime(booking.travelDate)}</div>
                </div>
                
                <div className="booking-points">
                  <div className="booking-label">Points</div>
                  <div className="booking-value">{booking.totalPoints}</div>
                </div>
              </div>
              
              {booking.status === 'pending' || booking.status === 'confirmed' ? (
                <div className="booking-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleCancelRequest(booking)}
                    disabled={cancelLoading}
                  >
                    Cancel Booking
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel Booking"
        cancelText="No, Keep Booking"
      />
    </div>
  );
};

export default TripHistory;