import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAllBookings, updateBookingStatus } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard stats. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await getAllBookings({ limit: 5, page: 1 });
        setRecentBookings(response.data.bookings);
        setBookingsLoading(false);
      } catch (err) {
        console.error('Error fetching recent bookings:', err);
        setBookingsLoading(false);
      }
    };
    
    fetchRecentBookings();
  }, []);
  
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update booking status in the UI
      setRecentBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading dashboard data..." />;
  }
  
  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Users</div>
          <div className="stat-value">{stats?.users?.total || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Active Routes</div>
          <div className="stat-value">{stats?.routes?.active || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Locations</div>
          <div className="stat-value">{stats?.locations?.total || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Recent Bookings</div>
          <div className="stat-value">{stats?.bookings?.recent || 0}</div>
        </div>
      </div>
      
      <div className="booking-status-summary">
        <h3>Booking Status Summary</h3>
        <div className="status-grid">
          <div className="status-card pending">
            <div className="status-name">Pending</div>
            <div className="status-count">{stats?.bookings?.statusBreakdown?.pending || 0}</div>
          </div>
          
          <div className="status-card confirmed">
            <div className="status-name">Confirmed</div>
            <div className="status-count">{stats?.bookings?.statusBreakdown?.confirmed || 0}</div>
          </div>
          
          <div className="status-card completed">
            <div className="status-name">Completed</div>
            <div className="status-count">{stats?.bookings?.statusBreakdown?.completed || 0}</div>
          </div>
          
          <div className="status-card cancelled">
            <div className="status-name">Cancelled</div>
            <div className="status-count">{stats?.bookings?.statusBreakdown?.cancelled || 0}</div>
          </div>
        </div>
      </div>
      
      <div className="recent-bookings">
        <div className="section-header">
          <h3>Recent Bookings</h3>
          <Link to="/admin/bookings" className="btn btn-secondary">View All</Link>
        </div>
        
        {bookingsLoading ? (
          <LoadingSpinner size="small" text="Loading bookings..." />
        ) : recentBookings.length === 0 ? (
          <div className="info-message">No recent bookings found.</div>
        ) : (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking._id.substring(0, 8)}...</td>
                    <td>{booking.userId?.name || 'Unknown'}</td>
                    <td>{formatDate(booking.travelDate)}</td>
                    <td>{booking.source?.name || 'Unknown'} → {booking.destination?.name || 'Unknown'}</td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="admin-actions">
        <h3>Management</h3>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Manage Students</h3>
            </div>
            <p>View and manage student accounts, add points to their wallets.</p>
            <Link to="/admin/students" className="btn">
              Manage Students
            </Link>
          </div>
          
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Manage Routes</h3>
            </div>
            <p>Add, edit, or remove shuttle routes and update fares.</p>
            <Link to="/admin/routes" className="btn">
              Manage Routes
            </Link>
          </div>
          
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Manage Locations</h3>
            </div>
            <p>Add, edit, or remove shuttle locations and stops.</p>
            <Link to="/admin/locations" className="btn">
              Manage Locations
            </Link>
          </div>
          
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Manage Bookings</h3>
            </div>
            <p>View all bookings, update status and manage cancellations.</p>
            <Link to="/admin/bookings" className="btn">
              Manage Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;