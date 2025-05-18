import React, { useState, useEffect } from 'react';
import { getAllBookings, updateBookingStatus } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  const fetchBookings = async (page = 1, status = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      
      console.log('Fetching bookings with params:', params);
      const response = await getAllBookings(params);
      console.log('Bookings response:', response.data);
      
      // Make sure bookings is an array
      const bookingsList = response.data.bookings || response.data || [];
      const totalPagesCount = response.data.pagination?.totalPages || 1;
      
      console.log('Processed bookings:', bookingsList);
      
      setBookings(bookingsList);
      setTotalPages(totalPagesCount);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBookings(currentPage, statusFilter);
  }, [currentPage, statusFilter]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleStatusChangeRequest = (booking, status) => {
    console.log('Requesting status change for booking:', booking);
    console.log('New status:', status);
    setBookingToUpdate(booking);
    setNewStatus(status);
    setShowCancelDialog(true);
  };
  
  const handleStatusChangeConfirm = async () => {
    if (!bookingToUpdate) return;
    
    try {
      console.log('Updating booking status:', bookingToUpdate._id, newStatus);
      const response = await updateBookingStatus(bookingToUpdate._id, newStatus);
      console.log('Update response:', response);
      
      // Update booking in UI
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingToUpdate._id 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
      
      setShowCancelDialog(false);
      setSuccess(`Booking status updated to ${newStatus} successfully!`);
      setBookingToUpdate(null);
      setNewStatus('');
      
      // Refresh the bookings after a short delay
      setTimeout(() => {
        fetchBookings(currentPage, statusFilter);
      }, 1000);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading bookings..." />;
  }
  
  return (
    <div className="manage-bookings">
      <h1>Manage Bookings</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="filter-controls">
        <div className="form-group">
          <label htmlFor="statusFilter">Filter by Status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings found with the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking._id.substring(0, 8)}...</td>
                    <td>{booking.userId?.name || booking.user?.name || 'Unknown'}</td>
                    <td>{formatDate(booking.travelDate)}</td>
                    <td>
                      {(booking.source?.name || booking.sourceLocation?.name || 'N/A')} → {' '}
                      {(booking.destination?.name || booking.destinationLocation?.name || 'N/A')}
                    </td>
                    <td>{booking.totalPoints || booking.points || 0}</td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="booking-actions-cell">
                        <select 
                          value={booking.status}
                          onChange={(e) => handleStatusChangeRequest(booking, e.target.value)}
                          className="status-select"
                          disabled={booking.status === 'cancelled'}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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
        </>
      )}
      
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleStatusChangeConfirm}
        title={`Update Booking Status to ${newStatus}`}
        message={`Are you sure you want to change the status of this booking to ${newStatus}? ${
          newStatus === 'cancelled' ? 'This will refund points to the user.' : ''
        }`}
        confirmText="Yes, Update Status"
        cancelText="Cancel"
        confirmButtonClass={newStatus === 'cancelled' ? 'btn-danger' : 'btn-primary'}
      />
    </div>
  );
};

export default ManageBookings; 