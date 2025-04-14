import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import BookingContext from '../../context/booking/bookingContext';
import RouteContext from '../../context/route/routeContext';
import LocationContext from '../../context/location/locationContext';
import Spinner from '../layout/Spinner';

const AdminDashboard = () => {
  const bookingContext = useContext(BookingContext);
  const routeContext = useContext(RouteContext);
  const locationContext = useContext(LocationContext);

  const { bookings, loading: bookingLoading } = bookingContext;
  const { routes, loading: routeLoading } = routeContext;
  const { locations, loading: locationLoading } = locationContext;

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalLocations: 0,
    totalRoutes: 0
  });

  useEffect(() => {
    if (!bookingLoading && bookings && !routeLoading && routes && !locationLoading && locations) {
      // Calculate dashboard statistics
      const pendingCount = bookings.filter(booking => booking.status === 'pending').length;
      const approvedCount = bookings.filter(booking => booking.status === 'approved').length;
      const cancelledCount = bookings.filter(booking => booking.status === 'cancelled').length;
      
      // Calculate total revenue from approved bookings
      const revenue = bookings
        .filter(booking => booking.status === 'approved')
        .reduce((total, booking) => total + (booking.totalPrice || 0), 0);

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pendingCount,
        approvedBookings: approvedCount,
        cancelledBookings: cancelledCount,
        totalRevenue: revenue,
        totalLocations: locations.length,
        totalRoutes: routes.length
      });
    }
  }, [bookings, routes, locations, bookingLoading, routeLoading, locationLoading]);

  if (bookingLoading || routeLoading || locationLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <h2 className="text-primary">Admin Dashboard</h2>
      
      <div className="grid-4 my-3">
        <div className="card bg-light">
          <div className="text-center p-1">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="card bg-primary">
          <div className="text-center p-1 text-white">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="card bg-success">
          <div className="text-center p-1 text-white">
            <h3>{stats.totalLocations}</h3>
            <p>Locations</p>
          </div>
        </div>
        <div className="card bg-dark">
          <div className="text-center p-1 text-white">
            <h3>{stats.totalRoutes}</h3>
            <p>Routes</p>
          </div>
        </div>
      </div>

      <div className="grid-2 my-3">
        <div className="card bg-light">
          <h3 className="text-primary">Booking Status</h3>
          <div className="p-2">
            <div className="grid-3">
              <div className="alert alert-warning text-center">
                <h4>{stats.pendingBookings}</h4>
                <p>Pending</p>
              </div>
              <div className="alert alert-success text-center">
                <h4>{stats.approvedBookings}</h4>
                <p>Approved</p>
              </div>
              <div className="alert alert-danger text-center">
                <h4>{stats.cancelledBookings}</h4>
                <p>Cancelled</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-light">
          <h3 className="text-primary">Quick Actions</h3>
          <div className="p-2">
            <Link to="/admin/bookings/pending" className="btn btn-block btn-warning my-1">
              <i className="fas fa-clock"></i> View Pending Bookings
            </Link>
            <Link to="/locations/suggestions" className="btn btn-block btn-success my-1">
              <i className="fas fa-map-marker-alt"></i> Review Location Suggestions
            </Link>
            <Link to="/admin/reports" className="btn btn-block btn-dark my-1">
              <i className="fas fa-chart-bar"></i> View Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-3 my-3">
        <div className="card bg-light">
          <h3 className="text-primary">Manage Users</h3>
          <p className="p-2">View and manage user accounts</p>
          <div className="p-2">
            <Link to="/admin/users" className="btn btn-dark btn-block">
              <i className="fas fa-users"></i> View Users
            </Link>
          </div>
        </div>
        
        <div className="card bg-light">
          <h3 className="text-primary">Manage Locations</h3>
          <p className="p-2">Add, edit, or remove locations</p>
          <div className="p-2 grid-2">
            <Link to="/locations" className="btn btn-dark">
              <i className="fas fa-list"></i> View All
            </Link>
            <Link to="/locations/add" className="btn btn-primary">
              <i className="fas fa-plus"></i> Add New
            </Link>
          </div>
        </div>
        
        <div className="card bg-light">
          <h3 className="text-primary">Manage Routes</h3>
          <p className="p-2">Configure shuttle routes</p>
          <div className="p-2 grid-2">
            <Link to="/routes" className="btn btn-dark">
              <i className="fas fa-list"></i> View All
            </Link>
            <Link to="/routes/add" className="btn btn-primary">
              <i className="fas fa-plus"></i> Add New
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 