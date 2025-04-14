import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import BookingContext from '../../context/booking/bookingContext';
import RouteContext from '../../context/route/routeContext';
import LocationContext from '../../context/location/locationContext';
import BookingList from '../bookings/BookingList';
import AdminDashboard from './AdminDashboard';
import Spinner from '../layout/Spinner';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const bookingContext = useContext(BookingContext);
  const routeContext = useContext(RouteContext);
  const locationContext = useContext(LocationContext);

  const { loadUser, user } = authContext;
  const { getBookings } = bookingContext;
  const { getRoutes } = routeContext;
  const { getLocations } = locationContext;

  useEffect(() => {
    loadUser();
    getBookings();
    getRoutes();
    getLocations();
    // eslint-disable-next-line
  }, []);

  if (!user) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-center my-2">Dashboard</h1>
      {user && user.isAdmin ? (
        <AdminDashboard />
      ) : (
        <UserDashboard user={user} />
      )}
    </div>
  );
};

const UserDashboard = ({ user }) => {
  return (
    <div>
      <h2 className="text-primary">Welcome, {user.name}</h2>
      <div className="grid-2">
        <div>
          <BookingList />
        </div>
        <div>
          <div className="card bg-light">
            <h3 className="text-primary">Quick Actions</h3>
            <div className="grid-1">
              <Link to="/bookings/new" className="btn btn-primary my-1">
                <i className="fas fa-plus"></i> Book a Shuttle
              </Link>
              <Link to="/bookings/my-bookings" className="btn btn-dark my-1">
                <i className="fas fa-list"></i> View All My Bookings
              </Link>
              <Link to="/locations" className="btn btn-dark my-1">
                <i className="fas fa-map-marker-alt"></i> View Locations
              </Link>
              <Link to="/routes" className="btn btn-dark my-1">
                <i className="fas fa-route"></i> View Available Routes
              </Link>
              <Link to="/locations/suggest" className="btn btn-dark my-1">
                <i className="fas fa-lightbulb"></i> Suggest New Location
              </Link>
              <Link to="/profile" className="btn btn-dark my-1">
                <i className="fas fa-user"></i> Update Profile
              </Link>
            </div>
          </div>
          
          <div className="card bg-light mt-3">
            <h3 className="text-primary">Your Stats</h3>
            <div className="p-2">
              <p>
                <i className="fas fa-user-circle"></i> Account Type: {user.isAdmin ? 'Administrator' : 'Regular User'}
              </p>
              <p>
                <i className="fas fa-envelope"></i> Email: {user.email}
              </p>
              <p>
                <i className="fas fa-calendar-alt"></i> Member Since: {new Date(user.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 