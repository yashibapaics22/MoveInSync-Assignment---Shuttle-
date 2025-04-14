import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import BookingDetails from './components/bookings/BookingDetails';
import BookingForm from './components/bookings/BookingForm';
import MyBookings from './components/bookings/MyBookings';
import SimpleBookingList from './components/bookings/SimpleBookingList';
import LocationForm from './components/locations/LocationForm';
import LocationList from './components/locations/LocationList';
import UserLocationForm from './components/locations/UserLocationForm';
import LocationSuggestions from './components/locations/LocationSuggestions';
import AuthCheck from './components/locations/AuthCheck';
import RouteForm from './components/routes/RouteForm';
import RouteList from './components/routes/RouteList';
import Profile from './components/profile/Profile';
import Unauthorized from './components/pages/Unauthorized';
import UserManagement from './components/admin/UserManagement';
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './utils/AdminRoute';

import AuthState from './context/auth/AuthState';
import BookingState from './context/booking/BookingState';
import LocationState from './context/location/LocationState';
import RouteState from './context/route/RouteState';
import AlertState from './context/alert/AlertState';
import setAuthToken from './utils/setAuthToken';

import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  return (
    <AuthState>
      <BookingState>
        <LocationState>
          <RouteState>
            <AlertState>
              <Router>
                <Fragment>
                  <Navbar />
                  <div className="container">
                    <Alert />
                    <Switch>
                      {/* Public Routes */}
                      <Route exact path="/login" component={Login} />
                      <Route exact path="/register" component={Register} />
                      <Route exact path="/unauthorized" component={Unauthorized} />
                      
                      {/* Private Routes (accessible by any authenticated user) */}
                      <PrivateRoute exact path="/" component={Dashboard} />
                      <PrivateRoute exact path="/profile" component={Profile} />
                      
                      {/* Booking Routes */}
                      <PrivateRoute exact path="/bookings/new" component={BookingForm} />
                      <PrivateRoute exact path="/bookings/my-bookings" component={MyBookings} />
                      <PrivateRoute exact path="/bookings/simple" component={SimpleBookingList} />
                      <PrivateRoute exact path="/bookings/:id" component={BookingDetails} />
                      
                      {/* Location Routes */}
                      <PrivateRoute exact path="/locations" component={LocationList} />
                      <PrivateRoute exact path="/locations/suggest" component={UserLocationForm} />
                      
                      {/* Route Routes */}
                      <PrivateRoute exact path="/routes" component={RouteList} />
                      
                      {/* Admin-Only Routes */}
                      <AdminRoute exact path="/locations/add" component={LocationForm} />
                      <AdminRoute exact path="/locations/suggestions" component={LocationSuggestions} />
                      <AdminRoute exact path="/locations/auth-check" component={AuthCheck} />
                      <AdminRoute exact path="/routes/add" component={RouteForm} />
                      
                      {/* Admin Dashboard Routes */}
                      <AdminRoute exact path="/admin/bookings" component={SimpleBookingList} />
                      <AdminRoute exact path="/admin/bookings/pending" component={SimpleBookingList} />
                      <AdminRoute exact path="/admin/reports" component={() => <h1>Reports Page (Coming Soon)</h1>} />
                      <AdminRoute exact path="/admin/users" component={UserManagement} />
                    </Switch>
                  </div>
                </Fragment>
              </Router>
            </AlertState>
          </RouteState>
        </LocationState>
      </BookingState>
    </AuthState>
  );
};

export default App; 